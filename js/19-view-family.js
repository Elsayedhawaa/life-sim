/* ============================================================
   VIEW: FAMILY (v2 — replaces 13-view-family.js)
   ============================================================
   Parents aging, health, requests, death, inheritance.
   Siblings life stages, marriage, children, requests.
   Remittances, visits with flight classes, gifts.
   Share parent costs with siblings. Inherit home shares.

   Registers tab 'family' at order 3 (takes over old slot).
   IMPORTANT: 13-view-family.js must be REMOVED from index.html
   or this file's tab won't be shown (duplicate id).
   ============================================================ */

/* ---------- STATE MIGRATION ---------- */
function ensureFamilyState() {
  if (!S) return;
  if (!Array.isArray(S.family)) S.family = [];
  if (!S.homeCountry) S.homeCountry = S.country || 'egy';

  const tier = resolveFamilyTier(S.familyTier);
  const tierCfg = FAMILY_TIERS[tier] || FAMILY_TIERS.middle;

  S.family.forEach(function(m) {
    if (!m.id) m.id = 'fam_' + Math.random().toString(36).slice(2, 8);
    if (typeof m.health !== 'number') m.health = 100;
    if (typeof m.alive !== 'boolean') m.alive = true;
    if (typeof m.bond !== 'number') m.bond = 70;
    if (typeof m.age !== 'number') m.age = 30;
    if (typeof m.lastContactYear === 'undefined') m.lastContactYear = null;
    if (typeof m.deathYear === 'undefined') m.deathYear = null;
    const isParent = (m.role === 'Mother' || m.role === 'Father');
    if (typeof m.wealth !== 'number') m.wealth = isParent ? tierCfg.parentWealth : 0;
    if (typeof m.income !== 'number') m.income = isParent ? tierCfg.parentIncome : 0;
    if (typeof m.retirementRequested !== 'boolean') m.retirementRequested = false;
  });

  if (S.age <= 6 && !S.family.some(function(m) { return m.isSibling === true; })) {
    familyAddSiblings();
  }

  if (!Array.isArray(S.familyRequests)) S.familyRequests = [];
  if (!S.parentAllowances || typeof S.parentAllowances !== 'object') S.parentAllowances = {};
  if (typeof S.vacationDays !== 'number') S.vacationDays = 21;
  if (typeof S.vacationDaysUsedThisYear !== 'number') S.vacationDaysUsedThisYear = 0;
  if (typeof S.inheritedFamilyHome === 'undefined') S.inheritedFamilyHome = null;
  if (!Array.isArray(S.familyEventLog)) S.familyEventLog = [];
  if (typeof S.familyVisitPlan === 'undefined') S.familyVisitPlan = null;
}

function familyAddSiblings() {
  const count = Math.floor(Math.random() * 4);
  if (count === 0) return;
  const pool = SIBLING_NAMES[S.country] || SIBLING_NAMES.egy;
  const usedNames = new Set(S.family.map(function(m) { return m.name; }));
  for (let i = 0; i < count; i++) {
    const gender = Math.random() < 0.5 ? 'm' : 'f';
    const names = pool[gender].filter(function(n) { return !usedNames.has(n); });
    if (!names.length) continue;
    const name = names[Math.floor(Math.random() * names.length)];
    usedNames.add(name);
    const ageOffset = Math.floor(Math.random() * 14) - 5;
    const siblingAge = Math.max(1, S.age + ageOffset);
    S.family.push({
      id: 'sib_' + Math.random().toString(36).slice(2, 8),
      role: gender === 'm' ? 'Brother' : 'Sister',
      name: name, age: siblingAge,
      bond: 60 + Math.floor(Math.random() * 30),
      alive: true, health: 100, gender: gender, isSibling: true,
      lastContactYear: null, wealth: 0, income: 0, deathYear: null,
      lifeStage: siblingAge < 6 ? 'toddler' : siblingAge < 18 ? 'student' : siblingAge < 22 ? 'uni' : 'working',
      successLevel: 'middle', spouse: null, children: 0, justMarried: false
    });
  }
}

GameHooks.on('newGame', ensureFamilyState);
GameHooks.on('migrate', ensureFamilyState);

/* ---------- HELPERS ---------- */
function familyParents() { return (S.family || []).filter(function(m) { return m.role === 'Mother' || m.role === 'Father'; }); }
function familySiblings() { return (S.family || []).filter(function(m) { return m.isSibling === true && m.alive !== false; }); }
function familyLivingParents() { return familyParents().filter(function(m) { return m.alive !== false; }); }
function familyByRole(role) { return (S.family || []).find(function(m) { return m.role === role; }); }
function familyById(id) { return (S.family || []).find(function(m) { return m.id === id; }); }
function familyHealthColor(v) { return v > 70 ? '#34d399' : v > 40 ? '#fbbf24' : '#fb7185'; }
function familyBondColor(v) { return v > 70 ? '#34d399' : v > 40 ? '#fbbf24' : '#fb7185'; }
function familyPlayerAbroad() { return S.country && S.homeCountry && S.country !== S.homeCountry; }
function familyHomeCountry() { return S.homeCountry || S.country || 'egy'; }

function familyMarkContact(member) { if (member) member.lastContactYear = gameYear(); }
function familyAddBond(member, amount) {
  if (!member) return;
  member.bond = Math.max(0, Math.min(100, (member.bond || 0) + amount));
}
function familyLog(msg) {
  if (!Array.isArray(S.familyEventLog)) S.familyEventLog = [];
  S.familyEventLog.unshift({ year: gameYear(), age: S.age, msg: msg });
  S.familyEventLog = S.familyEventLog.slice(0, 50);
}

/* ---------- CONTACT ---------- */
function familyCall(memberId) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m || m.alive === false) return;
  familyMarkContact(m);
  familyAddBond(m, FAMILY_BOND_BONUSES.call);
  fx({ happiness: 2 });
  log('📞 You called your ' + m.role.toLowerCase() + ', ' + m.name + '.');
  familyLog('📞 Called ' + m.name);
  render();
}
function familyVisit(memberId) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m || m.alive === false) return;
  familyMarkContact(m);
  familyAddBond(m, FAMILY_BOND_BONUSES.visit);
  fx({ happiness: 4 });
  log('☕ You visited ' + m.name + '.');
  familyLog('☕ Visited ' + m.name);
  render();
}
function familyHelpMoney(memberId, amount) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m || m.alive === false) return;
  if (S.wealth < amount) { log('Not enough cash.'); render(); return; }
  S.wealth -= amount;
  m.wealth = (m.wealth || 0) + amount;
  familyMarkContact(m);
  familyAddBond(m, FAMILY_BOND_BONUSES.helpMoney);
  fx({ happiness: 3 });
  familyLog('💵 Helped ' + m.name + ' with ' + money(amount));
  log('💵 Helped ' + m.name + ' with ' + money(amount) + '.');
  render();
}
function familyHelpPrompt(memberId, defaultAmount) {
  const amount = Math.round(Number(prompt('How much to give?\n(You have ' + money(S.wealth) + ')', String(defaultAmount || 20000))));
  if (!amount || amount <= 0) return;
  familyHelpMoney(memberId, amount);
}
window.familyCall = familyCall;
window.familyVisit = familyVisit;
window.familyHelpMoney = familyHelpMoney;
window.familyHelpPrompt = familyHelpPrompt;

/* ---------- REQUESTS ---------- */
function familyPayRequest(requestId) {
  ensureFamilyState();
  const idx = S.familyRequests.findIndex(function(r) { return r.id === requestId; });
  if (idx < 0) return;
  const r = S.familyRequests[idx];
  const isMonthly = r.perMonth === true;
  const totalAmount = isMonthly ? r.amount * 12 : r.amount;
  if (S.wealth < totalAmount) { log('Not enough cash for ' + money(totalAmount) + '.'); render(); return; }
  S.wealth -= totalAmount;

  if (isMonthly) {
    S.parentAllowances[r.memberId] = (S.parentAllowances[r.memberId] || 0) + r.amount;
    familyLog('💵 Committed ' + money(r.amount) + '/mo to ' + r.memberName);
    log('💵 You committed ' + money(r.amount) + '/month to help ' + r.memberName + '.');
  } else {
    const m = familyById(r.memberId);
    if (m) m.wealth = (m.wealth || 0) + r.amount;
    familyLog('💵 Paid ' + money(r.amount) + ' to ' + r.memberName);
    log('💵 You paid ' + money(r.amount) + ' for ' + r.memberName + "'s " + r.kind + '.');
  }

  const m = familyById(r.memberId);
  if (m) { familyAddBond(m, FAMILY_BOND_BONUSES.helpMoney); familyMarkContact(m); }
  fx({ happiness: 3 });
  S.familyRequests.splice(idx, 1);
  render();
}

function familyDeclineRequest(requestId) {
  ensureFamilyState();
  const idx = S.familyRequests.findIndex(function(r) { return r.id === requestId; });
  if (idx < 0) return;
  const r = S.familyRequests[idx];
  const m = familyById(r.memberId);
  if (m) familyAddBond(m, -10);
  fx({ happiness: -2 });
  familyLog('❌ Declined ' + r.memberName + "'s request");
  log('❌ You declined ' + r.memberName + "'s request for " + money(r.amount) + '.');
  S.familyRequests.splice(idx, 1);
  render();
}

function familyShareRequest(requestId) {
  ensureFamilyState();
  const idx = S.familyRequests.findIndex(function(r) { return r.id === requestId; });
  if (idx < 0) return;
  const r = S.familyRequests[idx];
  const siblings = familySiblings();
  if (!siblings.length) { familyPayRequest(requestId); return; }

  const totalPeople = 1 + siblings.length;
  const isMonthly = r.perMonth === true;
  const totalAmount = isMonthly ? r.amount * 12 : r.amount;
  const myShare = Math.round(totalAmount / totalPeople);
  if (S.wealth < myShare) { log('Not enough cash for your share (' + money(myShare) + ').'); render(); return; }
  S.wealth -= myShare;

  const contributions = [{ name: S.name, paid: myShare }];
  siblings.forEach(function(sib) {
    const chance = SIBLING_CONTRIBUTE_CHANCE[sib.successLevel] || SIBLING_CONTRIBUTE_CHANCE.middle;
    if (Math.random() < chance) {
      const theirShare = Math.round(totalAmount / totalPeople);
      sib.wealth = Math.max(0, (sib.wealth || 0) - theirShare);
      contributions.push({ name: sib.name, paid: theirShare });
    } else {
      contributions.push({ name: sib.name, paid: 0 });
      familyAddBond(sib, -5);
    }
  });

  const paid = contributions.reduce(function(sum, c) { return sum + c.paid; }, 0);
  const summary = contributions.map(function(c) { return c.name + ': ' + money(c.paid); }).join(' · ');
  familyLog('💵 Shared ' + r.memberName + "'s request · " + summary);
  log('💵 Shared cost with siblings. ' + summary);

  if (isMonthly) {
    S.parentAllowances[r.memberId] = (S.parentAllowances[r.memberId] || 0) + Math.round(r.amount / totalPeople);
  } else {
    const m = familyById(r.memberId);
    if (m) m.wealth = (m.wealth || 0) + paid;
  }

  const m = familyById(r.memberId);
  if (m) { familyAddBond(m, FAMILY_BOND_BONUSES.shareHelp); familyMarkContact(m); }
  fx({ happiness: 2 });
  S.familyRequests.splice(idx, 1);
  render();
}

window.familyPayRequest = familyPayRequest;
window.familyDeclineRequest = familyDeclineRequest;
window.familyShareRequest = familyShareRequest;

/* ---------- ALLOWANCE ---------- */
function familySetAllowance(memberId) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m) return;
  const current = S.parentAllowances[memberId] || 0;
  const input = prompt('Set monthly allowance for ' + m.name + '?\n(Current: ' + money(current) + '/month)\n(Enter 0 to stop)', String(current));
  if (input === null) return;
  const amt = Math.max(0, Math.round(Number(input) || 0));
  if (amt === 0) delete S.parentAllowances[memberId];
  else S.parentAllowances[memberId] = amt;
  familyLog('💰 Allowance for ' + m.name + ' set to ' + money(amt) + '/mo');
  log('💰 Allowance for ' + m.name + ': ' + money(amt) + '/month.');
  render();
}
window.familySetAllowance = familySetAllowance;

/* ---------- REMITTANCE ---------- */
function familySendRemittance() {
  ensureFamilyState();
  const homeCountry = familyHomeCountry();
  const info = REMITTANCE_COSTS[homeCountry] || REMITTANCE_COSTS.egy;
  const amt = Math.round(Number(prompt(
    'Send one-time money home.\nSuggested: ' + money(info.minMonthly) + ' - ' + money(info.maxMonthly) + '\nYou have ' + money(S.wealth),
    String(info.minMonthly * 3)
  )));
  if (!amt || amt <= 0) return;
  if (S.wealth < amt) { log('Not enough cash.'); render(); return; }
  S.wealth -= amt;
  const parents = familyLivingParents();
  if (parents.length) {
    parents.forEach(function(p) {
      p.wealth = (p.wealth || 0) + Math.round(amt / parents.length);
      familyAddBond(p, 8);
      familyMarkContact(p);
    });
    familyLog('✈️ Sent ' + money(amt) + ' home');
    log('✈️ Sent ' + money(amt) + ' to family. Bond +8.');
  }
  fx({ happiness: 3 });
  render();
}

function familySendGift(memberId, giftId) {
  ensureFamilyState();
  const m = familyById(memberId);
  if (!m) return;
  const gift = GIFT_CATALOG.find(function(g) { return g.id === giftId; });
  if (!gift) { log('Unknown gift.'); render(); return; }
  const abroad = !!familyPlayerAbroad();
  const shipCost = abroad ? ((REMITTANCE_COSTS[familyHomeCountry()] || REMITTANCE_COSTS.egy).giftShip || 0) : 0;
  const total = gift.cost + shipCost;
  if (S.wealth < total) { log('Not enough cash for ' + money(total) + '.'); render(); return; }
  S.wealth -= total;
  familyAddBond(m, gift.bond);
  familyMarkContact(m);
  fx({ happiness: 2 });
  familyLog('🎁 Sent ' + gift.label + ' to ' + m.name);
  log('🎁 Sent ' + m.name + ' a ' + gift.label + ' for ' + money(total) + '. Bond +' + gift.bond + '.');
  render();
}

function familyOpenGiftPicker(memberId) {
  const options = GIFT_CATALOG.map(function(g) { return g.id + ' = ' + g.label + ' (' + money(g.cost) + ')'; }).join('\n');
  const choice = prompt('Which gift to send?\n\n' + options + '\n\nEnter gift id:', 'phone');
  if (!choice) return;
  familySendGift(memberId, choice.trim());
}

window.familySendRemittance = familySendRemittance;
window.familySendGift = familySendGift;
window.familyOpenGiftPicker = familyOpenGiftPicker;

/* ---------- VISIT PLANNER ---------- */
function familyOpenVisitPlanner() {
  if (!familyPlayerAbroad()) {
    const parents = familyLivingParents();
    if (parents.length) familyVisit(parents[0].id);
    return;
  }
  S.familyVisitPlan = { duration: 'medium', airClass: 'economy', hotel: 'family_home', gifts: 20000 };
  render();
}
function familyVisitSet(key, value) {
  if (!S.familyVisitPlan) return;
  S.familyVisitPlan[key] = value;
  render();
}
function familyVisitCancel() { S.familyVisitPlan = null; render(); }
function familyVisitConfirm() {
  const plan = S.familyVisitPlan;
  if (!plan) return;
  const homeCountry = familyHomeCountry();
  const costs = REMITTANCE_COSTS[homeCountry] || REMITTANCE_COSTS.egy;
  const airClass = VISIT_CLASSES.find(function(c) { return c.id === plan.airClass; }) || VISIT_CLASSES[0];
  const duration = VISIT_DURATIONS.find(function(d) { return d.id === plan.duration; }) || VISIT_DURATIONS[1];
  const hotel = VISIT_HOTELS.find(function(h) { return h.id === plan.hotel; }) || VISIT_HOTELS[0];

  const airCost = Math.round(costs.airfareEconomy * airClass.mult);
  const hotelCost = hotel.costPerNight * duration.days;
  const giftCost = plan.gifts || 0;
  const total = airCost + hotelCost + giftCost;

  if (S.vacationDaysUsedThisYear + duration.days > S.vacationDays) {
    log('❌ Manager refused: not enough vacation days left (' + (S.vacationDays - S.vacationDaysUsedThisYear) + ' of ' + S.vacationDays + ').');
    render(); return;
  }
  if (S.wealth < total) { log('❌ Need ' + money(total) + ' for this visit.'); render(); return; }

  S.wealth -= total;
  S.vacationDaysUsedThisYear += duration.days;

  familyLivingParents().forEach(function(p) { familyAddBond(p, FAMILY_BOND_BONUSES.holidayVisit); familyMarkContact(p); });
  familySiblings().forEach(function(sib) { familyAddBond(sib, FAMILY_BOND_BONUSES.visit); familyMarkContact(sib); });
  fx({ happiness: 8 });

  familyLog('✈️ Visited home (' + duration.days + 'd, ' + airClass.label + ')');
  log('✈️ You visited family in ' + homeCountry.toUpperCase() + ' for ' + duration.days + ' days. Cost: ' + money(total) + '. Bond +' + FAMILY_BOND_BONUSES.holidayVisit + '.');
  S.familyVisitPlan = null;
  render();
}
window.familyOpenVisitPlanner = familyOpenVisitPlanner;
window.familyVisitSet = familyVisitSet;
window.familyVisitCancel = familyVisitCancel;
window.familyVisitConfirm = familyVisitConfirm;

/* ---------- INHERITANCE HOME SHARES ---------- */
function familyBuySiblingShare(siblingId) {
  if (!S.inheritedFamilyHome) return;
  const share = S.inheritedFamilyHome.shares.find(function(s) { return s.siblingId === siblingId; });
  if (!share) return;
  const cost = Math.round(S.inheritedFamilyHome.value * share.pct);
  if (S.wealth < cost) { log('Need ' + money(cost) + ' to buy this share.'); render(); return; }
  S.wealth -= cost;
  const sib = familyById(siblingId);
  if (sib) sib.wealth = (sib.wealth || 0) + cost;
  S.inheritedFamilyHome.myPct += share.pct;
  S.inheritedFamilyHome.shares = S.inheritedFamilyHome.shares.filter(function(s) { return s.siblingId !== siblingId; });
  familyLog('🏠 Bought ' + (sib ? sib.name : 'sibling') + "'s home share");
  log('🏠 Bought ' + (sib ? sib.name : "sibling") + "'s share of the family home for " + money(cost) + '.');
  render();
}
function familySellMyHomeShare() {
  if (!S.inheritedFamilyHome) return;
  const myShareValue = Math.round(S.inheritedFamilyHome.value * S.inheritedFamilyHome.myPct);
  if (!confirm('Sell your share of the family home for ' + money(myShareValue) + '?')) return;
  S.wealth += myShareValue;
  familyLog('🏠 Sold your share of family home for ' + money(myShareValue));
  log('🏠 Sold your share of the family home: ' + money(myShareValue) + '.');
  S.inheritedFamilyHome = null;
  if (S.housing === 'parents') S.housing = 'rented';
  render();
}
window.familyBuySiblingShare = familyBuySiblingShare;
window.familySellMyHomeShare = familySellMyHomeShare;

/* ---------- MAIN VIEW ---------- */
function familyView() {
  ensureFamilyState();
  if (!S) return '';
  if (S.age < 6) return '<div class="card"><h3>Family</h3><p class="muted">Nothing to see yet.</p></div>';

  const livingParents = familyLivingParents();
  const deadParents = familyParents().filter(function(m) { return m.alive === false; });
  const siblings = familySiblings();
  const spouse = familyByRole('Spouse');
  const pendingReq = S.familyRequests || [];

  let html = '<div class="card" style="padding:12px;background:linear-gradient(180deg,#fb718515 0%,transparent 100%);border-color:#fb7185">' +
    '<div style="display:flex;justify-content:space-between;align-items:center">' +
    '<div><div class="muted small" style="letter-spacing:.06em;font-weight:700">FAMILY · ' + C().name.toUpperCase() + '</div>' +
    '<div style="font-weight:700;font-size:1.05rem;margin-top:2px">' + livingParents.length + ' parent(s) · ' + siblings.length + ' sibling(s)' + (spouse ? ' · married' : '') + '</div>' +
    (pendingReq.length ? '<div style="color:#fbbf24;font-weight:700;margin-top:4px">⚠️ ' + pendingReq.length + ' pending request(s)</div>' : '') +
    '</div><div style="font-size:2rem">👨‍👩‍👧</div></div></div>';

  if (pendingReq.length) {
    html += '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">Pending Requests</h3>';
    pendingReq.forEach(function(r) {
      const amt = r.perMonth ? (money(r.amount) + '/mo') : money(r.amount);
      const canShare = r.shareable && siblings.length > 0;
      html += '<div style="padding:10px 0;border-bottom:1px solid #1a1a2a">' +
        '<div style="font-size:.9rem;margin-bottom:6px">' + r.message + '</div>' +
        '<div class="muted small" style="margin-bottom:8px">Amount: <b style="color:#fbbf24">' + amt + '</b>' +
        (r.perMonth ? ' (' + money(r.amount * 12) + '/year)' : '') + '</div>' +
        '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;background:#34d399;color:#000;font-weight:700" onclick="familyPayRequest(\'' + r.id + '\')">Pay full</button>' +
        (canShare ? '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyShareRequest(\'' + r.id + '\')">Split with siblings</button>' : '') +
        '<button class="opt" style="flex:1;padding:6px;font-size:.72rem;border-color:#fb7185;color:#fb7185" onclick="familyDeclineRequest(\'' + r.id + '\')">Decline</button>' +
        '</div></div>';
    });
    html += '</div>';
  }

  if (S.familyVisitPlan) html += familyRenderVisitPlanner();

  if (livingParents.length) {
    html += '<div class="card"><h3>Parents</h3>';
    livingParents.forEach(function(p) { html += familyRenderParent(p); });
    html += '</div>';
  }

  if (siblings.length) {
    html += '<div class="card"><h3>Siblings</h3>';
    siblings.forEach(function(sib) { html += familyRenderSibling(sib); });
    html += '</div>';
  }

  if (familyPlayerAbroad() && livingParents.length) html += familyRenderRemittance();

  if (familyPlayerAbroad()) {
    html += '<div class="card">' +
      '<h3>✈️ Visit Family</h3>' +
      '<p class="muted small">You live in ' + C().name + '. Family in ' + familyHomeCountry().toUpperCase() + '.</p>' +
      '<div class="row"><span>Vacation days left</span><b>' + (S.vacationDays - S.vacationDaysUsedThisYear) + ' / ' + S.vacationDays + '</b></div>' +
      '<button class="opt" style="margin-top:8px;text-align:center;background:#8b5cf6;color:#fff;font-weight:700" onclick="familyOpenVisitPlanner()">Plan a visit</button>' +
      '</div>';
  }

  if (S.inheritedFamilyHome) html += familyRenderInheritance();

  if (spouse && spouse.alive !== false) {
    html += '<div class="card"><h3>Spouse</h3>' +
      '<div class="row"><span>' + spouse.name + '</span><span class="muted small">age ' + spouse.age + ' · bond ' + spouse.bond + '%</span></div>' +
      '<p class="muted small" style="margin-top:8px">Marriage details live in the future Marriage system.</p></div>';
  }

  if (deadParents.length) {
    html += '<div class="card" style="border-color:#666"><h3 style="color:#888">In Memoriam</h3>' +
      deadParents.map(function(m) {
        return '<div class="row"><span style="color:#888">' + m.name + ' (' + m.role + ')</span><span class="muted small">' + (m.deathYear || '?') + '</span></div>';
      }).join('') + '</div>';
  }

  const recent = (S.familyEventLog || []).slice(0, 15);
  if (recent.length) {
    html += '<div class="card"><h3>Recent Family Events</h3>' +
      recent.map(function(l) {
        return '<div style="padding:5px 0;border-bottom:1px solid #1a1a2a;font-size:.85rem"><span class="muted mono" style="font-size:.72rem">Age ' + l.age + '</span> · ' + l.msg + '</div>';
      }).join('') + '</div>';
  }

  return html;
}

function familyRenderParent(p) {
  const hColor = familyHealthColor(p.health || 100);
  const bColor = familyBondColor(p.bond || 70);
  const lastContact = p.lastContactYear ? ('last contact ' + (gameYear() - p.lastContactYear) + 'y ago') : 'never contacted';
  const ageBracket = p.age >= 85 ? 'Elderly' : p.age >= 75 ? 'Senior' : p.age >= 65 ? 'Retiring' : p.age >= 50 ? 'Middle-aged' : 'Active';
  const allowance = S.parentAllowances[p.id] || 0;

  return '<div style="padding:12px 0;border-bottom:1px solid #1a1a2a">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px">' +
    '<div><div style="font-weight:700">' + p.name + ' · ' + p.role + '</div>' +
    '<div class="muted small">age ' + p.age + ' · ' + ageBracket + '</div></div>' +
    '<div class="muted" style="font-size:.7rem;text-align:right">' + lastContact + '</div></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin-bottom:2px"><span>Health</span><span>' + (p.health || 100) + '%</span></div>' +
    '<div style="height:4px;background:#1a1a2a;border-radius:2px;margin-bottom:6px"><div style="height:100%;width:' + (p.health || 100) + '%;background:' + hColor + ';border-radius:2px"></div></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin-bottom:2px"><span>Bond</span><span>' + (p.bond || 70) + '%</span></div>' +
    '<div style="height:4px;background:#1a1a2a;border-radius:2px;margin-bottom:6px"><div style="height:100%;width:' + (p.bond || 70) + '%;background:' + bColor + ';border-radius:2px"></div></div>' +
    (allowance > 0 ? '<div class="muted small" style="margin-bottom:6px">💰 Monthly allowance: <b>' + money(allowance) + '/mo</b></div>' : '') +
    '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyCall(\'' + p.id + '\')">📞 Call</button>' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyVisit(\'' + p.id + '\')">☕ Visit</button>' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyHelpPrompt(\'' + p.id + '\', 20000)">💵 Help</button>' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familySetAllowance(\'' + p.id + '\')">💰 Allowance</button>' +
    '</div></div>';
}

function familyRenderSibling(sib) {
  const bColor = familyBondColor(sib.bond || 70);
  const lastContact = sib.lastContactYear ? ('last contact ' + (gameYear() - sib.lastContactYear) + 'y ago') : 'never contacted';
  const stageLabel = { toddler: 'Toddler', student: 'Student', uni: 'University', working: 'Working', married: 'Married', parent: 'Parent' }[sib.lifeStage] || 'Unknown';
  const successLabel = { poor: 'Struggling', middle: 'Doing OK', successful: 'Successful' }[sib.successLevel] || '';

  return '<div style="padding:12px 0;border-bottom:1px solid #1a1a2a">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
    '<div><div style="font-weight:700">' + sib.name + ' · ' + sib.role + '</div>' +
    '<div class="muted small">age ' + sib.age + ' · ' + stageLabel + ' · ' + successLabel + '</div>' +
    (sib.spouse ? '<div class="muted small">Married to ' + sib.spouse.name + '</div>' : '') +
    (sib.children ? '<div class="muted small">' + sib.children + ' child(ren)</div>' : '') +
    '</div>' +
    '<div class="muted" style="font-size:.7rem;text-align:right;flex-shrink:0">' + lastContact + '</div></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:.72rem;color:#888;margin:8px 0 2px"><span>Bond</span><span>' + (sib.bond || 70) + '%</span></div>' +
    '<div style="height:4px;background:#1a1a2a;border-radius:2px;margin-bottom:10px"><div style="height:100%;width:' + (sib.bond || 70) + '%;background:' + bColor + ';border-radius:2px"></div></div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyCall(\'' + sib.id + '\')">📞 Call</button>' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyVisit(\'' + sib.id + '\')">☕ Visit</button>' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyHelpPrompt(\'' + sib.id + '\', 15000)">💵 Help</button>' +
    '<button class="opt" style="flex:1;padding:6px;font-size:.72rem" onclick="familyOpenGiftPicker(\'' + sib.id + '\')">🎁 Gift</button>' +
    '</div></div>';
}

function familyRenderRemittance() {
  const homeCountry = familyHomeCountry();
  const info = REMITTANCE_COSTS[homeCountry] || REMITTANCE_COSTS.egy;
  let html = '<div class="card"><h3>✈️ Remittance</h3>' +
    '<p class="muted small">You live in ' + C().name + ' · family in ' + homeCountry.toUpperCase() + '.</p>';
  const totalMonthly = Object.values(S.parentAllowances || {}).reduce(function(s, v) { return s + v; }, 0);
  if (totalMonthly > 0) html += '<div class="row"><span>Committed monthly to parents</span><b>' + money(totalMonthly) + '/mo</b></div>';
  html += '<button class="opt" style="margin-top:8px;text-align:center;background:#3b82f6;color:#fff;font-weight:700" onclick="familySendRemittance()">Send one-time amount</button></div>';
  return html;
}

function familyRenderVisitPlanner() {
  const plan = S.familyVisitPlan;
  if (!plan) return '';
  const costs = REMITTANCE_COSTS[familyHomeCountry()] || REMITTANCE_COSTS.egy;
  const duration = VISIT_DURATIONS.find(function(d) { return d.id === plan.duration; }) || VISIT_DURATIONS[1];
  const airClass = VISIT_CLASSES.find(function(c) { return c.id === plan.airClass; }) || VISIT_CLASSES[0];
  const hotel = VISIT_HOTELS.find(function(h) { return h.id === plan.hotel; }) || VISIT_HOTELS[0];

  const airCost = Math.round(costs.airfareEconomy * airClass.mult);
  const hotelCost = hotel.costPerNight * duration.days;
  const total = airCost + hotelCost + (plan.gifts || 0);
  const daysLeft = S.vacationDays - S.vacationDaysUsedThisYear;
  const canGo = daysLeft >= duration.days && S.wealth >= total;

  let html = '<div class="card" style="border-color:#8b5cf6"><h3 style="color:#8b5cf6">Plan Visit Home</h3>';

  html += '<h4 style="font-size:.8rem;color:#8b5cf6;margin-top:10px">Duration</h4><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px">';
  VISIT_DURATIONS.forEach(function(d) {
    html += '<button class="pill ' + (plan.duration === d.id ? 'on' : '') + '" style="padding:6px;font-size:.68rem" onclick="familyVisitSet(\'duration\',\'' + d.id + '\')">' + d.label + '</button>';
  });
  html += '</div>';

  html += '<h4 style="font-size:.8rem;color:#8b5cf6;margin-top:10px">Flight class</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
  VISIT_CLASSES.forEach(function(c) {
    const cost = Math.round(costs.airfareEconomy * c.mult);
    html += '<button class="pill ' + (plan.airClass === c.id ? 'on' : '') + '" style="padding:6px;font-size:.68rem" onclick="familyVisitSet(\'airClass\',\'' + c.id + '\')">' + c.label + '<br><span class="muted" style="font-size:.65rem">' + money(cost) + '</span></button>';
  });
  html += '</div>';

  html += '<h4 style="font-size:.8rem;color:#8b5cf6;margin-top:10px">Accommodation</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
  VISIT_HOTELS.forEach(function(h) {
    html += '<button class="pill ' + (plan.hotel === h.id ? 'on' : '') + '" style="padding:6px;font-size:.68rem" onclick="familyVisitSet(\'hotel\',\'' + h.id + '\')">' + h.label + '<br><span class="muted" style="font-size:.65rem">' + (h.costPerNight ? money(h.costPerNight) + '/night' : 'free') + '</span></button>';
  });
  html += '</div>';

  html += '<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">' +
    '<div class="row"><span>Flight (' + airClass.label + ')</span><b>' + money(airCost) + '</b></div>' +
    '<div class="row"><span>Accommodation (' + duration.days + ' nights)</span><b>' + money(hotelCost) + '</b></div>' +
    '<div class="row"><span>Gifts & spending</span><b>' + money(plan.gifts || 0) + '</b></div>' +
    '<div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Total</b><b style="color:#8b5cf6">' + money(total) + '</b></div>' +
    '<div class="row"><span>Vacation days needed</span><b>' + duration.days + ' (have ' + daysLeft + ')</b></div>' +
    '</div>';

  html += '<div style="display:flex;gap:6px;margin-top:10px">' +
    '<button class="opt" style="flex:1;padding:8px;font-size:.75rem;background:' + (canGo ? '#34d399' : '#25253a') + ';color:' + (canGo ? '#000' : '#666') + ';font-weight:700" ' + (canGo ? '' : 'disabled') + ' onclick="familyVisitConfirm()">Confirm visit</button>' +
    '<button class="opt" style="flex:1;padding:8px;font-size:.75rem;border-color:#fb7185;color:#fb7185" onclick="familyVisitCancel()">Cancel</button>' +
    '</div></div>';
  return html;
}

function familyRenderInheritance() {
  const h = S.inheritedFamilyHome;
  if (!h) return '';
  let html = '<div class="card" style="border-color:#fbbf24"><h3 style="color:#fbbf24">🏠 Family Home</h3>' +
    '<div class="row"><span>Estimated value</span><b>' + money(h.value) + '</b></div>' +
    '<div class="row"><span>Your share</span><b>' + Math.round(h.myPct * 100) + '% (' + money(h.value * h.myPct) + ')</b></div>';
  if (h.shares.length) {
    html += '<h4 style="font-size:.8rem;color:#fbbf24;margin-top:10px">Sibling shares</h4>';
    h.shares.forEach(function(s) {
      const sib = familyById(s.siblingId);
      if (!sib) return;
      const cost = Math.round(h.value * s.pct);
      html += '<div class="row"><span>' + sib.name + ' · ' + Math.round(s.pct * 100) + '%</span>' +
        '<button class="opt" style="padding:3px 8px;font-size:.7rem" onclick="familyBuySiblingShare(\'' + s.siblingId + '\')">Buy · ' + money(cost) + '</button></div>';
    });
  }
  html += '<button class="opt" style="margin-top:10px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="familySellMyHomeShare()">Sell my share · ' + money(h.value * h.myPct) + '</button></div>';
  return html;
}

/* ---------- YEAR TICK ---------- */
GameHooks.on('year', function() {
  ensureFamilyState();
  if (!S) return;
  const year = gameYear();
  const tier = resolveFamilyTier(S.familyTier);
  const tierCfg = FAMILY_TIERS[tier] || FAMILY_TIERS.middle;

  if (S.job) {
    S.vacationDays = 21;
    S.vacationDaysUsedThisYear = 0;
  }

  /* ===== PARENTS ===== */
  familyParents().forEach(function(p) {
    if (p.alive === false) return;

    const bracket = PARENT_HEALTH_DECAY.find(function(b) { return p.age >= b.minAge && p.age <= b.maxAge; });
    if (bracket && bracket.decay > 0) p.health = Math.max(0, (p.health || 100) - bracket.decay);

    if (p.lastContactYear === null || (year - p.lastContactYear) >= CONTACT_DECAY_THRESHOLD_YEARS) {
      p.bond = Math.max(0, (p.bond || 70) - CONTACT_DECAY_AMOUNT);
    }

    const deathBracket = PARENT_DEATH_CHANCE.find(function(b) { return p.age >= b.minAge && p.age <= b.maxAge; });
    if (deathBracket) {
      let chance = deathBracket.chance;
      if ((p.health || 100) < 30) chance *= 2;
      if (Math.random() < chance) { familyParentDies(p); return; }
    }

    if ((p.bond || 70) < 20) return;

    PARENT_REQUEST_TEMPLATES.forEach(function(tpl) {
      if (p.age < tpl.minAge || p.age > tpl.maxAge) return;
      if (tpl.oncePerLife && tpl.kind === 'retirement' && p.retirementRequested) return;
      if ((S.familyRequests || []).some(function(r) { return r.memberId === p.id; })) return;

      const chance = tpl.chance * tierCfg.requestChanceMult;
      if (Math.random() >= chance) return;
      if (tpl.oncePerLife && tpl.kind === 'retirement') p.retirementRequested = true;

      const amount = Math.floor(tpl.amount[0] + Math.random() * (tpl.amount[1] - tpl.amount[0]));
      const reason = tpl.reasons ? tpl.reasons[Math.floor(Math.random() * tpl.reasons.length)] : '';
      const message = tpl.message.replace('{name}', p.name).replace('{amount}', money(amount)).replace('{reason}', reason);

      S.familyRequests.push({
        id: 'req_' + Math.random().toString(36).slice(2, 8),
        memberId: p.id, memberName: p.name, memberRole: p.role,
        kind: tpl.kind, amount: amount, perMonth: tpl.perMonth === true,
        shareable: tpl.shareable === true, message: message, createdYear: year
      });
      log('📨 ' + message);
    });

    if (tierCfg.giftToPlayerChance > 0 && (p.bond || 70) > 60) {
      const chance = 0.15 * tierCfg.giftToPlayerChance;
      if (Math.random() < chance) {
        const gift = Math.floor((p.wealth || 0) * (0.01 + Math.random() * 0.05));
        if (gift > 0) {
          p.wealth -= gift; S.wealth += gift;
          log('🎁 ' + p.name + ' sent you ' + money(gift) + ' as a gift.');
          familyLog('🎁 ' + p.name + ' sent ' + money(gift));
          familyAddBond(p, 5);
        }
      }
    }
  });

  /* ===== SIBLINGS ===== */
  familySiblings().forEach(function(sib) {
    if (sib.lastContactYear === null || (year - sib.lastContactYear) >= CONTACT_DECAY_THRESHOLD_YEARS) {
      sib.bond = Math.max(0, (sib.bond || 70) - CONTACT_DECAY_AMOUNT);
    }
    if (sib.lifeStage === 'toddler' && sib.age >= SIBLING_MILESTONES.schoolStart) sib.lifeStage = 'student';
    if (sib.lifeStage === 'student' && sib.age >= SIBLING_MILESTONES.uniStart) sib.lifeStage = 'uni';
    if (sib.lifeStage === 'uni' && sib.age >= SIBLING_MILESTONES.workStart) {
      sib.lifeStage = 'working';
      log('🎓 ' + sib.name + ' graduated and started working.');
      familyLog('🎓 ' + sib.name + ' graduated');
    }

    sib.justMarried = false;
    if (sib.lifeStage === 'working' && !sib.spouse &&
        sib.age >= SIBLING_MILESTONES.marryMin && sib.age <= SIBLING_MILESTONES.marryMax &&
        Math.random() < SIBLING_WEDDING_CHANCE) {
      const pool = SIBLING_NAMES[S.country] || SIBLING_NAMES.egy;
      const otherGender = sib.gender === 'm' ? 'f' : 'm';
      const spouseName = pool[otherGender][Math.floor(Math.random() * pool[otherGender].length)];
      sib.spouse = { name: spouseName };
      sib.lifeStage = 'married';
      sib.justMarried = true;
      log('🎉 ' + sib.name + ' got married to ' + spouseName + '.');
      familyLog('🎉 ' + sib.name + ' married ' + spouseName);
      fx({ happiness: 2 });
    }

    if ((sib.lifeStage === 'married' || sib.lifeStage === 'parent') &&
        sib.age >= SIBLING_MILESTONES.childMin && sib.age <= SIBLING_MILESTONES.childMax &&
        Math.random() < SIBLING_CHILD_CHANCE) {
      sib.children = (sib.children || 0) + 1;
      sib.lifeStage = 'parent';
      log('👶 ' + sib.name + ' had a child (' + sib.children + ' total). You became an uncle/aunt.');
      familyLog('👶 ' + sib.name + ' had a child');
      fx({ happiness: 2 });
    }

    if (sib.lifeStage === 'working' || sib.lifeStage === 'married' || sib.lifeStage === 'parent') {
      const evo = SIBLING_SUCCESS_EVOLUTION[sib.successLevel] || SIBLING_SUCCESS_EVOLUTION.middle;
      const r = Math.random();
      if (r < evo.toPoor) sib.successLevel = 'poor';
      else if (r < evo.toPoor + evo.toSuccess) sib.successLevel = 'successful';
      else sib.successLevel = 'middle';
    }

    if ((sib.bond || 70) < 20) return;
    SIBLING_REQUEST_TEMPLATES.forEach(function(tpl) {
      if (sib.age < tpl.minAge || sib.age > tpl.maxAge) return;
      if (tpl.onlyIfStage && tpl.onlyIfStage.indexOf(sib.lifeStage) < 0) return;
      if (tpl.onlyJustMarried && !sib.justMarried) return;
      if ((S.familyRequests || []).some(function(r) { return r.memberId === sib.id; })) return;
      if (Math.random() >= tpl.chance) return;

      const amount = Math.floor(tpl.amount[0] + Math.random() * (tpl.amount[1] - tpl.amount[0]));
      const message = tpl.message.replace('{name}', sib.name).replace('{amount}', money(amount));
      S.familyRequests.push({
        id: 'req_' + Math.random().toString(36).slice(2, 8),
        memberId: sib.id, memberName: sib.name, memberRole: sib.role,
        kind: tpl.kind, amount: amount, perMonth: tpl.perMonth === true,
        shareable: false, message: message, createdYear: year
      });
      log('📨 ' + message);
    });
  });

  /* Allowances deducted */
  const totalMonthly = Object.values(S.parentAllowances || {}).reduce(function(s, v) { return s + v; }, 0);
  if (totalMonthly > 0) {
    const yearly = totalMonthly * 12;
    if (S.wealth >= yearly) {
      S.wealth -= yearly;
      log('💰 Paid ' + money(yearly) + ' in parent allowances this year.');
    } else {
      log('⚠️ Could not afford parent allowances (' + money(yearly) + '). Bond may suffer.');
      familyLivingParents().forEach(function(p) {
        if (S.parentAllowances[p.id]) familyAddBond(p, -5);
      });
    }
  }
});

function familyParentDies(p) {
  p.alive = false;
  p.deathYear = gameYear();
  p.bond = 0;

  const funeralCost = FUNERAL_COSTS[familyHomeCountry()] || 30000;
  if (S.wealth >= funeralCost) {
    S.wealth -= funeralCost;
    log('🕊 ' + p.name + ' passed away. Funeral cost: ' + money(funeralCost) + '.');
  } else {
    log('🕊 ' + p.name + ' passed away. You could not afford the funeral (' + money(funeralCost) + ').');
  }
  familyLog('🕊 ' + p.name + ' passed away');
  fx({ happiness: -20, health: -5 });

  const children = (S.family || []).filter(function(m) { return m.isSibling === true && m.alive !== false; });
  const totalChildren = 1 + children.length;
  const perChild = Math.floor((p.wealth || 0) / totalChildren);
  if (perChild > 0) {
    S.wealth += perChild;
    log('💰 Inherited ' + money(perChild) + ' from ' + p.name + ' (split with ' + children.length + ' sibling(s)).');
    children.forEach(function(sib) { sib.wealth = (sib.wealth || 0) + perChild; });
  }

  const livingParentsAfter = familyLivingParents();
  if (livingParentsAfter.length === 0 && !S.inheritedFamilyHome) {
    const homeValue = Math.max(500000, (p.wealth || 0) * 3);
    S.inheritedFamilyHome = {
      value: homeValue,
      myPct: 1 / totalChildren,
      shares: children.map(function(sib) { return { siblingId: sib.id, pct: 1 / totalChildren }; })
    };
    familyLog('🏠 Inherited family home share');
    log('🏠 You inherited ' + Math.round(100 / totalChildren) + '% of the family home (est. ' + money(homeValue) + ').');
  }
}

/* ---------- REGISTER ---------- */
GameHooks.registerTab({ id: 'family', label: 'Family', order: 3, view: familyView });
