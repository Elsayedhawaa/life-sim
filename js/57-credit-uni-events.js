/* =====================================================================
   57. CREDIT CARD PAYMENTS + UNIVERSITY FIX + LIFE EVENTS
   - Pay credit card: full, custom, or minimum (with monthly interest)
   - University graduation bug: complete replacement of uniYear
   - Life events system: monthly + yearly random events (family, friends,
     weddings, birthdays, drama)
   - INTEGRATED CREDIT CARD EVENT PAYMENTS & INVENTORY THEFT
   Load AFTER 56-critical-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

function p57Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p57Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p57EGP(egp2026) { return Math.round(egp2026 * p57Idx()); }

/* =================================================================
   PART 1 — CREDIT CARD PAYMENT (full, custom, minimum) + INTEREST
   ================================================================= */

function p57CardList() {
  if (!S || !S.bank || !Array.isArray(S.bank.activeCards)) return [];
  return S.bank.activeCards;
}

function p57CardBalance(cardId) {
  if (!S || !S.bank || !S.bank.cardDebt) return 0;
  return Math.max(0, Number(S.bank.cardDebt[cardId]) || 0);
}

/* --- Pay full balance --- */
function p57PayCardFull(cardId) {
  const debt = p57CardBalance(cardId);
  if (debt <= 0) return hint('No balance on this card.');
  if (S.wealth < debt) return hint('You need ' + money(debt) + ' available to clear this card.');
  S.wealth -= debt;
  S.bank.cardDebt[cardId] = 0;
  S.bank.score = Math.min(850, (S.bank.score || 680) + 8);
  log('Paid off ' + cardId + ' in full (' + money(debt) + '). Credit score improved.');
  render();
}
window.p57PayCardFull = p57PayCardFull;

/* --- Pay custom amount (EGP) --- */
function p57PayCardCustom(cardId) {
  const debt = p57CardBalance(cardId);
  if (debt <= 0) return hint('No balance on this card.');
  const rate = p57Rate();
  const debtEGP = Math.round(debt * rate);
  const input = prompt('How much to pay? (Full balance is ' + debtEGP.toLocaleString() + ' EGP)', '');
  if (input == null) return;
  const egp = Number(input);
  if (!isFinite(egp) || egp <= 0) return hint('Enter a valid amount.');
  const internal = egp / rate;
  const pay = Math.min(internal, debt, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash in checking.');
  S.wealth -= pay;
  S.bank.cardDebt[cardId] = Math.max(0, debt - pay);
  if (S.bank.cardDebt[cardId] < 0.5) S.bank.cardDebt[cardId] = 0;
  log('Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP toward ' + cardId + '. Remaining: ' + Math.round(S.bank.cardDebt[cardId] * rate).toLocaleString() + ' EGP.');
  if (S.bank.cardDebt[cardId] === 0) {
    S.bank.score = Math.min(850, (S.bank.score || 680) + 6);
    log('Card fully paid off.');
  }
  render();
}
window.p57PayCardCustom = p57PayCardCustom;

/* --- Monthly interest on unpaid cards --- */
function p57CardMonthlyInterest() {
  if (!S || !S.bank || !S.bank.cardDebt) return;
  const monthlyRate = 0.022;   /* ~28% APR equivalent */
  let total = 0;
  Object.keys(S.bank.cardDebt).forEach(function (cardId) {
    const debt = Number(S.bank.cardDebt[cardId]) || 0;
    if (debt <= 0.01) return;
    const interest = debt * monthlyRate;
    S.bank.cardDebt[cardId] = debt + interest;
    total += interest;
  });
  if (total > 0.5) {
    log('💳 Credit card interest this month: ' + money(total) + ' (2.2%/month on unpaid balances).');
  }
}

/* --- Yearly interest already exists in P37, but ensure it compounds --- */
const P57_bankYearBefore = (typeof bankYear === 'function') ? bankYear : null;
if (P57_bankYearBefore) {
  bankYear = function () {
    P57_bankYearBefore.apply(this, arguments);
  };
}

/* --- Enhance Bank view: show custom payment buttons --- */
const P57_viewBankBefore = viewBank;
viewBank = function () {
  let html = P57_viewBankBefore();
  if (!S || S.age < 18) return html;

  /* Add custom-payment buttons next to each card */
  const cards = p57CardList();
  cards.forEach(function (cardId) {
    const debt = p57CardBalance(cardId);
    if (debt <= 0) return;

    const rate = p57Rate();
    const debtEGP = Math.round(debt * rate);
    const minPayEGP = Math.max(500, Math.round(debtEGP * 0.05));   /* 5% min */
    const minPayInternal = minPayEGP / rate;

    const escId = cardId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const payBtnPattern = new RegExp('<button class="btn" onclick="p37PayCardPrompt\\(\'' + escId + '\'\\)">[^<]*<\\/button>');
    const newBtns = '<button class="btn" onclick="p57PayCardFull(\'' + cardId + '\')">Pay full · ' + debtEGP.toLocaleString() + ' EGP</button>' +
      '<button class="btn" onclick="p57PayCardCustom(\'' + cardId + '\')">Pay custom amount</button>' +
      '<button class="btn" ' + (S.wealth < minPayInternal ? 'disabled' : '') + ' onclick="p57PayCardMin(\'' + cardId + '\', ' + minPayEGP + ')">Pay minimum · ' + minPayEGP.toLocaleString() + ' EGP<small>5% of balance — the rest accrues 2.2% monthly interest</small></button>';

    if (payBtnPattern.test(html)) {
      html = html.replace(payBtnPattern, newBtns);
    } else {
      const rowPattern = new RegExp('(<div class="row"><span>Approx\\. EGP balance<\\/span><b>[^<]*<\\/b><\\/div>)');
      html = html.replace(rowPattern, '$1' + newBtns);
    }
  });

  return html;
};

function p57PayCardMin(cardId, minEGP) {
  const debt = p57CardBalance(cardId);
  if (debt <= 0) return hint('No balance.');
  const rate = p57Rate();
  const internal = minEGP / rate;
  if (S.wealth < internal) return hint('You need ' + minEGP.toLocaleString() + ' EGP.');
  S.wealth -= internal;
  S.bank.cardDebt[cardId] = Math.max(0, debt - internal);
  log('Paid minimum ' + minEGP.toLocaleString() + ' EGP on ' + cardId + '. Remaining ' + Math.round(S.bank.cardDebt[cardId] * rate).toLocaleString() + ' EGP will accrue interest.');
  render();
}
window.p57PayCardMin = p57PayCardMin;

/* Hook interest into monthly tick */
const P57_p52MonthlyTickBefore = p52MonthlyTick;
p52MonthlyTick = function () {
  P57_p52MonthlyTickBefore.apply(this, arguments);
  if (S && S.age >= 18) p57CardMonthlyInterest();
};

/* =================================================================
   PART 2 — UNIVERSITY GRADUATION (complete replacement)
   ================================================================= */

uniYear = function (notes, bill) {
  if (!Array.isArray(notes)) notes = [];
  if (!bill || typeof bill !== 'object') bill = {};
  if (!S || !S.uni) return;

  const u = S.uni;
  const isEgypt = !!u.universityId;

  const yearIdx = p57Idx();
  const rate = p57Rate();
  let tuitionInternal = 0;
  if (isEgypt) {
    const egp = Math.round((u.annualCostEGP || 10000) * yearIdx);
    tuitionInternal = egp / rate;
  } else {
    const un = (typeof UNIS !== 'undefined' && UNIS[u.type]) ? UNIS[u.type] : null;
    const baseTuition = un ? Number(un.tuition) || 500 : 500;
    const inflation = (typeof prOf === 'function') ? prOf(gameYear(), S) : 1;
    tuitionInternal = baseTuition * inflation * (u.scholar ? 0.5 : 1);
  }

  if (u.pay === 'parents') {
    if (!parents().length || bestBond() < 20) {
      u.pay = 'self';
      log('Your parents can no longer pay tuition. You must cover it yourself.');
    } else {
      notes.push('parents paid ' + Math.round(tuitionInternal * rate).toLocaleString() + ' EGP tuition');
    }
  }
  if (u.pay === 'self') {
    if (S.wealth < tuitionInternal) {
      const shortfall = tuitionInternal - S.wealth;
      S.loan = (S.loan || 0) + shortfall;
      S.wealth = 0;
      notes.push('student loan added ' + money(shortfall));
      log('You took a student loan of ' + money(shortfall) + ' to cover tuition.');
    } else {
      S.wealth -= tuitionInternal;
      bill.tuition = (bill.tuition || 0) + tuitionInternal;
    }
  }
  if (u.pay === 'loan') {
    S.loan = (S.loan || 0) + tuitionInternal;
    notes.push('student loan added ' + money(tuitionInternal));
  }

  const ef = (typeof EFFORT !== 'undefined' && EFFORT[S.effort]) ? EFFORT[S.effort] : { smarts: 1, happiness: 0, social: 0 };
  const mult = (u.type === 'private') ? 1.15 : 1.0;
  const smartsGain = ef.smarts > 0 ? Math.round(ef.smarts * mult) : ef.smarts;
  fx({ smarts: smartsGain, happiness: ef.happiness || 0, social: (ef.social || 0) + (u.type === 'private' ? 1 : 0) });

  u.year = (u.year || 0) + 1;
  const yearsTotal = u.yearsTotal || ((u.major && MAJORS && MAJORS[u.major]) ? MAJORS[u.major].years : 4);
  notes.push('university year ' + u.year + '/' + yearsTotal);

  if (u.year >= yearsTotal) {
    let majorId = u.major || null;
    if (!majorId && u.faculty) {
      const facultyMap = (typeof P44_FACULTY_TO_MAJOR !== 'undefined') ? P44_FACULTY_TO_MAJOR : {};
      majorId = facultyMap[u.faculty] || 'business';
    }
    if (!majorId) majorId = 'business';

    const majorName = (MAJORS && MAJORS[majorId]) ? MAJORS[majorId].name : majorId;
    const uniName = u.universityName || ((typeof UNIS !== 'undefined' && UNIS[u.type]) ? UNIS[u.type].name : 'University');

    S.degree = majorId;
    S.p49 = S.p49 || {};
    S.p49.graduationYear = gameYear();
    S.uni = null;

    fx({ happiness: 12, social: 5 });
    log('🎓 GRADUATED from ' + uniName + ' — ' + (u.faculty || majorName) + '. Your degree is recorded.');

    setTimeout(function () {
      if (typeof p24Popup === 'function') {
        p24Popup('🎓 University graduation',
          'You completed your degree!\n\n' +
          uniName + '\n' +
          'Faculty: ' + (u.faculty || majorName) + '\n\n' +
          'Career options are now open in the Career tab. Master\u2019s programs are available in Education.');
      }
    }, 350);
  }
};

/* =================================================================
   PART 3 — LIFE EVENTS (monthly + yearly)
   ================================================================= */

function p57InitEvents(o) {
  o = o || (typeof S !== 'undefined' ? S : null);
  if (!o) return; 
  if (!o.p57) o.p57 = {};
  if (typeof o.p57.lastEventAbsMonth !== 'number') o.p57.lastEventAbsMonth = -100;
  if (typeof o.p57.eventsThisYear !== 'number') o.p57.eventsThisYear = 0;
  if (!Array.isArray(o.p57.history)) o.p57.history = [];
}

const P57_migrateEvents = (typeof migrate === 'function') ? migrate : null;
if (P57_migrateEvents) {
  migrate = function(o) {
    const r = P57_migrateEvents(o);
    p57InitEvents(r);
    return r;
  };
}

const P57_newGameEvents = (typeof newGame === 'function') ? newGame : null;
if (P57_newGameEvents) {
  newGame = function() {
    P57_newGameEvents.apply(this, arguments);
    if (typeof S !== 'undefined') p57InitEvents(S);
  };
}

/* Helper: Actually steal the phone from inventory */
function p57StealPhoneFromInventory() {
  if (!S || !Array.isArray(S.inventory)) return false;
  let lostOne = false;
  S.inventory = S.inventory.filter(function (item) {
    if (lostOne || !item) return !lostOne ? true : false;
    /* Match by cat === 'phone' which is the reliable field */
    if (item.cat === 'phone') {
      lostOne = true;
      return false;  /* remove */
    }
    return true;  /* keep */
  });
  return lostOne;
}
/* ---- Event pool ---- */
function p57EventPool() {
  const pool = [];

  /* ---------- FAMILY: MONEY ---------- */
  pool.push({
    id: 'fam_money_parent', category: 'family', weight: 10, minAge: 20, maxAge: 60,
    ok: function () { return (S.family || []).some(function (m) { return m.alive !== false && m.role === 'Mother' && (m.bond || 0) >= 20; }); },
    title: 'Your mother needs help',
    text: function () { return 'Your mother calls. She is short on the household bills this month and asks if you can help with ' + p57EGP(3000).toLocaleString() + ' EGP. She sounds tired.'; },
    choices: [
      { label: 'Send the full amount', cost: function () { return p57EGP(3000); }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Mother'; }); if (m) m.bond = Math.min(100, (m.bond || 50) + 8); return { msg: 'You sent the money. Your mother was deeply grateful.', fx: { happiness: 2 } }; } },
      { label: 'Send half', cost: function () { return p57EGP(1500); }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Mother'; }); if (m) m.bond = Math.min(100, (m.bond || 50) + 3); return { msg: 'You sent what you could. She said she understood.', fx: { happiness: 1 } }; } },
      { label: 'Explain you cannot help right now', cost: function () { return 0; }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Mother'; }); if (m) m.bond = Math.max(0, (m.bond || 50) - 6); return { msg: 'She said she understood, but you could hear the disappointment.', fx: { happiness: -2 } }; } }
    ]
  });

  pool.push({
    id: 'fam_money_sibling', category: 'family', weight: 8, minAge: 20, maxAge: 60,
    ok: function () { return (S.family || []).some(function (m) { return m.alive !== false && m.role === 'Sibling'; }); },
    title: 'Your sibling needs a loan',
    text: function () { return 'Your sibling calls. They need ' + p57EGP(5000).toLocaleString() + ' EGP urgently — rent is overdue. They promise to pay you back.'; },
    choices: [
      { label: 'Send the money', cost: function () { return p57EGP(5000); }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Sibling'; }); if (m) { m.bond = Math.min(100, (m.bond || 50) + 10); m.siblingLoan = (m.siblingLoan || 0) + p57EGP(5000); } return { msg: 'You sent the money. They promised to repay you when they can.', fx: { happiness: 1 } }; } },
      { label: 'Send part of it', cost: function () { return p57EGP(2500); }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Sibling'; }); if (m) m.bond = Math.min(100, (m.bond || 50) + 4); return { msg: 'They thanked you for whatever you could give.', fx: {} }; } },
      { label: 'Refuse — you cannot afford it either', cost: function () { return 0; }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Sibling'; }); if (m) m.bond = Math.max(0, (m.bond || 50) - 8); return { msg: 'They were upset but said they would find another way.', fx: { happiness: -3 } }; } }
    ]
  });

  /* ---------- FAMILY: TIME ---------- */
  pool.push({
    id: 'fam_visit_request', category: 'family', weight: 10, minAge: 20, maxAge: 70,
    ok: function () { return (S.family || []).some(function (m) { return m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); }); },
    title: 'Your parents want to see you',
    text: function () { return 'Your father calls. He says it has been too long since you visited. He asks if you can come by this weekend. It would be nice to see them.'; },
    choices: [
      { label: 'Visit them this weekend', cost: function () { return p57EGP(300); }, effect: function () { (S.family || []).filter(function (m) { return m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); }).forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 6); }); return { msg: 'You spent a warm afternoon with them. The visit meant a lot.', fx: { happiness: 4, social: 2 } }; } },
      { label: 'Send a message instead', cost: function () { return 0; }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Father'; }); if (m) m.bond = Math.max(0, (m.bond || 50) - 2); return { msg: 'You explained you are busy. He said he understood.', fx: {} }; } },
      { label: 'Promise a visit next month', cost: function () { return 0; }, effect: function () { return { msg: 'You promised to come next month. He sounded hopeful.', fx: { happiness: 1 } }; } }
    ]
  });

  /* ---------- FRIENDS: HANGOUT ---------- */
  pool.push({
    id: 'friend_coffee', category: 'friend', weight: 20, minAge: 16, maxAge: 80,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'A friend invites you for coffee',
    text: function () { return 'A friend texts you: "Free this Friday? Let\u2019s get coffee — I want to catch up." A coffee date costs about ' + p57EGP(200).toLocaleString() + ' EGP plus transport.'; },
    choices: [
      { label: 'Yes, let\u2019s go (spend ' + p57EGP(250).toLocaleString() + ' EGP)', cost: function () { return p57EGP(250); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 5); return { msg: 'You had a warm, easy chat. Small moments keep friendships alive.', fx: { happiness: 3, social: 3 } }; } },
      { label: 'Suggest meeting at home instead (spend ' + p57EGP(80).toLocaleString() + ')', cost: function () { return p57EGP(80); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 4); return { msg: 'You brewed tea at home. It felt cosy and cheap.', fx: { happiness: 2, social: 2 } }; } },
      { label: 'Politely say you cannot', cost: function () { return 0; }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.max(0, (f.bond || 50) - 3); return { msg: 'You said you were busy. Your friend said "no worries" but sounded slightly disappointed.', fx: { happiness: -1 } }; } }
    ]
  });

  pool.push({
    id: 'friend_dinner', category: 'friend', weight: 12, minAge: 18, maxAge: 80,
    ok: function () { return (S.friends || []).length >= 2; },
    title: 'Dinner with friends',
    text: function () { return 'Friends are organising a dinner at a restaurant on Saturday. Dress nicely. The meal will cost around ' + p57EGP(900).toLocaleString() + ' EGP per person.'; },
    choices: [
      { label: 'Go and pay for yourself', cost: function () { return p57EGP(900); }, effect: function () { S.friends.slice(0, 2).forEach(function (f) { f.bond = Math.min(100, (f.bond || 50) + 6); }); return { msg: 'You enjoyed a long, warm dinner. The conversation lifted your spirits.', fx: { happiness: 5, social: 4 } }; } },
      { label: 'Go but split a cheaper meal', cost: function () { return p57EGP(450); }, effect: function () { S.friends.slice(0, 2).forEach(function (f) { f.bond = Math.min(100, (f.bond || 50) + 4); }); return { msg: 'You still had a great time and stayed within budget.', fx: { happiness: 3, social: 3 } }; } },
      { label: 'Skip it', cost: function () { return 0; }, effect: function () { S.friends.slice(0, 2).forEach(function (f) { f.bond = Math.max(0, (f.bond || 50) - 4); }); return { msg: 'You missed it. Friends noticed.', fx: { happiness: -2, social: -2 } }; } }
    ]
  });

  /* ---------- BIRTHDAY PARTY ---------- */
  pool.push({
    id: 'friend_birthday', category: 'social', weight: 14, minAge: 16, maxAge: 80,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'A friend\u2019s birthday party',
    text: function () { return 'Your friend invites you to their birthday party. You will need a gift — around ' + p57EGP(1200).toLocaleString() + ' EGP is appropriate — plus transport and possibly dinner.'; },
    choices: [
      { label: 'Go with a nice gift', cost: function () { return p57EGP(1200); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 10); return { msg: 'You gave a lovely gift. Your friend was thrilled you came.', fx: { happiness: 4, social: 3 } }; } },
      { label: 'Go with a modest gift', cost: function () { return p57EGP(400); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 5); return { msg: 'You still went and celebrated with them.', fx: { happiness: 2, social: 2 } }; } },
      { label: 'Send a message and skip the party', cost: function () { return 0; }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.max(0, (f.bond || 50) - 5); return { msg: 'Your friend thanked you for the message but noticed your absence.', fx: { social: -1 } }; } }
    ]
  });

  pool.push({
    id: 'family_birthday', category: 'family', weight: 10, minAge: 20, maxAge: 70,
    ok: function () { return (S.family || []).some(function (m) { return m.alive !== false && (m.role === 'Mother' || m.role === 'Father' || m.role === 'Sibling'); }); },
    title: 'It\u2019s a family member\u2019s birthday',
    text: function () { return 'A close family member\u2019s birthday is coming up. A good gift would cost around ' + p57EGP(1500).toLocaleString() + ' EGP. A simple one would be ' + p57EGP(500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy a thoughtful gift', cost: function () { return p57EGP(1500); }, effect: function () { const m = (S.family || []).find(function (x) { return x.alive !== false && (x.role === 'Mother' || x.role === 'Father' || x.role === 'Sibling'); }); if (m) m.bond = Math.min(100, (m.bond || 50) + 8); return { msg: 'They loved the gift and hugged you.', fx: { happiness: 3 } }; } },
      { label: 'Give a simple gift', cost: function () { return p57EGP(500); }, effect: function () { const m = (S.family || []).find(function (x) { return x.alive !== false && (x.role === 'Mother' || x.role === 'Father' || x.role === 'Sibling'); }); if (m) m.bond = Math.min(100, (m.bond || 50) + 4); return { msg: 'They appreciated the thought.', fx: { happiness: 1 } }; } },
      { label: 'Just call and wish them', cost: function () { return 0; }, effect: function () { const m = (S.family || []).find(function (x) { return x.alive !== false && (x.role === 'Mother' || x.role === 'Father' || x.role === 'Sibling'); }); if (m) m.bond = Math.max(0, (m.bond || 50) - 3); return { msg: 'They sounded happy to hear your voice, but a little disappointed.', fx: {} }; } }
    ]
  });

  /* ---------- WEDDING ---------- */
  pool.push({
    id: 'friend_wedding', category: 'social', weight: 8, minAge: 22, maxAge: 80,
    ok: function () { return (S.friends || []).some(function (f) { return (f.bond || 0) >= 40; }); },
    title: 'A friend is getting married',
    text: function () { return 'A close friend is getting married in a few weeks. Egyptian weddings involve a cash gift (negoot) of 1000–5000 EGP, formal clothing, and often a full day of celebration.'; },
    choices: [
      { label: 'Attend with a generous gift (5000 EGP)', cost: function () { return p57EGP(5000); }, effect: function () { const f = (S.friends || []).filter(function (x) { return (x.bond || 0) >= 40; })[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 12); return { msg: 'Your friend was deeply moved by your generosity.', fx: { happiness: 5, social: 4 } }; } },
      { label: 'Attend with a modest gift (1500 EGP)', cost: function () { return p57EGP(1500); }, effect: function () { const f = (S.friends || []).filter(function (x) { return (x.bond || 0) >= 40; })[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 6); return { msg: 'You celebrated with them and gave what you could.', fx: { happiness: 3, social: 3 } }; } },
      { label: 'Send a message of congratulations only', cost: function () { return 0; }, effect: function () { const f = (S.friends || []).filter(function (x) { return (x.bond || 0) >= 40; })[0]; if (f) f.bond = Math.max(0, (f.bond || 50) - 8); return { msg: 'They replied politely but you sensed the distance.', fx: { social: -2 } }; } }
    ]
  });

  /* ---------- SIBLING WEDDING ---------- */
  pool.push({
    id: 'sibling_wedding', category: 'family', weight: 6, minAge: 22, maxAge: 60,
    ok: function () { return (S.family || []).some(function (m) { return m.alive !== false && m.role === 'Sibling' && m.age >= 20; }); },
    title: 'Your sibling is getting married',
    text: function () { return 'Your sibling is getting married. In Egyptian families, brothers and sisters are expected to help with wedding costs — often 10,000–30,000 EGP depending on your means.'; },
    choices: [
      { label: 'Contribute 20,000 EGP', cost: function () { return p57EGP(20000); }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Sibling'; }); if (m) m.bond = Math.min(100, (m.bond || 50) + 15); return { msg: 'Your contribution meant the world to your sibling. The family was proud of you.', fx: { happiness: 6, social: 3 } }; } },
      { label: 'Contribute 5,000 EGP', cost: function () { return p57EGP(5000); }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Sibling'; }); if (m) m.bond = Math.min(100, (m.bond || 50) + 6); return { msg: 'You helped where you could. They thanked you.', fx: { happiness: 2 } }; } },
      { label: 'Attend but cannot help financially', cost: function () { return 0; }, effect: function () { const m = (S.family || []).find(function (x) { return x.role === 'Sibling'; }); if (m) m.bond = Math.max(0, (m.bond || 50) - 6); return { msg: 'You celebrated with them but felt the family\u2019s unspoken judgment.', fx: {} }; } }
    ]
  });

  /* ---------- FAMILY DINNER ---------- */
  pool.push({
    id: 'family_dinner', category: 'family', weight: 10, minAge: 20, maxAge: 70,
    ok: function () { return (S.family || []).some(function (m) { return m.alive !== false; }); },
    title: 'Family dinner invitation',
    text: function () { return 'Your family is having a Friday dinner and expects you to bring something — sweets, fruit, or a dish. Around ' + p57EGP(400).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Bring something generous', cost: function () { return p57EGP(800); }, effect: function () { (S.family || []).filter(function (m) { return m.alive !== false; }).forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 4); }); return { msg: 'You arrived with a full spread. Everyone was pleased.', fx: { happiness: 3, social: 2 } }; } },
      { label: 'Bring something simple', cost: function () { return p57EGP(400); }, effect: function () { (S.family || []).filter(function (m) { return m.alive !== false; }).forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 2); }); return { msg: 'You contributed. Dinner was warm.', fx: { happiness: 2 } }; } },
      { label: 'Come empty-handed', cost: function () { return 0; }, effect: function () { (S.family || []).filter(function (m) { return m.alive !== false; }).forEach(function (m) { m.bond = Math.max(0, (m.bond || 50) - 2); }); return { msg: 'You came empty-handed. Nothing was said, but you felt it.', fx: {} }; } }
    ]
  });

  /* ---------- COLLEAGUE WEDDING ---------- */
  pool.push({
    id: 'colleague_wedding', category: 'work', weight: 7, minAge: 22, maxAge: 60,
    ok: function () { return !!S.job; },
    title: 'A colleague is getting married',
    text: function () { return 'A work colleague invites you to their wedding. It is polite to attend and bring a gift of about ' + p57EGP(2000).toLocaleString() + ' EGP. Skipping could look bad in the office.'; },
    choices: [
      { label: 'Attend with a proper gift', cost: function () { return p57EGP(2000); }, effect: function () { if (S.job) S.job.perf = Math.min(100, (S.job.perf || 50) + 3); return { msg: 'You made a good impression. The colleague will remember the gesture.', fx: { happiness: 2, social: 2 } }; } },
      { label: 'Send a card and small gift only', cost: function () { return p57EGP(500); }, effect: function () { return { msg: 'You were seen as polite but distant. Nothing changed.', fx: {} }; } },
      { label: 'Politely decline', cost: function () { return 0; }, effect: function () { if (S.job) S.job.perf = Math.max(0, (S.job.perf || 50) - 2); return { msg: 'Your colleague said "no problem" but you felt a slight cooling.', fx: { social: -1 } }; } }
    ]
  });

  /* ---------- FAMILY DRAMA ---------- */
  pool.push({
    id: 'family_drama_money', category: 'drama', weight: 8, minAge: 20, maxAge: 60,
    ok: function () { return (S.family || []).filter(function (m) { return m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); }).length >= 1; },
    title: 'Family argument about money',
    text: function () { return 'Your parents are arguing about money again. One of them calls you to vent. You can listen, take sides, or step back.'; },
    choices: [
      { label: 'Listen without taking sides', cost: function () { return 0; }, effect: function () { (S.family || []).filter(function (m) { return m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); }).forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 3); }); return { msg: 'You listened calmly. They both felt heard. The argument cooled.', fx: { happiness: 1 } }; } },
      { label: 'Offer to help financially', cost: function () { return p57EGP(2000); }, effect: function () { (S.family || []).filter(function (m) { return m.alive !== false; }).forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 6); }); return { msg: 'Your help eased the tension. They thanked you.', fx: { happiness: 2 } }; } },
      { label: 'Tell them it is not your problem', cost: function () { return 0; }, effect: function () { (S.family || []).filter(function (m) { return m.alive !== false; }).forEach(function (m) { m.bond = Math.max(0, (m.bond || 50) - 5); }); return { msg: 'They hung up abruptly. The relationship feels colder.', fx: { happiness: -3 } }; } }
    ]
  });

  /* ---------- RELATIVE ASKS FOR LOAN ---------- */
  pool.push({
    id: 'relative_loan', category: 'drama', weight: 6, minAge: 25, maxAge: 70,
    ok: function () { return (S.family || []).length >= 3; },
    title: 'A cousin asks for a loan',
    text: function () { return 'A cousin you have not spoken to in months calls. They need ' + p57EGP(8000).toLocaleString() + ' EGP for a business idea. They promise to repay in a year.'; },
    choices: [
      { label: 'Lend the full amount', cost: function () { return p57EGP(8000); }, effect: function () { if (Math.random() < 0.5) { return { msg: 'They promised to repay you. Whether they do remains to be seen.', fx: { happiness: 1 } }; } return { msg: 'They took the money and stopped answering your calls.', fx: { happiness: -4 } }; } },
      { label: 'Lend a smaller amount', cost: function () { return p57EGP(2000); }, effect: function () { return { msg: 'They accepted what you could offer.', fx: {} }; } },
      { label: 'Politely decline', cost: function () { return 0; }, effect: function () { return { msg: 'They said they understood but you could hear the disappointment.', fx: {} }; } }
    ]
  });

  /* ---------- OLD FRIEND REAPPEARS ---------- */
  pool.push({
    id: 'old_friend', category: 'friend', weight: 8, minAge: 22, maxAge: 70,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'An old friend reappears',
    text: function () { return 'Someone you lost touch with messages you out of the blue: "Long time! Let\u2019s catch up properly. Dinner at my place this Friday?"'; },
    choices: [
      { label: 'Go and reconnect (bring a small gift)', cost: function () { return p57EGP(500); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 8); return { msg: 'You picked up as if no time had passed. Warm evening.', fx: { happiness: 4, social: 3 } }; } },
      { label: 'Go but bring nothing', cost: function () { return 0; }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 3); return { msg: 'Good to reconnect. You promised to stay in touch.', fx: { happiness: 2 } }; } },
      { label: 'Say you are too busy', cost: function () { return 0; }, effect: function () { return { msg: 'They said "sure, maybe another time". You felt the distance.', fx: { social: -1 } }; } }
    ]
  });

  /* ---------- NEIGHBOR INVITE ---------- */
  pool.push({
    id: 'neighbor_dinner', category: 'social', weight: 5, minAge: 25, maxAge: 70,
    ok: function () { return S.housing && S.housing !== 'parents' && !S.ownedHomes.some(function (h) { return h.id === S.housing && h.status !== 'live'; }); },
    title: 'A neighbor invites you for dinner',
    text: function () { return 'Your neighbor waves you over: "We are having people over Friday. Join us!" You should bring something — sweets or drinks.'; },
    choices: [
      { label: 'Go and bring a gift', cost: function () { return p57EGP(400); }, effect: function () { return { msg: 'You made a good connection with your neighbors. They now greet you warmly.', fx: { happiness: 3, social: 2 } }; } },
      { label: 'Go but bring nothing', cost: function () { return 0; }, effect: function () { return { msg: 'You attended and had a pleasant evening.', fx: { happiness: 2 } }; } },
      { label: 'Decline politely', cost: function () { return 0; }, effect: function () { return { msg: 'You said you had plans. The neighbor smiled but seemed a bit put off.', fx: {} }; } }
    ]
  });

  /* ---------- 1. WORKPLACE GOSSIP ---------- */
  pool.push({
    id: 'work_gossip', category: 'work', weight: 8, minAge: 20, maxAge: 65,
    ok: function () { return !!S.job; },
    title: 'Workplace Drama',
    text: function () { return 'A coworker tries to drag you into some office gossip about your manager. It is juicy, but getting involved could backfire.'; },
    choices: [
      { label: 'Join in on the gossip', cost: function () { return 0; }, effect: function () { if (S.job) S.job.perf = Math.max(0, (S.job.perf || 50) - 5); return { msg: 'Word got back to your manager. Your performance review took a hit.', fx: { social: 2, happiness: -2 } }; } },
      { label: 'Listen but stay neutral', cost: function () { return 0; }, effect: function () { return { msg: 'You nodded along without saying anything incriminating.', fx: { social: 1 } }; } },
      { label: 'Tell them you are too busy', cost: function () { return 0; }, effect: function () { if (S.job) S.job.perf = Math.min(100, (S.job.perf || 50) + 2); return { msg: 'You stayed out of it. The coworker thinks you are boring, but your boss is happy.', fx: { social: -1, smarts: 1 } }; } }
    ]
  });

  /* ---------- 2. UNPAID OVERTIME ---------- */
  pool.push({
    id: 'work_overtime', category: 'work', weight: 10, minAge: 20, maxAge: 65,
    ok: function () { return !!S.job; },
    title: 'Urgent Deadline',
    text: function () { return 'Your boss asks you to stay late every day this week to finish a project. There is no overtime pay, but it might help your career.'; },
    choices: [
      { label: 'Work the unpaid overtime', cost: function () { return 0; }, effect: function () { if (S.job) S.job.perf = Math.min(100, (S.job.perf || 50) + 8); return { msg: 'You worked exhausting hours. Your boss was impressed, but you are drained.', fx: { health: -3, happiness: -4 } }; } },
      { label: 'Compromise (stay late one day)', cost: function () { return 0; }, effect: function () { if (S.job) S.job.perf = Math.min(100, (S.job.perf || 50) + 2); return { msg: 'You helped out a bit without killing yourself.', fx: { health: -1, happiness: -1 } }; } },
      { label: 'Refuse, say you have plans', cost: function () { return 0; }, effect: function () { if (S.job) S.job.perf = Math.max(0, (S.job.perf || 50) - 6); return { msg: 'You protected your free time, but your boss seemed annoyed.', fx: { happiness: 2 } }; } }
    ]
  });

  /* ---------- 3. BROKEN PHONE SCREEN ---------- */
  pool.push({
    id: 'broken_phone', category: 'financial', weight: 12, minAge: 16, maxAge: 80,
    ok: function () { return true; },
    title: 'Shattered Screen',
    text: function () { return 'You dropped your phone on the pavement. The screen is completely shattered. Fixing it properly costs ' + p57EGP(2000).toLocaleString() + ' EGP. A cheap fix is ' + p57EGP(600).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Fix it properly', cost: function () { return p57EGP(2000); }, effect: function () { return { msg: 'Your phone looks brand new again.', fx: { happiness: 1 } }; } },
      { label: 'Get the cheap fix', cost: function () { return p57EGP(600); }, effect: function () { return { msg: 'The new screen has a weird blue tint and the touch is glitchy, but it works.', fx: { happiness: -2 } }; } },
      { label: 'Live with the cracked screen', cost: function () { return 0; }, effect: function () { return { msg: 'You cut your thumb on the glass twice this week.', fx: { happiness: -4, health: -1 } }; } }
    ]
  });

  /* ---------- 4. THE BAWAB / DOORMAN ---------- */
  pool.push({
    id: 'bawab_tip', category: 'financial', weight: 12, minAge: 20, maxAge: 80,
    ok: function () { return S.housing && S.housing !== 'parents'; },
    title: 'The Bawab',
    text: function () { return 'The building bawab (doorman) has been doing a lot of heavy lifting for you recently. He hints that a tip (Edeya or just a thank you) would be appreciated.'; },
    choices: [
      { label: 'Give a generous tip (300 EGP)', cost: function () { return p57EGP(300); }, effect: function () { return { msg: 'He is thrilled. Your car is always watched and your deliveries are rushed to your door.', fx: { happiness: 2 } }; } },
      { label: 'Give a standard tip (100 EGP)', cost: function () { return p57EGP(100); }, effect: function () { return { msg: 'He said thanks. Things continue normally.', fx: {} }; } },
      { label: 'Ignore the hint', cost: function () { return 0; }, effect: function () { return { msg: 'Suddenly, he is never around when you need him.', fx: { happiness: -2 } }; } }
    ]
  });

  /* ---------- 5. SAHEL TRIP INVITATION ---------- */
  pool.push({
    id: 'sahel_trip', category: 'social', weight: 6, minAge: 18, maxAge: 45,
    ok: function () { return (S.friends || []).length >= 2; },
    title: 'Weekend in Sahel',
    text: function () { return 'Your friends are renting a villa in the North Coast (Sahel) for the weekend. Your share for accommodation, food, and going out will be about ' + p57EGP(6000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Go all out and join them', cost: function () { return p57EGP(6000); }, effect: function () { S.friends.slice(0, 3).forEach(function (f) { f.bond = Math.min(100, (f.bond || 50) + 10); }); return { msg: 'You had an amazing, unforgettable weekend on the beach.', fx: { happiness: 8, social: 6, health: -1 } }; } },
      { label: 'Go but try to spend less on outings', cost: function () { return p57EGP(3500); }, effect: function () { S.friends.slice(0, 3).forEach(function (f) { f.bond = Math.min(100, (f.bond || 50) + 5); }); return { msg: 'You went, but felt a bit left out sitting on the beach while they went to expensive parties.', fx: { happiness: 3, social: 3 } }; } },
      { label: 'Skip it, too expensive', cost: function () { return 0; }, effect: function () { return { msg: 'You stayed in the hot city watching their Instagram stories.', fx: { happiness: -4, social: -2 } }; } }
    ]
  });

  /* ---------- 6. FOOD POISONING ---------- */
  pool.push({
    id: 'food_poisoning', category: 'health', weight: 10, minAge: 12, maxAge: 80,
    ok: function () { return true; },
    title: 'Bad Street Food',
    text: function () { return 'That late-night liver sandwich was a mistake. You woke up with terrible food poisoning. You need medications and electrolytes (' + p57EGP(400).toLocaleString() + ' EGP).'; },
    choices: [
      { label: 'Buy the meds and rest', cost: function () { return p57EGP(400); }, effect: function () { return { msg: 'You stayed in bed for two days and recovered gracefully.', fx: { health: -2, happiness: -2 } }; } },
      { label: 'Tough it out without meds', cost: function () { return 0; }, effect: function () { return { msg: 'You spent a miserable 4 days suffering in the bathroom. You lost weight and feel awful.', fx: { health: -8, happiness: -6 } }; } }
    ]
  });

  /* ---------- 7. SUBSCRIPTION TRAP ---------- */
  pool.push({
    id: 'sub_trap', category: 'financial', weight: 10, minAge: 18, maxAge: 80,
    ok: function () { return true; },
    title: 'Forgotten Subscription',
    text: function () { return 'You notice an auto-renewal charge on your card for an app you haven\'t used in a year. It cost ' + p57EGP(1200).toLocaleString() + ' EGP. You can try to fight customer service for a refund.'; },
    choices: [
      { label: 'Spend 2 hours arguing for a refund', cost: function () { return 0; }, effect: function () { if (Math.random() < 0.6) { return { msg: 'You eventually got the refund, but it ruined your afternoon.', fx: { happiness: -2, stress: 2 } }; } else { S.wealth -= (p57EGP(1200) / p57Rate()); return { msg: 'They pointed to the Terms of Service. You lost the money anyway.', fx: { happiness: -4 } }; } } },
      { label: 'Accept the loss and just cancel it', cost: function () { return p57EGP(1200); }, effect: function () { return { msg: 'You paid the stupid tax and moved on.', fx: { happiness: -1 } }; } }
    ]
  });

  /* ---------- 8. THE COUSIN COMPARISON ---------- */
  pool.push({
    id: 'cousin_compare', category: 'family', weight: 8, minAge: 18, maxAge: 40,
    ok: function () { return (S.family || []).some(function (m) { return m.role === 'Mother' || m.role === 'Father'; }); },
    title: 'The Successful Cousin',
    text: function () { return 'Your parent calls you just to mention how your cousin just bought a new car and got a promotion. The comparison is obvious and annoying.'; },
    choices: [
      { label: 'Change the subject calmly', cost: function () { return 0; }, effect: function () { return { msg: 'You brushed it off. Your parent got the hint.', fx: { smarts: 1 } }; } },
      { label: 'Argue and defend yourself', cost: function () { return 0; }, effect: function () { const p = (S.family || []).find(function (m) { return m.role === 'Mother' || m.role === 'Father'; }); if (p) p.bond = Math.max(0, (p.bond || 50) - 5); return { msg: 'It turned into a fight. You hung up feeling terrible.', fx: { happiness: -4 } }; } },
      { label: 'Agree and feel bad', cost: function () { return 0; }, effect: function () { return { msg: 'You agreed you need to do better. Your self-esteem took a hit.', fx: { happiness: -5 } }; } }
    ]
  });

  /* ---------- 9. GYM PRESSURE ---------- */
  pool.push({
    id: 'gym_pressure', category: 'health', weight: 8, minAge: 18, maxAge: 50,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'Gym Buddy',
    text: function () { return 'A friend is pressuring you to join their gym so you can work out together. A 3-month membership is ' + p57EGP(2500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Sign up and actually go', cost: function () { return p57EGP(2500); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 5); return { msg: 'You went regularly. You feel stronger and closer to your friend.', fx: { health: 5, happiness: 2, social: 3 } }; } },
      { label: 'Sign up but stop going after a week', cost: function () { return p57EGP(2500); }, effect: function () { return { msg: 'You wasted the money and your friend is annoyed you bailed on them.', fx: { health: 1, happiness: -2 } }; } },
      { label: 'Refuse to join', cost: function () { return 0; }, effect: function () { return { msg: 'You saved your money, but feel a little guilty every time they post a workout selfie.', fx: { health: -1 } }; } }
    ]
  });

  /* ---------- 10. AUNT'S SURPRISE VISIT ---------- */
  pool.push({
    id: 'aunt_visit', category: 'family', weight: 8, minAge: 22, maxAge: 60,
    ok: function () { return S.housing && S.housing !== 'parents'; },
    title: 'Unannounced Relatives',
    text: function () { return 'Your aunt and her kids are in the neighborhood and decide to drop by your place unannounced. Your apartment is a mess and you have no food to offer.'; },
    choices: [
      { label: 'Order expensive hospitality delivery', cost: function () { return p57EGP(800); }, effect: function () { return { msg: 'You ordered gateaux and juices. She was impressed by your hospitality.', fx: { social: 3, happiness: 1 } }; } },
      { label: 'Serve whatever you have (tea and biscuits)', cost: function () { return p57EGP(50); }, effect: function () { return { msg: 'She judged your messy house and cheap biscuits, but you survived the visit.', fx: { happiness: -2, stress: 2 } }; } },
      { label: 'Pretend you are not home', cost: function () { return 0; }, effect: function () { return { msg: 'You hid in silence until they left. Your mother called later to yell at you.', fx: { happiness: -3, social: -3 } }; } }
    ]
  });

  /* ---------- 11. PYRAMID SCHEME ---------- */
  pool.push({
    id: 'mlm_scheme', category: 'social', weight: 7, minAge: 18, maxAge: 40,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'The "Business Opportunity"',
    text: function () { return 'A friend invites you to coffee, only to pitch you a "guaranteed wealth" network marketing scheme. They want you to buy a starter kit for ' + p57EGP(4000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy the kit to support them', cost: function () { return p57EGP(4000); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 15); return { msg: 'You bought the useless products. You lost money, but your friend loves you.', fx: { smarts: -2, happiness: -2 } }; } },
      { label: 'Politely decline but pay for coffee', cost: function () { return p57EGP(200); }, effect: function () { return { msg: 'You dodged the scam gracefully.', fx: { smarts: 1 } }; } },
      { label: 'Call it a scam and walk out', cost: function () { return 0; }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.max(0, (f.bond || 50) - 20); return { msg: 'You saved your money, but the friendship is severely damaged.', fx: { social: -3 } }; } }
    ]
  });

  /* ---------- 12. DENTAL EMERGENCY ---------- */
  pool.push({
    id: 'toothache', category: 'health', weight: 8, minAge: 15, maxAge: 80,
    ok: function () { return true; },
    title: 'Severe Toothache',
    text: function () { return 'You wake up with a pounding toothache. You need a root canal. Going to a good private dentist costs ' + p57EGP(3500).toLocaleString() + ' EGP. A cheap clinic is ' + p57EGP(800).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Go to the good dentist', cost: function () { return p57EGP(3500); }, effect: function () { return { msg: 'The procedure was painless and the tooth is fully fixed.', fx: { health: 1 } }; } },
      { label: 'Go to the cheap clinic', cost: function () { return p57EGP(800); }, effect: function () { return { msg: 'It hurt. A lot. But the tooth is filled.', fx: { health: -1, happiness: -3 } }; } },
      { label: 'Just take painkillers', cost: function () { return p57EGP(100); }, effect: function () { return { msg: 'The pain keeps coming back. You can barely sleep.', fx: { health: -5, happiness: -5 } }; } }
    ]
  });

  /* ---------- 13. COWORKER ASKS FOR LOAN ---------- */
  pool.push({
    id: 'coworker_loan', category: 'work', weight: 6, minAge: 22, maxAge: 65,
    ok: function () { return !!S.job; },
    title: 'Awkward Ask',
    text: function () { return 'A coworker pulls you aside. They are short on rent and ask to borrow ' + p57EGP(2000).toLocaleString() + ' EGP until payday.'; },
    choices: [
      { label: 'Lend them the money', cost: function () { return p57EGP(2000); }, effect: function () { if (Math.random() < 0.7) { return { msg: 'They paid you back on time. Your working relationship is great.', fx: { happiness: 1, social: 2 } }; } else { return { msg: 'They keep making excuses. You probably won\'t see that money again.', fx: { happiness: -3, social: -1 } }; } } },
      { label: 'Make up an excuse to say no', cost: function () { return 0; }, effect: function () { return { msg: 'Things are awkward in the office now, but your money is safe.', fx: { happiness: -1 } }; } }
    ]
  });

  /* ---------- 14. WATER CUT ---------- */
  pool.push({
    id: 'water_cut', category: 'financial', weight: 10, minAge: 18, maxAge: 80,
    ok: function () { return S.housing !== null; },
    title: 'No Water in the Building',
    text: function () { return 'A main pipe broke in the street. Your building will have no water for 48 hours. You need to buy big water bottles and order delivery for all meals.'; },
    choices: [
      { label: 'Buy water and order out', cost: function () { return p57EGP(900); }, effect: function () { return { msg: 'It was highly inconvenient, but you survived the weekend.', fx: { happiness: -2 } }; } },
      { label: 'Go stay at a cheap hotel/Airbnb', cost: function () { return p57EGP(2500); }, effect: function () { return { msg: 'You spent money for comfort and took a nice hot shower.', fx: { happiness: 1 } }; } },
      { label: 'Go crash with your parents', cost: function () { return 0; }, effect: function () { return { msg: 'You slept on their couch. Free, but annoying.', fx: { happiness: -1, social: 1 } }; } }
    ]
  });

  /* ---------- 15. LOUD NEIGHBORS ---------- */
  pool.push({
    id: 'loud_neighbors', category: 'drama', weight: 8, minAge: 20, maxAge: 80,
    ok: function () { return S.housing !== 'parents'; },
    title: 'Upstairs Noise',
    text: function () { return 'The neighbors upstairs are dragging furniture and yelling at 2 AM on a Tuesday. You can\'t sleep.'; },
    choices: [
      { label: 'Go upstairs and confront them', cost: function () { return 0; }, effect: function () { if (Math.random() > 0.5) { return { msg: 'They apologized and quieted down. You slept well.', fx: { happiness: 1 } }; } else { return { msg: 'They yelled at you. You went back down angry and awake.', fx: { happiness: -3, stress: 3 } }; } } },
      { label: 'Call the Bawab to handle it', cost: function () { return p57EGP(50); }, effect: function () { return { msg: 'The Bawab talked to them and the noise stopped.', fx: { happiness: 1 } }; } },
      { label: 'Put in earplugs and suffer', cost: function () { return 0; }, effect: function () { return { msg: 'You woke up exhausted for work.', fx: { health: -1, happiness: -2 } }; } }
    ]
  });

  /* ---------- 16. FOUND CASH ---------- */
  pool.push({
    id: 'found_cash', category: 'random', weight: 5, minAge: 12, maxAge: 80,
    ok: function () { return true; },
    title: 'A Lucky Find',
    text: function () { return 'While putting on a winter jacket you haven\'t worn since last year, you reach into the pocket and find a crisp 200 EGP note (scaled for inflation).'; },
    choices: [
      { label: 'Keep it', cost: function () { return 0; }, effect: function () { const amt = p57EGP(200); S.wealth += (amt / p57Rate()); return { msg: 'Past you was looking out for present you! Found ' + amt + ' EGP.', fx: { happiness: 3 } }; } }
    ]
  });

  /* ---------- 17. SCAM CALL ---------- */
  pool.push({
    id: 'scam_call', category: 'financial', weight: 8, minAge: 18, maxAge: 80,
    ok: function () { return true; },
    title: 'Bank "Security" Call',
    text: function () { return 'You get a phone call from someone claiming to be from your bank. They say your account is frozen and they need your OTP to verify your identity.'; },
    choices: [
      { label: 'Give them the OTP', cost: function () { return 0; }, effect: function () { const lost = p57EGP(4000); if(S.wealth * p57Rate() > lost) S.wealth -= (lost / p57Rate()); else S.wealth = 0; return { msg: 'It was a scam. They stole money from your account before you could block the card.', fx: { happiness: -8, smarts: -3 } }; } },
      { label: 'Hang up and block the number', cost: function () { return 0; }, effect: function () { return { msg: 'Nice try, scammers. You protected your money.', fx: { smarts: 2, happiness: 1 } }; } }
    ]
  });

  /* ---------- 18. CAR / COMMUTE TROUBLE ---------- */
  pool.push({
    id: 'commute_trouble', category: 'financial', weight: 10, minAge: 18, maxAge: 65,
    ok: function () { return !!S.job; },
    title: 'Morning Disaster',
    text: function () { return 'You are running late for an important meeting, but your usual transportation falls through. Taking a premium Uber surge ride will cost ' + p57EGP(300).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Pay the surge price', cost: function () { return p57EGP(300); }, effect: function () { return { msg: 'You made it to the meeting just in time, but your wallet hurts.', fx: { happiness: -1 } }; } },
      { label: 'Take public transit and arrive late', cost: function () { return p57EGP(20); }, effect: function () { if (S.job) S.job.perf = Math.max(0, (S.job.perf || 50) - 4); return { msg: 'You were 45 minutes late. Your boss publicly scolded you.', fx: { happiness: -3 } }; } },
      { label: 'Call in sick', cost: function () { return 0; }, effect: function () { if (S.job) S.job.perf = Math.max(0, (S.job.perf || 50) - 2); return { msg: 'You stayed home. You saved money but look unreliable.', fx: { happiness: 1 } }; } }
    ]
  });

  /* ---------- 19. SIBLING NEEDS COVER ---------- */
  pool.push({
    id: 'sibling_cover', category: 'drama', weight: 8, minAge: 16, maxAge: 40,
    ok: function () { return (S.family || []).some(function (m) { return m.role === 'Sibling'; }); },
    title: 'Covering for a Sibling',
    text: function () { return 'Your younger sibling calls. They sneaked out and need you to lie to your parents about where they are. If you get caught, the parents will be furious with you too.'; },
    choices: [
      { label: 'Lie for them', cost: function () { return 0; }, effect: function () { if (Math.random() > 0.4) { const s = (S.family||[]).find(x => x.role==='Sibling'); if (s) s.bond = Math.min(100, (s.bond||50)+8); return { msg: 'You covered successfully. Your sibling owes you one.', fx: { social: 1 } }; } else { const p = (S.family||[]).find(x => x.role==='Mother'); if(p) p.bond -= 10; return { msg: 'You both got caught. Your parents are incredibly disappointed in you.', fx: { happiness: -5 } }; } } },
      { label: 'Refuse to lie', cost: function () { return 0; }, effect: function () { const s = (S.family||[]).find(x => x.role==='Sibling'); if (s) s.bond -= 10; return { msg: 'Your sibling got in huge trouble and blames you for not helping.', fx: { happiness: -2 } }; } }
    ]
  });

  /* ---------- 20. DOUBLE DATE ---------- */
  pool.push({
    id: 'awkward_date', category: 'social', weight: 6, minAge: 18, maxAge: 35,
    ok: function () { return (S.friends || []).length > 0 && (!S.marriage || !S.marriage.wifeWorks); },
    title: 'The Setup',
    text: function () { return 'A well-meaning friend sets you up on a blind double date at a nice cafe. It will cost about ' + p57EGP(500).toLocaleString() + ' EGP. They promise the person is "perfect for you."'; },
    choices: [
      { label: 'Go on the date', cost: function () { return p57EGP(500); }, effect: function () { if (Math.random() > 0.5) { return { msg: 'The date was actually really fun. You hit it off.', fx: { happiness: 4, social: 3 } }; } else { return { msg: 'It was the most awkward 2 hours of your life. Zero chemistry.', fx: { happiness: -2, social: 1 } }; } } },
      { label: 'Make an excuse to cancel', cost: function () { return 0; }, effect: function () { return { msg: 'You stayed home and watched Netflix. Safe, but lonely.', fx: { happiness: -1 } }; } }
    ]
  });

  /* ---------- 21. APPLIANCE BROKEN ---------- */
  pool.push({
    id: 'fridge_broken', category: 'financial', weight: 10, minAge: 22, maxAge: 80,
    ok: function () { return S.housing && S.housing !== 'parents'; },
    title: 'Broken Refrigerator',
    text: function () { return 'You wake up to find a puddle of water in the kitchen. Your fridge has completely stopped working. All your food is spoiling.'; },
    choices: [
      { label: 'Call an emergency technician', cost: function () { return p57EGP(1500); }, effect: function () { return { msg: 'The technician fixed the compressor. Most of your food was saved.', fx: { happiness: -1 } }; } },
      { label: 'Wait days for the warranty guy', cost: function () { return 0; }, effect: function () { return { msg: 'The fix was free, but all your food spoiled and you ate takeout for 4 days.', fx: { happiness: -4, health: -1 } }; } }
    ]
  });

  /* ---------- 22. FRIEND STARTUP ---------- */
  pool.push({
    id: 'friend_startup', category: 'social', weight: 6, minAge: 20, maxAge: 45,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'Support a Friend',
    text: function () { return 'Your friend just started a new small business selling handmade clothes/candles online. They hint they would love their friends to buy something to support the launch (' + p57EGP(800).toLocaleString() + ' EGP).'; },
    choices: [
      { label: 'Buy a product to support them', cost: function () { return p57EGP(800); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 12); return { msg: 'Your friend was incredibly grateful for the support. (The product isn\'t bad either).', fx: { happiness: 2, social: 2 } }; } },
      { label: 'Just share their post on social media', cost: function () { return 0; }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 2); return { msg: 'You supported them for free. They appreciated it.', fx: { social: 1 } }; } },
      { label: 'Ignore it', cost: function () { return 0; }, effect: function () { return { msg: 'You ignored the launch. Your friend definitely noticed who bought and who didn\'t.', fx: { social: -2 } }; } }
    ]
  });

  /* ---------- 23. ELECTRICITY SPIKE ---------- */
  pool.push({
    id: 'electric_spike', category: 'financial', weight: 12, minAge: 20, maxAge: 80,
    ok: function () { return S.housing && S.housing !== 'parents'; },
    title: 'Summer Electricity Bill',
    text: function () { return 'The August heat wave was brutal, and you ran the AC non-stop. The electricity bill just arrived and it is ' + p57EGP(2000).toLocaleString() + ' EGP higher than normal.'; },
    choices: [
      { label: 'Pay the bill', cost: function () { return p57EGP(2000); }, effect: function () { return { msg: 'Ouch. That hurt the wallet, but at least you didn\'t melt in the heat.', fx: { happiness: -2 } }; } }
    ]
  });

  /* ---------- 24. BAD BREAKUP FRIEND ---------- */
  pool.push({
    id: 'friend_breakup', category: 'social', weight: 8, minAge: 18, maxAge: 50,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'The Breakup',
    text: function () { return 'Your best friend just went through a horrible breakup. They show up at your door crying and want to stay over and talk all night.'; },
    choices: [
      { label: 'Order comfort food and stay up all night', cost: function () { return p57EGP(600); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 15); return { msg: 'You were a great friend. You are exhausted today, but they needed you.', fx: { health: -2, happiness: 2, social: 4 } }; } },
      { label: 'Talk for an hour, then send them home', cost: function () { return 0; }, effect: function () { return { msg: 'You gave them some advice but protected your sleep schedule.', fx: { social: -1 } }; } },
      { label: 'Say you are too busy', cost: function () { return 0; }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond -= 20; return { msg: 'You abandoned them when they needed you most. The friendship is cracked.', fx: { happiness: -3, social: -4 } }; } }
    ]
  });

  /* ---------- 25. YOUNGER SIBLING ADVICE ---------- */
  pool.push({
    id: 'sibling_advice', category: 'family', weight: 8, minAge: 24, maxAge: 50,
    ok: function () { return (S.family || []).some(function (m) { return m.role === 'Sibling' && m.age < S.age; }); },
    title: 'Career Advice',
    text: function () { return 'Your younger sibling asks you for advice. They want to drop out of university to pursue a risky career as an influencer/artist.'; },
    choices: [
      { label: 'Encourage them to follow their dreams', cost: function () { return 0; }, effect: function () { const s = (S.family||[]).find(x => x.role==='Sibling'); if (s) s.bond += 10; return { msg: 'Your sibling is thrilled, but your parents blame you for "corrupting" them.', fx: { happiness: 1, social: -2 } }; } },
      { label: 'Tell them to be realistic and finish school', cost: function () { return 0; }, effect: function () { return { msg: 'You gave harsh but safe advice. They were annoyed but listened.', fx: { smarts: 2 } }; } },
      { label: 'Take them out to dinner to discuss it properly', cost: function () { return p57EGP(800); }, effect: function () { const s = (S.family||[]).find(x => x.role==='Sibling'); if (s) s.bond += 12; return { msg: 'You had a deep, meaningful talk. You feel like a great older sibling.', fx: { happiness: 4, social: 2 } }; } }
    ]
  });

  /* ---------- 26. PARENTS ANNIVERSARY ---------- */
  pool.push({
    id: 'parents_anniversary', category: 'family', weight: 8, minAge: 18, maxAge: 50,
    ok: function () { return (S.family || []).filter(function (m) { return m.role === 'Mother' || m.role === 'Father'; }).length === 2; },
    title: 'Parents Anniversary',
    text: function () { return 'Your siblings want to pool money together to buy your parents a very nice anniversary gift (A weekend trip or a new TV). Your share is ' + p57EGP(3500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Pay your share willingly', cost: function () { return p57EGP(3500); }, effect: function () { (S.family || []).forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 8); }); return { msg: 'Your parents cried when they got the gift. The whole family is happy.', fx: { happiness: 5 } }; } },
      { label: 'Say you can only afford half', cost: function () { return p57EGP(1750); }, effect: function () { return { msg: 'Your siblings covered the rest. It caused a bit of friction, but the parents got the gift.', fx: { happiness: 2 } }; } },
      { label: 'Refuse to pay', cost: function () { return 0; }, effect: function () { (S.family || []).filter(function(x){return x.role==='Sibling';}).forEach(function (m) { m.bond -= 15; }); return { msg: 'Your siblings are furious with you. You look cheap.', fx: { happiness: -4 } }; } }
    ]
  });

  /* ---------- 27. INSOMNIA WEEK ---------- */
  pool.push({
    id: 'insomnia_week', category: 'health', weight: 8, minAge: 18, maxAge: 80,
    ok: function () { return true; },
    title: 'Bout of Insomnia',
    text: function () { return 'For an entire week, you find it impossible to fall asleep before 4 AM. You are exhausted during the day and your brain feels foggy.'; },
    choices: [
      { label: 'Go to a pharmacy for sleep aids', cost: function () { return p57EGP(250); }, effect: function () { return { msg: 'The pills knocked you out. You finally caught up on sleep, but felt groggy.', fx: { health: 1, happiness: -1 } }; } },
      { label: 'Just drink lots of coffee and survive', cost: function () { return p57EGP(150); }, effect: function () { return { msg: 'You survived the week on caffeine, but your heart rate is crazy and you are miserable.', fx: { health: -4, happiness: -4, stress: 4 } }; } },
      { label: 'Take two days off work to rest', cost: function () { return 0; }, effect: function () { if (S.job) S.job.perf = Math.max(0, (S.job.perf || 50) - 3); return { msg: 'You lost some traction at work, but your body finally rested.', fx: { health: 3, happiness: 1 } }; } }
    ]
  });

  /* ---------- 28. TEAM BUILDING ---------- */
  pool.push({
    id: 'work_team_building', category: 'work', weight: 8, minAge: 20, maxAge: 65,
    ok: function () { return !!S.job; },
    title: 'Mandatory Fun',
    text: function () { return 'Your company is doing a "team building" escape room and dinner. It is technically voluntary, but the managers are noting who attends. Everyone has to pay ' + p57EGP(600).toLocaleString() + ' EGP for their own dinner.'; },
    choices: [
      { label: 'Go and pay', cost: function () { return p57EGP(600); }, effect: function () { if (S.job) S.job.perf = Math.min(100, (S.job.perf || 50) + 4); return { msg: 'You faked a smile, escaped the room, and scored points with the boss.', fx: { social: 2, happiness: -1 } }; } },
      { label: 'Skip it', cost: function () { return 0; }, effect: function () { if (S.job) S.job.perf = Math.max(0, (S.job.perf || 50) - 3); return { msg: 'You went home early. You missed out on the networking, but kept your money.', fx: { happiness: 2, social: -2 } }; } }
    ]
  });

  /* ---------- 29. CHARITY CASE ---------- */
  pool.push({
    id: 'street_charity', category: 'random', weight: 8, minAge: 16, maxAge: 80,
    ok: function () { return true; },
    title: 'A Cry for Help',
    text: function () { return 'While walking out of a supermarket, an elderly person quietly asks you for help buying some basic groceries for their family.'; },
    choices: [
      { label: 'Buy them a full grocery bag', cost: function () { return p57EGP(500); }, effect: function () { return { msg: 'You bought them rice, oil, chicken, and bread. They prayed for you. You feel deeply fulfilled.', fx: { happiness: 6, health: 1 } }; } },
      { label: 'Give them some cash', cost: function () { return p57EGP(100); }, effect: function () { return { msg: 'You gave what you could spare. They thanked you.', fx: { happiness: 2 } }; } },
      { label: 'Apologize and walk away', cost: function () { return 0; }, effect: function () { return { msg: 'You walked away, but felt a pang of guilt on the drive home.', fx: { happiness: -2 } }; } }
    ]
  });

  /* ---------- 30. INHERITANCE DISPUTE ---------- */
  pool.push({
    id: 'inheritance_drama', category: 'drama', weight: 5, minAge: 25, maxAge: 60,
    ok: function () { return (S.family || []).some(function(m){return m.role === 'Mother' || m.role === 'Father';}); },
    title: 'Family Inheritance Drama',
    text: function () { return 'Your parents are embroiled in a massive legal dispute with your uncles over an old piece of agricultural land. The tension is spilling over into your life; your uncle demands you convince your parents to give up.'; },
    choices: [
      { label: 'Defend your parents aggressively', cost: function () { return 0; }, effect: function () { const p = (S.family||[]).find(x => x.role==='Mother' || x.role==='Father'); if(p) p.bond += 10; return { msg: 'You yelled at your uncle. Your parents are proud of you, but the family is fractured.', fx: { stress: 4, happiness: -2 } }; } },
      { label: 'Try to mediate peacefully', cost: function () { return 0; }, effect: function () { return { msg: 'You tried to talk sense into everyone. Nobody listened to you, and you wasted hours stressing.', fx: { stress: 5, happiness: -3 } }; } },
      { label: 'Refuse to get involved', cost: function () { return 0; }, effect: function () { const p = (S.family||[]).find(x => x.role==='Mother' || x.role==='Father'); if(p) p.bond -= 5; return { msg: 'You blocked their numbers and stayed out of it. Your parents feel unsupported, but your mental health is intact.', fx: { happiness: 2 } }; } }
    ]
  });

  /* ---------- 31. THE MICROBUS INCIDENT ---------- */
  pool.push({
    id: 'microbus_accident', category: 'emergency', weight: 10, minAge: 18, maxAge: 70,
    ok: function () { return true; },
    title: 'Traffic Collision',
    text: function () { return 'A microbus abruptly swerves to pick up a passenger and hits the side of the car you are in. The driver is yelling, a crowd is gathering, and the damage needs to be paid for right now to avoid the police station.'; },
    choices: [
      { label: 'Pay to de-escalate (2000 EGP)', cost: function () { return p57EGP(2000); }, effect: function () { return { msg: 'You paid the money to avoid a messy police report. You are safe but angry.', fx: { happiness: -4, stress: 3 } }; } },
      { label: 'Refuse and go to the police station', cost: function () { return 0; }, effect: function () { return { msg: 'You spent 7 hours at the station in the heat. Nothing was resolved, and you lost a day of your life.', fx: { happiness: -6, health: -2, stress: 5 } }; } }
    ]
  });

  /* ---------- 32. MEDICAL EMERGENCY: APPENDICITIS ---------- */
  pool.push({
    id: 'appendicitis', category: 'health', weight: 4, minAge: 15, maxAge: 50,
    ok: function () { return true; },
    title: 'Searing Abdominal Pain',
    text: function () { return 'You wake up in the middle of the night in absolute agony. The pain in your lower right abdomen is unbearable. You need to go to the emergency room immediately. A private hospital requires a ' + p57EGP(15000).toLocaleString() + ' EGP deposit for surgery.'; },
    choices: [
      { label: 'Go to a good private hospital', cost: function () { return p57EGP(15000); }, effect: function () { return { msg: 'They rushed you into surgery. You recovered safely in a clean room over the next 3 days.', fx: { health: -5, happiness: -2 } }; } },
      { label: 'Go to a crowded public hospital', cost: function () { return p57EGP(1000); }, effect: function () { return { msg: 'You waited for hours in pain before surgery. The recovery was rough, but you survived.', fx: { health: -15, happiness: -8, stress: 6 } }; } }
    ]
  });

  /* ---------- 33. ROLLING BLACKOUTS ---------- */
  pool.push({
    id: 'rolling_blackouts', category: 'drama', weight: 12, minAge: 18, maxAge: 80,
    ok: function () { return S.housing !== 'parents'; },
    title: 'Summer Power Cuts',
    text: function () { return 'The government has implemented strict 2-hour rolling blackouts every day. It is 40 degrees outside, your fridge is struggling, and you can\'t work.'; },
    choices: [
      { label: 'Buy a UPS and rechargeable fans', cost: function () { return p57EGP(3500); }, effect: function () { return { msg: 'The fans kept you sane and the UPS saved your internet router. A worthy investment.', fx: { happiness: 1 } }; } },
      { label: 'Just suffer through the heat', cost: function () { return 0; }, effect: function () { return { msg: 'You spent 2 hours every day sweating in the dark, questioning your life choices.', fx: { happiness: -4, health: -1, stress: 2 } }; } }
    ]
  });

  /* ---------- 34. STOLEN WALLET ON THE METRO ---------- */
  pool.push({
    id: 'stolen_wallet', category: 'emergency', weight: 8, minAge: 16, maxAge: 70,
    ok: function () { return true; },
    title: 'Pickpocketed',
    text: function () { return 'You were squished in a crowded metro carriage at Al Shohada station. When you get off, your wallet is gone. You lost your cash (' + p57EGP(800).toLocaleString() + ' EGP), your National ID, and your bank cards.'; },
    choices: [
      { label: 'Cancel cards and replace ID', cost: function () { return p57EGP(800); }, effect: function () { return { msg: 'You spent three miserable mornings in government offices replacing your ID.', fx: { happiness: -5, stress: 5 } }; } }
    ]
  });

  /* ---------- 35. FRIEND MOVING TO DUBAI ---------- */
  pool.push({
    id: 'friend_emigrates', category: 'social', weight: 8, minAge: 22, maxAge: 40,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'Farewell Party',
    text: function () { return 'One of your closest friends just got a job in Dubai and is leaving Egypt next week. The friend group is organizing a big farewell dinner.'; },
    choices: [
      { label: 'Help pay for the dinner and a nice gift', cost: function () { return p57EGP(1500); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 15); return { msg: 'It was an emotional goodbye. You promised to visit them in the UAE.', fx: { happiness: -2, social: 4 } }; } },
      { label: 'Just go to the airport to say goodbye', cost: function () { return p57EGP(100); }, effect: function () { const f = (S.friends || [])[0]; if (f) f.bond = Math.min(100, (f.bond || 50) + 5); return { msg: 'You hugged them at Terminal 2. The city feels a little emptier now.', fx: { happiness: -3 } }; } }
    ]
  });

  /* ---------- 36. NOSY AUNT ---------- */
  pool.push({
    id: 'nosy_aunt', category: 'family', weight: 10, minAge: 22, maxAge: 35,
    ok: function () { return (S.family || []).some(function(m) { return m.role === 'Mother'; }); },
    title: 'The Interrogation',
    text: function () { return 'At a family gathering, your nosy aunt corners you. She loudly interrogates you about your salary, why you aren\'t married yet, and your weight. Everyone is listening.'; },
    choices: [
      { label: 'Smile and give vague answers', cost: function () { return 0; }, effect: function () { return { msg: 'You politely deflected, but you left the gathering with a massive headache.', fx: { happiness: -2, stress: 3 } }; } },
      { label: 'Snap back with a sarcastic remark', cost: function () { return 0; }, effect: function () { const m = (S.family || []).find(function(x){return x.role==='Mother';}); if(m) m.bond -= 5; return { msg: 'You shut her down! It felt great, but your mother scolded you on the way home for being rude.', fx: { happiness: 2, social: -3 } }; } },
      { label: 'Excuse yourself and leave early', cost: function () { return 0; }, effect: function () { return { msg: 'You hid in the bathroom for 20 minutes, then faked an emergency to leave.', fx: { social: -1 } }; } }
    ]
  });

  /* ---------- 37. TRAFFIC FINES ---------- */
  pool.push({
    id: 'traffic_fines', category: 'financial', weight: 9, minAge: 20, maxAge: 70,
    ok: function () { return true; },
    title: 'Unexpected Government Fees',
    text: function () { return 'You check the online portal and discover you have accumulated a massive amount of traffic fines and late fees from cameras you didn\'t even know were there. Total: ' + p57EGP(2800).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Pay them online immediately', cost: function () { return p57EGP(2800); }, effect: function () { return { msg: 'You paid it. A painful, completely unrewarding expense.', fx: { happiness: -3 } }; } },
      { label: 'Hire a fixer (Mokhales) to reduce them', cost: function () { return p57EGP(1500); }, effect: function () { if (Math.random() > 0.4) { return { msg: 'The fixer got half the fines dropped. You saved some money.', fx: { happiness: 1 } }; } else { return { msg: 'The fixer took your money and did nothing. You still have to pay the fines eventually.', fx: { happiness: -5, stress: 4 } }; } } }
    ]
  });

  /* ---------- 38. SIBLING'S LEGAL TROUBLE ---------- */
  pool.push({
    id: 'sibling_police', category: 'emergency', weight: 5, minAge: 20, maxAge: 50,
    ok: function () { return (S.family || []).some(function (m) { return m.role === 'Sibling'; }); },
    title: 'A Call From the Station',
    text: function () { return 'Your sibling calls you in a panic. They got into an altercation over a parking spot and have been taken to the police station. They need you to come negotiate a settlement with the other guy.'; },
    choices: [
      { label: 'Rush there and pay off the guy', cost: function () { return p57EGP(5000); }, effect: function () { const s = (S.family||[]).find(x => x.role==='Sibling'); if (s) s.bond = Math.min(100, (s.bond||50)+15); return { msg: 'You paid the guy to drop the charges. You spent 6 hours at the station, but your sibling is safe.', fx: { happiness: -4, stress: 5 } }; } },
      { label: 'Go there but refuse to pay', cost: function () { return p57EGP(200); }, effect: function () { const s = (S.family||[]).find(x => x.role==='Sibling'); if (s) s.bond -= 20; return { msg: 'They spent the night in holding before things got sorted. The family is traumatized.', fx: { happiness: -8, social: -5, stress: 8 } }; } }
    ]
  });

  /* ---------- 39. PLUMBING DISASTER ---------- */
  pool.push({
    id: 'pipe_burst', category: 'emergency', weight: 8, minAge: 20, maxAge: 80,
    ok: function () { return S.housing && S.housing !== 'parents'; },
    title: 'Flooded Apartment',
    text: function () { return 'You come home from work to find your apartment flooded. The old plumbing pipe in the bathroom burst. Your rugs are ruined and you need an emergency plumber.'; },
    choices: [
      { label: 'Hire an emergency plumber & cleaners', cost: function () { return p57EGP(4000); }, effect: function () { return { msg: 'They sucked up the water and fixed the pipe, but your favorite rug had to be thrown away.', fx: { happiness: -4, stress: 4 } }; } },
      { label: 'Fix it yourself and mop all night', cost: function () { return p57EGP(800); }, effect: function () { return { msg: 'You taped the pipe and mopped for 8 hours straight. Your back is destroyed.', fx: { health: -4, happiness: -5, stress: 6 } }; } }
    ]
  });

  /* ---------- 40. GYM INJURY ---------- */
  pool.push({
    id: 'gym_injury', category: 'health', weight: 7, minAge: 18, maxAge: 45,
    ok: function () { return true; },
    title: 'Slipped Disc',
    text: function () { return 'While trying to lift a heavy box (or heavy weights), you feel a sharp pop in your lower back. You drop to the floor in agony. You need an MRI and physiotherapy.'; },
    choices: [
      { label: 'Pay for MRI and good physio', cost: function () { return p57EGP(6000); }, effect: function () { return { msg: 'The physio worked wonders, but it took weeks to feel normal again.', fx: { health: -3, happiness: -2 } }; } },
      { label: 'Just take muscle relaxants and rest', cost: function () { return p57EGP(300); }, effect: function () { return { msg: 'Your back healed wrong. Now you have chronic pain every time you bend over.', fx: { health: -8, happiness: -4 } }; } }
    ]
  });

  /* ---------- 41. STRAY KITTEN ---------- */
  pool.push({
    id: 'stray_kitten', category: 'random', weight: 10, minAge: 18, maxAge: 80,
    ok: function () { return S.housing !== 'parents'; },
    title: 'A Cry in the Engine',
    text: function () { return 'While walking down the street, you hear loud meowing coming from inside a parked car\'s engine. It\'s a tiny, dirty stray kitten, and it looks sick.'; },
    choices: [
      { label: 'Take it to the vet and adopt it', cost: function () { return p57EGP(1200); }, effect: function () { return { msg: 'You spent money on vaccines and food. The kitten slept on your chest all night. You feel amazing.', fx: { happiness: 8, social: 2, health: 1 } }; } },
      { label: 'Buy it some milk and leave it in the street', cost: function () { return p57EGP(30); }, effect: function () { return { msg: 'You fed it, but walking away broke your heart a little.', fx: { happiness: -1 } }; } },
      { label: 'Ignore it', cost: function () { return 0; }, effect: function () { return { msg: 'You kept walking, but the sound echoed in your head all day.', fx: { happiness: -2 } }; } }
    ]
  });

  /* ---------- 42. WEDDING SEASON BANKRUPTCY ---------- */
  pool.push({
    id: 'wedding_season', category: 'financial', weight: 8, minAge: 22, maxAge: 35,
    ok: function () { return (S.friends || []).length >= 2; },
    title: 'Wedding Season',
    text: function () { return 'It\'s July. Suddenly, three different friends/cousins are getting married in the same month. You need outfits, transportation, and cash gifts (negoot) for all of them.'; },
    choices: [
      { label: 'Attend all of them properly', cost: function () { return p57EGP(7500); }, effect: function () { return { msg: 'You are completely broke, but you danced at three weddings and everyone loves you.', fx: { happiness: 4, social: 6, stress: 2 } }; } },
      { label: 'Attend one, apologize to the others', cost: function () { return p57EGP(2500); }, effect: function () { return { msg: 'You saved money, but the friends you skipped are definitely holding a grudge.', fx: { happiness: 1, social: -3 } }; } },
      { label: 'Skip all of them', cost: function () { return 0; }, effect: function () { return { msg: 'You became a social outcast this summer, but your bank account is full.', fx: { happiness: -3, social: -6 } }; } }
    ]
  });

  /* ---------- 43. INTERNET OUTAGE (REMOTE WORK) ---------- */
  pool.push({
    id: 'internet_outage', category: 'work', weight: 12, minAge: 20, maxAge: 65,
    ok: function () { return !!S.job; },
    title: 'WE Router Disaster',
    text: function () { return 'You have a crucial online meeting in 10 minutes, but the red LOS light on your router is blinking. The internet is completely dead in your area.'; },
    choices: [
      { label: 'Buy an massive mobile data bundle immediately', cost: function () { return p57EGP(300); }, effect: function () { return { msg: 'You hot-spotted from your phone. The connection dropped twice, but you survived the meeting.', fx: { stress: 4 } }; } },
      { label: 'Run to a nearby workspace/cafe', cost: function () { return p57EGP(150); }, effect: function () { return { msg: 'You sprinted down the street sweating, but made it just in time.', fx: { happiness: -1, stress: 5 } }; } },
      { label: 'Call your boss and cancel', cost: function () { return 0; }, effect: function () { if(S.job) S.job.perf = Math.max(0, (S.job.perf || 50) - 5); return { msg: 'Your boss was very annoyed at your "unreliability".', fx: { happiness: -2, social: -1 } }; } }
    ]
  });

  /* ---------- 44. CRYPTO/STOCK CRASH ---------- */
  pool.push({
    id: 'bad_investment', category: 'financial', weight: 6, minAge: 21, maxAge: 60,
    ok: function () { return S.wealth > (p57EGP(20000) / p57Rate()); },
    title: 'Market Crash',
    text: function () { return 'Remember that "guaranteed" investment a friend told you about? The market just tanked, and the platform halted withdrawals. You lost a chunk of your savings.'; },
    choices: [
      { label: 'Accept the loss (Lose 15,000 EGP)', cost: function () { return p57EGP(15000); }, effect: function () { return { msg: 'You watched your portfolio go to zero. A painful lesson in greed.', fx: { happiness: -6, smarts: 2, stress: 5 } }; } }
    ]
  });

  /* ---------- 45. OLD DEBT REPAID ---------- */
  pool.push({
    id: 'debt_repaid', category: 'random', weight: 5, minAge: 20, maxAge: 80,
    ok: function () { return true; },
    title: 'A Surprise Transfer',
    text: function () { return 'An old friend from university suddenly texts you. "Hey, I finally got on my feet. Here is that money I borrowed three years ago." You get an Instapay transfer.'; },
    choices: [
      { label: 'Accept the money', cost: function () { return 0; }, effect: function () { const amt = p57EGP(4000); S.wealth += (amt / p57Rate()); return { msg: 'You completely forgot about that! You just gained ' + amt.toLocaleString() + ' EGP.', fx: { happiness: 5, social: 2 } }; } }
    ]
  });

  /* ---------- 46. COMPANY LAYOFF RUMORS ---------- */
  pool.push({
    id: 'layoff_rumors', category: 'work', weight: 8, minAge: 22, maxAge: 60,
    ok: function () { return !!S.job; },
    title: 'Office Panic',
    text: function () { return 'Management just announced a sudden "all-hands meeting." Rumors are flying that massive layoffs are coming today. You are terrified you might lose your job.'; },
    choices: [
      { label: 'Network aggressively to save yourself', cost: function () { return p57EGP(200); }, effect: function () { if(S.job) S.job.perf = Math.min(100, (S.job.perf || 50) + 5); return { msg: 'You bought coffees for the managers. You survived the cuts, but feel dirty.', fx: { stress: 6, happiness: -2 } }; } },
      { label: 'Keep your head down and pray', cost: function () { return 0; }, effect: function () { if (Math.random() > 0.3) { return { msg: 'Your department was spared. The relief is overwhelming.', fx: { happiness: 2, stress: 3 } }; } else { if(S.job) S.job.perf = Math.max(0, (S.job.perf || 50) - 10); return { msg: 'You barely survived, but your salary was frozen and your workload doubled.', fx: { happiness: -5, stress: 8 } }; } } }
    ]
  });

  /* ---------- 47. VISA REJECTION ---------- */
  pool.push({
    id: 'visa_rejection', category: 'drama', weight: 6, minAge: 20, maxAge: 50,
    ok: function () { return true; },
    title: 'Schengen Visa Denied',
    text: function () { return 'You spent weeks gathering papers, bank statements, and HR letters to apply for a tourist visa to Europe. The embassy just handed your passport back. Rejected. No refund.'; },
    choices: [
      { label: 'Accept the loss (Cost: 3500 EGP)', cost: function () { return p57EGP(3500); }, effect: function () { return { msg: 'You lost the visa fees and the translation costs. The dream is dead for now.', fx: { happiness: -6, stress: 4 } }; } }
    ]
  });

  /* ---------- 48. SIBLING'S TUITION CRISIS ---------- */
  pool.push({
    id: 'sibling_tuition', category: 'family', weight: 7, minAge: 24, maxAge: 50,
    ok: function () { return (S.family || []).some(function (m) { return m.role === 'Sibling'; }); },
    title: 'University Fees',
    text: function () { return 'Your parents call you, embarrassed. They cannot afford the final installment for your younger sibling\'s private university tuition. If it isn\'t paid, your sibling can\'t take final exams.'; },
    choices: [
      { label: 'Pay the tuition (12,000 EGP)', cost: function () { return p57EGP(12000); }, effect: function () { const s = (S.family||[]).find(x => x.role==='Sibling'); if (s) s.bond = 100; const p = (S.family||[]).find(x => x.role==='Father' || x.role==='Mother'); if(p) p.bond = 100; return { msg: 'You saved your sibling\'s education. Your parents wept and prayed for you.', fx: { happiness: 5, social: 3 } }; } },
      { label: 'Help with half (6,000 EGP)', cost: function () { return p57EGP(6000); }, effect: function () { return { msg: 'Your parents sold some gold to cover the rest. They are grateful for your help.', fx: { happiness: 2 } }; } },
      { label: 'Say you cannot afford it', cost: function () { return 0; }, effect: function () { const s = (S.family||[]).find(x => x.role==='Sibling'); if (s) s.bond -= 20; return { msg: 'Your sibling had to drop the semester. The family dynamic is deeply damaged.', fx: { happiness: -8, stress: 5 } }; } }
    ]
  });

  /* ---------- 49. PHONE STOLEN (INVENTORY INTEGRATED) ---------- */
  pool.push({
    id: 'phone_stolen', category: 'emergency', weight: 8, minAge: 15, maxAge: 80,
    ok: function () { 
      if (!S || !Array.isArray(S.inventory)) return false;
      return S.inventory.some(i => {
        let n = (i.name || i.id || '').toLowerCase();
        return n.includes('phone') || n.includes('iphone') || n.includes('galaxy') || n.includes('samsung');
      });
    },
    title: 'Snatched in Traffic',
    text: function () { return 'You were sitting in an Uber with the window down, texting. A motorcycle sped by and the passenger snatched your phone right out of your hand. It is gone.'; },
    choices: [
      { label: 'Let it go. I will buy a new one from the Shopping tab.', cost: function () { return 0; }, effect: function () { 
          const hadPhone = p57StealPhoneFromInventory();
          return { msg: 'Your phone was stolen from your inventory. You are disconnected from the world until you buy a new one in the Shopping tab.', fx: { happiness: -8, stress: 5 } }; 
        } 
      }
    ]
  });

  /* ---------- 50. FOOD DELIVERY SCAM ---------- */
  pool.push({
    id: 'food_scam', category: 'random', weight: 10, minAge: 16, maxAge: 80,
    ok: function () { return true; },
    title: 'The Missing Order',
    text: function () { return 'You ordered a massive meal for you and your friends on a food delivery app and paid online (' + p57EGP(800).toLocaleString() + ' EGP). The app says "Delivered", but the driver is nowhere to be found.'; },
    choices: [
      { label: 'Fight customer service for a refund', cost: function () { return 0; }, effect: function () { if (Math.random() > 0.4) { const amt = p57EGP(800); S.wealth += (amt / p57Rate()); return { msg: 'They eventually refunded you, but you guys ate instant noodles for dinner.', fx: { happiness: -2, stress: 2 } }; } else { return { msg: 'They claimed the GPS showed the driver at your location. You lost the food and the money.', fx: { happiness: -4, stress: 4 } }; } } },
      { label: 'Order something else with cash', cost: function () { return p57EGP(600); }, effect: function () { return { msg: 'You spent double the money, but at least you finally ate.', fx: { happiness: -1, stress: 1 } }; } }
    ]
  }) 
   /* =================================================================
     EXPANSION PACK 3: SHOPPING, CREDIT & HEALTH INSURANCE (30 Events)
     ================================================================= */

  /* ---------- 51. WHITE FRIDAY TV SALE ---------- */
  pool.push({
    id: 'white_friday_tv', category: 'financial', weight: 8, minAge: 20, maxAge: 70,
    ok: function () { return S.housing !== 'parents'; },
    title: 'White Friday Mega Sale',
    text: function () { return 'You get a notification: A massive 65-inch 4K Smart TV is on sale for White Friday at 40% off. It looks incredible, but it still costs ' + p57EGP(15000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy the TV!', cost: function () { return p57EGP(15000); }, effect: function () { return { msg: 'You bought the huge TV! Movie nights are amazing now, even if your wallet is crying.', fx: { happiness: 8, stress: 2 } }; } },
      { label: 'Resist the urge', cost: function () { return 0; }, effect: function () { return { msg: 'You closed the app. Your current TV is fine. You feel financially responsible, but a bit bored.', fx: { smarts: 2, happiness: -1 } }; } }
    ]
  });

  /* ---------- 52. NEW IPHONE RELEASE ---------- */
  pool.push({
    id: 'new_iphone', category: 'social', weight: 6, minAge: 18, maxAge: 50,
    ok: function () { return true; },
    title: 'The Upgrade Itch',
    text: function () { return 'Apple just announced the newest iPhone. All your coworkers and friends are talking about upgrading. The peer pressure is real. A new one costs ' + p57EGP(45000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy the new iPhone', cost: function () { return p57EGP(45000); }, effect: function () { return { msg: 'You got the new phone! It takes amazing photos and you look very successful.', fx: { happiness: 6, social: 3, stress: 4 } }; } },
      { label: 'Keep your old phone', cost: function () { return 0; }, effect: function () { return { msg: 'Your battery drains in 3 hours, but you saved a fortune.', fx: { happiness: -2, smarts: 3 } }; } }
    ]
  });

  /* ---------- 53. AIR FRYER CRAZE ---------- */
  pool.push({
    id: 'air_fryer', category: 'financial', weight: 10, minAge: 20, maxAge: 60,
    ok: function () { return S.housing !== 'parents'; },
    title: 'The Air Fryer Cult',
    text: function () { return 'Everyone on TikTok and in your friend group is obsessed with their new air fryers. You feel like you are missing out on healthy, easy cooking. A good one is ' + p57EGP(5500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy the Air Fryer', cost: function () { return p57EGP(5500); }, effect: function () { return { msg: 'You make fries with zero oil now. It was totally worth it.', fx: { health: 2, happiness: 3 } }; } },
      { label: 'Skip it', cost: function () { return 0; }, effect: function () { return { msg: 'You continue eating deep-fried food like a traditionalist.', fx: { health: -1 } }; } }
    ]
  });

  /* ---------- 54. WASHING MACHINE DEATH ---------- */
  pool.push({
    id: 'washing_machine', category: 'emergency', weight: 8, minAge: 22, maxAge: 80,
    ok: function () { return S.housing && S.housing !== 'parents'; },
    title: 'Flooded Kitchen',
    text: function () { return 'Your washing machine makes a horrific grinding noise, stops mid-cycle, and leaks soapy water everywhere. The motor is dead. A replacement is ' + p57EGP(14000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy a new washing machine', cost: function () { return p57EGP(14000); }, effect: function () { return { msg: 'You bought a brand new machine. Your clothes are clean, but that was an awful expense.', fx: { happiness: 1, stress: 3 } }; } },
      { label: 'Wash by hand / Use laundry service for now', cost: function () { return p57EGP(1000); }, effect: function () { return { msg: 'You are spending hours hand-washing socks and paying the dry cleaner. It is exhausting.', fx: { happiness: -5, stress: 5, health: -1 } }; } }
    ]
  });

  /* ---------- 55. HEALTH INSURANCE GAP (BLOOD TESTS) ---------- */
  pool.push({
    id: 'health_insurance_gap', category: 'health', weight: 9, minAge: 22, maxAge: 65,
    ok: function () { return true; },
    title: 'Doctor Ordered Tests',
    text: function () { return 'You have been feeling dizzy. The doctor ordered a massive panel of blood tests and an MRI. ' + (S.job ? 'Because you have corporate health insurance, you only pay a copay.' : 'Since you don\'t have a corporate job, you must pay fully out of pocket.'); },
    choices: [
      { label: 'Get the tests done', cost: function () { return S.job ? p57EGP(600) : p57EGP(4500); }, effect: function () { return { msg: 'You got the tests. Turns out you just need Vitamin D and iron. Good to know!', fx: { health: 4, happiness: 1 } }; } },
      { label: 'Skip the expensive tests', cost: function () { return 0; }, effect: function () { return { msg: 'You ignored the dizziness. It haunts you and gives you anxiety every time you stand up fast.', fx: { health: -4, stress: 4 } }; } }
    ]
  });

  /* ---------- 56. AUTO-RENEWAL SHOCK ---------- */
  pool.push({
    id: 'auto_renewal', category: 'financial', weight: 10, minAge: 18, maxAge: 50,
    ok: function () { return true; },
    title: 'Annual Subscription Hit',
    text: function () { return 'You forgot to cancel that premium fitness app and a dating app. They both just auto-renewed for an annual plan. Total charge: ' + p57EGP(2800).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Accept the charge and try to use them', cost: function () { return p57EGP(2800); }, effect: function () { return { msg: 'You paid it. Now you are forcing yourself to do 10-minute workouts out of guilt.', fx: { health: 1, happiness: -2 } }; } }
    ]
  });

  /* ---------- 57. USD TRANSACTION FEES ---------- */
  pool.push({
    id: 'usd_markup', category: 'financial', weight: 12, minAge: 18, maxAge: 60,
    ok: function () { return true; },
    title: 'Bank Markup Fees',
    text: function () { return 'You booked a flight/hotel online using a foreign site. Your bank applied a massive 10% currency markup and commission fee on the transaction, adding ' + p57EGP(1500).toLocaleString() + ' EGP to your bill.'; },
    choices: [
      { label: 'Pay the markup', cost: function () { return p57EGP(1500); }, effect: function () { return { msg: 'The hidden bank fees hurt your soul, but the payment went through.', fx: { happiness: -3 } }; } }
    ]
  });

  /* ---------- 58. WISDOM TOOTH SURGERY ---------- */
  pool.push({
    id: 'wisdom_tooth', category: 'health', weight: 8, minAge: 18, maxAge: 35,
    ok: function () { return true; },
    title: 'Impacted Wisdom Tooth',
    text: function () { return 'Your jaw is swelling. An x-ray shows an impacted wisdom tooth pushing against your nerves. You need minor oral surgery. Cost: ' + p57EGP(4500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Get the surgery', cost: function () { return p57EGP(4500); }, effect: function () { return { msg: 'Your face was swollen like a chipmunk for a week, but the pain is finally gone.', fx: { health: 2, happiness: -1 } }; } },
      { label: 'Take painkillers and wait', cost: function () { return p57EGP(200); }, effect: function () { return { msg: 'The infection spread. You were in agony for weeks before giving in.', fx: { health: -6, happiness: -6, stress: 5 } }; } }
    ]
  });

  /* ---------- 59. EXPENSIVE SKINCARE URGE ---------- */
  pool.push({
    id: 'skincare_urge', category: 'shopping', weight: 8, minAge: 18, maxAge: 40,
    ok: function () { return true; },
    title: 'The Skincare Routine',
    text: function () { return 'You fell down a dermatologist rabbit hole on YouTube. Now you feel an overwhelming urge to buy imported serums, sunscreens, and moisturizers to fix your skin (' + p57EGP(3500).toLocaleString() + ' EGP).'; },
    choices: [
      { label: 'Buy the premium routine', cost: function () { return p57EGP(3500); }, effect: function () { return { msg: 'You bought it all. Your skin is glowing and your confidence is up!', fx: { happiness: 4, social: 2, health: 1 } }; } },
      { label: 'Stick to local pharmacy soap', cost: function () { return p57EGP(100); }, effect: function () { return { msg: 'You saved money, but you still have those annoying breakouts.', fx: { happiness: -1 } }; } }
    ]
  });

  /* ---------- 60. ERGONOMIC CHAIR ---------- */
  pool.push({
    id: 'ergo_chair', category: 'shopping', weight: 8, minAge: 22, maxAge: 60,
    ok: function () { return !!S.job; },
    title: 'Crippling Back Pain',
    text: function () { return 'Sitting at a desk all day is destroying your lower back. You desperately want to buy a high-end ergonomic office chair. It costs ' + p57EGP(8000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Invest in the chair', cost: function () { return p57EGP(8000); }, effect: function () { return { msg: 'It looks like a spaceship, but your back pain vanished completely.', fx: { health: 5, happiness: 3 } }; } },
      { label: 'Buy a cheap cushion', cost: function () { return p57EGP(300); }, effect: function () { return { msg: 'The cushion flattened in two days. Your back still aches.', fx: { health: -2, happiness: -1 } }; } }
    ]
  });

  /* ---------- 61. SUPERSTAR CONCERT ---------- */
  pool.push({
    id: 'big_concert', category: 'social', weight: 8, minAge: 18, maxAge: 35,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'Amr Diab Concert',
    text: function () { return 'Amr Diab (or a massive international DJ) is playing a concert in Gouna/Sahel. VIP Tickets and transport will run you ' + p57EGP(4500).toLocaleString() + ' EGP. Your friends are all going.'; },
    choices: [
      { label: 'Buy the VIP ticket', cost: function () { return p57EGP(4500); }, effect: function () { S.friends.slice(0, 3).forEach(function (f) { f.bond = Math.min(100, (f.bond || 50) + 10); }); return { msg: 'You danced until 4 AM. An unforgettable core memory with friends.', fx: { happiness: 7, social: 5, health: -1 } }; } },
      { label: 'Skip it, watch the stories', cost: function () { return 0; }, effect: function () { return { msg: 'You saved money, but suffered massive FOMO watching their Instagram stories.', fx: { happiness: -3, social: -2 } }; } }
    ]
  });

  /* ---------- 62. PADEL TENNIS OBSESSION ---------- */
  pool.push({
    id: 'padel_craze', category: 'social', weight: 8, minAge: 18, maxAge: 45,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'The Padel Craze',
    text: function () { return 'Your social circle is suddenly obsessed with playing Padel every week. Court rentals and buying your own decent racket will cost you ' + p57EGP(3500).toLocaleString() + ' EGP this month.'; },
    choices: [
      { label: 'Join the cult, buy the gear', cost: function () { return p57EGP(3500); }, effect: function () { return { msg: 'You are exhausted, but it is super fun and great networking.', fx: { health: 4, social: 4, happiness: 3 } }; } },
      { label: 'Say it is too expensive', cost: function () { return 0; }, effect: function () { return { msg: 'You got left out of the group chat plans for a few weeks.', fx: { social: -2, happiness: -1 } }; } }
    ]
  });

  /* ---------- 63. HIGH-END STEAKHOUSE ---------- */
  pool.push({
    id: 'expensive_dinner', category: 'social', weight: 9, minAge: 22, maxAge: 50,
    ok: function () { return (S.friends || []).length > 0; },
    title: 'Peer Pressure Dining',
    text: function () { return 'A friend gets a promotion and insists the group celebrates at a ridiculously overpriced premium steakhouse. Your share of the bill is going to be ' + p57EGP(2500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Go and pay your share', cost: function () { return p57EGP(2500); }, effect: function () { return { msg: 'The steak was good, but swallowing that bill hurt your stomach.', fx: { happiness: 1, social: 3, stress: 2 } }; } },
      { label: 'Make up an excuse to skip', cost: function () { return 0; }, effect: function () { return { msg: 'You looked a bit cheap, but you kept your money.', fx: { social: -2, happiness: -1 } }; } }
    ]
  });

  /* ---------- 64. WEEKEND IN DAHAB ---------- */
  pool.push({
    id: 'dahab_trip', category: 'shopping', weight: 6, minAge: 20, maxAge: 35,
    ok: function () { return true; },
    title: 'Spontaneous Travel Urge',
    text: function () { return 'Work has been so stressful. You have an overwhelming urge to book a spontaneous 4-day trip to Dahab to dive and relax. Cost: ' + p57EGP(6000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Book it immediately!', cost: function () { return p57EGP(6000); }, effect: function () { return { msg: 'You spent 4 days snorkeling in the Red Sea. Your stress completely vanished.', fx: { happiness: 10, stress: -8, health: 2 } }; } },
      { label: 'Be responsible and stay home', cost: function () { return 0; }, effect: function () { return { msg: 'You stayed in the noisy city. You saved money but feel burned out.', fx: { happiness: -3, stress: 2 } }; } }
    ]
  });

  /* ---------- 65. CAR TIRE BLOWOUT ---------- */
  pool.push({
    id: 'car_tires', category: 'emergency', weight: 9, minAge: 20, maxAge: 70,
    ok: function () { return true; },
    title: 'Pothole Disaster',
    text: function () { return 'You hit a massive unseen pothole on the Ring Road. Two of your tires blew out completely, and the rim is bent. You need replacement tires immediately: ' + p57EGP(8500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Replace the tires', cost: function () { return p57EGP(8500); }, effect: function () { return { msg: 'You got towed and replaced the tires. A horrible, expensive day.', fx: { happiness: -4, stress: 5 } }; } }
    ]
  });

  /* ---------- 66. DOG BITE (RABIES SHOT) ---------- */
  pool.push({
    id: 'rabies_shot', category: 'health', weight: 6, minAge: 16, maxAge: 80,
    ok: function () { return true; },
    title: 'Stray Dog Encounter',
    text: function () { return 'While walking at night, a defensive street dog nipped your ankle. It broke the skin. You absolutely must go to the hospital for a series of Rabies and Tetanus vaccines (' + p57EGP(1200).toLocaleString() + ' EGP private, or public clinic free but chaotic).'; },
    choices: [
      { label: 'Go to a private clinic', cost: function () { return p57EGP(1200); }, effect: function () { return { msg: 'You got clean, fast service for your 5 vaccine doses. You are safe.', fx: { health: 1, happiness: -2 } }; } },
      { label: 'Go to the public hospital', cost: function () { return p57EGP(100); }, effect: function () { return { msg: 'You waited 6 hours in a chaotic ER for the free vaccine. Very stressful.', fx: { health: 1, happiness: -4, stress: 4 } }; } }
    ]
  });

  /* ---------- 67. COWORKER BABY SHOWER ---------- */
  pool.push({
    id: 'coworker_baby', category: 'work', weight: 9, minAge: 22, maxAge: 65,
    ok: function () { return !!S.job; },
    title: 'Office Collection',
    text: function () { return 'A coworker just had a baby. HR is passing around an envelope to collect money for a very expensive gold gift. Everyone is putting in ' + p57EGP(500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Contribute the full amount', cost: function () { return p57EGP(500); }, effect: function () { if(S.job) S.job.perf = Math.min(100, (S.job.perf||50)+2); return { msg: 'You signed the card and contributed. You are seen as a team player.', fx: { social: 2 } }; } },
      { label: 'Put in 100 EGP and hide', cost: function () { return p57EGP(100); }, effect: function () { return { msg: 'The collector gave you a weird look, but took it.', fx: { social: -1 } }; } },
      { label: 'Refuse to contribute', cost: function () { return 0; }, effect: function () { return { msg: 'You refused. People talk about how cheap you are in the breakroom.', fx: { social: -3, happiness: -2 } }; } }
    ]
  });

  /* ---------- 68. ESPRESSO MACHINE URGE ---------- */
  pool.push({
    id: 'espresso_machine', category: 'shopping', weight: 7, minAge: 22, maxAge: 60,
    ok: function () { return S.housing !== 'parents'; },
    title: 'The Coffee Snob Phase',
    text: function () { return 'You are tired of spending 150 EGP on lattes every morning. You have a massive urge to buy a premium home espresso machine with a milk frother (' + p57EGP(11000).toLocaleString() + ' EGP).'; },
    choices: [
      { label: 'Buy the espresso machine', cost: function () { return p57EGP(11000); }, effect: function () { return { msg: 'You are now a home barista. Your mornings are magical (and highly caffeinated).', fx: { happiness: 5, health: -1 } }; } },
      { label: 'Stick to instant coffee', cost: function () { return p57EGP(200); }, effect: function () { return { msg: 'You bought a jar of instant coffee. It tastes like sadness, but saves money.', fx: { happiness: -2 } }; } }
    ]
  });

  /* ---------- 69. LASER EYE SURGERY ---------- */
  pool.push({
    id: 'laser_eye', category: 'health', weight: 5, minAge: 20, maxAge: 40,
    ok: function () { return true; },
    title: 'Tired of Glasses',
    text: function () { return 'You are sick of contact lenses and fogged-up glasses. A highly-rated eye clinic is running an offer for Lasik surgery. ' + (S.job ? 'Your insurance won\'t cover cosmetic surgery.' : '') + ' It will cost ' + p57EGP(18000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Get the Lasik surgery', cost: function () { return p57EGP(18000); }, effect: function () { return { msg: 'You can see in 4K! Waking up and just seeing the world is a miracle.', fx: { health: 5, happiness: 8, smarts: 1 } }; } },
      { label: 'Just buy new glasses', cost: function () { return p57EGP(1500); }, effect: function () { return { msg: 'You updated your prescription. The dream of perfect vision is delayed.', fx: { health: 1 } }; } }
    ]
  });

  /* ---------- 70. GAMING CONSOLE RESTOCK ---------- */
  pool.push({
    id: 'gaming_console', category: 'shopping', weight: 8, minAge: 16, maxAge: 40,
    ok: function () { return true; },
    title: 'PS5 Pro Available',
    text: function () { return 'You walk past a tech store and see the newest gaming console is finally in stock without a waitlist. It is highly tempting, but costs ' + p57EGP(35000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy the console!', cost: function () { return p57EGP(35000); }, effect: function () { return { msg: 'You bought it! You spent the whole weekend gaming and avoiding your problems.', fx: { happiness: 7, social: -2, stress: -4 } }; } },
      { label: 'Walk away', cost: function () { return 0; }, effect: function () { return { msg: 'You walked away. Very disciplined, very boring.', fx: { smarts: 2, happiness: -2 } }; } }
    ]
  });

  /* ---------- 71. CLOTHES SHOPPING SPREE ---------- */
  pool.push({
    id: 'shopping_spree', category: 'shopping', weight: 10, minAge: 18, maxAge: 50,
    ok: function () { return true; },
    title: 'Wardrobe Crisis',
    text: function () { return 'You open your closet and feel like you have absolutely nothing nice to wear. You have a sudden urge to go to the mall and drop ' + p57EGP(6000).toLocaleString() + ' EGP on a new seasonal wardrobe.'; },
    choices: [
      { label: 'Go on a shopping spree', cost: function () { return p57EGP(6000); }, effect: function () { return { msg: 'You bought fresh outfits. You look great and feel incredibly confident at work/uni.', fx: { happiness: 4, social: 3 } }; } },
      { label: 'Just buy one shirt', cost: function () { return p57EGP(600); }, effect: function () { return { msg: 'You bought one item. It didn\'t fix the feeling, but it helped a little.', fx: { happiness: 1 } }; } },
      { label: 'Wear your old clothes', cost: function () { return 0; }, effect: function () { return { msg: 'You wore a slightly faded hoodie. Nobody actually cares.', fx: { happiness: -1 } }; } }
    ]
  });

  /* ---------- 72. AC COMPRESSOR EXPLODES ---------- */
  pool.push({
    id: 'ac_breaks', category: 'emergency', weight: 8, minAge: 22, maxAge: 80,
    ok: function () { return S.housing && S.housing !== 'parents'; },
    title: 'Air Conditioning Failure',
    text: function () { return 'It is mid-August (42 degrees). Your AC unit makes a loud popping sound and starts blowing hot air. The compressor is dead. Fix it for ' + p57EGP(8000).toLocaleString() + ' EGP or buy a new one for ' + p57EGP(24000).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy a brand new AC', cost: function () { return p57EGP(24000); }, effect: function () { return { msg: 'You bought a new inverter AC. It is freezing cold and saves electricity. RIP wallet.', fx: { happiness: 4, stress: -3 } }; } },
      { label: 'Replace the compressor', cost: function () { return p57EGP(8000); }, effect: function () { return { msg: 'The fix worked, but the AC makes a weird rattling sound now.', fx: { happiness: 1 } }; } },
      { label: 'Sleep in the heat (Buy a fan)', cost: function () { return p57EGP(1000); }, effect: function () { return { msg: 'You woke up drenched in sweat every day for a month.', fx: { health: -3, happiness: -6, stress: 6 } }; } }
    ]
  });

  /* ---------- 73. WATER HEATER LEAKS ---------- */
  pool.push({
    id: 'water_heater', category: 'emergency', weight: 9, minAge: 20, maxAge: 80,
    ok: function () { return S.housing && S.housing !== 'parents'; },
    title: 'Freezing Showers',
    text: function () { return 'It is January. You step into the shower and the water is freezing. You look up and see the water heater is leaking rusty water everywhere. It needs immediate replacement (' + p57EGP(4500).toLocaleString() + ' EGP).'; },
    choices: [
      { label: 'Buy and install a new heater', cost: function () { return p57EGP(4500); }, effect: function () { return { msg: 'You got a new heater. The hot shower felt like heaven.', fx: { happiness: 1, health: 1 } }; } },
      { label: 'Take cold showers until next payday', cost: function () { return 0; }, effect: function () { return { msg: 'You caught a terrible cold and dreaded waking up every morning.', fx: { health: -4, happiness: -5, stress: 4 } }; } }
    ]
  });

  /* ---------- 74. EXPENSIVE PERFUME ---------- */
  pool.push({
    id: 'expensive_perfume', category: 'shopping', weight: 7, minAge: 18, maxAge: 60,
    ok: function () { return true; },
    title: 'The Signature Scent',
    text: function () { return 'You walk through duty-free or a mall and smell a luxury niche perfume (like Tom Ford or Creed). You want to make it your signature scent, but it is ' + p57EGP(8500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy the luxury perfume', cost: function () { return p57EGP(8500); }, effect: function () { return { msg: 'You bought it. Every time you walk into a room, people ask what you are wearing.', fx: { happiness: 4, social: 3 } }; } },
      { label: 'Buy a cheap clone/knockoff', cost: function () { return p57EGP(600); }, effect: function () { return { msg: 'It smells similar for 10 minutes, then fades into a weird alcohol smell.', fx: { happiness: -1 } }; } }
    ]
  });

  /* ---------- 75. INSTAGRAM AD SCAM ---------- */
  pool.push({
    id: 'insta_ad_scam', category: 'shopping', weight: 10, minAge: 15, maxAge: 65,
    ok: function () { return true; },
    title: 'The Targeted Ad',
    text: function () { return 'An incredibly convincing Instagram ad shows a "smart posture corrector" or a "magic cleaning gel" that looks perfect for you. It is only ' + p57EGP(900).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Impulse buy it', cost: function () { return p57EGP(900); }, effect: function () { if (Math.random() > 0.8) { return { msg: 'Surprisingly, it actually works! A rare win.', fx: { happiness: 2 } }; } else { return { msg: 'It arrived broken and looks nothing like the video. You got scammed.', fx: { happiness: -2, smarts: -1 } }; } } },
      { label: 'Ignore the ad', cost: function () { return 0; }, effect: function () { return { msg: 'You saved your money. Targeted ads have no power over you.', fx: { smarts: 1 } }; } }
    ]
  });

  /* ---------- 76. WEDDING OUTFIT PANIC ---------- */
  pool.push({
    id: 'wedding_outfit', category: 'shopping', weight: 8, minAge: 20, maxAge: 45,
    ok: function () { return true; },
    title: 'Nothing to Wear',
    text: function () { return 'You have a very upscale wedding to attend this weekend, and you suddenly realize your old suit/dress doesn\'t fit right anymore. You need to buy a new formal outfit (' + p57EGP(5500).toLocaleString() + ' EGP).'; },
    choices: [
      { label: 'Buy a brand new outfit', cost: function () { return p57EGP(5500); }, effect: function () { return { msg: 'You looked stunning at the wedding and took great photos.', fx: { happiness: 3, social: 4 } }; } },
      { label: 'Squeeze into the old one', cost: function () { return 0; }, effect: function () { return { msg: 'You felt uncomfortable and underdressed the entire night. You hid in the back of group photos.', fx: { happiness: -3, social: -2 } }; } }
    ]
  });

  /* ---------- 77. TEETH WHITENING URGE ---------- */
  pool.push({
    id: 'teeth_whitening', category: 'health', weight: 6, minAge: 20, maxAge: 50,
    ok: function () { return true; },
    title: 'Cosmetic Dentistry',
    text: function () { return 'You\'ve been drinking a lot of coffee, and you notice your teeth are looking yellow in photos. A dentist clinic is offering a professional laser whitening session for ' + p57EGP(3500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Get the laser whitening', cost: function () { return p57EGP(3500); }, effect: function () { return { msg: 'Your teeth are painfully sensitive for a day, but your smile is blindingly bright.', fx: { happiness: 4, social: 2, health: 1 } }; } },
      { label: 'Buy whitening strips from pharmacy', cost: function () { return p57EGP(500); }, effect: function () { return { msg: 'It helped a tiny bit, but mostly just made your gums hurt.', fx: { happiness: 1 } }; } },
      { label: 'Do nothing', cost: function () { return 0; }, effect: function () { return { msg: 'You keep your money, but try not to smile too wide in photos.', fx: { happiness: -1 } }; } }
    ]
  });

  /* ---------- 78. BROKEN GLASSES ---------- */
  pool.push({
    id: 'broken_glasses', category: 'emergency', weight: 8, minAge: 12, maxAge: 80,
    ok: function () { return true; },
    title: 'Snap!',
    text: function () { return 'You accidentally sat on your glasses (or lost a contact lens). The frame snapped in half. You are basically blind until you replace them. Cost for a decent frame and lenses: ' + p57EGP(2500).toLocaleString() + ' EGP.'; },
    choices: [
      { label: 'Buy new glasses immediately', cost: function () { return p57EGP(2500); }, effect: function () { return { msg: 'You got a nice new frame. You can see again!', fx: { happiness: 1, stress: -1 } }; } },
      { label: 'Tape them together', cost: function () { return p57EGP(50); }, effect: function () { return { msg: 'You taped the bridge. You look ridiculous and people keep staring, but you saved money.', fx: { happiness: -4, social: -4, stress: 3 } }; } }
    ]
  });

  /* ---------- 79. THERAPY URGE ---------- */
  pool.push({
    id: 'therapy_urge', category: 'health', weight: 9, minAge: 18, maxAge: 60,
    ok: function () { return true; },
    title: 'Mental Health Check',
    text: function () { return 'Lately, you have been feeling completely overwhelmed, anxious, and burnt out. You consider booking a session with a good therapist. It costs ' + p57EGP(1200).toLocaleString() + ' EGP per session.'; },
    choices: [
      { label: 'Book the therapy session', cost: function () { return p57EGP(1200); }, effect: function () { return { msg: 'Talking it out helped tremendously. You learned some coping mechanisms.', fx: { happiness: 4, stress: -6, health: 2 } }; } },
      { label: 'Just bottle it up', cost: function () { return 0; }, effect: function () { return { msg: 'You pushed the feelings down. They will definitely explode later.', fx: { happiness: -3, stress: 4, health: -1 } }; } }
    ]
  });

  /* ---------- 80. THE "MOKHALES" (FIXER) ---------- */
  pool.push({
    id: 'mokhales_papers', category: 'financial', weight: 8, minAge: 21, maxAge: 70,
    ok: function () { return true; },
    title: 'Government Paperwork',
    text: function () { return 'You need to renew an important government document (passport, car license, etc). The line is 4 hours long. A "Mokhales" (fixer) offers to do it all for you while you sit in a cafe, for ' + p57EGP(1500).toLocaleString() + ' EGP in "fees".'; },
    choices: [
      { label: 'Pay the fixer', cost: function () { return p57EGP(1500); }, effect: function () { return { msg: 'You drank coffee while he did the work. Expensive, but you saved your sanity.', fx: { happiness: 2, stress: -3 } }; } },
      { label: 'Stand in line yourself', cost: function () { return p57EGP(300); }, effect: function () { return { msg: 'You lost an entire day to bureaucracy, sweat, and screaming officials.', fx: { happiness: -5, stress: 6, health: -1 } }; } }
    ]
  });

  return pool;
}

/* ---- Pick an eligible event ---- */
function p57PickEvent() {
  p57InitEvents();
  const pool = p57EventPool();
  const eligible = pool.filter(function (e) {
    if (S.age < (e.minAge || 0)) return false;
    if (S.age > (e.maxAge || 200)) return false;
    if (typeof e.ok === 'function' && !e.ok()) return false;
    return true;
  });
  if (!eligible.length) return null;
  const totalWeight = eligible.reduce(function (sum, e) { return sum + (e.weight || 1); }, 0);
  let roll = Math.random() * totalWeight;
  for (const e of eligible) {
    roll -= (e.weight || 1);
    if (roll <= 0) return e;
  }
  return eligible[eligible.length - 1];
}

/* ---- Should an event fire? ---- */
function p57ShouldFireEvent(isMonthly) {
  p57InitEvents();
  if (document.getElementById('p57-event-modal')) return false;
  if (S.pending) return false;
  if (S.yearPopup) return false;

  const absMonth = (S.pacingAbsoluteMonth || 0);

  if (S.pacing === 'monthly' || isMonthly) {
    if (S.p57.lastEventAbsMonth === absMonth) return false;
    /* ~25% chance each month → ~3 events per year */
    if (Math.random() > 0.25) return false;
    return true;
  } else {
    if (S.p57.eventsThisYear >= 1) return false;
    return true;
  }
}

/* ---- Show the event modal (UPGRADED WITH CREDIT CARDS) ---- */
function p57ShowEventModal(event) {
  if (!event) return;
  const existing = document.getElementById('p57-event-modal');
  if (existing) existing.remove();

  const text = (typeof event.text === 'function') ? event.text() : event.text;
  
  const hasCard = S && S.bank && Array.isArray(S.bank.activeCards) && S.bank.activeCards.length > 0;
  const rate = p57Rate();

  let choicesHtml = '';
  (event.choices || []).forEach(function (c, i) {
    const costEGP = (typeof c.cost === 'function') ? c.cost() : (c.cost || 0);
    const internalCost = costEGP / rate;
    
    if (costEGP > 0) {
      const canAffordCash = internalCost <= S.wealth;
      choicesHtml += '<button class="btn" ' + (canAffordCash ? '' : 'disabled') + ' onclick="p57ResolveEvent(\'' + event.id + '\',' + i + ',\'cash\')">' +
        c.label + ' (Cash)' +
        (canAffordCash ? '' : '<small>Not enough cash in bank</small>') +
        '</button>';
        
      if (hasCard) {
        let cardId = (typeof p38PickCard === 'function') ? p38PickCard(internalCost) : (S.bank.primaryCard || S.bank.activeCards[0]);
        let limit = 500;
        if (cardId && typeof p38GetLimit === 'function') {
            limit = p38GetLimit(cardId);
        } else if (cardId) {
            limit = Math.max(500, Math.round(((S.job && S.job.salary) || S.income || 0) * 0.25));
        }
        const currentDebt = cardId ? (Number(S.bank.cardDebt[cardId]) || 0) : 0;
        const canAffordCredit = cardId && (currentDebt + internalCost <= limit);
        
        choicesHtml += '<button class="btn" style="border-color:var(--amber); color:var(--amber)" ' + (canAffordCredit ? '' : 'disabled') + ' onclick="p57ResolveEvent(\'' + event.id + '\',' + i + ',\'credit\')">' +
          c.label + ' (Credit Card)' +
          (canAffordCredit ? '' : '<small>Exceeds credit limit</small>') +
          '</button>';
    } else {
      choicesHtml += '<button class="btn" onclick="p57ResolveEvent(\'' + event.id + '\',' + i + ',\'cash\')">' +
        c.label + '</button>';
    }
  });

  const modal = document.createElement('div');
  modal.id = 'p57-event-modal';
  modal.className = 'p24-modal-backdrop';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.78);backdrop-filter:blur(7px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:18px';
  modal.innerHTML = '<div class="p24-modal" style="max-width:460px">' +
    '<div class="p24-pill">LIFE EVENT · ' + (typeof p52FormatDate === 'function' ? p52FormatDate() : S.age) + '</div>' +
    '<h2>' + event.title + '</h2>' +
    '<p>' + text + '</p>' +
    '<div style="margin-top:14px">' + choicesHtml + '</div>' +
    '</div>';
  document.body.appendChild(modal);
}
window.p57ShowEventModal = p57ShowEventModal;

/* ---- Resolve the event (UPGRADED WITH CREDIT CARDS) ---- */
function p57ResolveEvent(eventId, choiceIndex, payMethod) {
  const pool = p57EventPool();
  const event = pool.find(function (e) { return e.id === eventId; });
  if (!event) return;
  const choice = (event.choices || [])[choiceIndex];
  if (!choice) return;

  const cost = (typeof choice.cost === 'function') ? choice.cost() : (choice.cost || 0);
  const rate = p57Rate();
  const internal = cost / rate;

  if (internal > 0) {
    if (payMethod === 'credit') {
      let cardId = (typeof p38PickCard === 'function') ? p38PickCard(internal) : (S.bank.primaryCard || S.bank.activeCards[0]);
      if (!cardId) return hint('No credit card available.');
      S.bank.cardDebt[cardId] = (Number(S.bank.cardDebt[cardId]) || 0) + internal;
      log('💳 Charged ' + cost.toLocaleString() + ' EGP to ' + cardId + ' for life event.');
       }
    } else {
      if (internal > S.wealth) return hint('You cannot afford that right now.');
      S.wealth -= internal;
    }
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.lifeEvents = (S.bill.lifeEvents || 0) + internal;
  }

  const result = (typeof choice.effect === 'function') ? choice.effect() : (choice.effect || {});
  if (result && result.fx && typeof fx === 'function') fx(result.fx);

  if (result && result.msg) {
    log('📅 ' + event.title + ' — ' + result.msg);
  }

  p57InitEvents();
  S.p57.lastEventAbsMonth = (S.pacingAbsoluteMonth || 0);
  S.p57.eventsThisYear = (S.p57.eventsThisYear || 0) + 1;
  S.p57.history.push({ year: gameYear(), month: (typeof p52CurrentMonth === 'function' ? p52CurrentMonth() : 1), event: event.id, choice: choiceIndex, method: payMethod });
  S.p57.history = S.p57.history.slice(-30);

  const modal = document.getElementById('p57-event-modal');
  if (modal) modal.remove();

  hint();
  render();
}
window.p57ResolveEvent = p57ResolveEvent;

/* ---- Reset event counter at year rollover ---- */
function p57ResetYearlyCounters() {
  p57InitEvents();
  S.p57.eventsThisYear = 0;
}

/* ---- Hook into monthly advance ---- */
const P57_p52AdvanceMonthBefore = p52AdvanceMonth;
p52AdvanceMonth = function () {
  P57_p52AdvanceMonthBefore.apply(this, arguments);
  if (!S) return;
  if (p57ShouldFireEvent(true)) {
    const event = p57PickEvent();
    if (event) setTimeout(function () { p57ShowEventModal(event); }, 200);
  }
};

/* ---- Hook into yearly advance ---- */
const P57_ageUpBeforeEvents = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  P57_ageUpBeforeEvents.apply(this, arguments);
  if (!S) return;
  if (S.age === ageBefore) return;
  p57ResetYearlyCounters();
  if (S.pacing !== 'monthly' && p57ShouldFireEvent(false)) {
    const event = p57PickEvent();
    if (event) setTimeout(function () { p57ShowEventModal(event); }, 400);
  }
};

/* ---- Event history panel on Pacing tab ---- */
const P57_viewPacingBefore = viewPacing;
viewPacing = function () {
  let html = P57_viewPacingBefore();
  p57InitEvents();
  const hist = (S.p57.history || []).slice(-8).reverse();
  if (!hist.length) return html;

  let card = '<section class="card"><h3>🎭 Recent life events</h3>';
  hist.forEach(function (h) {
    const mName = (typeof P52_MONTH_NAMES !== 'undefined' && P52_MONTH_NAMES[h.month - 1]) ? P52_MONTH_NAMES[h.month - 1] : '?';
    card += '<div class="row"><span>' + mName + ' ' + h.year + ' · ' + h.event.replace(/_/g, ' ') + '</span></div>';
  });
  card += '</section>';
  return html + card;
};

/* =================================================================
   INIT
   ================================================================= */
p57InitEvents();
