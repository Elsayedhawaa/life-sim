/* =====================================================================
   60. FAMILY HOME, PARENT MORTALITY & INHERITANCE
   - Real details for the parents' home (address, type, rooms, owner, condition)
   - Renovate / upgrade / maid for parents' home
   - Parents can die (age + illness + accidents)
   - Inheritance distribution among children + spouse
   - Buy / sell / gift sibling shares of the family home
   - Eviction handling if the last parent dies
   - Mortgage annual payment recalculates after early payment
   Load AFTER 59-early-payment-bank-ui.js and BEFORE 99-boot.js
   ===================================================================== */

function p60Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p60Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p60EGP(egp2026) { return Math.round(egp2026 * p60Idx()); }

/* ============ 1. STATE ============ */
function p60Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p60) o.p60 = {};
  const d = o.p60;
  if (!d.parentsHome) d.parentsHome = null;
  if (typeof d.homeMaid === 'undefined') d.homeMaid = null;   /* null | 'cleaner' | 'maid' */
  if (typeof d.homeMaidCost !== 'number') d.homeMaidCost = 0;
  if (!Array.isArray(d.inheritances)) d.inheritances = [];
  if (typeof d.pendingPopup === 'undefined') d.pendingPopup = null;
  if (!Array.isArray(d.pendingDeath)) d.pendingDeath = [];
}
const P60_migrate = migrate;
migrate = function (o) { const r = P60_migrate(o); p60Init(r); return r; };
const P60_newGame = newGame;
newGame = function () {
  P60_newGame.apply(this, arguments);
  p60Init(S);
  p60GenerateParentsHome();
};

/* ============ 2. GENERATE PARENTS HOME ============ */
function p60GenerateParentsHome() {
  if (!S) return;
  p60Init(S);
  const y = S.born || 2001;
  const city = S.country === 'egy'
    ? (Math.random() < 0.5 ? 'Alexandria' : 'Cairo')
    : ((typeof COUNTRIES !== 'undefined' && COUNTRIES[S.country]) ? COUNTRIES[S.country].n : 'Home country');

  const neighbourhoods = {
    egy: ['Smouha', 'Sidi Gaber', 'Miami', 'Agami', 'Nasr City', 'Maadi', 'Shubra', 'Heliopolis'],
    usa: ['Suburb', 'Downtown', 'Older district', 'Riverside'],
    gbr: ['Outer zone', 'Suburb', 'Town centre'],
    deu: ['Altbau district', 'Suburb', 'City fringe'],
    default: ['Central district', 'Old town', 'Outer district']
  };
  const hoods = neighbourhoods[S.country] || neighbourhoods.default;
  const hood = hoods[Math.floor(Math.random() * hoods.length)];

  const fw = Math.max(0, Math.min(2, Number(S.famWealth) || 0));
  const builtYears = [1975, 1988, 1995, 2005, 2015];
  const builtYear = builtYears[fw] + Math.floor(Math.random() * 6);

  const types = fw === 2 ? ['villa', 'duplex', 'penthouse'] : fw === 1 ? ['apartment', 'flat', 'duplex'] : ['apartment', 'older flat', 'walk-up'];
  const type = types[Math.floor(Math.random() * types.length)];

  const rooms = fw === 0 ? (2 + Math.floor(Math.random() * 2))
    : fw === 1 ? (3 + Math.floor(Math.random() * 2))
    : (4 + Math.floor(Math.random() * 3));

  const area = fw === 0 ? (60 + Math.floor(Math.random() * 30))
    : fw === 1 ? (110 + Math.floor(Math.random() * 50))
    : (240 + Math.floor(Math.random() * 120));

  const condition = 30 + Math.floor(Math.random() * 40) + fw * 12;
  const cond = Math.max(20, Math.min(95, condition));

  /* Value in 2026 EGP; then to internal */
  const pricePerM2Base = fw === 2 ? 60000 : fw === 1 ? 28000 : 12000;
  const valueEGP2026 = area * pricePerM2Base * (cond / 100) * 0.85 + Math.random() * 200000;
  const valueInternal = p60EGP(valueEGP2026) / p60Rate();

  /* Owner */
  const motherAlive = (S.family || []).some(function (m) { return m && m.role === 'Mother' && m.alive !== false; });
  const fatherAlive = (S.family || []).some(function (m) { return m && m.role === 'Father' && m.alive !== false; });
  const owner = motherAlive && fatherAlive ? (Math.random() < 0.5 ? 'both' : 'father')
    : motherAlive ? 'mother'
    : fatherAlive ? 'father'
    : 'both';

  const featurePool = ['Balcony', 'Elevator', 'Parking spot', 'Private garden', 'Security gate', 'Storage room', 'Air conditioning', 'Modern kitchen'];
  const features = [];
  const count = fw + 1 + Math.floor(Math.random() * 2);
  for (let i = 0; i < count && i < featurePool.length; i++) {
    const pick = featurePool[Math.floor(Math.random() * featurePool.length)];
    if (features.indexOf(pick) === -1) features.push(pick);
  }

  S.p60.parentsHome = {
    address: (hood + ', ' + city),
    city: city,
    neighbourhood: hood,
    type: type,
    rooms: rooms,
    area: area,
    condition: cond,
    builtYear: builtYear,
    owner: owner,
    value: Math.round(valueInternal),
    features: features,
    renovations: [],
    ownsHome: true
  };
}
window.p60GenerateParentsHome = p60GenerateParentsHome;

/* ============ 3. HOME VIEW FOR PARENTS ============ */
function p60ParentsHomePanel() {
  if (!S || S.age < 16) return '';
  p60Init(S);
  if (S.housing !== 'parents') return '';
  const h = S.p60.parentsHome;
  if (!h) return '';

  const rate = p60Rate();
  const valueEGP = Math.round(Number(h.value) * rate);
  const ownerLabel = h.owner === 'both' ? 'Your mother and father (jointly)'
    : h.owner === 'mother' ? 'Your mother'
    : h.owner === 'father' ? 'Your father'
    : 'Your parents';

  const condColor = h.condition < 40 ? 'var(--rose)' : h.condition < 65 ? 'var(--amber)' : 'var(--mint)';

  /* Renovation options */
  const renoOptions = [
    { id: 'paint',   label: 'Repaint & refresh',       egp: 15000, cond: 8,  value: 0.03 },
    { id: 'kitchen', label: 'Modernise kitchen',       egp: 45000, cond: 12, value: 0.06 },
    { id: 'bath',    label: 'Renovate bathroom',       egp: 38000, cond: 10, value: 0.05 },
    { id: 'floors',  label: 'Replace floors',          egp: 55000, cond: 14, value: 0.07 },
    { id: 'ac',      label: 'Install split AC units',  egp: 60000, cond: 6,  value: 0.04 }
  ];

  const maidOptions = [
    { id: 'cleaner', label: 'Weekly cleaner',   egpMonthly: 3500 },
    { id: 'maid',    label: 'Full-time helper', egpMonthly: 8000 }
  ];

  let html = '<section class="card"><h3>🏠 Your parents\' home</h3>' +
    '<div class="row"><span>Address</span><b>' + h.address + '</b></div>' +
    '<div class="row"><span>Type</span><b>' + h.type + ' · ' + h.rooms + ' rooms · ' + h.area + ' m²</b></div>' +
    '<div class="row"><span>Built</span><b>' + h.builtYear + ' (' + (gameYear() - h.builtYear) + ' years old)</b></div>' +
    '<div class="row"><span>Owner</span><b>' + ownerLabel + '</b></div>' +
    '<div class="row"><span>Condition</span><b style="color:' + condColor + '">' + Math.round(h.condition) + '%</b></div>' +
    '<div class="row"><span>Market value</span><b class="mono">' + valueEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row"><span>Features</span><b style="font-size:.82rem">' + ((h.features || []).join(' · ') || 'Basic finish') + '</b></div>';

  if ((h.renovations || []).length) {
    html += '<p class="muted" style="font-size:.82rem;margin-top:6px">Renovations: ' + h.renovations.join(', ') + '</p>';
  }

  /* If player is under 18 or has no money, hide controls */
  if (S.age >= 18) {
    /* Maid controls */
    html += '<h4 style="margin-top:12px;font-size:.9rem">Household help</h4>';
    if (S.p60.homeMaid) {
      const currentLabel = S.p60.homeMaid === 'cleaner' ? 'Weekly cleaner' : 'Full-time helper';
      html += '<div class="row"><span>Current</span><b>' + currentLabel + '</b></div>' +
        '<button class="btn" onclick="p60CancelMaid()">Cancel household help</button>';
    } else {
      maidOptions.forEach(function (m) {
        html += '<button class="btn" onclick="p60HireMaid(\'' + m.id + '\')">Hire ' + m.label + ' · ' + p60EGP(m.egpMonthly).toLocaleString() + ' EGP/month</button>';
      });
    }

    /* Renovations */
    html += '<h4 style="margin-top:14px;font-size:.9rem">Renovate parents\' home</h4>';
    renoOptions.forEach(function (r) {
      const egp = p60EGP(r.egp);
      const internal = egp / rate;
      const canAfford = S.wealth >= internal;
      html += '<button class="btn" ' + (canAfford ? '' : 'disabled') + ' onclick="p60RenovateParentsHome(\'' + r.id + '\')">' +
        r.label + ' · ' + egp.toLocaleString() + ' EGP' +
        (canAfford ? '' : '<small>Not enough cash</small>') +
        '</button>';
    });
  } else {
    html += '<p class="muted" style="font-size:.82rem;margin-top:8px">Renovations and household help unlock at age 18.</p>';
  }

  /* Estate preview */
  html += '<h4 style="margin-top:14px;font-size:.9rem">Ownership & estate</h4>';
  const livingHeirs = p60LivingHeirs();
  if (livingHeirs.length > 1) {
    html += '<p class="muted" style="font-size:.82rem">If both parents pass, the home and their savings are divided among ' +
      livingHeirs.length + ' heirs (' + livingHeirs.map(function (h2) { return h2.name; }).join(', ') + ').</p>';
  } else {
    html += '<p class="muted" style="font-size:.82rem">You are the only surviving heir.</p>';
  }

  /* Owned shares */
  const ownedShare = p60PlayerOwnedShareOfHome();
  if (ownedShare > 0) {
    const shareLabel = (ownedShare * 100).toFixed(0);
    const shareValue = Math.round(valueEGP * ownedShare);
    html += '<div class="row"><span>Your owned share</span><b>' + shareLabel + '% (' + shareValue.toLocaleString() + ' EGP)</b></div>';
    html += '<button class="btn" onclick="p60SellSharePrompt()">Sell your share to family</button>';
  }

  /* Buy sibling shares if parents are dead and siblings own shares */
  const siblingShares = p60SiblingShares();
  if (siblingShares.length > 0) {
    html += '<h4 style="margin-top:14px;font-size:.9rem">Buy shares from siblings</h4>';
    siblingShares.forEach(function (s) {
      const shareValue = Math.round(valueEGP * s.share);
      html += '<div class="row"><span>' + s.member.name + ' · ' + (s.share * 100).toFixed(0) + '%</span><b class="mono">' + shareValue.toLocaleString() + ' EGP</b></div>' +
        '<button class="btn" onclick="p60BuySiblingShare(\'' + s.member.id + '\')">Buy ' + s.member.name + '\'s share</button>';
    });
  }

  html += '</section>';
  return html;
}

/* ============ 4. MAID / RENOVATION ACTIONS ============ */
function p60HireMaid(id) {
  p60Init(S);
  const opts = { cleaner: 3500, maid: 8000 };
  const egp = p60EGP(opts[id]);
  if (!egp) return hint('Invalid option.');
  const internal = egp / p60Rate();
  if (S.wealth < internal) return hint('You need ' + egp.toLocaleString() + ' EGP for the first month.');
  S.wealth -= internal;
  S.p60.homeMaid = id;
  S.p60.homeMaidCost = egp;
  /* Boost parents' happiness and bond */
  (S.family || []).filter(function (m) { return m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); })
    .forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 5); });
  fx({ happiness: 2 });
  log('🏠 Hired a ' + (id === 'cleaner' ? 'weekly cleaner' : 'full-time helper') + ' for your parents\' home (' + egp.toLocaleString() + ' EGP/month).');
  hint();
  render();
}
window.p60HireMaid = p60HireMaid;

function p60CancelMaid() {
  p60Init(S);
  if (!S.p60.homeMaid) return hint('No maid employed.');
  const label = S.p60.homeMaid === 'cleaner' ? 'weekly cleaner' : 'full-time helper';
  S.p60.homeMaid = null;
  S.p60.homeMaidCost = 0;
  log('Cancelled the ' + label + ' for your parents\' home.');
  hint();
  render();
}
window.p60CancelMaid = p60CancelMaid;

function p60RenovateParentsHome(id) {
  p60Init(S);
  const h = S.p60.parentsHome;
  if (!h) return hint('No parents\' home.');
  const options = {
    paint:   { label: 'Repaint & refresh',      egp: 15000, cond: 8,  value: 0.03 },
    kitchen: { label: 'Modernise kitchen',      egp: 45000, cond: 12, value: 0.06 },
    bath:    { label: 'Renovate bathroom',      egp: 38000, cond: 10, value: 0.05 },
    floors:  { label: 'Replace floors',         egp: 55000, cond: 14, value: 0.07 },
    ac:      { label: 'Install split AC units', egp: 60000, cond: 6,  value: 0.04 }
  };
  const opt = options[id];
  if (!opt) return hint('Invalid renovation.');
  const egp = p60EGP(opt.egp);
  const internal = egp / p60Rate();
  if (S.wealth < internal) return hint('You need ' + egp.toLocaleString() + ' EGP.');
  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.homeRenovations = (S.bill.homeRenovations || 0) + internal;
  h.condition = Math.min(100, (h.condition || 0) + opt.cond);
  h.value = Math.round(h.value * (1 + opt.value));
  h.renovations = h.renovations || [];
  h.renovations.push(opt.label);
  (S.family || []).filter(function (m) { return m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); })
    .forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 6); });
  fx({ happiness: 3 });
  log('🏠 Renovated your parents\' home: ' + opt.label + ' (' + egp.toLocaleString() + ' EGP).');
  hint();
  render();
}
window.p60RenovateParentsHome = p60RenovateParentsHome;

/* ============ 5. HEIRS & SHARES ============ */
function p60LivingHeirs() {
  if (!S) return [];
  const heirs = [];
  /* Children (including the player) */
  (S.family || []).forEach(function (m) {
    if (!m || m.alive === false) return;
    if (m.role === 'Sibling') heirs.push(m);
    if (m.role === 'Child' && m.age >= 18) heirs.push(m);
  });
  /* Player counts as an heir */
  heirs.push({ id: 'player', name: 'You', role: 'Player' });
  return heirs;
}

function p60SiblingShares() {
  if (!S || !S.p60 || !S.p60.parentsHome) return [];
  const shares = [];
  (S.family || []).forEach(function (m) {
    if (!m || m.alive === false) return;
    if (m.role !== 'Sibling') return;
    if (typeof m.inheritedHomeShare === 'number' && m.inheritedHomeShare > 0) {
      shares.push({ member: m, share: m.inheritedHomeShare });
    }
  });
  return shares;
}

function p60PlayerOwnedShareOfHome() {
  p60Init(S);
  return Math.max(0, Math.min(1, Number(S.p60.playerHomeShare) || 0));
}

/* ============ 6. PARENT MORTALITY ============ */
function p60ParentMortalityRoll() {
  if (!S || S.age < 5) return;
  p60Init(S);

  /* Roll each living parent */
  const parents = (S.family || []).filter(function (m) {
    return m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father');
  });
  parents.forEach(function (p) {
    const age = Number(p.age) || 0;
    let chance = 0;
    if (age < 40) chance = 0.0015;
    else if (age < 55) chance = 0.004;
    else if (age < 65) chance = 0.012;
    else if (age < 75) chance = 0.030;
    else if (age < 85) chance = 0.075;
    else if (age < 95) chance = 0.160;
    else chance = 0.320;

    /* Recession/health modifiers */
    if (S.econ === 'recession') chance *= 1.15;
    if ((p.bond || 0) < 20) chance *= 0.95;   /* estranged, less contact, same biology */
    /* Player living with them keeps them "visible" but doesn't change biology */

    if (Math.random() < chance) {
      /* Determine cause */
      let cause;
      const roll = Math.random();
      if (age < 55) cause = roll < 0.5 ? 'illness' : 'accident';
      else if (age < 75) cause = roll < 0.6 ? 'illness' : 'a sudden heart attack';
      else cause = roll < 0.5 ? 'old age' : 'illness';

      p60HandleParentDeath(p, cause);
    }
  });
}

function p60HandleParentDeath(parent, cause) {
  parent.alive = false;
  parent.deathYear = gameYear();
  parent.deathCause = cause;

  /* Log visibly */
  log('🕊️ Your ' + (parent.role === 'Mother' ? 'mother' : 'father') + ' ' + parent.name +
    ' has passed away (' + cause + '). You will need to handle the estate.');

  /* Determine estate */
  const cash = Math.max(0, Number(parent.netWorth) || Number(parent.estateInternal) || 0);
  const h = S.p60.parentsHome;
  const homeIncluded = h && h.ownsHome &&
    (h.owner === 'both' || h.owner === (parent.role === 'Mother' ? 'mother' : 'father'));
  const homeValueHalf = homeIncluded ? (Number(h.value) || 0) * (h.owner === 'both' ? 0.5 : 1) : 0;
  const totalEstateInternal = cash + homeValueHalf;

  /* Apply simplified Egyptian share rules:
     - If a spouse survives: spouse gets 1/8 of cash (if children exist)
     - Remaining cash divided equally among children
     - Home: if spouse survives, spouse keeps the home; else home becomes joint property of children */
  const otherParent = (S.family || []).find(function (m) {
    return m && m.alive !== false && m !== parent && (m.role === 'Mother' || m.role === 'Father');
  });
  const children = p60LivingHeirs();

  let spouseCashShare = 0;
  let childrenCashShare = 0;
  if (otherParent && children.length > 0) {
    spouseCashShare = cash * 0.125;
    childrenCashShare = cash - spouseCashShare;
  } else if (otherParent) {
    spouseCashShare = cash * 0.5;
    childrenCashShare = cash - spouseCashShare;
  } else {
    childrenCashShare = cash;
  }

  const perChildCash = children.length > 0 ? childrenCashShare / children.length : 0;

  /* Home share distribution */
  let homeShare = homeIncluded ? (h.owner === 'both' ? 0.5 : 1) : 0;
  if (homeShare > 0) {
    if (otherParent) {
      /* Surviving spouse keeps everything */
    } else {
      /* Split among children */
      const perChild = homeShare / children.length;
      children.forEach(function (c) {
        if (c.id === 'player') {
          S.p60.playerHomeShare = (S.p60.playerHomeShare || 0) + perChild;
        } else {
          const m = (S.family || []).find(function (x) { return x.id === c.id; });
          if (m) m.inheritedHomeShare = (m.inheritedHomeShare || 0) + perChild;
        }
      });
    }
  }

  /* Apply cash */
  const playerCash = perChildCash;
  if (playerCash > 0.01) {
    S.wealth += playerCash;
    S.income = (S.income || 0) + playerCash;
  }
  if (otherParent && spouseCashShare > 0.01) {
    otherParent.netWorth = (Number(otherParent.netWorth) || 0) + spouseCashShare;
    otherParent.estateInternal = otherParent.netWorth;
  }

  /* Record inheritance history */
  S.p60.inheritances.push({
    year: gameYear(),
    from: parent.name,
    role: parent.role,
    cashInternal: playerCash,
    homeShareAdded: homeIncluded && !otherParent ? (homeShare / children.length) : 0,
    cause: cause
  });

  /* Queue popup */
  S.p60.pendingDeath.push({
    parentId: parent.id,
    parentName: parent.name,
    parentRole: parent.role,
    cause: cause,
    playerCashInternal: playerCash,
    siblingCount: children.length - 1,
    spouseSurvives: !!otherParent
  });

  /* If player was living with parents and no other parent remains, arrange housing */
  if (S.housing === 'parents' && !otherParent) {
    /* Player inherited a share of the home (S.p60.playerHomeShare) — remain for now */
    log('You inherited a share of your parents\' home. You can continue living there or sell your share.');
  }
}

/* ============ 7. DEATH POPUP HANDLER ============ */
function p60ShowPendingDeathPopup() {
  if (!S || !S.p60 || !S.p60.pendingDeath || !S.p60.pendingDeath.length) return;
  const d = S.p60.pendingDeath[0];
  const rate = p60Rate();
  const cashEGP = Math.round(d.playerCashInternal * rate);

  let msg = 'Your ' + (d.parentRole === 'Mother' ? 'mother' : 'father') + ' ' + d.parentName +
    ' passed away from ' + d.cause + '.\n\n';

  if (cashEGP > 0) {
    msg += '💵 Your share of the cash estate: ' + cashEGP.toLocaleString() + ' EGP.\n';
  } else {
    msg += 'No cash was left after debts and expenses.\n';
  }

  if (S.p60.playerHomeShare > 0) {
    msg += '\n🏠 You also inherited a ' + (S.p60.playerHomeShare * 100).toFixed(0) + '% share of the family home.\n';
  }

  if (d.siblingCount > 0 && !d.spouseSurvives) {
    msg += '\nYour ' + d.siblingCount + ' sibling(s) each received an equal share. You can buy their shares or sell yours in the Real Estate tab.';
  } else if (d.spouseSurvives) {
    msg += '\nYour surviving parent keeps the family home.';
  }

  setTimeout(function () {
    if (typeof p24Popup === 'function') {
      p24Popup('🕊️ ' + d.parentName + ' has passed away', msg);
    }
    /* Remove this pending popup */
    S.p60.pendingDeath.shift();
    /* Show next if any */
    if (S.p60.pendingDeath.length > 0) {
      setTimeout(p60ShowPendingDeathPopup, 1200);
    }
    render();
  }, 500);
}

/* ============ 8. SHARE TRADING ============ */
function p60BuySiblingShare(memberId) {
  p60Init(S);
  const h = S.p60.parentsHome;
  if (!h) return hint('No parents home.');
  const m = (S.family || []).find(function (x) { return x.id === memberId; });
  if (!m || typeof m.inheritedHomeShare !== 'number' || m.inheritedHomeShare <= 0) return hint('That sibling has no share to sell.');
  const rate = p60Rate();
  const share = m.inheritedHomeShare;
  const price = Math.round((Number(h.value) || 0) * share * 1.05);   /* 5% premium over market */
  if (S.wealth < price) return hint('You need ' + Math.round(price * rate).toLocaleString() + ' EGP to buy this share.');

  /* Sibling may refuse based on bond */
  const agreeChance = 0.35 + Math.max(0, (m.bond || 50) - 40) / 200;
  if (Math.random() > agreeChance) {
    m.bond = Math.max(0, (m.bond || 50) - 3);
    log('❌ ' + m.name + ' refused to sell their share of the family home.');
    hint();
    render();
    return;
  }

  if (!confirm('Buy ' + m.name + '\'s share (' + (share * 100).toFixed(0) + '%) for ' + Math.round(price * rate).toLocaleString() + ' EGP?')) return;

  S.wealth -= price;
  S.p60.playerHomeShare = (S.p60.playerHomeShare || 0) + share;
  m.inheritedHomeShare = 0;
  m.bond = Math.min(100, (m.bond || 50) + 5);
  log('🏠 Bought ' + (share * 100).toFixed(0) + '% of the family home from ' + m.name + '. You now own ' + (S.p60.playerHomeShare * 100).toFixed(0) + '%.');
  hint();
  render();
}
window.p60BuySiblingShare = p60BuySiblingShare;

function p60SellSharePrompt() {
  p60Init(S);
  const h = S.p60.parentsHome;
  if (!h) return;
  const playerShare = S.p60.playerHomeShare || 0;
  if (playerShare <= 0) return hint('You do not own a share of the family home.');

  const siblingShares = p60SiblingShares();
  const otherParent = (S.family || []).find(function (m) {
    return m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father');
  });

  const rate = p60Rate();
  const shareValue = Math.round((Number(h.value) || 0) * playerShare * 0.95);   /* 5% discount to family */

  let buyerName = '';
  let buyer = null;
  if (siblingShares.length > 0) {
    buyer = siblingShares[0].member;
    buyerName = buyer.name;
  } else if (otherParent) {
    buyer = otherParent;
    buyerName = otherParent.name;
  } else {
    return hint('Nobody in the family can buy your share right now.');
  }

  if (!confirm('Sell your ' + (playerShare * 100).toFixed(0) + '% share to ' + buyerName + ' for ' + Math.round(shareValue * rate).toLocaleString() + ' EGP?')) return;

  S.wealth += shareValue;
  if (buyer.role === 'Sibling') {
    buyer.inheritedHomeShare = (buyer.inheritedHomeShare || 0) + playerShare;
  } else {
    /* Parent: absorb share */
    buyer.netWorth = (Number(buyer.netWorth) || 0) + shareValue;
  }
  S.p60.playerHomeShare = 0;
  log('🏠 Sold your share of the family home to ' + buyerName + ' for ' + Math.round(shareValue * rate).toLocaleString() + ' EGP.');
  hint();
  render();
}
window.p60SellSharePrompt = p60SellSharePrompt;

/* ============ 9. MORTGAGE RECALCULATION AFTER EARLY PAYMENT ============ */
/* Store the original balance when a mortgage is first recorded, so we can
   recalculate annual payment proportionally */
const P60_p59CustomBefore = (typeof p59PayMortgageCustom === 'function') ? p59PayMortgageCustom : null;
if (P60_p59CustomBefore) {
  p59PayMortgageCustom = function (homeId) {
    const home = (S.ownedHomes || []).find(function (h) { return h.id === homeId; });
    if (!home) return P60_p59CustomBefore(homeId);
    const oldBalance = Number(home.balance) || 0;
    const oldPay = Number(home.pay) || 0;
    const result = P60_p59CustomBefore(homeId);
    const newBalance = Number(home.balance) || 0;
    if (oldPay > 0 && oldBalance > 0 && newBalance < oldBalance && newBalance > 0) {
      /* Reduce the annual payment proportionally to the balance reduction */
      const reduction = newBalance / oldBalance;
      const newPay = Math.max(1000, Math.round(oldPay * reduction));
      home.pay = newPay;
      log('🏠 Mortgage annual payment recalculated: ' + Math.round(oldPay * p60Rate()).toLocaleString() +
        ' → ' + Math.round(newPay * p60Rate()).toLocaleString() + ' EGP/yr.');
    }
    return result;
  };
}

const P60_p59FullBefore = (typeof p59PayMortgageFull === 'function') ? p59PayMortgageFull : null;
if (P60_p59FullBefore) {
  p59PayMortgageFull = function (homeId) {
    const home = (S.ownedHomes || []).find(function (h) { return h.id === homeId; });
    if (home) home.pay = 0;
    return P60_p59FullBefore(homeId);
  };
}

/* ============ 10. VIEW INTEGRATION ============ */
const P60_viewAssetsBefore = viewAssets;
viewAssets = function () {
  let html = P60_viewAssetsBefore();
  if (!S) return html;
  /* Inject parents home panel near the top if player lives with parents */
  if (S.housing === 'parents') {
    const panel = p60ParentsHomePanel();
    if (panel) {
      /* Remove any existing instance */
      html = html.replace(/<section class="card"><h3>🏠 Your parents' home<\/h3>[\s\S]*?<\/section>/, '');
      /* Insert after the top banner */
      const bannerEnd = html.indexOf('</section>');
      if (bannerEnd !== -1) {
        return html.slice(0, bannerEnd + 10) + panel + html.slice(bannerEnd + 10);
      }
      return panel + html;
    }
  }
  return html;
};

/* ============ 11. HOOKS ============ */
/* Yearly mortality roll — safe to run before/after other systems */
const P60_ageUpBeforeMortality = ageUp;
ageUp = function () {
  const ageBefore = S && S.age;
  P60_ageUpBeforeMortality.apply(this, arguments);
  if (!S) return;
  if (S.age === ageBefore) return;

  try {
    p60ParentMortalityRoll();
    /* Handle inherited home when player lives with parents */
    if (S.p60.playerHomeShare >= 0.999) {
      /* Player owns 100% of the family home — can now be treated as a home */
    }
  } catch (err) {
    console.error('Parent mortality roll failed:', err);
  }

  /* Monthly maids / weekly costs run in monthly mode */
  if (S.pacing === 'monthly' && S.p60 && S.p60.homeMaid) {
    /* Monthly cost handled by p60MonthlyHousehold */ 
  }
};

/* Monthly maintenance cost for parents' home */
const P60_p52MonthlyTickBefore = p52MonthlyTick;
p52MonthlyTick = function () {
  P60_p52MonthlyTickBefore.apply(this, arguments);
  if (!S || S.pacing !== 'monthly') return;
  p60Init(S);
  if (S.p60.homeMaid && S.p60.homeMaidCost > 0) {
    const internal = S.p60.homeMaidCost / p60Rate();
    if (S.wealth >= internal) {
      S.wealth -= internal;
      S.expenses = (S.expenses || 0) + internal;
      if (!S.bill) S.bill = {};
      S.bill.homeMaid = (S.bill.homeMaid || 0) + internal;
    }
  }
};

/* Yearly version */
const P60_p10YearBeforeMaid = (typeof p10Year === 'function') ? p10Year : null;
if (P60_p10YearBeforeMaid) {
  p10Year = function () {
    const r = P60_p10YearBeforeMaid.apply(this, arguments);
    if (!S || S.pacing === 'monthly') return r;
    p60Init(S);
    if (S.p60.homeMaid && S.p60.homeMaidCost > 0) {
      const annual = S.p60.homeMaidCost * 12;
      const internal = annual / p60Rate();
      if (S.wealth >= internal) {
        S.wealth -= internal;
        S.expenses = (S.expenses || 0) + internal;
        if (!S.bill) S.bill = {};
        S.bill.homeMaid = (S.bill.homeMaid || 0) + internal;
        log('🏠 Paid ' + annual.toLocaleString() + ' EGP for household help at your parents\' home.');
      }
    }
    return r;
  };
}

/* Show death popups after every render */
const P60_renderBeforeDeathPopup = render;
render = function () {
  const r = P60_renderBeforeDeathPopup.apply(this, arguments);
  if (S && S.p60 && S.p60.pendingDeath && S.p60.pendingDeath.length > 0 && !document.getElementById('p24-feedback-modal')) {
    setTimeout(p60ShowPendingDeathPopup, 300);
  }
  return r;
};

/* Init on load */
p60Init(S);
if (S && !S.p60.parentsHome) {
  p60GenerateParentsHome();
  save();
}
