/* ============================================================
   02-data-events.js — FIXED
   All evt* helpers are null-safe.
   All dynamic labels are functions: label: s => '...'
   ============================================================ */

/* ---------- HELPERS (all null-safe) ---------- */
function evtMoney(egpBase) {
  var egpRate = 52.7;
  var currentRate = (typeof C === 'function' && C().rate) || 52.7;
  return Math.round((egpBase || 0) / egpRate * currentRate);
}
window.evtMoney = evtMoney;

function evtCurrency() {
  return (typeof C === 'function' && C().currency) || 'EGP';
}

function evtHasJob() { return !!(S && ((S.career && S.career.job) || S.job)); }

function evtJobPerf() {
  if (!S) return 50;
  if (S.career && S.career.job) return S.career.job.performance || 50;
  if (S.job) return S.job.performance || 50;
  return 50;
}

function evtAffectPerf(delta) {
  if (!S) return;
  if (S.career && S.career.job) {
    S.career.job.performance = Math.max(0, Math.min(100, (S.career.job.performance || 50) + delta));
  }
  if (S.job) {
    S.job.performance = Math.max(0, Math.min(100, (S.job.performance || 50) + delta));
  }
}

function evtIsMarried() {
  if (!S) return false;
  return !!((S.marriage && S.marriage.status === 'married' && S.marriage.partner) || S.spouse);
}

function evtIsSingle() {
  if (!S) return true;
  return !S.marriage || S.marriage.status === 'single' || S.marriage.status === 'divorced';
}

function evtHasChildren() {
  return !!(S && S.childrenList && S.childrenList.length > 0);
}

function evtPartner() {
  if (!S) return null;
  if (S.marriage && S.marriage.partner) return S.marriage.partner;
  if (S.spouse) return S.spouse;
  return null;
}

function evtPartnerName() {
  var p = evtPartner();
  return p ? p.name : 'your spouse';
}

function evtParent(role) {
  if (!S || !Array.isArray(S.family)) return null;
  return S.family.find(function (m) {
    return m.alive !== false && (!role || m.role === role);
  }) || null;
}

function evtBumpFamily(role, delta) {
  if (!S || !Array.isArray(S.family)) return;
  S.family.forEach(function (m) {
    if (m.alive !== false && (!role || m.role === role)) {
      m.bond = Math.max(0, Math.min(100, (m.bond || 70) + delta));
    }
  });
}

function evtBumpPartner(delta) {
  var p = evtPartner();
  if (p) p.bond = Math.max(0, Math.min(100, (p.bond || 70) + delta));
}

function evtCreditRoom() {
  if (!S || !S.bank || !Array.isArray(S.bank.creditCards)) return 0;
  return S.bank.creditCards.reduce(function (sum, c) {
    return sum + Math.max(0, (c.limit || 0) - (c.balance || 0));
  }, 0);
}

function evtChargeCredit(amount) {
  if (!S || !S.bank || !Array.isArray(S.bank.creditCards)) return false;
  var card = S.bank.creditCards.find(function (c) {
    return ((c.balance || 0) + amount) <= (c.limit || 0);
  });
  if (!card) return false;
  card.balance = (card.balance || 0) + amount;
  return true;
}

function evtAskPartner(amount) {
  var p = evtPartner();
  if (!p) return { ok: false, reason: 'no_partner' };
  var bond = p.bond || 70;
  var chance = Math.min(0.92, Math.max(0.15, bond / 100));
  if (Math.random() < chance) {
    p.bond = Math.max(0, bond - 2);
    return { ok: true, name: p.name };
  }
  p.bond = Math.max(0, bond - 6);
  return { ok: false, reason: 'refused', name: p.name };
}

/* Helper: safe call to evtRemember (defined in 02b-data-events-deep.js) */
function evtRememberSafe(key, value, years) {
  if (typeof evtRemember === 'function') evtRemember(key, value, years);
}

/* ============================================================
   GENDER_EVENTS
   ============================================================ */
const GENDER_EVENTS = [

/* ---------- FEMALE EVENTS ---------- */

{ id: 'f_marriage_pressure', genderOnly: 'f', minAge: 22, maxAge: 32,
  condition: s => evtIsSingle(),
  weight: 10,
  title: '💍 "When Will You Marry?"',
  text: s => {
    var mom = evtParent('Mother');
    var name = mom ? mom.name : 'Your mother';
    return name + ' sits you down with tea. "You are ' + s.age + ' now. Your cousin married at 23. Everyone is asking about you. What should I tell them?"';
  },
  choices: [
    { label: 'Tell her to stop pressuring you',
      effect: s => { evtBumpFamily('Mother', -8); fx({ happiness: -5 }); } },
    { label: 'Reassure her gently',
      effect: s => { evtBumpFamily('Mother', 3); fx({ happiness: 1 }); } },
    { label: 'Explain your career comes first',
      effect: s => { evtBumpFamily('Mother', -3); fx({ smarts: 2 }); } }
  ]
},

{ id: 'f_aunt_body_comment', genderOnly: 'f', minAge: 18, maxAge: 45, weight: 8, maxFires: 4,
  title: '👩‍👧 Family Gathering Critique',
  text: s => 'At a family gathering, your aunt pulls you aside and loudly comments on your weight, your clothes, your skin. "Look at your cousin, she is so elegant. Why do you not take care of yourself?"',
  choices: [
    { label: 'Smile politely and excuse yourself',
      effect: s => { fx({ happiness: -3, social: 1 }); } },
    { label: 'Snap back at her',
      effect: s => { evtBumpFamily(null, -3); fx({ happiness: 2, social: -3 }); } },
    { label: 'Laugh it off and change the subject',
      effect: s => { fx({ happiness: -1, smarts: 1 }); } }
  ]
},

{ id: 'f_street_harassment', genderOnly: 'f', minAge: 15, maxAge: 45, weight: 9, maxFires: 5,
  title: '🚶‍♀️ Street Harassment',
  text: s => 'You are walking home and a group of men start catcalling you. One follows you for a block. Your heart is racing.',
  choices: [
    { label: 'Ignore and walk faster (free)',
      effect: s => { fx({ happiness: -4, health: -1 }); } },
    { label: s => 'Take an Uber to escape (' + evtMoney(80).toLocaleString() + ' ' + evtCurrency() + ')',
      available: s => s.wealth >= evtMoney(80),
      effect: s => { s.wealth -= evtMoney(80); fx({ happiness: 1 }); } },
    { label: s => 'Call ' + (evtParent('Father') ? evtParent('Father').name : 'your father') + ' to come get you',
      effect: s => { evtBumpFamily('Father', 4); fx({ happiness: 2 }); } }
  ]
},

{ id: 'f_career_vs_kids', genderOnly: 'f', minAge: 28, maxAge: 40, weight: 8,
  condition: s => evtIsMarried() && evtHasChildren() && evtHasJob(),
  title: '⚖️ Career or Family?',
  text: s => {
    var p = evtPartnerName();
    return p + '\'s family is over for dinner. His mother says: "She should stay home with the children. A woman who works is not raising her kids right." Everyone looks at you.';
  },
  choices: [
    { label: 'Stand up for your career',
      effect: s => { evtAffectPerf(5); evtBumpPartner(3); fx({ happiness: 3, social: -3 }); } },
    { label: 'Stay quiet and let it pass',
      effect: s => { fx({ happiness: -6 }); } },
    { label: 'Concede and consider quitting',
      effect: s => { evtAffectPerf(-10); fx({ happiness: -3, smarts: -2 }); } }
  ]
},

{ id: 'f_inlaw_kitchen', genderOnly: 'f', minAge: 22, maxAge: 45, weight: 9,
  condition: s => evtIsMarried(),
  title: '🍲 Mother-in-Law Critiques Dinner',
  text: s => {
    var p = evtPartnerName();
    return 'Your mother-in-law tastes your food, puts the spoon down and says: "This is not how ' + p + '\'s grandmother made it. He deserves better."';
  },
  choices: [
    { label: 'Apologize and promise to do better',
      effect: s => { evtBumpFamily('Mother', 2); fx({ happiness: -4 }); } },
    { label: 'Tell her to cook it herself next time',
      effect: s => { evtBumpFamily('Mother', -8); evtBumpPartner(4); fx({ happiness: 3, social: -2 }); } },
    { label: 'Ask your husband to defend you',
      effect: s => {
        var p = evtPartner();
        if (p && (p.bond || 70) >= 60) { evtBumpPartner(5); evtBumpFamily('Mother', -5); fx({ happiness: 4 }); }
        else { evtBumpPartner(-6); fx({ happiness: -8 }); }
      } }
  ]
},

{ id: 'f_baby_pressure', genderOnly: 'f', minAge: 25, maxAge: 35, weight: 8,
  condition: s => evtIsMarried() && !evtHasChildren(),
  title: '👶 "When is the Baby Coming?"',
  text: s => 'Your mother-in-law holds your hand: "Two years married. Still nothing? People are talking. Maybe you should see a doctor, habibti."',
  choices: [
    { label: 'Politely say it is between you and your husband',
      effect: s => { evtBumpFamily('Mother', -3); evtBumpPartner(2); fx({ happiness: -2 }); } },
    { label: 'Burst into tears',
      effect: s => { fx({ happiness: -8, health: -1 }); } },
    { label: 'Promise you are trying',
      effect: s => { evtBumpFamily('Mother', 4); fx({ happiness: -1 }); } }
  ]
},

{ id: 'f_dress_code_family', genderOnly: 'f', minAge: 18, maxAge: 40, weight: 7, maxFires: 3,
  title: '👗 Clothing Dispute',
  text: s => 'You come downstairs in your favorite outfit. Your father looks up and says: "You are not leaving the house like that."',
  choices: [
    { label: 'Change your clothes',
      effect: s => { evtBumpFamily('Father', 3); fx({ happiness: -4 }); } },
    { label: 'Argue and leave anyway',
      effect: s => { evtBumpFamily('Father', -8); fx({ happiness: 3, social: 2 }); } },
    { label: 'Compromise on a jacket',
      effect: s => { fx({ happiness: -1 }); } }
  ]
},

{ id: 'f_workplace_sexism', genderOnly: 'f', minAge: 22, maxAge: 45, weight: 8, maxFires: 3,
  condition: s => evtHasJob(),
  title: '💼 The Promotion That Wasn\'t Yours',
  text: s => 'You delivered better results than any man in the department. The promotion went to a junior male colleague. Your manager says: "You know how it is. He has a family to feed."',
  choices: [
    { label: 'Report it to HR',
      effect: s => { evtAffectPerf(2); fx({ happiness: -2, smarts: 2 }); } },
    { label: 'Accept it silently',
      effect: s => { evtAffectPerf(-5); fx({ happiness: -8 }); } },
    { label: 'Start looking for another job',
      effect: s => { evtAffectPerf(-2); fx({ happiness: 2 }); } }
  ]
},

{ id: 'f_grandma_matchmaking', genderOnly: 'f', minAge: 20, maxAge: 28, weight: 7,
  condition: s => evtIsSingle(),
  title: '👵 Grandma Has a "Nice Young Man"',
  text: s => 'Your grandmother beams at you: "I found you a wonderful young man! Engineer, good family. I told them you will come for tea on Friday."',
  choices: [
    { label: 'Go to the tea meeting',
      effect: s => { fx({ happiness: -1, social: 2 }); log('💍 You went. Awkward. But grandma was happy.'); } },
    { label: 'Refuse to go',
      effect: s => { evtBumpFamily('Mother', -4); fx({ happiness: 1, social: -2 }); } },
    { label: 'Go but make it clear you are not interested',
      effect: s => { fx({ happiness: 1 }); } }
  ]
},

{ id: 'f_dowry_argument', genderOnly: 'f', minAge: 22, maxAge: 32, weight: 6,
  condition: s => S && S.marriage && (S.marriage.status === 'engaged' || S.marriage.status === 'dating'),
  title: '💬 The Dowry Argument',
  text: s => 'Your mother and your fiancé\'s mother are arguing over the mahr. Both keep looking at you.',
  choices: [
    { label: 'Stay silent and let them fight',
      effect: s => { evtBumpFamily('Mother', -3); fx({ happiness: -4 }); } },
    { label: 'Say you do not care about money, only about him',
      effect: s => { evtBumpPartner(6); evtBumpFamily('Mother', -4); fx({ happiness: 1 }); } },
    { label: 'Take your mother\'s side',
      effect: s => { evtBumpFamily('Mother', 5); evtBumpPartner(-3); fx({ happiness: -1 }); } }
  ]
},

{ id: 'f_hijab_choice', genderOnly: 'f', minAge: 16, maxAge: 28, weight: 6,
  title: '🧕 Personal Decision',
  text: s => 'You have been thinking about it for months. Your mother asks what you are going to do.',
  choices: [
    { label: 'Decide to wear it',
      effect: s => { evtBumpFamily(null, 5); fx({ happiness: 2, social: 1 }); } },
    { label: 'Decide not to wear it',
      effect: s => { fx({ happiness: 3, social: -1 }); } },
    { label: 'Say it is your private decision',
      effect: s => { fx({ happiness: 1 }); } }
  ]
},

{ id: 'f_friend_wedding_dress', genderOnly: 'f', minAge: 22, maxAge: 40, weight: 7, maxFires: 3,
  condition: s => (S.friends || []).length > 0,
  title: '👗 Friend\'s Wedding, No Dress',
  text: s => 'Your close friend is getting married next week. You have nothing nice to wear. A proper new dress costs ~' + evtMoney(3000).toLocaleString() + ' ' + evtCurrency() + '.',
  choices: [
    { label: s => 'Buy a new dress (' + evtMoney(3000).toLocaleString() + ' ' + evtCurrency() + ', cash)',
      available: s => s.wealth >= evtMoney(3000),
      effect: s => { s.wealth -= evtMoney(3000); (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 4)); fx({ happiness: 4, social: 3 }); } },
    { label: s => 'Charge ' + evtMoney(3000).toLocaleString() + ' ' + evtCurrency() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(3000),
      effect: s => { evtChargeCredit(evtMoney(3000)); (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 4)); fx({ happiness: 3, social: 3 }); } },
    { label: s => 'Ask ' + evtPartnerName() + ' to pay',
      available: s => evtIsMarried(),
      effect: s => {
        var r = evtAskPartner(evtMoney(3000));
        if (r.ok) { (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 4)); fx({ happiness: 3 }); log('💍 ' + r.name + ': "Of course. Buy something nice."'); }
        else { fx({ happiness: -3 }); log('💔 ' + r.name + ': "Why should I pay for your friend?"'); }
      } },
    { label: 'Re-wear an old dress',
      effect: s => { fx({ happiness: -2, social: -1 }); } }
  ]
},

/* ---------- MALE EVENTS ---------- */

{ id: 'm_apartment_pressure', genderOnly: 'm', minAge: 22, maxAge: 32, weight: 10,
  condition: s => evtIsSingle(),
  title: '🏠 "No Apartment, No Marriage"',
  text: s => {
    var dad = evtParent('Father');
    var name = dad ? dad.name : 'Your father';
    return name + ' slams his tea glass down. "You are ' + s.age + '. No apartment, no car, still living here. How will any father give you his daughter? Get serious."';
  },
  choices: [
    { label: 'Promise to start saving for an apartment',
      effect: s => { evtBumpFamily('Father', 3); fx({ happiness: -3, smarts: 1 }); } },
    { label: 'Argue that times have changed',
      effect: s => { evtBumpFamily('Father', -6); fx({ happiness: -2 }); } },
    { label: 'Stay silent and leave the room',
      effect: s => { evtBumpFamily('Father', -2); fx({ happiness: -5 }); } }
  ]
},

{ id: 'm_military_service', genderOnly: 'm', minAge: 18, maxAge: 24, weight: 12,
  condition: s => s.country === 'egy',
  title: '🎖 Military Conscription Notice',
  text: s => 'The letter arrives in the mail. You have been called for mandatory military service. You can serve, buy an exemption, or find a medical excuse.',
  choices: [
    { label: 'Serve your country (lose a year)',
      effect: s => { fx({ happiness: -10, health: -5, smarts: 3, social: 5 }); log('🎖 You completed military service. It was brutal.'); } },
    { label: s => 'Buy an exemption (' + evtMoney(50000).toLocaleString() + ' ' + evtCurrency() + ')',
      available: s => s.wealth >= evtMoney(50000),
      effect: s => { s.wealth -= evtMoney(50000); fx({ happiness: 5 }); log('🎖 You paid for an exemption.'); } },
    { label: 'Look for a medical exemption',
      effect: s => { if (Math.random() < 0.4) { fx({ happiness: 3 }); log('🎖 A doctor friend helped you. Exempt.'); } else { fx({ happiness: -8, health: -3 }); log('🎖 Excuse rejected. You still served.'); } } }
  ]
},

{ id: 'm_breadwinner', genderOnly: 'm', minAge: 26, maxAge: 45, weight: 8, maxFires: 3,
  condition: s => evtHasJob(),
  title: '💰 "You Are the Man of the House"',
  text: s => 'Your mother calls. Your father\'s pension delayed again. Your sister\'s school fees are due. "You are the man of the house now."',
  choices: [
    { label: s => 'Send ' + evtMoney(5000).toLocaleString() + ' ' + evtCurrency() + ' (cash)',
      available: s => s.wealth >= evtMoney(5000),
      effect: s => { s.wealth -= evtMoney(5000); evtBumpFamily(null, 8); fx({ happiness: 3 }); } },
    { label: s => 'Put ' + evtMoney(5000).toLocaleString() + ' on credit card',
      available: s => evtCreditRoom() >= evtMoney(5000),
      effect: s => { evtChargeCredit(evtMoney(5000)); evtBumpFamily(null, 8); fx({ happiness: 2 }); } },
    { label: s => 'Send ' + evtMoney(2000).toLocaleString() + ' (partial)',
      available: s => s.wealth >= evtMoney(2000),
      effect: s => { s.wealth -= evtMoney(2000); evtBumpFamily(null, 3); fx({ happiness: 1 }); } },
    { label: 'Tell them you cannot this month',
      effect: s => { evtBumpFamily(null, -10); fx({ happiness: -5 }); } }
  ]
},

{ id: 'm_shabka_saving', genderOnly: 'm', minAge: 24, maxAge: 32, weight: 7,
  condition: s => S && S.marriage && (S.marriage.status === 'engaged'),
  title: '💍 Shabka is Due',
  text: s => {
    var p = evtPartnerName();
    return p + '\'s father calls. "We agreed on the shabka next month. You need ' + evtMoney(80000).toLocaleString() + ' ' + evtCurrency() + ' worth of gold."';
  },
  choices: [
    { label: s => 'Pay ' + evtMoney(80000).toLocaleString() + ' from savings',
      available: s => s.wealth >= evtMoney(80000),
      effect: s => { s.wealth -= evtMoney(80000); evtBumpPartner(10); fx({ happiness: 5 }); log('💍 Shabka bought. Wedding is on.'); } },
    { label: s => 'Charge ' + evtMoney(80000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(80000),
      effect: s => { evtChargeCredit(evtMoney(80000)); evtBumpPartner(6); fx({ happiness: 2, health: -1 }); } },
    { label: 'Ask for more time',
      effect: s => { evtBumpPartner(-8); fx({ happiness: -6 }); log('💔 Her father was not happy. Wedding postponed.'); } }
  ]
},

{ id: 'm_family_business', genderOnly: 'm', minAge: 22, maxAge: 40, weight: 6,
  condition: s => evtParent('Father'),
  title: '🏪 "Come Work With Me"',
  text: s => 'Your father wants you to join the family business. He is getting older. But it means giving up your own career.',
  choices: [
    { label: 'Join the family business',
      effect: s => { evtBumpFamily('Father', 15); evtAffectPerf(-15); fx({ happiness: 3, social: 3 }); } },
    { label: 'Politely refuse',
      effect: s => { evtBumpFamily('Father', -12); fx({ happiness: 2 }); } },
    { label: 'Ask to think about it',
      effect: s => { evtBumpFamily('Father', -3); fx({ happiness: -2 }); } }
  ]
},

{ id: 'm_car_required', genderOnly: 'm', minAge: 24, maxAge: 32, weight: 6,
  condition: s => S && S.marriage && S.marriage.status === 'dating' && (!S.cars || S.cars.length === 0),
  title: '🚗 "He Has No Car?"',
  text: s => 'You are dating ' + evtPartnerName() + '. Her brother made a comment: "A man who does not have a car should not be dating my sister."',
  choices: [
    { label: 'Save aggressively for a car',
      effect: s => { fx({ happiness: -3, smarts: 1 }); } },
    { label: 'Ignore him and keep dating her',
      effect: s => { evtBumpPartner(4); fx({ happiness: 2, social: -2 }); } },
    { label: 'End things to save her reputation',
      effect: s => { evtBumpPartner(-20); fx({ happiness: -8 }); log('💔 You ended it. The shame was too much.'); } }
  ]
},

{ id: 'm_marriage_proposal', genderOnly: 'm', minAge: 26, maxAge: 35, weight: 8,
  condition: s => S && S.marriage && S.marriage.status === 'dating' && S.marriage.partner && (S.marriage.partner.bond || 70) >= 65,
  title: '💍 Time to Propose?',
  text: s => 'You have been dating ' + evtPartnerName() + ' for a while. Both families are asking. Are you ready?',
  choices: [
    { label: s => 'Propose properly (ring: ' + evtMoney(15000).toLocaleString() + ' ' + evtCurrency() + ')',
      available: s => s.wealth >= evtMoney(15000),
      effect: s => { s.wealth -= evtMoney(15000); if (S.marriage) S.marriage.status = 'engaged'; evtBumpPartner(15); fx({ happiness: 15 }); } },
    { label: s => 'Propose with a cheap ring (' + evtMoney(3000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(3000),
      effect: s => { s.wealth -= evtMoney(3000); if (S.marriage) S.marriage.status = 'engaged'; evtBumpPartner(8); fx({ happiness: 10 }); } },
    { label: 'Wait a bit longer',
      effect: s => { evtBumpPartner(-3); fx({ happiness: -2 }); } }
  ]
},

{ id: 'm_sibling_loan', genderOnly: 'm', minAge: 24, maxAge: 45, weight: 7, maxFires: 3,
  condition: s => (S.family || []).some(m => m.alive !== false && m.role === 'Brother'),
  title: '💸 Brother Needs a Big Loan',
  text: s => 'Your brother needs ' + evtMoney(20000).toLocaleString() + ' ' + evtCurrency() + ' for a "sure thing" business deal.',
  choices: [
    { label: s => 'Lend ' + evtMoney(20000).toLocaleString() + ' from savings',
      available: s => s.wealth >= evtMoney(20000),
      effect: s => { s.wealth -= evtMoney(20000); evtBumpFamily('Brother', 12); fx({ happiness: 2 }); } },
    { label: s => 'Charge ' + evtMoney(20000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(20000),
      effect: s => { evtChargeCredit(evtMoney(20000)); evtBumpFamily('Brother', 8); fx({ happiness: 1 }); } },
    { label: s => 'Lend ' + evtMoney(10000).toLocaleString() + ' (half)',
      available: s => s.wealth >= evtMoney(10000),
      effect: s => { s.wealth -= evtMoney(10000); evtBumpFamily('Brother', 5); } },
    { label: 'Refuse',
      effect: s => { evtBumpFamily('Brother', -15); fx({ happiness: -4 }); } }
  ]
},

{ id: 'm_father_in_law', genderOnly: 'm', minAge: 26, maxAge: 38, weight: 6,
  condition: s => S && S.marriage && S.marriage.status === 'engaged',
  title: '☕ Meet the Father-in-Law',
  text: s => 'You meet ' + evtPartnerName() + '\'s father for the first time, alone. He wants to "discuss your intentions."',
  choices: [
    { label: s => 'Bring a generous gift (' + evtMoney(3000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(3000),
      effect: s => { s.wealth -= evtMoney(3000); evtBumpPartner(10); fx({ happiness: 6 }); } },
    { label: s => 'Bring a simple gift (' + evtMoney(500).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(500),
      effect: s => { s.wealth -= evtMoney(500); evtBumpPartner(4); fx({ happiness: 2 }); } },
    { label: 'Arrive empty-handed',
      effect: s => { evtBumpPartner(-6); fx({ happiness: -4 }); } }
  ]
},

{ id: 'm_friend_pressure_drink', genderOnly: 'm', minAge: 18, maxAge: 40, weight: 6, maxFires: 4,
  condition: s => (S.friends || []).length > 0,
  title: '🍻 Friends Want to Go Out',
  text: s => 'The boys want to go to a club. "You never come out anymore. What, are you scared?"',
  choices: [
    { label: s => 'Go, spend ' + evtMoney(800).toLocaleString() + ' ' + evtCurrency() + ' on drinks',
      available: s => s.wealth >= evtMoney(800),
      effect: s => { s.wealth -= evtMoney(800); (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 6)); fx({ happiness: 5, social: 4, health: -2 }); } },
    { label: 'Stay home and rest',
      effect: s => { fx({ happiness: 1, social: -3 }); } },
    { label: 'Suggest hanging out at home instead',
      effect: s => { (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 2)); fx({ happiness: 3, social: 2 }); } }
  ]
},

{ id: 'm_brother_wedding_help', genderOnly: 'm', minAge: 24, maxAge: 45, weight: 6,
  condition: s => (S.family || []).some(m => m.alive !== false && m.role === 'Brother'),
  title: '💍 Brother\'s Wedding Costs',
  text: s => 'Your brother is getting married. Your mother quietly tells you: "We need ' + evtMoney(15000).toLocaleString() + ' ' + evtCurrency() + ' from you. You are his only brother."',
  choices: [
    { label: s => 'Pay ' + evtMoney(15000).toLocaleString() + ' (cash)',
      available: s => s.wealth >= evtMoney(15000),
      effect: s => { s.wealth -= evtMoney(15000); evtBumpFamily(null, 15); fx({ happiness: 6, social: 5 }); } },
    { label: s => 'Charge ' + evtMoney(15000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(15000),
      effect: s => { evtChargeCredit(evtMoney(15000)); evtBumpFamily(null, 12); fx({ happiness: 4 }); } },
    { label: s => 'Contribute ' + evtMoney(5000).toLocaleString() + ' (what you can)',
      available: s => s.wealth >= evtMoney(5000),
      effect: s => { s.wealth -= evtMoney(5000); evtBumpFamily(null, 6); fx({ happiness: 2 }); } },
    { label: 'Refuse — you have your own family',
      effect: s => { evtBumpFamily(null, -20); fx({ happiness: -5 }); } }
  ]
},

{ id: 'm_wedding_costs', genderOnly: 'm', minAge: 26, maxAge: 38, weight: 7,
  condition: s => S && S.marriage && S.marriage.status === 'engaged',
  title: '🎉 Wedding Budget Crisis',
  text: s => {
    var p = evtPartnerName();
    return p + '\'s family and yours argue over wedding cost. You are expected to pay ' + evtMoney(150000).toLocaleString() + ' ' + evtCurrency() + '.';
  },
  choices: [
    { label: s => 'Take a bank loan (' + evtMoney(150000).toLocaleString() + ')',
      available: s => evtCreditRoom() >= evtMoney(150000),
      effect: s => { evtChargeCredit(evtMoney(150000)); evtBumpPartner(10); fx({ happiness: 8, health: -3 }); } },
    { label: 'Ask for a smaller wedding',
      effect: s => { evtBumpPartner(-5); fx({ happiness: -3 }); } },
    { label: s => 'Ask ' + evtPartnerName() + ' and her family to contribute',
      effect: s => { evtBumpPartner(-3); fx({ happiness: -2 }); } }
  ]
},

{ id: 'm_career_versus_family', genderOnly: 'm', minAge: 30, maxAge: 48, weight: 7,
  condition: s => evtIsMarried() && evtHasChildren() && evtHasJob(),
  title: '💼 "You Are Never Home"',
  text: s => evtPartnerName() + ' is waiting up at 11 PM. "The kids asked where you were again. This is not a family anymore, it is a hotel."',
  choices: [
    { label: 'Cut back on work hours',
      effect: s => { evtAffectPerf(-8); evtBumpPartner(12); fx({ happiness: 6 }); } },
    { label: 'Promise it will be different',
      effect: s => { evtBumpPartner(3); fx({ happiness: 1 }); } },
    { label: 'Say you are doing this for the family',
      effect: s => { evtBumpPartner(-10); evtAffectPerf(3); fx({ happiness: -5 }); } }
  ]
},

{ id: 'm_marriage_offer_arranged', genderOnly: 'm', minAge: 24, maxAge: 34, weight: 6,
  condition: s => evtIsSingle(),
  title: '💍 Family Arranged Match',
  text: s => 'Your mother found a "very respectable family." Their daughter is beautiful, educated. She wants you to meet her Friday.',
  choices: [
    { label: 'Go to the meeting',
      effect: s => { fx({ happiness: 1, social: 2 }); } },
    { label: 'Refuse politely',
      effect: s => { evtBumpFamily('Mother', -5); fx({ happiness: -2 }); } },
    { label: 'Say you want to choose your own wife',
      effect: s => { evtBumpFamily('Mother', -8); fx({ happiness: 3 }); } }
  ]
},

{ id: 'm_family_honor', genderOnly: 'm', minAge: 22, maxAge: 45, weight: 5,
  condition: s => (S.family || []).length > 0,
  title: '⚔️ Family Honor',
  text: s => 'A neighbor insulted your family publicly. Your father and brothers expect you to "handle it" — man to man.',
  choices: [
    { label: 'Confront him directly',
      effect: s => { if (Math.random() < 0.5) { evtBumpFamily(null, 10); fx({ happiness: 5, health: -3 }); } else { evtBumpFamily(null, -3); fx({ happiness: -4, health: -8 }); } } },
    { label: 'Let it go',
      effect: s => { evtBumpFamily(null, -8); fx({ happiness: -3 }); } },
    { label: 'Call the police instead',
      effect: s => { evtBumpFamily(null, 4); fx({ happiness: 2, social: -2 }); } }
  ]
},

/* ---------- SHARED ---------- */

{ id: 's_parent_surgery', minAge: 22, maxAge: 65, weight: 8, maxFires: 2,
  condition: s => evtParent(),
  title: '🏥 Parent Needs Surgery',
  text: s => {
    var parent = evtParent();
    if (!parent) return 'A parent needs urgent surgery.';
    return 'Your ' + parent.role.toLowerCase() + ', ' + parent.name + ', needs urgent surgery. The hospital wants ' + evtMoney(15000).toLocaleString() + ' ' + evtCurrency() + ' upfront.';
  },
  choices: [
    {
      label: s => 'Pay ' + evtMoney(15000).toLocaleString() + ' ' + evtCurrency() + ' from savings',
      available: s => s.wealth >= evtMoney(15000),
      effect: s => {
        s.wealth -= evtMoney(15000);
        evtBumpFamily(null, 15);
        fx({ happiness: 3 });
        log('💰 You paid for the surgery. The family is grateful.');
        evtRememberSafe('paidParentSurgery', true, 15);
      }
    },
    {
      label: s => 'Charge ' + evtMoney(15000).toLocaleString() + ' ' + evtCurrency() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(15000),
      effect: s => {
        evtChargeCredit(evtMoney(15000));
        evtBumpFamily(null, 12);
        fx({ happiness: 2 });
        log('💳 Charged. The debt is heavy.');
        evtRememberSafe('paidParentSurgery', true, 15);
      }
    },
    {
      label: s => 'Ask ' + evtPartnerName() + ' to help',
      available: s => evtIsMarried(),
      effect: s => {
        var r = evtAskPartner(evtMoney(15000));
        if (r.ok) {
          evtBumpFamily(null, 10);
          fx({ happiness: 3 });
          log('💍 ' + r.name + ': "Your family is my family."');
          evtRememberSafe('paidParentSurgery', true, 15);
        } else {
          fx({ happiness: -12 });
          log('💔 ' + r.name + ' refused.');
        }
      }
    },
    {
      label: 'Say you cannot afford it',
      effect: s => {
        evtBumpFamily(null, -25);
        fx({ happiness: -20, health: -5 });
        log('💔 The surgery was delayed. The family is devastated.');
        evtRememberSafe('refusedParentSurgery', true, 15);
      }
    }
  ]
},

{ id: 's_sibling_wedding', minAge: 22, maxAge: 45, weight: 6, maxFires: 2,
  condition: s => (S.family || []).some(m => m.alive !== false && (m.isSibling || m.role === 'Sibling' || m.role === 'Brother' || m.role === 'Sister')),
  title: '💍 Sibling\'s Wedding',
  text: s => 'Your sibling is getting married. Your expected share: ' + evtMoney(10000).toLocaleString() + ' ' + evtCurrency() + '.',
  choices: [
    { label: s => 'Pay ' + evtMoney(10000).toLocaleString() + ' (cash)',
      available: s => s.wealth >= evtMoney(10000),
      effect: s => { s.wealth -= evtMoney(10000); evtBumpFamily(null, 8); fx({ happiness: 4, social: 3 }); } },
    { label: s => 'Charge ' + evtMoney(10000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(10000),
      effect: s => { evtChargeCredit(evtMoney(10000)); evtBumpFamily(null, 8); fx({ happiness: 3 }); } },
    { label: s => 'Ask ' + evtPartnerName() + ' to cover it',
      available: s => evtIsMarried(),
      effect: s => {
        var r = evtAskPartner(evtMoney(10000));
        if (r.ok) { evtBumpFamily(null, 6); fx({ happiness: 2 }); }
        else { evtBumpFamily(null, -5); fx({ happiness: -5 }); }
      } },
    { label: s => 'Give ' + evtMoney(3000).toLocaleString() + ' (what you can)',
      available: s => s.wealth >= evtMoney(3000),
      effect: s => { s.wealth -= evtMoney(3000); evtBumpFamily(null, 3); } },
    { label: 'Refuse',
      effect: s => { evtBumpFamily(null, -12); fx({ happiness: -4, social: -3 }); } }
  ]
},

{ id: 's_friend_wedding_gift', minAge: 22, maxAge: 45, weight: 8, maxFires: 3,
  condition: s => (S.friends || []).some(f => (f.bond || 0) >= 40),
  title: '💒 Friend\'s Wedding',
  text: s => {
    var f = (S.friends || []).filter(x => (x.bond || 0) >= 40)[0];
    if (!f) return 'A close friend is getting married.';
    return f.name + ' is getting married. A proper cash gift (negoot): ' + evtMoney(2000).toLocaleString() + ' ' + evtCurrency() + '.';
  },
  choices: [
    { label: s => 'Attend with proper gift (' + evtMoney(2000).toLocaleString() + ', cash)',
      available: s => s.wealth >= evtMoney(2000),
      effect: s => { s.wealth -= evtMoney(2000); (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 8)); fx({ happiness: 4, social: 4 }); } },
    { label: s => 'Charge ' + evtMoney(2000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(2000),
      effect: s => { evtChargeCredit(evtMoney(2000)); (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 8)); fx({ happiness: 3, social: 3 }); } },
    { label: s => 'Ask ' + evtPartnerName() + ' to split the gift',
      available: s => evtIsMarried(),
      effect: s => {
        var r = evtAskPartner(evtMoney(1000));
        if (r.ok) { (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 6)); fx({ happiness: 3 }); }
        else { fx({ happiness: -2 }); }
      } },
    { label: 'Send a message and skip',
      effect: s => { (S.friends || []).forEach(f => f.bond = Math.max(0, (f.bond || 50) - 8)); fx({ social: -3 }); } }
  ]
},

{ id: 's_family_birthday', minAge: 18, maxAge: 60, weight: 8, maxFires: 5,
  condition: s => (S.family || []).some(m => m.alive !== false),
  title: '🎂 Family Birthday',
  text: s => 'A close family member\'s birthday. A good gift: ~' + evtMoney(1500).toLocaleString() + ' ' + evtCurrency() + '.',
  choices: [
    { label: s => 'Buy a thoughtful gift (' + evtMoney(1500).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(1500),
      effect: s => { s.wealth -= evtMoney(1500); evtBumpFamily(null, 5); fx({ happiness: 3 }); } },
    { label: s => 'Simple gift (' + evtMoney(500).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(500),
      effect: s => { s.wealth -= evtMoney(500); evtBumpFamily(null, 2); fx({ happiness: 1 }); } },
    { label: 'Just call and wish them',
      effect: s => { evtBumpFamily(null, -2); } }
  ]
},

{ id: 's_car_breakdown', minAge: 22, maxAge: 65, weight: 8, maxFires: 3,
  condition: s => (S.cars || []).some(c => !c.storedIn),
  title: '🚗 Car Broke Down',
  text: s => 'Your car will not start. Dead alternator. Repair: ' + evtMoney(3000).toLocaleString() + ' ' + evtCurrency() + '.',
  choices: [
    { label: s => 'Repair the car (' + evtMoney(3000).toLocaleString() + ', cash)',
      available: s => s.wealth >= evtMoney(3000),
      effect: s => { s.wealth -= evtMoney(3000); fx({ happiness: -2 }); } },
    { label: s => 'Charge ' + evtMoney(3000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(3000),
      effect: s => { evtChargeCredit(evtMoney(3000)); fx({ happiness: -1 }); } },
    { label: 'Take public transport for now',
      effect: s => { fx({ happiness: -5, health: -1 }); } }
  ]
},

{ id: 's_fridge_broken', minAge: 22, maxAge: 65, weight: 7,
  condition: s => S && S.housing && S.housing !== 'parents',
  title: '🧊 Fridge Died',
  text: s => 'Your refrigerator stopped working overnight. New fridge: ' + evtMoney(12000).toLocaleString() + ' ' + evtCurrency() + '. Repair: ' + evtMoney(2500).toLocaleString() + '.',
  choices: [
    { label: s => 'Buy new fridge (' + evtMoney(12000).toLocaleString() + ', cash)',
      available: s => s.wealth >= evtMoney(12000),
      effect: s => { s.wealth -= evtMoney(12000); fx({ happiness: 2 }); } },
    { label: s => 'Charge ' + evtMoney(12000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(12000),
      effect: s => { evtChargeCredit(evtMoney(12000)); fx({ happiness: 1 }); } },
    { label: s => 'Repair (' + evtMoney(2500).toLocaleString() + ', cash)',
      available: s => s.wealth >= evtMoney(2500),
      effect: s => { s.wealth -= evtMoney(2500); fx({ happiness: -2 }); } },
    { label: 'Live without a fridge',
      effect: s => { fx({ happiness: -5, health: -2 }); } }
  ]
},

{ id: 's_phone_stolen', minAge: 16, maxAge: 70, weight: 7,
  title: '📱 Phone Snatched',
  text: s => 'A motorcycle snatcher grabbed your phone at the traffic light. You need a new one.',
  choices: [
    { label: s => 'Buy a basic replacement (' + evtMoney(5000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(5000),
      effect: s => { s.wealth -= evtMoney(5000); fx({ happiness: -4 }); } },
    { label: s => 'Charge ' + evtMoney(5000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(5000),
      effect: s => { evtChargeCredit(evtMoney(5000)); fx({ happiness: -3 }); } },
    { label: 'Go without a phone',
      effect: s => { fx({ happiness: -8, social: -5 }); } }
  ]
},

{ id: 's_coworker_loan', minAge: 22, maxAge: 55, weight: 6, maxFires: 3,
  condition: s => evtHasJob(),
  title: '💼 Coworker Wants a Loan',
  text: s => 'A coworker: "I am short on rent. Can you lend me ' + evtMoney(2000).toLocaleString() + ' ' + evtCurrency() + '?"',
  choices: [
    { label: s => 'Lend ' + evtMoney(2000).toLocaleString() + ' (cash)',
      available: s => s.wealth >= evtMoney(2000),
      effect: s => { s.wealth -= evtMoney(2000); if (Math.random() < 0.5) { fx({ happiness: 2, social: 3 }); log('😊 They paid you back on time.'); } else { fx({ happiness: -3 }); log('😐 Not seen that money since.'); } } },
    { label: 'Politely say you cannot',
      effect: s => { evtAffectPerf(-1); fx({ social: -2 }); } }
  ]
},

{ id: 's_subscription_trap', minAge: 18, maxAge: 70, weight: 7, maxFires: 3,
  title: '📱 Forgotten Subscription Auto-Renewed',
  text: s => 'You notice a charge of ' + evtMoney(1200).toLocaleString() + ' ' + evtCurrency() + ' on your card for an old app. Auto-renewal.',
  choices: [
    { label: 'Accept and cancel now',
      effect: s => { fx({ happiness: -1 }); } },
    { label: 'Call support for a refund',
      effect: s => { if (Math.random() < 0.5) { fx({ happiness: 2 }); log('😊 They refunded you. Nice!'); } else { fx({ happiness: -2 }); log('😐 No refund. "Terms of service."'); } } }
  ]
},

{ id: 's_friend_coffee', minAge: 18, maxAge: 65, weight: 9, maxFires: 10,
  condition: s => (S.friends || []).length > 0,
  title: '☕ Coffee Invite',
  text: s => {
    var f = (S.friends || [])[0];
    return (f ? f.name : 'A friend') + ' texts: "Free this weekend? Coffee?" (~' + evtMoney(200).toLocaleString() + ' ' + evtCurrency() + ')';
  },
  choices: [
    { label: s => 'Yes, coffee out (' + evtMoney(250).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(250),
      effect: s => { s.wealth -= evtMoney(250); (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 4)); fx({ happiness: 3, social: 3 }); } },
    { label: 'Meet at home instead (free)',
      effect: s => { (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 3)); fx({ happiness: 2, social: 2 }); } },
    { label: 'Say you are busy',
      effect: s => { (S.friends || []).forEach(f => f.bond = Math.max(0, (f.bond || 50) - 3)); fx({ happiness: -1 }); } }
  ]
},

{ id: 's_parent_wants_visit', minAge: 20, maxAge: 65, weight: 7, maxFires: 5,
  condition: s => evtParent(),
  title: '👨‍👩‍👧 "Come See Us"',
  text: s => {
    var p = evtParent();
    return (p ? p.name : 'Your parent') + ' calls. "It has been so long. When are you coming to visit?"';
  },
  choices: [
    { label: s => 'Visit this weekend (' + evtMoney(300).toLocaleString() + ' transport)',
      available: s => s.wealth >= evtMoney(300),
      effect: s => { s.wealth -= evtMoney(300); evtBumpFamily(null, 6); fx({ happiness: 4, social: 2 }); } },
    { label: 'Promise to visit soon',
      effect: s => { evtBumpFamily(null, 1); } },
    { label: 'Say you are too busy',
      effect: s => { evtBumpFamily(null, -3); fx({ happiness: -2 }); } }
  ]
},

{ id: 's_old_friend_returns', minAge: 24, maxAge: 60, weight: 5, maxFires: 3,
  condition: s => (S.friends || []).length > 0,
  title: '👋 Old Friend Reappears',
  text: s => 'Someone you lost touch with: "Long time! Dinner at my place?"',
  choices: [
    { label: s => 'Go, bring a gift (' + evtMoney(400).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(400),
      effect: s => { s.wealth -= evtMoney(400); (S.friends || []).forEach(f => f.bond = Math.min(100, (f.bond || 50) + 6)); fx({ happiness: 4, social: 3 }); } },
    { label: 'Go but bring nothing',
      effect: s => { fx({ happiness: 2, social: 2 }); } },
    { label: 'Say you are too busy',
      effect: s => { fx({ social: -1 }); } }
  ]
},

{ id: 's_charity_encounter', minAge: 16, maxAge: 70, weight: 6, maxFires: 4,
  title: '🤲 Person in Need',
  text: s => 'An elderly woman quietly asks you for money to buy bread and milk for her grandchildren.',
  choices: [
    { label: s => 'Buy groceries (' + evtMoney(400).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(400),
      effect: s => { s.wealth -= evtMoney(400); fx({ happiness: 5, health: 1 }); log('🤲 She prayed for you.'); } },
    { label: s => 'Give some cash (' + evtMoney(100).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(100),
      effect: s => { s.wealth -= evtMoney(100); fx({ happiness: 2 }); } },
    { label: 'Apologize and walk away',
      effect: s => { fx({ happiness: -2 }); } }
  ]
},

{ id: 's_scam_call', minAge: 18, maxAge: 70, weight: 6, maxFires: 3,
  title: '📞 "Bank Security" Call',
  text: s => 'Someone claiming to be from your bank calls. They want your OTP to "verify" your identity.',
  choices: [
    { label: 'Give them the OTP',
      effect: s => { var loss = Math.min(s.wealth, evtMoney(4000)); s.wealth -= loss; fx({ happiness: -8, smarts: -2 }); log('🚨 Scam. Took ' + loss.toLocaleString() + ' ' + evtCurrency() + '.'); } },
    { label: 'Hang up immediately',
      effect: s => { fx({ smarts: 1 }); log('🛡 You protected yourself.'); } }
  ]
},

/* ---------- MARRIED-ONLY ---------- */

{ id: 'm_partner_wants_baby', minAge: 24, maxAge: 38, weight: 9, maxFires: 4,
  condition: s => evtIsMarried() && !evtHasChildren(),
  title: '👶 Partner Wants a Child',
  text: s => evtPartnerName() + ': "I have been thinking. Maybe we are ready? A baby."',
  choices: [
    { label: 'Yes — let us try',
      effect: s => { evtBumpPartner(12); fx({ happiness: 8 }); log('💡 Try for a baby in the Children tab.'); } },
    { label: 'Not yet',
      effect: s => { evtBumpPartner(-4); } },
    { label: 'I do not want children',
      effect: s => { evtBumpPartner(-20); if (S.marriage) S.marriage.pendingConflict = 'children'; fx({ happiness: -6 }); } }
  ]
},

{ id: 'm_anniversary', minAge: 25, maxAge: 60, weight: 7, maxFires: 20,
  condition: s => evtIsMarried(),
  title: '💍 Wedding Anniversary',
  text: s => evtPartnerName() + ': "So... do you remember what today is?"',
  choices: [
    { label: s => 'Book dinner + gift (' + evtMoney(8000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(8000),
      effect: s => { s.wealth -= evtMoney(8000); evtBumpPartner(15); fx({ happiness: 10 }); } },
    { label: s => 'Charge ' + evtMoney(8000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(8000),
      effect: s => { evtChargeCredit(evtMoney(8000)); evtBumpPartner(12); fx({ happiness: 8 }); } },
    { label: 'Homemade dinner + card (free)',
      effect: s => { evtBumpPartner(6); fx({ happiness: 4 }); } },
    { label: 'Admit you forgot',
      effect: s => { evtBumpPartner(-18); fx({ happiness: -8 }); } }
  ]
},

{ id: 'm_inlaw_visit', minAge: 24, maxAge: 55, weight: 7, maxFires: 5,
  condition: s => evtIsMarried(),
  title: '👵 Mother-in-Law Visiting',
  text: s => 'Your mother-in-law announces a week-long stay. ' + evtPartnerName() + ': "Only a week. She misses us."',
  choices: [
    { label: s => 'Host graciously (' + evtMoney(2000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(2000),
      effect: s => { s.wealth -= evtMoney(2000); evtBumpFamily('Mother', 10); evtBumpPartner(5); fx({ happiness: -2 }); } },
    { label: 'Push back on her comments',
      effect: s => { evtBumpFamily('Mother', -15); evtBumpPartner(3); fx({ happiness: 3 }); } },
    { label: 'Stay quiet and keep the peace',
      effect: s => { evtBumpFamily('Mother', 5); evtBumpPartner(-2); fx({ happiness: -3 }); } }
  ]
},

{ id: 'm_partner_distant', minAge: 26, maxAge: 55, weight: 6, maxFires: 4,
  condition: s => evtIsMarried(),
  title: '💬 Partner Seems Distant',
  text: s => 'Conversations have been short. ' + evtPartnerName() + ' says "I am fine" but clearly is not.',
  choices: [
    { label: 'Sit down and really listen',
      effect: s => { evtBumpPartner(10); fx({ happiness: 4 }); } },
    { label: 'Give them space',
      effect: s => { evtBumpPartner(-4); } },
    { label: 'Push them to talk now',
      effect: s => { evtBumpPartner(-8); fx({ happiness: -3 }); } }
  ]
},

{ id: 'm_partner_lost_job', minAge: 26, maxAge: 58, weight: 5,
  condition: s => evtIsMarried() && evtPartner() && evtPartner().income > 0,
  title: '😔 Partner Lost Job',
  text: s => evtPartnerName() + ' comes home with red eyes. "They let me go."',
  choices: [
    { label: 'Reassure them',
      effect: s => { evtBumpPartner(10); fx({ happiness: 2 }); if (evtPartner()) evtPartner().income = 0; } },
    { label: 'Get angry',
      effect: s => { evtBumpPartner(-12); fx({ happiness: -6 }); if (evtPartner()) evtPartner().income = 0; } }
  ]
},

/* ---------- CHILDREN-ONLY ---------- */

{ id: 'c_school_fees', minAge: 30, maxAge: 55, weight: 7, maxFires: 8,
  condition: s => evtHasChildren() && (S.childrenList || []).some(c => c.age >= 4 && c.age <= 18),
  title: '📚 Child\'s School Fees',
  text: s => 'Term fees + uniforms + books: ' + evtMoney(8000).toLocaleString() + ' ' + evtCurrency() + '.',
  choices: [
    { label: s => 'Pay ' + evtMoney(8000).toLocaleString() + ' (cash)',
      available: s => s.wealth >= evtMoney(8000),
      effect: s => { s.wealth -= evtMoney(8000); (S.childrenList || []).forEach(c => c.happiness = Math.min(100, (c.happiness || 70) + 3)); fx({ happiness: 2 }); } },
    { label: s => 'Charge ' + evtMoney(8000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(8000),
      effect: s => { evtChargeCredit(evtMoney(8000)); fx({ happiness: 1 }); } },
    { label: s => 'Ask ' + evtPartnerName() + ' to split',
      available: s => evtIsMarried(),
      effect: s => {
        var r = evtAskPartner(evtMoney(4000));
        if (r.ok) { fx({ happiness: 2 }); }
        else { fx({ happiness: -4 }); }
      } },
    { label: 'Ask the school for a delay',
      effect: s => { (S.childrenList || []).forEach(c => c.happiness = Math.max(0, (c.happiness || 70) - 5)); fx({ happiness: -3 }); } }
  ]
},

{ id: 'c_child_wants_phone', minAge: 30, maxAge: 50, weight: 6,
  condition: s => (S.childrenList || []).some(c => c.age >= 11 && c.age <= 15),
  title: '📱 Child Wants a Phone',
  text: s => {
    var child = (S.childrenList || []).find(c => c.age >= 11 && c.age <= 15);
    return (child ? child.name : 'Your child') + ' begs for a smartphone. Decent one: ' + evtMoney(8000).toLocaleString() + ' ' + evtCurrency() + '.';
  },
  choices: [
    { label: s => 'Buy it (' + evtMoney(8000).toLocaleString() + ', cash)',
      available: s => s.wealth >= evtMoney(8000),
      effect: s => { s.wealth -= evtMoney(8000); (S.childrenList || []).forEach(c => c.happiness = Math.min(100, (c.happiness || 70) + 10)); fx({ happiness: 3 }); } },
    { label: s => 'Charge ' + evtMoney(8000).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(8000),
      effect: s => { evtChargeCredit(evtMoney(8000)); (S.childrenList || []).forEach(c => c.happiness = Math.min(100, (c.happiness || 70) + 8)); fx({ happiness: 2 }); } },
    { label: 'Refuse — too young',
      effect: s => { (S.childrenList || []).forEach(c => c.happiness = Math.max(0, (c.happiness || 70) - 8)); fx({ happiness: -2 }); } }
  ]
},

{ id: 'c_child_birthday', minAge: 28, maxAge: 55, weight: 7, maxFires: 10,
  condition: s => evtHasChildren(),
  title: '🎂 Child\'s Birthday',
  text: s => {
    var child = (S.childrenList || [])[0];
    return (child ? child.name : 'Your child') + '\'s birthday. Proper party: ' + evtMoney(3000).toLocaleString() + ' ' + evtCurrency() + '. Simple cake: ' + evtMoney(500).toLocaleString() + '.';
  },
  choices: [
    { label: s => 'Proper party (' + evtMoney(3000).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(3000),
      effect: s => { s.wealth -= evtMoney(3000); (S.childrenList || []).forEach(c => { c.happiness = Math.min(100, (c.happiness || 70) + 12); c.bond = Math.min(100, (c.bond || 55) + 6); }); fx({ happiness: 5 }); } },
    { label: s => 'Simple cake at home (' + evtMoney(500).toLocaleString() + ')',
      available: s => s.wealth >= evtMoney(500),
      effect: s => { s.wealth -= evtMoney(500); (S.childrenList || []).forEach(c => { c.happiness = Math.min(100, (c.happiness || 70) + 5); c.bond = Math.min(100, (c.bond || 55) + 3); }); fx({ happiness: 3 }); } },
    { label: 'Just a phone call',
      effect: s => { (S.childrenList || []).forEach(c => c.happiness = Math.max(0, (c.happiness || 70) - 6)); fx({ happiness: -2 }); } }
  ]
},

{ id: 'c_child_sick', minAge: 28, maxAge: 55, weight: 6, maxFires: 5,
  condition: s => (S.childrenList || []).some(c => c.age < 12),
  title: '🤒 Child is Sick',
  text: s => {
    var child = (S.childrenList || []).find(c => c.age < 12);
    return (child ? child.name : 'Your child') + ' has a high fever. Doctor + medicine: ' + evtMoney(1500).toLocaleString() + ' ' + evtCurrency() + '.';
  },
  choices: [
    { label: s => 'Private doctor (' + evtMoney(1500).toLocaleString() + ', cash)',
      available: s => s.wealth >= evtMoney(1500),
      effect: s => { s.wealth -= evtMoney(1500); (S.childrenList || []).forEach(c => { c.health = Math.min(100, (c.health || 100) + 15); }); fx({ happiness: 1 }); } },
    { label: s => 'Charge ' + evtMoney(1500).toLocaleString() + ' to credit card',
      available: s => evtCreditRoom() >= evtMoney(1500),
      effect: s => { evtChargeCredit(evtMoney(1500)); fx({ happiness: 1 }); } },
    { label: 'Wait it out at home',
      effect: s => { (S.childrenList || []).forEach(c => { c.health = Math.max(0, (c.health || 100) - 15); }); fx({ happiness: -5, health: -1 }); } }
  ]
}

];

/* ============================================================
   GLOBAL_EVENTS (original simple events — kept)
   ============================================================ */
const GLOBAL_EVENTS = [
  { id: 'first_friend', minAge: 7, maxAge: 9,
    title: 'A new friend',
    text: 'A classmate asks if you want to play football after school.',
    choices: [
      { label: 'Play football', effect: s => { s.happiness += 5; s.social += 5; } },
      { label: 'Go home and study', effect: s => { s.smarts += 3; s.social -= 2; } }
    ]
  },
  { id: 'hobby', minAge: 10, maxAge: 12,
    title: 'A new hobby',
    text: 'You have some free time.',
    choices: [
      { label: 'Read books', effect: s => { s.smarts += 4; } },
      { label: 'Play video games', effect: s => { s.happiness += 4; } },
      { label: 'Play sports', effect: s => { s.health += 4; s.social += 3; } }
    ]
  },
  { id: 'study_choice', minAge: 13, maxAge: 15,
    title: 'Preparing for exams',
    text: 'Exams are coming up.',
    choices: [
      { label: 'Study hard', effect: s => { s.smarts += 5; s.happiness -= 3; } },
      { label: 'Coast', effect: s => { s.smarts += 1; } },
      { label: 'Skip studying', effect: s => { s.smarts -= 2; s.happiness += 4; } }
    ]
  },
  { id: 'marriage_opportunity', minAge: 24, maxAge: 35,
    condition: s => !s.spouse && !(s.marriage && s.marriage.partner),
    title: 'Someone special',
    text: 'You meet someone you could see yourself with.',
    choices: [
      { label: 'Pursue it', effect: s => {
        const male = ['Omar','Youssef','Karim','Ahmed','Hassan'];
        const female = ['Sarah','Layla','Noor','Mariam','Hana'];
        const names = s.gender === 'm' ? female : male;
        const spouse = {
          id: 'sp_' + Math.random().toString(36).slice(2, 8),
          role: 'Spouse',
          name: names[Math.floor(Math.random() * names.length)],
          age: Math.max(20, s.age + Math.floor(Math.random() * 5) - 2),
          bond: 65, alive: true,
          works: Math.random() < 0.6, income: 0
        };
        if (spouse.works) spouse.income = Math.round(s.age >= 22 ? 60000 + Math.random() * 60000 : 0);
        s.spouse = spouse;
        s.family.push(spouse);
        s.happiness += 8; s.social += 5;
      } },
      { label: 'Stay focused on career', effect: s => { s.happiness -= 2; s.smarts += 2; } }
    ]
  },
  { id: 'child_opportunity', minAge: 27, maxAge: 40,
       condition: s => {
      if (!(s.spouse || (s.marriage && s.marriage.status === 'married' && s.marriage.partner))) return false;
      var fp = s.marriage && s.marriage.familyPlanning;
      if (fp === 'wait') return false;
      if (fp === 'career_first' && Math.random() > 0.15) return false;
      var kids = (s.childrenList || []).length;
      if (fp === 'one_child' && kids >= 1) return false;
      if (fp === 'two_children' && kids >= 2) return false;
      if (fp === 'large_family' && kids >= 4) return false;
      return true;
    },
    title: 'Starting a family',
    text: 'You and your partner talk about having a child.',
    choices: [
          { label: 'Have a child', effect: s => {
        if (!s.childrenList) s.childrenList = [];
        var _g = Math.random() < 0.5 ? 'm' : 'f';
        var _pool = (typeof CHILDREN_BABY_NAMES !== 'undefined' && CHILDREN_BABY_NAMES[s.country]) ? CHILDREN_BABY_NAMES[s.country] : (CHILDREN_BABY_NAMES || {}).egy || { m: ['Omar'], f: ['Layla'] };
        var _name = (_g === 'm' ? _pool.m : _pool.f)[Math.floor(Math.random() * (_g === 'm' ? _pool.m : _pool.f).length)];
        var _kid = {
          id: 'child_' + Math.random().toString(36).slice(2, 8),
          name: _name,
          gender: _g,
          age: 0,
          birthYear: gameYear(),
          bond: 55,
          happiness: 70,
          smarts: 50,
          health: 100,
          social: 50,
          lifestyle: 'standard',
          activities: [],
          milestones: [],
          events: [],
          traits: [],
          school: null,
          movedOut: false
        };
        s.childrenList.push(_kid);
        s.happiness += 10;
        s.wealth -= 36000;
        if (s.marriage && s.marriage.partner) s.marriage.partner.bond = Math.min(100, (s.marriage.partner.bond || 70) + 5);
      } },
      { label: 'Not yet', effect: s => { s.happiness += 2; } }
    ]
  }
];

window.GLOBAL_EVENTS = GLOBAL_EVENTS;
window.GENDER_EVENTS = GENDER_EVENTS;
