/* =====================================================================
   57. CREDIT CARD PAYMENTS + UNIVERSITY FIX + LIFE EVENTS
   - Pay credit card: full, custom, or minimum (with monthly interest)
   - University graduation bug: complete replacement of uniYear
   - Life events system: monthly + yearly random events (family, friends,
     weddings, birthdays, drama)
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
    /* Compounding already happens in base — nothing to add */
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

    /* Find the "Pay balance" button for this card */
    const escId = cardId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const payBtnPattern = new RegExp('<button class="btn" onclick="p37PayCardPrompt\\(\'' + escId + '\'\\)">[^<]*<\\/button>');
    const newBtns = '<button class="btn" onclick="p57PayCardFull(\'' + cardId + '\')">Pay full · ' + debtEGP.toLocaleString() + ' EGP</button>' +
      '<button class="btn" onclick="p57PayCardCustom(\'' + cardId + '\')">Pay custom amount</button>' +
      '<button class="btn" ' + (S.wealth < minPayInternal ? 'disabled' : '') + ' onclick="p57PayCardMin(\'' + cardId + '\', ' + minPayEGP + ')">Pay minimum · ' + minPayEGP.toLocaleString() + ' EGP<small>5% of balance — the rest accrues 2.2% monthly interest</small></button>';

    if (payBtnPattern.test(html)) {
      html = html.replace(payBtnPattern, newBtns);
    } else {
      /* Insert after the "Approx. EGP balance" row for this card */
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

  /* --- Handle both US and Egypt uni formats --- */
  const isEgypt = !!u.universityId;

  /* --- Tuition --- */
  const yearIdx = p57Idx();
  const rate = p57Rate();
  let tuitionInternal = 0;
  if (isEgypt) {
    const egp = Math.round((u.annualCostEGP || 10000) * yearIdx);
    tuitionInternal = egp / rate;
  } else {
    const un = (typeof UNIS !== 'undefined' && UNIS[u.type]) ? UNIS[u.type] : null;
    const baseTuition = un ? Number(un.tuition) || 500 : 500;
    /* Apply era inflation */
    const inflation = (typeof prOf === 'function') ? prOf(gameYear(), S) : 1;
    tuitionInternal = baseTuition * inflation * (u.scholar ? 0.5 : 1);
  }

  /* --- Funding --- */
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

  /* --- Effort effect on grades --- */
  const ef = (typeof EFFORT !== 'undefined' && EFFORT[S.effort]) ? EFFORT[S.effort] : { smarts: 1, happiness: 0, social: 0 };
  const mult = (u.type === 'private') ? 1.15 : 1.0;
  const smartsGain = ef.smarts > 0 ? Math.round(ef.smarts * mult) : ef.smarts;
  fx({ smarts: smartsGain, happiness: ef.happiness || 0, social: (ef.social || 0) + (u.type === 'private' ? 1 : 0) });

  /* --- Advance year --- */
  u.year = (u.year || 0) + 1;

  /* Years total: Egypt uni has it, US-style doesn't, use MAJORS */
  const yearsTotal = u.yearsTotal || ((u.major && MAJORS && MAJORS[u.major]) ? MAJORS[u.major].years : 4);

  notes.push('university year ' + u.year + '/' + yearsTotal);

  /* --- Graduation? --- */
  if (u.year >= yearsTotal) {
    /* Determine the major */
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

    /* Popup */
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
  if (!o) return; /* Safely aborts if game hasn't started yet */
  if (!o.p57) o.p57 = {};
  if (typeof o.p57.lastEventAbsMonth !== 'number') o.p57.lastEventAbsMonth = -100;
  if (typeof o.p57.eventsThisYear !== 'number') o.p57.eventsThisYear = 0;
  if (!Array.isArray(o.p57.history)) o.p57.history = [];
}

/* Properly hook into save migration and new games per MASTER rules */
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

/* ---- Event pool ---- */
function p57EventPool() {
  const pool = [];

  /* ---------- FAMILY: MONEY ---------- */
  pool.push({
    id: 'fam_money_parent',
    category: 'family',
    weight: 10,
    minAge: 20,
    maxAge: 60,
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
    id: 'fam_money_sibling',
    category: 'family',
    weight: 8,
    minAge: 20,
    maxAge: 60,
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
    id: 'fam_visit_request',
    category: 'family',
    weight: 10,
    minAge: 20,
    maxAge: 70,
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
    id: 'friend_coffee',
    category: 'friend',
    weight: 20,
    minAge: 16,
    maxAge: 80,
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
    id: 'friend_dinner',
    category: 'friend',
    weight: 12,
    minAge: 18,
    maxAge: 80,
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
    id: 'friend_birthday',
    category: 'social',
    weight: 14,
    minAge: 16,
    maxAge: 80,
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
    id: 'family_birthday',
    category: 'family',
    weight: 10,
    minAge: 20,
    maxAge: 70,
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
    id: 'friend_wedding',
    category: 'social',
    weight: 8,
    minAge: 22,
    maxAge: 80,
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
    id: 'sibling_wedding',
    category: 'family',
    weight: 6,
    minAge: 22,
    maxAge: 60,
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
    id: 'family_dinner',
    category: 'family',
    weight: 10,
    minAge: 20,
    maxAge: 70,
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
    id: 'colleague_wedding',
    category: 'work',
    weight: 7,
    minAge: 22,
    maxAge: 60,
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
    id: 'family_drama_money',
    category: 'drama',
    weight: 8,
    minAge: 20,
    maxAge: 60,
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
    id: 'relative_loan',
    category: 'drama',
    weight: 6,
    minAge: 25,
    maxAge: 70,
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
    id: 'old_friend',
    category: 'friend',
    weight: 8,
    minAge: 22,
    maxAge: 70,
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
    id: 'neighbor_dinner',
    category: 'social',
    weight: 5,
    minAge: 25,
    maxAge: 70,
    ok: function () { return S.housing && S.housing !== 'parents' && !S.ownedHomes.some(function (h) { return h.id === S.housing && h.status !== 'live'; }); },
    title: 'A neighbor invites you for dinner',
    text: function () { return 'Your neighbor waves you over: "We are having people over Friday. Join us!" You should bring something — sweets or drinks.'; },
    choices: [
      { label: 'Go and bring a gift', cost: function () { return p57EGP(400); }, effect: function () { return { msg: 'You made a good connection with your neighbors. They now greet you warmly.', fx: { happiness: 3, social: 2 } }; } },
      { label: 'Go but bring nothing', cost: function () { return 0; }, effect: function () { return { msg: 'You attended and had a pleasant evening.', fx: { happiness: 2 } }; } },
      { label: 'Decline politely', cost: function () { return 0; }, effect: function () { return { msg: 'You said you had plans. The neighbor smiled but seemed a bit put off.', fx: {} }; } }
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
  /* Weighted pick */
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
  /* Don't fire if a modal is already open */
  if (document.getElementById('p57-event-modal')) return false;
  if (S.pending) return false;
  if (S.yearPopup) return false;

  const absMonth = (S.pacingAbsoluteMonth || 0);
  /* Cooldown: no event within 2 months of the last one */
  if (absMonth - (S.p57.lastEventAbsMonth || -100) < 2) return false;

  /* Fire chance */
  const chance = isMonthly ? 0.20 : 0.85;
  if (Math.random() > chance) return false;

  return true;
}

/* ---- Show the event modal ---- */
function p57ShowEventModal(event) {
  if (!event) return;
  const existing = document.getElementById('p57-event-modal');
  if (existing) existing.remove();

  const text = (typeof event.text === 'function') ? event.text() : event.text;
  const choicesHtml = (event.choices || []).map(function (c, i) {
    const cost = (typeof c.cost === 'function') ? c.cost() : (c.cost || 0);
    const costStr = cost > 0 ? ' — ' + cost.toLocaleString() + ' EGP' : '';
    const canAfford = cost <= Math.round(S.wealth * p57Rate());
    return '<button class="btn" ' + (canAfford ? '' : 'disabled') + ' onclick="p57ResolveEvent(\'' + event.id + '\',' + i + ')">' +
      c.label + costStr +
      (canAfford ? '' : '<small>Not enough cash</small>') +
      '</button>';
  }).join('');

  const modal = document.createElement('div');
  modal.id = 'p57-event-modal';
  modal.className = 'p24-modal-backdrop';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.78);backdrop-filter:blur(7px);z-index:2000;display:flex;align-items:center;justify-content:center;padding:18px';
  modal.innerHTML = '<div class="p24-modal" style="max-width:460px">' +
    '<div class="p24-pill">LIFE EVENT · ' + p52FormatDate() + '</div>' +
    '<h2>' + event.title + '</h2>' +
    '<p>' + text + '</p>' +
    '<div style="margin-top:14px">' + choicesHtml + '</div>' +
    '</div>';
  document.body.appendChild(modal);
}
window.p57ShowEventModal = p57ShowEventModal;

/* ---- Resolve the event ---- */
function p57ResolveEvent(eventId, choiceIndex) {
  const pool = p57EventPool();
  const event = pool.find(function (e) { return e.id === eventId; });
  if (!event) return;
  const choice = (event.choices || [])[choiceIndex];
  if (!choice) return;

  const cost = (typeof choice.cost === 'function') ? choice.cost() : (choice.cost || 0);
  const rate = p57Rate();
  const internal = cost / rate;

  if (internal > S.wealth) {
    hint('You cannot afford that right now.');
    return;
  }

  if (internal > 0) {
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.lifeEvents = (S.bill.lifeEvents || 0) + internal;
  }

  /* Apply effect */
  const result = (typeof choice.effect === 'function') ? choice.effect() : (choice.effect || {});
  if (result && result.fx && typeof fx === 'function') fx(result.fx);

  /* Log */
  if (result && result.msg) {
    log('📅 ' + event.title + ' — ' + result.msg);
  }

  /* Record */
  p57InitEvents();
  S.p57.lastEventAbsMonth = (S.pacingAbsoluteMonth || 0);
  S.p57.eventsThisYear = (S.p57.eventsThisYear || 0) + 1;
  S.p57.history.push({ year: gameYear(), month: p52CurrentMonth(), event: event.id, choice: choiceIndex });
  S.p57.history = S.p57.history.slice(-30);

  /* Remove modal */
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
  /* Check after the tick */
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
  /* Fire one event per year in yearly mode */
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
    card += '<div class="row"><span>' + (P52_MONTH_NAMES[h.month - 1] || '?') + ' ' + h.year + ' · ' + h.event.replace(/_/g, ' ') + '</span></div>';
  });
  card += '</section>';
  return html + card;
};

/* =================================================================
   INIT
   ================================================================= */
p57InitEvents() 
/* =================================================================
   PART 4 — FORCED EVENT OVERRIDE (100% Chance)
   Forces an event every month (monthly pacing) or every year (yearly)
   ================================================================= */
p57ShouldFireEvent = function (isMonthly) {
  p57InitEvents();
  
  /* Do not fire if a modal is already open or game is pending a choice */
  if (document.getElementById('p57-event-modal')) return false;
  if (S.pending) return false;
  if (S.yearPopup) return false;

  const absMonth = (S.pacingAbsoluteMonth || 0);

  if (S.pacing === 'monthly' || isMonthly) {
    /* 100% chance every month. Prevent double-firing in the exact same month. */
    if (S.p57.lastEventAbsMonth === absMonth) return false;
    return true; 
  } else {
    /* 100% chance once per year in yearly mode. */
    if (S.p57.eventsThisYear >= 1) return false;
    return true;
  }
};
