/* ============================================================
   FAMILY DEPTH SYSTEM — Wants, Drama, Estrangement
   ============================================================
   Adds:
   - Wants Ticker (spouse/children/parents/siblings ask for things)
   - Feel-left-behind self-want
   - Cut ties (estrangement) + reunion
   - Family refusal to let you move out (woman path)
   - Year tick logic + signal integration
   ============================================================ */

/* ---------- STATE ---------- */
function ensureFamilyDepthState() {
  if (!S) return;
  if (!Array.isArray(S.familyWants)) S.familyWants = [];
  if (typeof S.familyDepthLastRoll === 'undefined') S.familyDepthLastRoll = 0;
  if (typeof S.selfWant === 'undefined') S.selfWant = null;
  if (typeof S.estrangementHistory === 'undefined') S.estrangementHistory = [];
}
GameHooks.on('newGame', ensureFamilyDepthState);
GameHooks.on('migrate', ensureFamilyDepthState);

/* ---------- WANT TEMPLATES ---------- */
const WANT_TEMPLATES = {
  spouse: [
    { id: 'gift_phone',   label: 'a new phone',                  costEGP: 30000,  bondFulfill: 10, bondIgnore: -4, weight: 6,  bias: ['extravagant','jealous','materialistic'] },
    { id: 'gift_jewelry', label: 'some jewelry',                 costEGP: 50000,  bondFulfill: 12, bondIgnore: -5, weight: 4,  bias: ['romantic','extravagant'] },
    { id: 'date_night',   label: 'a romantic date night',        costEGP: 2500,   bondFulfill: 8,  bondIgnore: -6, weight: 12, bias: ['romantic'] },
    { id: 'trip_weekend', label: 'a weekend away together',      costEGP: 12000,  bondFulfill: 15, bondIgnore: -6, weight: 5,  bias: ['adventurous'] },
    { id: 'spend_time',   label: 'more quality time together',   costEGP: 0,      bondFulfill: 6,  bondIgnore: -8, weight: 10, bias: ['supportive','homebody'] },
    { id: 'help_chores',  label: 'help around the house',        costEGP: 0,      bondFulfill: 5,  bondIgnore: -5, weight: 8,  bias: [] },
    { id: 'listen_vent',  label: 'you to just listen',           costEGP: 0,      bondFulfill: 7,  bondIgnore: -6, weight: 8,  bias: ['insecure','moody'] },
    { id: 'gift_car',     label: 'a new car',                    costEGP: 400000, bondFulfill: 25, bondIgnore: -10, weight: 1, bias: ['extravagant','jealous'] },
    { id: 'help_rent',    label: 'help paying the rent',         costEGP: 20000,  bondFulfill: 10, bondIgnore: -6, weight: 4, bias: [] }
  ],
  child: [
    { id: 'toy',          label: 'a new toy',                    costEGP: 800,    bondFulfill: 5,  bondIgnore: -3, weight: 15, ageMax: 12 },
    { id: 'phone',        label: 'a smartphone',                 costEGP: 25000,  bondFulfill: 10, bondIgnore: -6, weight: 8,  ageMin: 11 },
    { id: 'clothes',      label: 'new clothes',                  costEGP: 2000,   bondFulfill: 4,  bondIgnore: -2, weight: 10, bias: [] },
    { id: 'game',         label: 'a new video game',             costEGP: 3000,   bondFulfill: 6,  bondIgnore: -3, weight: 10, ageMin: 8 },
    { id: 'pet',          label: 'a pet',                        costEGP: 5000,   bondFulfill: 12, bondIgnore: -5, weight: 4,  ageMin: 6, ageMax: 16 },
    { id: 'sports_club',  label: 'sports club enrollment',       costEGP: 15000,  bondFulfill: 8,  bondIgnore: -4, weight: 6,  ageMin: 6 },
    { id: 'attention',    label: 'more attention from you',      costEGP: 0,      bondFulfill: 6,  bondIgnore: -6, weight: 10 },
    { id: 'car',          label: 'a car',                        costEGP: 250000, bondFulfill: 20, bondIgnore: -8, weight: 2,  ageMin: 18 }
  ],
  parent: [
    { id: 'visit',        label: 'a visit from you',             costEGP: 0,      bondFulfill: 8,  bondIgnore: -6, weight: 15 },
    { id: 'call',         label: 'a phone call',                 costEGP: 0,      bondFulfill: 5,  bondIgnore: -3, weight: 20 },
    { id: 'money_small',  label: 'some financial help',          costEGP: 10000,  bondFulfill: 10, bondIgnore: -5, weight: 8 },
    { id: 'medical',      label: 'help with medical bills',      costEGP: 25000,  bondFulfill: 15, bondIgnore: -8, weight: 4 },
    { id: 'gift',         label: 'a thoughtful gift',            costEGP: 3000,   bondFulfill: 6,  bondIgnore: -2, weight: 5 }
  ],
  sibling: [
    { id: 'money_small',  label: 'financial help',               costEGP: 8000,   bondFulfill: 10, bondIgnore: -5, weight: 10 },
    { id: 'wedding_help', label: 'help with wedding costs',      costEGP: 40000,  bondFulfill: 20, bondIgnore: -8, weight: 3 },
    { id: 'gift',         label: 'a gift',                       costEGP: 2000,   bondFulfill: 6,  bondIgnore: -2, weight: 8 },
    { id: 'visit',        label: 'you to visit',                 costEGP: 0,      bondFulfill: 8,  bondIgnore: -4, weight: 12 },
    { id: 'tutoring',     label: 'help with studies',            costEGP: 15000,  bondFulfill: 12, bondIgnore: -4, weight: 4,  ageMax: 22 }
  ]
};

/* ---------- SELF-WANT TEMPLATES (feel-left-behind) ---------- */
const SELF_WANT_TEMPLATES = [
  { id: 'buy_phone',   label: 'a new phone — yours is embarrassing',      costEGP: 30000,  happyFulfill: 12, happyIgnore: -6 },
  { id: 'buy_car',     label: 'a car — commuting is exhausting',           costEGP: 250000, happyFulfill: 20, happyIgnore: -10 },
  { id: 'buy_clothes', label: 'nicer clothes — you feel frumpy',           costEGP: 8000,   happyFulfill: 6,  happyIgnore: -3 },
  { id: 'vacation',    label: 'a real vacation — you need a break',        costEGP: 20000,  happyFulfill: 15, happyIgnore: -8 }
];

/* ---------- HELPERS ---------- */
function _fdRate() { return (C().rate || 1) / 52.7; }

function _fdAllRelations() {
  if (!S) return [];
  const list = [];
  if (S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    list.push({ obj: S.marriage.partner, kind: 'spouse', name: S.marriage.partner.name });
  }
  (S.childrenList || []).forEach(function(c) {
    if (!c.movedOut) list.push({ obj: c, kind: 'child', name: c.name });
  });
  (S.family || []).forEach(function(m) {
    if (m.alive === false || m.estranged) return;
    if (m.role === 'Mother' || m.role === 'Father') list.push({ obj: m, kind: 'parent', name: m.name });
    else if (m.isSibling) list.push({ obj: m, kind: 'sibling', name: m.name });
  });
  return list;
}

function _fdPickTraitBias(templates, traits) {
  const weighted = [];
  templates.forEach(function(t) {
    let w = t.weight || 1;
    if (t.bias && t.bias.length) {
      const matches = t.bias.filter(function(b) { return traits.indexOf(b) >= 0; }).length;
      if (matches > 0) w *= 3;
    }
    weighted.push({ tpl: t, w: w });
  });
  const total = weighted.reduce(function(s, x) { return s + x.w; }, 0);
  let roll = Math.random() * total;
  for (const w of weighted) {
    roll -= w.w;
    if (roll <= 0) return w.tpl;
  }
  return weighted[0].tpl;
}

function _fdRollWantFor(relation) {
  const pool = WANT_TEMPLATES[relation.kind];
  if (!pool) return null;
   const eligible = pool.filter(function(t) {
    if (t.ageMin && (relation.obj.age || 0) < t.ageMin) return false;
    if (t.ageMax && (relation.obj.age || 999) > t.ageMax) return false;
    // NEW: If player is young and broke, siblings shouldn't ask for huge gifts
    if (S.age < 25 && t.costEGP > 5000) return false;
    if (S.wealth < t.costEGP && t.costEGP > 20000) return false;
    return true;
  });
  if (!eligible.length) return null;
  const traits = relation.obj.traits || (relation.obj.trait ? [relation.obj.trait] : []);
  const tpl = _fdPickTraitBias(eligible, traits);
  return {
    id: 'w_' + Math.random().toString(36).slice(2, 8),
    relationId: relation.obj.id || relation.name,
    relationName: relation.name,
    relationKind: relation.kind,
    templateId: tpl.id,
    label: tpl.label,
    costEGP: tpl.costEGP,
    bondFulfill: tpl.bondFulfill,
    bondIgnore: tpl.bondIgnore,
    createdYear: gameYear(),
    createdAbsMonth: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1),
    expiresYear: gameYear() + 2,
    expiresAbsMonth: (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1) + 24,
    status: 'active'
  };
}

/* ---------- ACTIONS ---------- */
window.familyFulfillWant = function(wantId) {
  const want = S.familyWants.find(function(w) { return w.id === wantId; });
  if (!want || want.status !== 'active') return;
  const cost = Math.round(want.costEGP * _fdRate());
  if (S.wealth < cost) { log('❌ Need ' + money(cost) + ' to fulfill this.'); render(); return; }
  if (!confirm('Fulfill: ' + want.relationName + ' wants ' + want.label + '?\n\nCost: ' + money(cost) + '\nBond +' + want.bondFulfill + '\n\nProceed?')) return;

  S.wealth -= cost;
  want.status = 'fulfilled';

  /* Apply bond */
  const rel = _fdAllRelations().find(function(r) { return r.name === want.relationName; });
  if (rel && rel.obj) {
    if (typeof rel.obj.bond === 'number') rel.obj.bond = Math.min(100, rel.obj.bond + want.bondFulfill);
    if (typeof rel.obj.happiness === 'number') rel.obj.happiness = Math.min(100, rel.obj.happiness + Math.round(want.bondFulfill / 2));
  }
  fx({ happiness: 4 });
  log('💝 Fulfilled ' + want.relationName + "'s wish for " + want.label + '. Bond +' + want.bondFulfill + '.');
  emitSignal('wantFulfilled', { want: want });
  render();
};

window.familyIgnoreWant = function(wantId) {
  const want = S.familyWants.find(function(w) { return w.id === wantId; });
  if (!want || want.status !== 'active') return;
  if (!confirm('Ignore ' + want.relationName + "'s wish?\n\nBond " + want.bondIgnore)) return;

  want.status = 'ignored';
  const rel = _fdAllRelations().find(function(r) { return r.name === want.relationName; });
  if (rel && rel.obj) {
    if (typeof rel.obj.bond === 'number') rel.obj.bond = Math.max(0, rel.obj.bond + want.bondIgnore);
    if (typeof rel.obj.happiness === 'number') rel.obj.happiness = Math.max(0, rel.obj.happiness + Math.round(want.bondIgnore / 2));
  }
  log('😶 You ignored ' + want.relationName + "'s wish. Bond " + want.bondIgnore + '.');
  render();
};

window.familyFulfillSelfWant = function() {
  if (!S.selfWant) return;
  const cost = Math.round(S.selfWant.costEGP * _fdRate());
  if (S.wealth < cost) { log('❌ Need ' + money(cost) + '.'); render(); return; }
  if (!confirm('Buy: ' + S.selfWant.label + '?\n\nCost: ' + money(cost) + '\nHappiness +' + S.selfWant.happyFulfill)) return;
  S.wealth -= cost;
  fx({ happiness: S.selfWant.happyFulfill });
  log('🛍 Bought ' + S.selfWant.label + '. Happiness +' + S.selfWant.happyFulfill + '.');
  S.selfWant = null;
  render();
};

window.familyDismissSelfWant = function() {
  if (!S.selfWant) return;
  fx({ happiness: S.selfWant.happyIgnore });
  log('😔 You dismissed your own wish. Happiness ' + S.selfWant.happyIgnore + '.');
  S.selfWant = null;
  render();
};

/* ---------- CUT TIES / ESTRANGEMENT ---------- */
window.familyCutTies = function(memberId) {
  const m = (S.family || []).find(function(x) { return x.id === memberId; });
  if (!m) return;
  if (m.estranged) return;
  const roleLabel = m.role || 'family member';
  if (!confirm('Cut ties with ' + m.name + ' (' + roleLabel + ')?\n\nThis ends contact permanently. Can only be undone through years of effort.')) return;
  m.estranged = true;
  m.estrangedYear = gameYear();
  m.bond = 0;
  S.estrangementHistory.push({ memberId: m.id, memberName: m.name, cutYear: gameYear(), reason: 'voluntary' });
  log('💔 You cut ties with ' + m.name + '.');
  fx({ happiness: -5, social: -3 });
  emitSignal('cutTies', { member: m });
  render();
};

window.familyReunite = function(memberId) {
  const m = (S.family || []).find(function(x) { return x.id === memberId; });
  if (!m || !m.estranged) return;
  const yearsApart = gameYear() - (m.estrangedYear || gameYear());
  const costEGP = 5000 + yearsApart * 2000;
  const cost = Math.round(costEGP * _fdRate());
  if (S.wealth < cost) { log('❌ Need ' + money(cost) + ' to attempt reunion (travel, gifts, time).'); render(); return; }
  const chance = Math.min(0.75, 0.30 + yearsApart * 0.08);
  if (!confirm('Try to reunite with ' + m.name + '?\n\nCost: ' + money(cost) + '\nChance: ' + Math.round(chance * 100) + '%')) return;
  S.wealth -= cost;
  if (Math.random() < chance) {
    m.estranged = false;
    m.bond = 25 + Math.floor(Math.random() * 15);
    log('🤝 You reconnected with ' + m.name + '. It will take time to rebuild.');
    fx({ happiness: 6 });
    emitSignal('reunion', { member: m });
  } else {
    log('❌ ' + m.name + ' refused to see you. Try again next year.');
    fx({ happiness: -3 });
  }
  render();
};

/* ---------- MOVING-OUT REFUSAL ---------- */
/* A traditional family (esp. for a woman in Egypt-like countries) may refuse
   to let their child move out. Player must argue, cut ties, or wait. */
function _fdFamilyWillRefuseMoveOut() {
  if (!S || S.housing !== 'parents') return false;
  const traditionalCultures = ['egy', 'sau', 'ind'];
  const isTraditionalCountry = traditionalCultures.indexOf(S.country) >= 0;
  const isFemale = S.gender === 'f';
  /* Parents' traits drive refusal */
  const parents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && !m.estranged;
  });
  if (!parents.length) return false;
  let traditionalScore = 0;
  parents.forEach(function(p) {
    if (p.trait === 'traditional') traditionalScore += 2;
    if (p.trait === 'strict') traditionalScore += 1;
    if (p.trait === 'envious' || p.trait === 'grumpy') traditionalScore += 1;
    if (p.trait === 'openMinded' || p.trait === 'warm') traditionalScore -= 2;
  });
  const threshold = isTraditionalCountry ? (isFemale ? 3 : 2) : (isFemale ? 4 : 3);
  return traditionalScore >= threshold;
}

/* Wrap the rental function to check for family refusal */
const _origAssetsRentHome = window.assetsRentHome;
window.assetsRentHome = function(tierId) {
  if (S && S.housing === 'parents' && _fdFamilyWillRefuseMoveOut()) {
    _fdShowMoveOutRefusal(tierId);
    return;
  }
  return _origAssetsRentHome(tierId);
};

function _fdShowMoveOutRefusal(tierId) {
  const parents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && !m.estranged;
  });
  const parentNames = parents.map(function(p) { return p.name; }).join(' and ');
  S._fdPendingMoveOut = tierId;
  S._fdMoveOutRefusalOpen = true;
  render();
}

window.familyArgueMoveOut = function() {
  if (!S._fdPendingMoveOut) return;
  const parents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && !m.estranged;
  });
  const chance = 0.35;
  if (!confirm('Argue with your parents to allow moving out?\n\nChance: ' + Math.round(chance * 100) + '%\nBond -15 regardless.')) return;
  parents.forEach(function(p) {
    p.bond = Math.max(0, (p.bond || 70) - 15);
  });
  if (Math.random() < chance) {
    log('🗣 You convinced your parents. They are hurt but agreed.');
    fx({ happiness: -3 });
    const tier = S._fdPendingMoveOut;
    S._fdPendingMoveOut = null;
    S._fdMoveOutRefusalOpen = false;
    const origAssetsRentHome = _origAssetsRentHome;
    if (origAssetsRentHome) origAssetsRentHome(tier);
  } else {
    log('❌ Your parents refused. They said you are "not ready" and this is "not how we do things".');
    fx({ happiness: -8, social: -3 });
  }
  render();
};

window.familyCutTiesToMove = function() {
  if (!S._fdPendingMoveOut) return;
  const parents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && !m.estranged;
  });
  if (!confirm('Cut ties with your parents to move out independently?\n\nThis is permanent. Your family will not speak to you.')) return;
  parents.forEach(function(p) {
    p.estranged = true;
    p.estrangedYear = gameYear();
    p.bond = 0;
    S.estrangementHistory.push({ memberId: p.id, memberName: p.name, cutYear: gameYear(), reason: 'move_out' });
  });
  log('💔 You cut ties with your parents. You are free, but alone.');
  fx({ happiness: -15, social: -10 });
  const tier = S._fdPendingMoveOut;
  S._fdPendingMoveOut = null;
  S._fdMoveOutRefusalOpen = false;
  emitSignal('cutTies', { member: parents[0] });
  if (_origAssetsRentHome) _origAssetsRentHome(tier);
  render();
};

window.familyCancelMoveOut = function() {
  S._fdPendingMoveOut = null;
  S._fdMoveOutRefusalOpen = false;
  log('You decided to stay with your parents for now.');
  render();
};

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureFamilyDepthState();
  if (!S || S.age < 15) return;

  /* ============ ROLL WANTS ============ */
  const relations = _fdAllRelations();
  const activeWantRelationIds = S.familyWants
    .filter(function(w) { return w.status === 'active'; })
    .map(function(w) { return w.relationName; });

  relations.forEach(function(rel) {
    if (activeWantRelationIds.indexOf(rel.name) >= 0) return; /* already has a want */
    /* Vary chance by relationship closeness and trait */
    let chance = 0.30;
    const traitObj = rel.obj.trait ? (typeof FRIEND_TRAITS !== 'undefined' && FRIEND_TRAITS[rel.obj.trait]) || null : null;
    if (rel.kind === 'spouse') chance = 0.45;
    if (rel.kind === 'child') chance = 0.50;
    if (rel.kind === 'parent') chance = 0.25;
    if (rel.kind === 'sibling') chance = 0.30;
    if (Math.random() > chance) return;
    const want = _fdRollWantFor(rel);
    if (want) {
      S.familyWants.push(want);
      log('💭 ' + rel.name + ' wants ' + want.label + '.');
    }
  });

   /* ============ EXPIRE WANTS ============ */
  const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
  S.familyWants.forEach(function(w) {
    if (w.status !== 'active') return;
    /* Use abs month if present, else fall back to year comparison */
    const expired = w.expiresAbsMonth ? (currentAbs >= w.expiresAbsMonth) : (gameYear() > w.expiresYear);
    if (expired) {
      w.status = 'expired';
      const rel = _fdAllRelations().find(function(r) { return r.name === w.relationName; });
      if (rel && rel.obj && typeof rel.obj.bond === 'number') {
        rel.obj.bond = Math.max(0, rel.obj.bond + w.bondIgnore);
      }
      log('⌛ ' + w.relationName + "'s wish for " + w.label + " expired. They remember.");
      emitSignal('wantExpired', { want: w });
    }
  });
  /* Prune old wants */
  S.familyWants = S.familyWants.filter(function(w) {
    return w.status === 'active' || (gameYear() - w.createdYear) < 3;
  });

  /* ============ SELF-WANT (feel left behind) ============ */
  if (!S.selfWant && Math.random() < 0.15 && S.age >= 16) {
    /* Trigger more often when unhappy */
    const r = Math.random();
    if (S.happiness < 50 || r < 0.5) {
      const tpl = SELF_WANT_TEMPLATES[Math.floor(Math.random() * SELF_WANT_TEMPLATES.length)];
      S.selfWant = {
        label: tpl.label,
        costEGP: tpl.costEGP,
        happyFulfill: tpl.happyFulfill,
        happyIgnore: tpl.happyIgnore,
        setYear: gameYear(),
        expiresYear: gameYear() + 2
      };
      log('💭 You find yourself wanting ' + tpl.label + '.');
    }
  }
  if (S.selfWant && gameYear() > S.selfWant.expiresYear) {
    fx({ happiness: S.selfWant.happyIgnore });
    log('😔 You let go of the wish for ' + S.selfWant.label + '.');
    S.selfWant = null;
  }

  /* ============ ESTRANGEMENT DRIFT ============ */
  S.estrangementHistory.forEach(function(h) {
    if (gameYear() - h.cutYear >= 3) h.mature = true;
  });
});

/* ---------- SIGNAL LISTENERS ---------- */
onSignal('marriageStrain', function() {
  if (!S || !S.familyWants) return;
  /* Marriage strain may trigger a "spouse wants affection" want */
  const hasSpouseWant = S.familyWants.some(function(w) {
    return w.relationKind === 'spouse' && w.status === 'active';
  });
  if (!hasSpouseWant && S.marriage && S.marriage.partner && S.marriage.partner.alive !== false) {
    const want = {
      id: 'w_strain_' + Math.random().toString(36).slice(2, 8),
      relationId: S.marriage.partner.id || S.marriage.partner.name,
      relationName: S.marriage.partner.name,
      relationKind: 'spouse',
      templateId: 'spend_time',
      label: 'more quality time together — things feel distant',
      costEGP: 0,
      bondFulfill: 8,
      bondIgnore: -10,
      createdYear: gameYear(),
      expiresYear: gameYear() + 1,
      status: 'active'
    };
    S.familyWants.push(want);
    log('💭 ' + S.marriage.partner.name + ' wants more quality time — they feel distant.');
  }
});

onSignal('parentDied', function() {
  if (!S) return;
  /* Old wants from dead parent should expire */
  S.familyWants.forEach(function(w) {
    if (w.relationKind === 'parent' && w.status === 'active') {
      const rel = (S.family || []).find(function(m) { return m.name === w.relationName; });
      if (rel && rel.alive === false) w.status = 'expired';
    }
  });
});

/* ---------- RENDER SUPPORT ---------- */
window.familyDepthGetActiveWants = function() {
  if (!S || !Array.isArray(S.familyWants)) return [];
  return S.familyWants.filter(function(w) { return w.status === 'active'; });
};

window.familyDepthIsEstranged = function(memberId) {
  const m = (S.family || []).find(function(x) { return x.id === memberId; });
  return !!(m && m.estranged);
};

window.familyDepthRenderWantsPanel = function() {
  if (!S) return '';
  const active = familyDepthGetActiveWants();
  const self = S.selfWant;
  let html = '';

  if (self) {
    const cost = Math.round(self.costEGP * _fdRate());
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">💭 Your Own Wish</h3>' +
      '<div class="muted small" style="margin-top:4px">' + self.label + '</div>' +
      '<div class="row"><span>Cost</span><b class="mono">' + (cost > 0 ? money(cost) : 'Free') + '</b></div>' +
      '<div style="display:flex;gap:6px;margin-top:8px">' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;background:#34d399;color:#000;font-weight:700" onclick="familyFulfillSelfWant()">Fulfill</button>' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="familyDismissSelfWant()">Let it go</button>' +
      '</div></div>';
  }

  if (!active.length && !self) {
    return '<div class="card"><h3>💭 Wants</h3><p class="muted small">No outstanding wants right now.</p></div>';
  }

   active.forEach(function(w) {
    const cost = Math.round(w.costEGP * _fdRate());
    const currentAbs = (gameYear() - 2001) * 12 + (isMonthly() ? currentMonth() : 1);
    let expiringLabel;
    if (w.expiresAbsMonth && isMonthly()) {
      const monthsLeft = Math.max(0, w.expiresAbsMonth - currentAbs);
      expiringLabel = monthsLeft + ' month' + (monthsLeft !== 1 ? 's' : '');
    } else {
      const yearsLeft = Math.max(0, w.expiresYear - gameYear());
      expiringLabel = yearsLeft + 'y';
    }
    html += '<div class="card" style="padding:10px">' +
      '<div style="font-weight:700">' + w.relationName + ' <span class="muted small">(' + w.relationKind + ')</span></div>' +
      '<div class="muted small" style="margin-top:2px">Wants ' + w.label + '</div>' +
      '<div class="row" style="margin-top:4px"><span>Cost</span><b class="mono">' + (cost > 0 ? money(cost) : 'Free') + '</b></div>' +
      '<div class="muted small">Bond +' + w.bondFulfill + ' if fulfilled · ' + w.bondIgnore + ' if ignored · expires in ' + expiringLabel + '</div>' +      '<div style="display:flex;gap:6px;margin-top:8px">' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;background:' + (S.wealth >= cost ? '#34d399' : '#25253a') + ';color:' + (S.wealth >= cost ? '#000' : '#666') + ';font-weight:700" ' + (S.wealth >= cost ? '' : 'disabled') + ' onclick="familyFulfillWant(\'' + w.id + '\')">Fulfill</button>' +
      '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="familyIgnoreWant(\'' + w.id + '\')">Ignore</button>' +
      '</div></div>';
  });

  return html;
};

window.familyDepthRenderMoveOutRefusal = function() {
  if (!S._fdMoveOutRefusalOpen) return '';
  const parents = (S.family || []).filter(function(m) {
    return (m.role === 'Mother' || m.role === 'Father') && m.alive !== false && !m.estranged;
  });
  const names = parents.map(function(p) { return p.name; }).join(' and ');
  return '<div class="card" style="border-color:#fb7185;background:#fb718520"><h3 style="color:#fb7185">🚫 Your parents refuse</h3>' +
    '<p class="muted small" style="margin:6px 0">' + names + ' will not allow you to move out. They say you are "not ready" and this is "not how our family does things".</p>' +
    '<div style="display:flex;flex-direction:column;gap:6px;margin-top:8px">' +
    '<button class="opt" style="text-align:center;font-size:.78rem;background:#fbbf24;color:#000;font-weight:700" onclick="familyArgueMoveOut()">🗣 Argue with them (35% chance · bond −15)</button>' +
    '<button class="opt" style="text-align:center;font-size:.78rem;border-color:#fb7185;color:#fb7185" onclick="familyCutTiesToMove()">💔 Cut ties and leave anyway</button>' +
    '<button class="opt" style="text-align:center;font-size:.78rem" onclick="familyCancelMoveOut()">← Stay for now</button>' +
    '</div></div>';
};
/* Monthly expiry check for monthly pace */
GameHooks.on('month', function() {
  ensureFamilyDepthState();
  if (!S || !isMonthly()) return;
  const currentAbs = (gameYear() - 2001) * 12 + currentMonth();
  S.familyWants.forEach(function(w) {
    if (w.status !== 'active') return;
    if (!w.expiresAbsMonth) return;
    if (currentAbs >= w.expiresAbsMonth) {
      w.status = 'expired';
      const rel = _fdAllRelations().find(function(r) { return r.name === w.relationName; });
      if (rel && rel.obj && typeof rel.obj.bond === 'number') {
        rel.obj.bond = Math.max(0, rel.obj.bond + w.bondIgnore);
      }
      log('⌛ ' + w.relationName + "'s wish for " + w.label + " expired.");
      emitSignal('wantExpired', { want: w });
    }
  });
  /* Also expire self-want */
  if (S.selfWant && S.selfWant.expiresAbsMonth && currentAbs >= S.selfWant.expiresAbsMonth) {
    fx({ happiness: S.selfWant.happyIgnore });
    log('😔 You let go of the wish for ' + S.selfWant.label + '.');
    S.selfWant = null;
  }
});
console.log('[World Life] 29-family-depth.js loaded');
