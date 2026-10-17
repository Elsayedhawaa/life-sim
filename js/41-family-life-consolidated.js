/* =====================================================================
   41. FAMILY & LIFE CONSOLIDATED (PHASE 4)
   Consolidates: 
     - 41-family-marriage-gift-fix
     - 42-number-fixes
     - 43-clarity-fixes
     - 44-flow-fixes
     - 60-family-home-inheritance
   Load AFTER 40-medical-system.js and BEFORE 45-medical-work-loans.js
   ===================================================================== */

(function p41FamilyLife() {
  'use strict';

  function rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
  function idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex((typeof gameYear === 'function' ? gameYear() : 2026)) : 1; }
  function egp(n) { return Math.round(n * idx()); }

  /* =================================================================
     PART 1 — STATE & NEW GAME
     ================================================================= */
  function p41Init(o) {
    o = o || S;
    if (!o) return;
    if (!o.marriage) o.marriage = {};
    if (!o.p60) o.p60 = {};
    const d = o.p60;
    if (!d.parentsHome) d.parentsHome = null;
    if (typeof d.homeMaid === 'undefined') d.homeMaid = null;
    if (typeof d.homeMaidCost !== 'number') d.homeMaidCost = 0;
    if (!Array.isArray(d.inheritances)) d.inheritances = [];
    if (typeof d.pendingPopup === 'undefined') d.pendingPopup = null;
    if (!Array.isArray(d.pendingDeath)) d.pendingDeath = [];
    if (typeof o.p44GraduationPopup === 'undefined') o.p44GraduationPopup = null;
  }

  const _migrate = migrate;
  migrate = function (o) {
    const r = _migrate(o);
    p41Init(r);
    if (r && r.housing === 'parents' && (!r.p60 || !r.p60.parentsHome)) {
      const prevS = (typeof S !== 'undefined') ? S : undefined;
      try {
        if (typeof S !== 'undefined') S = r;
        p60GenerateParentsHome();
      } catch (e) {}
      finally { if (prevS !== undefined) S = prevS; }
    }
    return r;
  };

  const _newGame = newGame;
  newGame = function () {
    _newGame.apply(this, arguments);
    if (!S) return;
    p41Init(S);
    p60GenerateParentsHome();
    
    /* Random Family Wealth on New Game (File 44) */
    if (S.country === 'egy') {
      const r = Math.random();
      S.famWealth = r < 0.55 ? 0 : r < 0.87 ? 1 : 2;
    } else if (S.country === 'ind' || S.country === 'pak' || S.country === 'nga') {
      const r = Math.random();
      S.famWealth = r < 0.6 ? 0 : r < 0.9 ? 1 : 2;
    } else {
      const r = Math.random();
      S.famWealth = r < 0.35 ? 0 : r < 0.75 ? 1 : 2;
    }
    log('Family background: ' + ['Modest', 'Comfortable', 'Wealthy'][S.famWealth] + '.');
  };
  p41Init(typeof S !== 'undefined' ? S : null);

  /* =================================================================
     PART 2 — PARENTS' HOME GENERATION (File 60)
     ================================================================= */
  function p60GenerateParentsHome() {
    if (!S) return;
    p41Init(S);
    const city = S.country === 'egy' ? (Math.random() < 0.5 ? 'Alexandria' : 'Cairo') : ((typeof COUNTRIES !== 'undefined' && COUNTRIES[S.country]) ? COUNTRIES[S.country].n : 'Home country');
    const hoods = { egy:['Smouha','Sidi Gaber','Miami','Agami','Nasr City','Maadi','Shubra','Heliopolis'], usa:['Suburb','Downtown','Older district','Riverside'], gbr:['Outer zone','Suburb','Town centre'], deu:['Altbau district','Suburb','City fringe'], default:['Central district','Old town','Outer district'] };
    const hood = (hoods[S.country] || hoods.default)[Math.floor(Math.random() * (hoods[S.country] || hoods.default).length)];
    const fw = Math.max(0, Math.min(2, Number(S.famWealth) || 0));
    const builtYears = [1975, 1988, 1995, 2005, 2015];
    const builtYear = builtYears[fw] + Math.floor(Math.random() * 6);
    const types = fw === 2 ? ['villa','duplex','penthouse'] : fw === 1 ? ['apartment','flat','duplex'] : ['apartment','older flat','walk-up'];
    const type = types[Math.floor(Math.random() * types.length)];
    const rooms = fw === 0 ? (2 + Math.floor(Math.random() * 2)) : fw === 1 ? (3 + Math.floor(Math.random() * 2)) : (4 + Math.floor(Math.random() * 3));
    const area = fw === 0 ? (60 + Math.floor(Math.random() * 30)) : fw === 1 ? (110 + Math.floor(Math.random() * 50)) : (240 + Math.floor(Math.random() * 120));
    const cond = Math.max(20, Math.min(95, 30 + Math.floor(Math.random() * 40) + fw * 12));
    const ppm = fw === 2 ? 60000 : fw === 1 ? 28000 : 12000;
    const valueEGP2026 = area * ppm * (cond / 100) * 0.85 + Math.random() * 200000;
    const valueInternal = (valueEGP2026 * idx()) / rate();
    const motherAlive = (S.family || []).some(function (m) { return m && m.role === 'Mother' && m.alive !== false; });
    const fatherAlive = (S.family || []).some(function (m) { return m && m.role === 'Father' && m.alive !== false; });
    const owner = motherAlive && fatherAlive ? (Math.random() < 0.5 ? 'both' : 'father') : motherAlive ? 'mother' : fatherAlive ? 'father' : 'both';
    const pool = ['Balcony','Elevator','Parking spot','Private garden','Security gate','Storage room','Air conditioning','Modern kitchen'];
    const features = [];
    const count = fw + 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count && i < pool.length; i++) {
      const p = pool[Math.floor(Math.random() * pool.length)];
      if (features.indexOf(p) === -1) features.push(p);
    }
    S.p60.parentsHome = {
      address: (hood + ', ' + city), city: city, neighbourhood: hood, type: type, rooms: rooms, area: area, condition: cond, builtYear: builtYear, owner: owner, value: Math.round(valueInternal), features: features, renovations: [], ownsHome: true
    };
  }
  window.p60GenerateParentsHome = p60GenerateParentsHome;

  /* =================================================================
     PART 3 — PARENTS HOME ACTIONS & MORTALITY (File 60)
     ================================================================= */
  window.p60HireMaid = function (id) {
    p41Init(S);
    const cost = { cleaner: 3500, maid: 8000 }[id];
    if (!cost) return;
    const e = cost * idx();
    const internal = e / rate();
    if (S.wealth < internal) return hint('You need ' + e.toLocaleString() + ' EGP for first month.');
    S.wealth -= internal;
    S.p60.homeMaid = id;
    S.p60.homeMaidCost = e;
    (S.family || []).filter(function (m) { return m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); }).forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 5); });
    fx({ happiness: 2 });
    log('🏠 Hired ' + (id === 'cleaner' ? 'weekly cleaner' : 'full-time helper') + ' (' + e.toLocaleString() + ' EGP/month).');
    render();
  };

  window.p60CancelMaid = function () {
    p41Init(S);
    if (!S.p60.homeMaid) return;
    S.p60.homeMaid = null;
    S.p60.homeMaidCost = 0;
    log('Cancelled household help.');
    render();
  };

  window.p60RenovateParentsHome = function (id) {
    p41Init(S);
    const h = S.p60.parentsHome;
    if (!h) return;
    const opts = {
      paint: { label:'Repaint & refresh', egp:15000, cond:8, val:0.03 },
      kitchen: { label:'Modernise kitchen', egp:45000, cond:12, val:0.06 },
      bath: { label:'Renovate bathroom', egp:38000, cond:10, val:0.05 },
      floors: { label:'Replace floors', egp:55000, cond:14, val:0.07 },
      ac: { label:'Install split AC', egp:60000, cond:6, val:0.04 }
    };
    const opt = opts[id];
    if (!opt) return;
    const e = opt.egp * idx();
    const internal = e / rate();
    if (S.wealth < internal) return hint('Need ' + e.toLocaleString() + ' EGP.');
    S.wealth -= internal;
    S.expenses = (S.expenses || 0) + internal;
    S.bill = S.bill || {};
    S.bill.homeRenovations = (S.bill.homeRenovations || 0) + internal;
    h.condition = Math.min(100, (h.condition || 0) + opt.cond);
    h.value = Math.round(h.value * (1 + opt.val));
    h.renovations = h.renovations || [];
    h.renovations.push(opt.label);
    (S.family || []).filter(function (m) { return m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); }).forEach(function (m) { m.bond = Math.min(100, (m.bond || 50) + 6); });
    fx({ happiness: 3 });
    log('🏠 Renovated parents\' home: ' + opt.label + ' (' + e.toLocaleString() + ' EGP).');
    render();
  };

  function p60LivingHeirs() {
    if (!S) return [];
    const out = [];
    (S.family || []).forEach(function (m) {
      if (!m || m.alive === false) return;
      if (m.role === 'Sibling' || (m.role === 'Child' && m.age >= 18)) out.push(m);
    });
    out.push({ id:'player', name:'You', role:'Player' });
    return out;
  }

  function p60SiblingShares() {
    if (!S || !S.p60 || !S.p60.parentsHome) return [];
    const out = [];
    (S.family || []).forEach(function (m) {
      if (!m || m.alive === false) return;
      if (m.role === 'Sibling' && typeof m.inheritedHomeShare === 'number' && m.inheritedHomeShare > 0) out.push({ member: m, share: m.inheritedHomeShare });
    });
    return out;
  }

  function p60ParentMortalityRoll() {
    if (!S || S.age < 5) return;
    p41Init(S);
    const parents = (S.family || []).filter(function (m) { return m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); });
    parents.forEach(function (p) {
      const a = Number(p.age) || 0;
      let chance = a < 40 ? 0.0015 : a < 55 ? 0.004 : a < 65 ? 0.012 : a < 75 ? 0.030 : a < 85 ? 0.075 : a < 95 ? 0.160 : 0.320;
      if (S.econ === 'recession') chance *= 1.15;
      if ((p.bond || 0) < 20) chance *= 0.95;
      if (Math.random() < chance) {
        const roll = Math.random();
        const cause = a < 55 ? (roll < 0.5 ? 'illness' : 'accident') : a < 75 ? (roll < 0.6 ? 'illness' : 'a sudden heart attack') : (roll < 0.5 ? 'old age' : 'illness');
        p60HandleParentDeath(p, cause);
      }
    });
  }

  function p60HandleParentDeath(parent, cause) {
    parent.alive = false;
    parent.deathYear = gameYear();
    parent.deathCause = cause;
    log('🕊️ Your ' + (parent.role === 'Mother' ? 'mother' : 'father') + ' ' + parent.name + ' passed away (' + cause + ').');

    const cash = Math.max(0, Number(parent.netWorth) || Number(parent.estateInternal) || 0);
    const h = S.p60.parentsHome;
    const homeIncluded = h && h.ownsHome && (h.owner === 'both' || h.owner === (parent.role === 'Mother' ? 'mother' : 'father'));
    const homeValueHalf = homeIncluded ? (Number(h.value) || 0) * (h.owner === 'both' ? 0.5 : 1) : 0;
    const other = (S.family || []).find(function (m) { return m && m.alive !== false && m !== parent && (m.role === 'Mother' || m.role === 'Father'); });
    const children = p60LivingHeirs();

    let spouseShare = 0, childShare = 0;
    if (other && children.length > 0) { spouseShare = cash * 0.125; childShare = cash - spouseShare; }
    else if (other) { spouseShare = cash * 0.5; childShare = cash - spouseShare; }
    else { childShare = cash; }
    const perChild = children.length > 0 ? childShare / children.length : 0;

    let homeShare = homeIncluded ? (h.owner === 'both' ? 0.5 : 1) : 0;
    if (homeShare > 0 && !other) {
      const per = homeShare / children.length;
      children.forEach(function (c) {
        if (c.id === 'player') S.p60.playerHomeShare = (S.p60.playerHomeShare || 0) + per;
        else {
          const mm = (S.family || []).find(function (x) { return x.id === c.id; });
          if (mm) mm.inheritedHomeShare = (mm.inheritedHomeShare || 0) + per;
        }
      });
    }

    if (perChild > 0.01) { S.wealth += perChild; S.income = (S.income || 0) + perChild; }
    if (other && spouseShare > 0.01) { other.netWorth = (Number(other.netWorth) || 0) + spouseShare; other.estateInternal = other.netWorth; }

    S.p60.inheritances.push({ year: gameYear(), from: parent.name, role: parent.role, cashInternal: perChild, homeShareAdded: homeIncluded && !other ? (homeShare / children.length) : 0, cause: cause });
    S.p60.pendingDeath.push({ parentId: parent.id, parentName: parent.name, parentRole: parent.role, cause: cause, playerCashInternal: perChild, siblingCount: children.length - 1, spouseSurvives: !!other });

    if (S.housing === 'parents' && !other) log('You inherited a share of your parents\' home. You can continue living there or sell your share.');
  }

  function p60ShowPendingDeathPopup() {
    if (!S || !S.p60 || !S.p60.pendingDeath || !S.p60.pendingDeath.length) return;
    const d = S.p60.pendingDeath[0];
    const cashEGP = Math.round(d.playerCashInternal * rate());
    let msg = 'Your ' + (d.parentRole === 'Mother' ? 'mother' : 'father') + ' ' + d.parentName + ' passed away from ' + d.cause + '.\n\n';
    msg += cashEGP > 0 ? '💵 Your share of the cash estate: ' + cashEGP.toLocaleString() + ' EGP.\n' : 'No cash was left after debts and expenses.\n';
    if (S.p60.playerHomeShare > 0) msg += '\n🏠 You also inherited a ' + (S.p60.playerHomeShare * 100).toFixed(0) + '% share of the family home.\n';
    if (d.siblingCount > 0 && !d.spouseSurvives) msg += '\nYour ' + d.siblingCount + ' sibling(s) each received an equal share.';
    else if (d.spouseSurvives) msg += '\nYour surviving parent keeps the family home.';
    
    setTimeout(function () {
      if (typeof p24Popup === 'function') p24Popup('🕊️ ' + d.parentName + ' has passed away', msg);
      S.p60.pendingDeath.shift();
      if (S.p60.pendingDeath.length > 0) setTimeout(p60ShowPendingDeathPopup, 1200);
      render();
    }, 500);
  }

  window.p60BuySiblingShare = function (memberId) {
    p41Init(S);
    const h = S.p60.parentsHome;
    if (!h) return hint('No parents home.');
    const m = (S.family || []).find(function (x) { return x.id === memberId; });
    if (!m || !m.inheritedHomeShare) return hint('That sibling has no share to sell.');
    const share = m.inheritedHomeShare;
    const price = Math.round((Number(h.value) || 0) * share * 1.05);
    if (S.wealth < price) return hint('You need ' + Math.round(price * rate()).toLocaleString() + ' EGP.');
    const agreeChance = 0.35 + Math.max(0, (m.bond || 50) - 40) / 200;
    if (Math.random() > agreeChance) {
      m.bond = Math.max(0, (m.bond || 50) - 3);
      log('❌ ' + m.name + ' refused to sell their share of the family home.');
      render(); return;
    }
    if (!confirm('Buy ' + m.name + '\'s share (' + (share * 100).toFixed(0) + '%) for ' + Math.round(price * rate()).toLocaleString() + ' EGP?')) return;
    S.wealth -= price;
    S.p60.playerHomeShare = (S.p60.playerHomeShare || 0) + share;
    m.inheritedHomeShare = 0;
    m.bond = Math.min(100, (m.bond || 50) + 5);
    log('🏠 Bought ' + (share * 100).toFixed(0) + '% of the family home from ' + m.name + '.');
    render();
  };

  window.p60SellSharePrompt = function () {
    p41Init(S);
    const h = S.p60.parentsHome;
    if (!h) return;
    const playerShare = S.p60.playerHomeShare || 0;
    if (playerShare <= 0) return hint('You do not own a share.');
    const sib = p60SiblingShares();
    const other = (S.family || []).find(function (m) { return m && m.alive !== false && (m.role === 'Mother' || m.role === 'Father'); });
    let buyer = null;
    if (sib.length > 0) buyer = sib[0].member;
    else if (other) buyer = other;
    else return hint('Nobody in the family can buy your share right now.');
    const value = Math.round((Number(h.value) || 0) * playerShare * 0.95);
    if (!confirm('Sell your ' + (playerShare * 100).toFixed(0) + '% share to ' + buyer.name + ' for ' + Math.round(value * rate()).toLocaleString() + ' EGP?')) return;
    S.wealth += value;
    if (buyer.role === 'Sibling') buyer.inheritedHomeShare = (buyer.inheritedHomeShare || 0) + playerShare;
    else buyer.netWorth = (Number(buyer.netWorth) || 0) + value;
    S.p60.playerHomeShare = 0;
    log('🏠 Sold your share of the family home to ' + buyer.name + '.');
    render();
  };

  /* =================================================================
     PART 4 — FAMILY SUPPORT EGP FIXES (File 41 & 42)
     ================================================================= */
  window.p24FamilySupport = function (mode) {
    if (!S || S.age < 18) return hint('You can manage family support from age 18.');
    const id = document.getElementById('p24-support-member')?.value;
    const m = (S.family || []).find(function (x) { return x.id === id && x.alive !== false; });
    if (!m) return hint('Choose a living family member first.');
    const rel = (typeof p24Relation === 'function') ? p24Relation(m) : (m.name || 'family');

    if (mode === 'once') {
      const localEGP = Number(document.getElementById('p24-support-once')?.value);
      if (!isFinite(localEGP) || localEGP <= 0) return hint('Enter an amount greater than zero.');
      const internal = localEGP / rate();
      if (S.wealth < internal) return hint('You need ' + localEGP.toLocaleString() + ' EGP available to send this transfer.');
      S.wealth -= internal;
      m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 45) + 8));
      log('You sent ' + localEGP.toLocaleString() + ' EGP to ' + rel + '.');
      fx({ happiness: 1, social: 1 });
      if (typeof p24Popup === 'function') p24Popup(rel + ' replied', '“Thank you for sending ' + localEGP.toLocaleString() + ' EGP. This helps me with my expenses.”');
      render(); return;
    }

    if (mode === 'monthly') {
      const monthlyEGP = Number(document.getElementById('p24-support-monthly')?.value);
      if (!isFinite(monthlyEGP) || monthlyEGP < 0) return hint('Enter zero or a positive monthly amount.');
      m.allowLocalEGP = Math.round(monthlyEGP * 12);
      m.allowLocal = m.allowLocalEGP;
      m.allowCurrency = S.country;
      m.allow = m.allowLocalEGP / rate();
      m.allowPaidYear = null;
      if (monthlyEGP > 0) {
        m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 45) + 4));
        log('You arranged monthly support of ' + monthlyEGP.toLocaleString() + ' EGP for ' + rel + '.');
        if (typeof p24Popup === 'function') p24Popup(rel + ' is grateful', '“Thank you for making this regular. Knowing I can count on ' + monthlyEGP.toLocaleString() + ' EGP each month makes planning much easier.”');
      } else {
        log('You cancelled recurring support for ' + rel + '.');
      }
      render(); return;
    }

    if (mode === 'stop') {
      m.allowLocalEGP = 0; m.allowLocal = 0; m.allow = 0; m.allowPaidYear = null;
      log('You cancelled recurring support for ' + rel + '.');
      render();
    }
  };

  window.p24UpdateSupportPreview = function () {
    const id = document.getElementById('p24-support-member')?.value;
    const m = (S.family || []).find(function (x) { return x.id === id && x.alive !== false; });
    const el = document.getElementById('p24-support-current');
    const monthly = document.getElementById('p24-support-monthly');
    if (m) {
      const monthlyEGP = (m.allowLocalEGP != null) ? Math.round(m.allowLocalEGP / 12) : Math.round((Number(m.allow) || 0) * rate() / 12);
      if (el) el.innerHTML = '<span>Current monthly support</span><b>' + monthlyEGP.toLocaleString() + ' EGP/month</b>';
      if (monthly) monthly.value = Math.max(0, monthlyEGP);
    }
  };

  const _familyYear = familyYear;
  familyYear = function () {
    const r = _familyYear.apply(this, arguments);
    if (!S || !Array.isArray(S.family)) return r;
    const year = (typeof gameYear === 'function') ? gameYear() : 2026;
    S.family.forEach(function (m) {
      if (!m || m.alive === false) return;
      if (!(Number(m.allow) > 0) && !(Number(m.allowLocalEGP) > 0)) return;
      if (m.allowPaidYear === year) return;
      const egp = Number(m.allowLocalEGP) || Math.round((Number(m.allow) || 0) * rate());
      m.allow = egp / rate();
      m.allowPaidYear = year;
      m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 45) + 3));
    });
    return r;
  };

  /* =================================================================
     PART 5 — FAMILY REQUESTS FIXES (File 42, 44)
     ================================================================= */
  window.p14RespondFamilyNeed = function (send) {
    const r = (typeof p14RequestState === 'function') ? p14RequestState() : null;
    if (!r) return hint('No pending family request.');
    const m = r.m;

    if (!send) {
      if (m) m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) - 7));
      fx({ happiness: -3 });
      log('You declined ' + r.name + '\'s request for ' + r.reason + '.');
      if (r.kind === 'parent') S.parentNeed = null; else S.familyNeed = null;
      render(); return;
    }

    const egpInput = Number(document.getElementById('p14-family-request-amount')?.value);
    if (!isFinite(egpInput) || egpInput < 0) return hint('Enter a valid amount.');

    const transfer = egpInput / rate();
    const fee = S.country !== (S.home || S.country) ? transfer * 0.025 : 0;
    const total = transfer + fee;

    if (total > S.wealth) return hint('You cannot afford ' + Math.round(egpInput * (1 + (fee > 0 ? 0.025 : 0))).toLocaleString() + ' EGP including fees.');

    S.wealth -= total;
    S.expenses = (S.expenses || 0) + total;
    S.bill = S.bill || {};
    S.bill.familySupport = (S.bill.familySupport || 0) + total;
    if (S.yearPopup) S.yearPopup.expenses = (S.yearPopup.expenses || 0) + total;

    if (m) {
      const ratio = r.amountInternal > 0 ? transfer / r.amountInternal : 0;
      m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) + (ratio >= 0.9 ? 9 : ratio >= 0.35 ? 5 : ratio > 0 ? 2 : -3)));
    }
    if (transfer > 0) {
      fx({ happiness: Math.min(3, Math.round(transfer / Math.max(0.001, r.amountInternal) * 2)) });
      log('You sent ' + egpInput.toLocaleString() + ' EGP to ' + r.name + ' for ' + r.reason + '.');
    } else {
      fx({ happiness: -2 });
      log('You offered no money to ' + r.name + '.');
    }
    if (r.kind === 'parent') S.parentNeed = null; else S.familyNeed = null;
    const el = document.getElementById('p14-parent-request-modal');
    if (el) el.remove();
    hint(); render();
  };

  window.p14SuggestedFamilyNeed = function (reason, familyTier, year, country) {
    country = country || 'egy';
    const r = String(reason || '').toLowerCase();
    const t = Math.max(0, Math.min(2, Number(familyTier) || 0));
    const table = [[4500,18000,55000], [1800,5500,15000], [2500,10000,45000], [7000,30000,100000], [3000,12000,45000], [2500,8000,24000], [2500,8500,25000]];
    let pick = table[6];
    if (/hospital|treatment|medical|medication|medicine/.test(r)) pick = table[0];
    else if (/grocery|food/.test(r)) pick = table[1];
    else if (/school|education|fees/.test(r)) pick = table[2];
    else if (/wedding|event/.test(r)) pick = table[3];
    else if (/repair|plumbing|roof/.test(r)) pick = table[4];
    else if (/rent|bill|utility|electric|gas/.test(r)) pick = table[5];
    const base = pick[t];
    return country === 'egy' ? Math.round(base * idx()) : Math.round(base / 52.7);
  };

  window.p14ShowParentRequestModal = function () {
    if (!S || S.pending || S.yearPopup) return;
    const r = (typeof p14RequestState === 'function') ? p14RequestState() : null;
    const existing = document.getElementById('p14-parent-request-modal');
    if (!r) { if (existing) existing.remove(); return; }
    let el = existing || document.createElement('div');
    if (!existing) { el.id = 'p14-parent-request-modal'; el.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(2,2,10,.82);display:flex;align-items:center;justify-content:center;padding:16px;'; document.body.appendChild(el); }
    
    const reqEGP = Math.round(Number(r.amountInternal) * rate());
    const suggested = Math.min(reqEGP, Math.round(S.wealth * rate()));
    el.innerHTML = '<div style="background:#14141f;color:#e8e8f2;border:1px solid #51416e;border-radius:16px;padding:20px;max-width:480px;width:100%;max-height:86vh;overflow:auto;box-shadow:0 18px 60px #0009">' +
      '<div style="font-size:.75rem;letter-spacing:.08em;color:#22d3ee;font-weight:700">FAMILY MESSAGE · ' + gameYear() + '</div>' +
      '<h2 style="font-size:1.45rem;margin:8px 0">' + r.name + ' asks for your help</h2>' +
      '<p style="line-height:1.5;margin-bottom:10px">They need help with <b>' + r.reason + '</b>. The requested amount is <b>' + reqEGP.toLocaleString() + ' EGP</b>.</p>' +
      '<label for="p14-family-request-amount" class="muted">Amount you choose to send (EGP)</label>' +
      '<input id="p14-family-request-amount" type="number" min="0" step="100" value="' + suggested + '" style="width:100%;margin:8px 0 12px;padding:12px;background:#0b0b12;color:#e8e8f2;border:1px solid #35354b;border-radius:10px;font:inherit">' +
      '<p class="muted" style="font-size:.8rem">You may send the full amount, a smaller amount, or nothing. ' + (S.country !== (S.home || S.country) ? 'An estimated 2.5% transfer fee applies when sending internationally.' : '') + '</p>' +
      '<div class="acts"><button class="btn" style="text-align:center;background:#8b5cf6" onclick="p14RespondFamilyNeed(true)">Send chosen amount</button><button class="btn" style="text-align:center" onclick="p14RespondFamilyNeed(false)">Decline for now</button></div></div>';
  };

  if (typeof p12GenerateFamilyNeed === 'function') {
    const _need = p12GenerateFamilyNeed;
    window.p12GenerateFamilyNeed = function () {
      if (!S) return;
      if (S.famWealth >= 2 && S.uni && S.uni.pay === 'parents') return;
      if (S.famWealth >= 2 && Math.random() < 0.75) return;
      if (S.famWealth === 1 && Math.random() < 0.4) return;
      return _need.apply(this, arguments);
    };
  }
  if (typeof p14GenerateFamilyNeed === 'function') {
    window.p14GenerateFamilyNeed = window.p12GenerateFamilyNeed;
  }

  /* =================================================================
     PART 6 — MARRIAGE ARRANGEMENTS & YEAR SETTLEMENT (File 41)
     ================================================================= */
  window.p41SetArrangement = function (mode) {
    if (!S.marriage) S.marriage = {};
    const spouse = (typeof partner === 'function') ? partner() : null;
    if (!spouse || spouse.stage !== 'married') return hint('You must be married.');
    const gen = Number(spouse.generosity) || 0.5;
    if ((mode === 'split' || mode === 'wife-pays') && gen < 0.35) {
      const chance = 0.5 + (0.35 - gen) * 2;
      if (Math.random() < chance) {
        spouse.bond = Math.max(0, Math.min(100, (Number(spouse.bond) || 50) - 4));
        log(spouse.name + ' refused the "' + mode + '" arrangement. She says the husband should provide.');
        if (typeof p24Popup === 'function') p24Popup(spouse.name + ' refused', '“In our culture, the husband provides for the household. I am not going to pay half of the bills.”');
        render(); return;
      }
    }
    S.marriage.arrangement = mode;
    const reactions = {
      'split': { label: 'Split bills 50/50', msg: '“Fine, we share everything equally. Fair is fair.”', bond: 1 },
      'man-pays': { label: 'You pay all bills', msg: '“Thank you. I feel cared for — you are a real man.”', bond: 3 },
      'wife-pays': { label: 'She pays most', msg: '“I will pay, but I do not feel respected. This is not how it should be.”', bond: -4 },
      'traditional': { label: 'Traditional mixed', msg: '“This feels right — you lead, I help where I can.”', bond: 2 }
    };
    const r = reactions[mode] || reactions.split;
    spouse.bond = Math.max(0, Math.min(100, (Number(spouse.bond) || 50) + r.bond));
    log('Household arrangement set to: ' + r.label + '.');
    if (typeof p24Popup === 'function') p24Popup('Household arrangement updated', r.msg);
    render();
  };
  window.p35SetArrangement = window.p41SetArrangement;

  function p41MarriageYearSettlement() {
    if (!S || !S.marriage) return;
    const spouse = (typeof partner === 'function') ? partner() : null;
    if (!spouse || spouse.stage !== 'married') return;
    const arr = S.marriage.arrangement || 'split';
    const household = (S.bill && (Number(S.bill.rent) || 0) + (Number(S.bill.utilities) || 0) + (Number(S.bill.groceries) || 0) + (Number(S.bill.mortgage) || 0) + (Number(S.bill.propertyTax) || 0)) || 0;
    
    if (household > 0) {
      let refund = 0, label = '';
      if (arr === 'split') { refund = household * 0.5 * (Number(spouse.shareWill) || 0.5); label = 'shared 50/50'; }
      else if (arr === 'traditional') { refund = household * 0.2; label = 'traditional split'; }
      else if (arr === 'wife-pays') { refund = household * 0.7; label = 'she paid most'; }
      if (refund > 0) { S.wealth += refund; S.income = (S.income || 0) + refund; log(spouse.name + ' contributed ' + (typeof money === 'function' ? money(refund) : Math.round(refund * rate()) + ' EGP') + ' to the household (' + label + ').'); }
    }
    if (S.marriage.sharedBank && (S.marriage.sharedBal || 0) > 0) {
      const earned = Math.round(S.marriage.sharedBal * 0.12);
      if (earned > 0) { S.marriage.sharedBal += earned; S.income = (S.income || 0) + earned; }
    }
    if (S.marriage.wifeWorks) {
      const herIncome = Number(spouse.income) || 0;
      if (herIncome > 0) {
        if (S.marriage.sharedBank) {
          const amount = Math.round(herIncome * (0.15 + (Number(spouse.generosity) || 0.5) * 0.25));
          if (amount > 0) S.marriage.sharedBal = (S.marriage.sharedBal || 0) + amount;
        }
        const growth = Math.round(herIncome * (0.10 + (Number(spouse.generosity) || 0.5) * 0.15));
        spouse.personalSavings = (Number(spouse.personalSavings) || 0) + growth;
        spouse.netWorth = (Number(spouse.netWorth) || 0) + growth;
      }
    } else {
      spouse.netWorth = Math.max(0, (Number(spouse.netWorth) || 0) * 0.94);
      spouse.income = 0;
    }
  }

  /* =================================================================
     PART 7 — BRAND GIFTS & SHOPPING FIXES (File 41)
     ================================================================= */
  const P41_BRAND_GIFTS = {
    jewelry: [
      { id: 'g18_chain', name: '18K gold chain (5g)', brand: 'Local jeweler', egp: 26500, bond: 6 },
      { id: 'g21_set', name: '21K gold jewelry set (10g)', brand: 'Gold souk', egp: 61800, bond: 9 },
      { id: 'g_diamond_ring', name: 'Diamond ring 18K white gold (2g)', brand: 'Local jeweler', egp: 27290, bond: 10 },
      { id: 'g_diamond_rose', name: 'Rose-gold diamond ring (9g)', brand: 'Al Hedia', egp: 124650, bond: 15 },
      { id: 'g_full_set', name: 'Full diamond jewelry set', brand: 'Luxury house', egp: 350000, bond: 20 }
    ],
    bag: [
      { id: 'bag_gucci', name: 'Gucci Small Lunetta Shoulder Bag', brand: 'Gucci', egp: 66024, bond: 10 },
      { id: 'bag_lv_speedy', name: 'Louis Vuitton Speedy 30', brand: 'Louis Vuitton', egp: 80000, bond: 12 },
      { id: 'bag_lv_vanity', name: 'Louis Vuitton Vanity Case PM', brand: 'Louis Vuitton', egp: 266866, bond: 18 },
      { id: 'bag_chanel', name: 'Chanel Classic Flap Medium', brand: 'Chanel', egp: 450000, bond: 22 },
      { id: 'bag_hermes', name: 'Hermès Birkin 25', brand: 'Hermès', egp: 829000, bond: 28 }
    ],
    watch: [
      { id: 'watch_casio', name: 'Casio / Seiko entry watch', brand: 'Casio / Seiko', egp: 8000, bond: 5 },
      { id: 'watch_cartier', name: 'Cartier Tank Solo SM', brand: 'Cartier', egp: 200000, bond: 15 },
      { id: 'watch_rolex26', name: 'Rolex Lady-Datejust 26', brand: 'Rolex', egp: 344000, bond: 20 },
      { id: 'watch_rolex31', name: 'Rolex Datejust 31', brand: 'Rolex', egp: 400000, bond: 22 },
      { id: 'watch_patek', name: 'Patek Philippe Nautilus', brand: 'Patek Philippe', egp: 1500000, bond: 32 }
    ]
  };

  const _gift = typeof gift === 'function' ? gift : function(){};
  window.gift = function (i) {
    if (i < 6) return _gift.apply(this, arguments);
    const m = (typeof lp === 'function') ? lp() : null;
    if (!m) return hint('No partner.');
    if (S.gact >= 3) return hint('Three gifts per year.');
    let category = null;
    if (i === 6) category = 'watch'; else if (i === 7) category = 'jewelry'; else if (i === 8 || i === 9) category = 'bag';
    if (!category) return _gift.apply(this, arguments);
    return p41GiftSubmenu(category);
  };

  window.p41GiftSubmenu = function (category) {
    const m = (typeof lp === 'function') ? lp() : null;
    if (!m) return hint('No partner.');
    if (S.gact >= 3) return hint('Three gifts per year.');
    const items = P41_BRAND_GIFTS[category] || [];
    if (!items.length) return hint('No items in this category.');

    let html = '<section class="card"><h3>Choose a brand gift for ' + m.name + '</h3>' +
      '<p class="muted">Real 2026 Egypt market prices. She has her own taste — some brands will please her more than others.</p>';
    items.forEach(function (it) {
      const priceEGP = egp(it.egp);
      const internal = priceEGP / rate();
      const canAfford = S.wealth >= internal;
      const isHerStyle = (m.likes === 'jewelry' && category === 'jewelry') || (m.likes === 'fashion' && category === 'bag');
      html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
        '<b>' + it.name + '</b>' +
        '<div class="row"><span>Brand</span><b>' + it.brand + '</b></div>' +
        '<div class="row"><span>Price</span><b>' + priceEGP.toLocaleString() + ' EGP</b></div>' +
        '<div class="row"><span>Bond boost</span><b>+' + it.bond + (isHerStyle ? ' (her taste!)' : '') + '</b></div>' +
        '<button class="btn" ' + (canAfford ? '' : 'disabled') + ' onclick="p41BuyBrandGift(\'' + category + '\',\'' + it.id + '\')">' + (canAfford ? 'Buy for ' + m.name : 'Not enough cash') + '</button></div>';
    });
    html += '<button class="btn" style="margin-top:12px" onclick="render()">Back</button></section>';
    
    const modal = document.createElement('div');
    modal.className = 'p24-modal-backdrop';
    modal.id = 'p41-gift-modal';
    modal.innerHTML = '<div class="p24-modal" style="max-width:520px">' + html + '</div>';
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
    document.body.appendChild(modal);
  };

  window.p41BuyBrandGift = function (category, itemId) {
    const m = (typeof lp === 'function') ? lp() : null;
    if (!m) return hint('No partner.');
    if (S.gact >= 3) return hint('Three gifts per year.');
    const it = (P41_BRAND_GIFTS[category] || []).find(function (x) { return x.id === itemId; });
    if (!it) return;
    const priceEGP = egp(it.egp);
    const internal = priceEGP / rate();
    if (S.wealth < internal) return hint('Need ' + priceEGP.toLocaleString() + ' EGP.');

    S.wealth -= internal; S.expenses = (S.expenses || 0) + internal; S.bill = S.bill || {}; S.bill.gifts = (S.bill.gifts || 0) + internal; S.gact = (S.gact || 0) + 1;
    const isHerStyle = (m.likes === 'jewelry' && category === 'jewelry') || (m.likes === 'fashion' && category === 'bag');
    m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) + it.bond + (isHerStyle ? 5 : 0)));
    fx({ happiness: 3 });
    log('You gave ' + m.name + ' a ' + it.name + ' (' + it.brand + ') for ' + priceEGP.toLocaleString() + ' EGP.');

    const modal = document.getElementById('p41-gift-modal');
    if (modal) modal.remove();
    if (typeof p24Popup === 'function') {
      let reaction = isHerStyle ? '“Oh my God — ' + it.brand + '! You actually remembered. This is exactly what I wanted.”' :
        (it.bond >= 20 ? '“This is beautiful. I cannot believe you bought me a ' + it.brand + '. Thank you.”' :
        (it.bond >= 10 ? '“Thank you, it’s lovely. I appreciate the thought.”' : '“Oh, thanks.”'));
      p24Popup(m.name + ' reacted', reaction);
    }
    render();
  };

  window.p41OpenShoppingForGift = function () {
    const m = (typeof lp === 'function') ? lp() : null;
    if (!m) return hint('No partner.');
    S.p41GiftTarget = m.id;
    if (typeof activeTab !== 'undefined') window.activeTab = 'shop';
    if (typeof activeShopTab !== 'undefined') window.activeShopTab = 'apple';
    hint('Choose a phone or tablet from the store. Buying it will gift it to ' + m.name + '.');
    render();
  };

  const _buyItem = typeof buyItem === 'function' ? buyItem : function(){};
  window.buyItem = function (key, method) {
    if (S && S.p41GiftTarget) {
      const m = (S.family || []).find(function (x) { return x.id === S.p41GiftTarget && x.alive !== false; });
      if (m) {
        if (method !== 'cash') return hint('Gifts are paid with cash only.');
        const it = (typeof catalog === 'function' ? catalog() : []).find(function (x) { return x.key === key; });
        if (!it) return hint('Item not found.');
        const total = (typeof shopPrice === 'function') ? shopPrice(it, 0) : it.price;
        if (S.wealth < total) return hint('Not enough cash.');
        S.wealth -= total; S.expenses = (S.expenses || 0) + total; S.bill = S.bill || {}; S.bill.gifts = (S.bill.gifts || 0) + total; S.gact = (S.gact || 0) + 1;
        m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) + 12));
        log('You bought a ' + it.model + ' for ' + m.name + ' (' + (typeof money === 'function' ? money(total) : total) + ').');
        S.p41GiftTarget = null;
        if (typeof p24Popup === 'function') p24Popup(m.name + ' loved it', '“Thank you for the ' + it.model + '! I’ve been wanting one of these.”');
        render(); return;
      }
    }
    return _buyItem.apply(this, arguments);
  };

  /* =================================================================
     PART 8 — SHARED PROPERTY (File 41 & 42)
     ================================================================= */
  function p42GetListingEGP(l) {
    let internal = Number(l && l.priceInternal) || 0;
    if (!internal && l && l.catId && typeof HOUSING_CATALOG !== 'undefined') {
      const c = HOUSING_CATALOG.find(function (x) { return x.id === l.catId; });
      if (c) internal = Number(c.price) || 0;
    }
    return Math.round(internal * rate());
  }

  window.p42BuyTogether = function (listingId, playerShare, mode) {
    const spouse = (typeof partner === 'function') ? partner() : null;
    if (!spouse || (spouse.stage !== 'engaged' && spouse.stage !== 'married')) return hint('Need engaged or married partner.');
    const listing = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket().find(function (x) { return x.id === listingId; }) : null;
    if (!listing) return;
    
    const priceEGP = p42GetListingEGP(listing);
    const priceInternal = priceEGP / rate();
    const myShare = priceInternal * playerShare;
    const herShare = priceInternal * (1 - playerShare);
    const herCash = Number(spouse.netWorth) || 0;
    
    if (herCash < herShare * 0.5) return hint(spouse.name + ' cannot afford ' + Math.round(herShare * rate()).toLocaleString() + ' EGP.');
    const agree = 0.25 + (Number(spouse.generosity) || 0.5) * 0.7;
    if (Math.random() > agree) {
      spouse.bond = Math.max(0, Math.min(100, (Number(spouse.bond) || 50) - 5));
      log(spouse.name + ' refused to share the property purchase.');
      if (typeof p24Popup === 'function') p24Popup(spouse.name + ' refused', '“No, I will not split this. If you want a property, you buy it yourself.”');
      render(); return;
    }
    
    const down = mode === 'mortgage' ? myShare * 0.20 : myShare;
    if (S.wealth < down) return hint('Need ' + Math.round(down * rate()).toLocaleString() + ' EGP available.');
    
    S.wealth -= down;
    spouse.netWorth = Math.max(0, herCash - herShare);
    const id = 'h_shared_' + Math.random().toString(36).slice(2, 8);
    const mortgageInternal = mode === 'mortgage' ? myShare * 0.80 : 0;
    S.ownedHomes = S.ownedHomes || [];
    S.ownedHomes.push({
      id: id, catId: 'shared_custom', name: listing.name,
      value: priceInternal, balance: mortgageInternal,
      cond: listing.condition || 80, rentInc: listing.marketRentRate ? priceInternal * listing.marketRentRate * 12 : priceInternal * 0.003 * 12,
      status: 'vacant', pay: mortgageInternal > 0 ? Math.round(mortgageInternal * 0.08) : 0,
      rate: mortgageInternal > 0 ? (S.mortRate || 0.19) : 0, features: listing.features || [],
      location: listing.location, marketCountry: S.country, typeId: listing.typeId, p12: true,
      coOwnedWith: spouse.id, coOwnedName: spouse.name, playerEquity: playerShare, partnerEquity: 1 - playerShare
    });
    
    if (Array.isArray(S.propertyMarket)) S.propertyMarket = S.propertyMarket.filter(function (x) { return x.id !== listingId; });
    spouse.bond = Math.max(0, Math.min(100, (Number(spouse.bond) || 50) + 8));
    log('Bought ' + listing.name + ' with ' + spouse.name + ' (you ' + Math.round(playerShare * 100) + '%, her ' + Math.round((1 - playerShare) * 100) + '%).');
    if (typeof p24Popup === 'function') {
      p24Popup('Shared property purchased', listing.name + ' is now co-owned with ' + spouse.name + '.\n\nYou contributed ' + Math.round(down * rate()).toLocaleString() + ' EGP (' + Math.round(playerShare * 100) + '% share' + (mode === 'mortgage' ? ', 20% down payment' : ', paid in full') + ')\nShe contributed ' + Math.round(herShare * rate()).toLocaleString() + ' EGP\n' + (mode === 'mortgage' ? 'Mortgage on your share: ' + Math.round(mortgageInternal * rate()).toLocaleString() + ' EGP\n' : ''));
    }
    render();
  };

  /* =================================================================
     PART 9 — UNIVERSITY & EVENTS (File 44)
     ================================================================= */
  const P44_majorList = [
    { id: 'law', label: 'Law', smarts: 60 }, { id: 'business', label: 'Business', smarts: 50 },
    { id: 'medicine', label: 'Medicine', smarts: 75 }, { id: 'cs', label: 'Computer Science', smarts: 60 }, { id: 'biology', label: 'Biology', smarts: 55 }
  ];

  if (typeof EVENTS !== 'undefined') {
    for (let i = EVENTS.length - 1; i >= 0; i--) if (EVENTS[i].id === 'parent_plan') EVENTS.splice(i, 1);
    EVENTS.push({
      id: 'parent_plan', min: 18, max: 19,
      ok: function () { return (typeof parents === 'function' ? parents() : []).length > 0 && S.diploma && !S.uni && !S.degree; },
      title: 'Your parents have a plan',
      text: function () {
        const choices = P44_majorList.filter(function (m) { return S.smarts >= m.smarts - 10; });
        if (!choices.length) return 'Your parents want you to study a subject at a national university and offer to pay the tuition. They are not sure you qualify.';
        const pick = choices[Math.floor(Math.random() * choices.length)];
        S.p44ParentPlanMajor = pick.id; S.p44ParentPlanLabel = pick.label;
        return 'Your parents want you to study ' + pick.label + ' at a national university. They will pay the tuition if you accept. You can also decline and work with your high school diploma.';
      },
      choices: [
        { label: 'Accept their offer (tuition paid)', fx: function () {
          const mid = S.p44ParentPlanMajor || 'law';
          const mj = typeof MAJORS !== 'undefined' ? MAJORS[mid] : null;
          if (S.smarts < (mj ? mj.min : 50)) return { happiness: -2, msg: 'You accepted, but your grades were below the entry requirement. Your parents were disappointed.' };
          S.uni = { type: 'national', major: mid, year: 0, pay: 'parents', scholar: false };
          return { happiness: 5, social: 3, msg: 'You enrolled in ' + (mj ? mj.name : mid) + ' at a national university. Your parents pay the tuition.' };
        }},
        { label: 'No thanks, I will keep my diploma and work', fx: function () {
          (typeof parents === 'function' ? parents() : []).forEach(function (m) { m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) - 2)); });
          return { happiness: 2, msg: 'You declined and kept your high school diploma. Careers are open in the Career tab.' };
        }}
      ]
    });

    const med = EVENTS.find(function (e) { return e.id === 'medical'; });
    if (med && med.choices && !med.choices.some(function (c) { return c.label === 'Ask parents to pay'; })) {
      med.choices.push({
        label: 'Ask parents to pay', cost: function () { return 0; },
        fx: function () {
          if (!(typeof parents === 'function' ? parents() : []).length || S.age >= 25 || S.housing !== 'parents') return { msg: 'Your parents were not available or you are no longer living with them. You had to handle it yourself.' };
          const bill = (typeof p12MedicalBill === 'function') ? p12MedicalBill() : 5000;
          const internal = bill / rate();
          if (S.famWealth >= 1 && Math.random() < 0.7) return { health: 6, msg: 'Your parents covered the bill of ' + Math.round(bill).toLocaleString() + ' EGP. You recovered.' };
          if (S.famWealth === 0 && Math.random() < 0.5) { S.wealth -= internal * 0.5; return { health: 4, wealth: -internal * 0.5, msg: 'Your parents paid part of the bill; you covered the rest.' }; }
          return { health: -5, msg: 'Your parents could not afford the bill. You delayed treatment.' };
        }
      });
    }

    const callEvent = EVENTS.find(function (e) { return e.id === 'p20-family-call'; });
    if (callEvent) {
      callEvent.ok = function () {
        if (!S || !S.family) return false;
        if (S.famWealth >= 2 && S.uni && S.uni.pay === 'parents') return false;
        if (S.famWealth >= 2 && Math.random() < 0.7) return false;
        return S.family.some(function (m) { return m.alive !== false && ['Mother', 'Father', 'Sibling'].indexOf(m.role) !== -1; }) && S.p20CallsAge !== S.age;
      };
    }
  }

  const P44_FACULTY_TO_MAJOR = {
    'Medicine':'medicine', 'Dentistry':'medicine', 'Nursing':'medicine', 'Physical Therapy':'medicine',
    'Engineering':'cs', 'Computers & IT':'cs',
    'Pharmacy':'biology', 'Pharmacy & Biotech':'biology', 'Science':'biology', 'Fisheries':'biology',
    'Business':'business', 'Management':'business', 'Economics':'business', 'Logistics':'business', 'Media':'business', 'Applied Sciences & Arts':'business',
    'Law':'law', 'Arts':'business', 'Humanities':'business', 'Education':'business',
    'Agriculture':'biology'
  };

  if (typeof uniYear === 'function') {
    const _uniYear = uniYear;
    window.uniYear = function (notes, bill) {
      if (S.uni && S.uni.universityId) {
        const u = S.uni;
        const tuition = Math.round((u.annualCostEGP || 10000) * idx());
        const internal = tuition / rate();
        if (u.pay === 'parents') {
          if (!(typeof parents === 'function' ? parents() : []).length || (typeof bestBond === 'function' && bestBond() < 20)) {
            u.pay = 'self'; log('Your parents can no longer pay tuition. You must cover it yourself.');
          } else notes.push('parents paid ' + tuition.toLocaleString() + ' EGP tuition');
        }
        if (u.pay === 'self') {
          if (S.wealth < internal) {
            const shortfall = internal - S.wealth;
            S.loan = (S.loan || 0) + shortfall; S.wealth = 0;
            notes.push('student loan added ' + (typeof money === 'function' ? money(shortfall) : shortfall));
            log('You took a student loan to cover the shortfall of ' + (typeof money === 'function' ? money(shortfall) : shortfall) + '.');
          } else { S.wealth -= internal; bill.tuition = (bill.tuition || 0) + internal; }
        }
        const ef = typeof EFFORT !== 'undefined' ? (EFFORT[S.effort] || EFFORT.coast) : { smarts: 1, happiness: -1, social: 1 };
        const mult = u.type === 'private' ? 1.15 : 1.0;
        fx({ smarts: ef.smarts > 0 ? Math.round(ef.smarts * mult) : ef.smarts, happiness: ef.happiness, social: ef.social + (u.type === 'private' ? 1 : 0) });
        u.year++;
        notes.push('university year ' + u.year + '/' + u.yearsTotal);
        if (u.year >= u.yearsTotal) {
          const majorId = P44_FACULTY_TO_MAJOR[u.faculty] || 'business';
          S.degree = majorId; S.masterField = S.masterField || '';
          S.p44GraduationPopup = { majorLabel: u.faculty, university: u.universityName || 'University', majorId: majorId };
          S.uni = null;
          fx({ happiness: 10, social: 4 });
          log('You graduated from ' + S.p44GraduationPopup.university + ' — Faculty of ' + S.p44GraduationPopup.majorLabel + '.');
          setTimeout(function () {
            if (typeof p24Popup === 'function') p24Popup('🎓 Graduation!', 'You completed your degree at ' + S.p44GraduationPopup.university + '.\nFaculty of ' + S.p44GraduationPopup.majorLabel + '.\n\nYour career options are now open in the Career tab.');
          }, 300);
        }
        return;
      }
      return _uniYear.apply(this, arguments);
    };
  }

  window.p44HoldGraduationParty = function () {
    if (!S || S.age < 18) return hint('Graduation ceremonies are for graduates.');
    if (!S.p44GraduationPopup) return hint('No graduation to celebrate.');
    const cost = Math.round((30000 + Math.random() * 20000) * idx());
    const internal = cost / rate();
    if (S.wealth < internal) return hint('You need ' + cost.toLocaleString() + ' EGP for the graduation party.');
    if (!confirm('Hold a graduation party for about ' + cost.toLocaleString() + ' EGP?')) return;
    S.wealth -= internal; S.expenses = (S.expenses || 0) + internal; S.bill = S.bill || {}; S.bill.graduationParty = (S.bill.graduationParty || 0) + internal;
    const p = S.p44GraduationPopup;
    S.p44GraduationPopup = null;
    fx({ happiness: 10, social: 8 });
    (typeof parents === 'function' ? parents() : []).forEach(function (m) { m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) + 5)); });
    log('You held a graduation party for ' + cost.toLocaleString() + ' EGP. Family and friends celebrated with you.');
    if (typeof p24Popup === 'function') p24Popup('Graduation party', 'You celebrated your graduation from ' + p.university + '. Family and friends shared the moment.');
    render();
  };

  /* =================================================================
     PART 10 — CORE OVERRIDES (Employers, Drama, Core Fixes)
     ================================================================= */
  if (typeof companyListFor === 'function') {
    const P44_extraEgyptEmployers = ['Orascom Construction Engineering', 'Elsewedy Electric', 'Hassan Allam Holding', 'Rowad Modern Engineering', 'Asec Company for Mining', 'Petrojet Engineering Services', 'Enppi Engineering', 'Egyptian Drilling Company', 'Misr Italia Properties', 'Travco Group Hotels', 'Bavarian Auto Group', 'AstraZeneca Egypt'];
    const _companyListFor = companyListFor;
    window.companyListFor = function (country) {
      country = country || S.country;
      let list = _companyListFor(country);
      if (country !== 'egy' || !S) return list;
      const hasEng = S.degree === 'cs' || (S.uni && /Engineering|Computers/i.test(String(S.uni.faculty || '')));
      if (!hasEng) return list;
      const copy = list.slice();
      for (let i = 0; i < 5 && i < copy.length; i++) {
        const i2 = Math.floor(Math.random() * copy.length);
        if (copy[i2] && !copy[i2].p44Renamed) {
          copy[i2] = Object.assign({}, copy[i2]);
          copy[i2].name = P44_extraEgyptEmployers[Math.floor(Math.random() * P44_extraEgyptEmployers.length)];
          copy[i2].p44Renamed = true;
        }
      }
      return copy;
    };
  }

  if (typeof p12PreAgeEvent === 'function') {
    const _p12PreAgeEvent = p12PreAgeEvent;
    window.p12PreAgeEvent = function () {
      const list = _p12PreAgeEvent.apply(this, arguments);
      for (let i = list.length - 1; i >= 0; i--) if (list[i] && String(list[i].id || '').indexOf('p14-family-drama') === 0) list.splice(i, 1);
      if (S.age >= 18 && (typeof parents === 'function' ? parents() : []).length && Math.random() < 0.25) {
        const pArr = (typeof parents === 'function' ? parents() : []);
        const m = pArr[Math.floor(Math.random() * pArr.length)];
        const askType = Math.random();
        let title, text, choices;
        if (askType < 0.5) {
          const amount = Math.round(2000 + Math.random() * 5000 * idx());
          title = m.name + ' is asking for financial help';
          text = m.name + ' says the household is under pressure and asks if you can send ' + amount.toLocaleString() + ' EGP to help with bills.';
          choices = [
            { label: 'Send the money', fx: function () {
              const internal = amount / rate();
              if (S.wealth < internal) return { msg: 'You could not afford it after all.' };
              S.wealth -= internal; m.bond = Math.min(100, (Number(m.bond) || 50) + 8);
              return { wealth: -internal, happiness: 1, msg: 'You sent ' + amount.toLocaleString() + ' EGP. Your parent was relieved.' };
            }},
            { label: 'Send a smaller amount', fx: function () {
              const internal = (amount * 0.4) / rate();
              if (S.wealth < internal) return { msg: 'Even the smaller amount was too much.' };
              S.wealth -= internal; m.bond = Math.min(100, (Number(m.bond) || 50) + 3);
              return { wealth: -internal, msg: 'You sent what you could afford. Your parent understood.' };
            }},
            { label: 'Explain that you cannot help right now', fx: function () { m.bond = Math.max(0, (Number(m.bond) || 50) - 4); return { happiness: -2, msg: 'Your parent was disappointed but said they understood.' }; }}
          ];
        } else if (askType < 0.75) {
          title = m.name + ' wants you to visit';
          text = m.name + ' says it has been a long time and asks when you will come home. They miss you.';
          choices = [
            { label: 'Promise to visit soon', fx: function () { m.bond = Math.min(100, (Number(m.bond) || 50) + 6); return { happiness: 3, msg: 'You promised to visit. Your parent was pleased.' }; }},
            { label: 'Say you are too busy right now', fx: function () { m.bond = Math.max(0, (Number(m.bond) || 50) - 5); return { happiness: -2, msg: 'Your parent sounded hurt. You have been very busy.' }; }}
          ];
        } else {
          title = m.name + ' is worried about your future';
          text = m.name + ' says the family talks about your career and future a lot. They want to know what your plan is.';
          choices = [
            { label: 'Share your plan and reassure them', fx: function () { m.bond = Math.min(100, (Number(m.bond) || 50) + 5); return { happiness: 2, smarts: 1, msg: 'You laid out your plan. Your parent felt reassured.' }; }},
            { label: 'Set a firm boundary — your life, your choices', fx: function () { m.bond = Math.max(0, (Number(m.bond) || 50) - 3); return { happiness: 2, msg: 'You made it clear you are making your own decisions. It was tense but respectful.' }; }},
            { label: 'Argue and leave the conversation', fx: function () { m.bond = Math.max(0, (Number(m.bond) || 50) - 9); return { happiness: -3, social: -1, msg: 'The argument escalated. Everyone went away frustrated.' }; }}
          ];
        }
        list.push({ id: 'p44-family-' + S.age, title: title, text: text, choices: choices });
      }
      return list;
    };
  }

  if (typeof p12SettleRentalYear === 'function') {
    const _rental = p12SettleRentalYear;
    window.p12SettleRentalYear = function () {
      _rental.apply(this, arguments);
      if (!S || !Array.isArray(S.ownedHomes)) return;
      let refund = 0;
      S.ownedHomes.forEach(function (h) {
        if (!h || !h.p12 || h.status !== 'p12-rented') return;
        const val = Math.max(0, Number(h.value) || 0);
        const rent = Math.max(0, Number(h.rentAmount) || 0) * 12;
        const oldMaint = val * ((Number(h.cond) || 100) < 50 ? 0.025 : 0.012);
        const newMaint = rent * 0.10;
        refund += Math.max(0, oldMaint - newMaint);
      });
      if (refund > 0.5) {
        S.wealth += refund; S.expenses = Math.max(0, (S.expenses || 0) - refund);
        if (!S.bill) S.bill = {};
        S.bill.rentalMaintenance = Math.max(0, (S.bill.rentalMaintenance || 0) - refund);
        if (S.yearPopup) S.yearPopup.expenses = Math.max(0, (S.yearPopup.expenses || 0) - refund);
        log('Rental maintenance adjusted to a realistic 10% of collected rent. Refunded ' + (typeof money === 'function' ? money(refund) : Math.round(refund * rate()) + ' EGP') + '.');
      }
    };
  }

  if (typeof p59PayMortgageCustom === 'function') {
    const _p59Custom = p59PayMortgageCustom;
    window.p59PayMortgageCustom = function (homeId) {
      const home = (S.ownedHomes || []).find(function (h) { return h.id === homeId; });
      if (!home) return _p59Custom(homeId);
      const oldBalance = Number(home.balance) || 0;
      const oldPay = Number(home.pay) || 0;
      const result = _p59Custom(homeId);
      const newBalance = Number(home.balance) || 0;
      if (oldPay > 0 && oldBalance > 0 && newBalance < oldBalance && newBalance > 0) {
        const reduction = newBalance / oldBalance;
        const newPay = Math.max(1000, Math.round(oldPay * reduction));
        home.pay = newPay;
        log('🏠 Mortgage annual payment recalculated: ' + Math.round(oldPay * rate()).toLocaleString() + ' → ' + Math.round(newPay * rate()).toLocaleString() + ' EGP/yr.');
      }
      return result;
    };
  }
  if (typeof p59PayMortgageFull === 'function') {
    const _p59Full = p59PayMortgageFull;
    window.p59PayMortgageFull = function (homeId) {
      const home = (S.ownedHomes || []).find(function (h) { return h.id === homeId; });
      if (home) home.pay = 0;
      return _p59Full(homeId);
    };
  }

  window.p42PayNegativeWithCard = function () {
    if (!S || !S.bank || !S.bank.activeCards || !S.bank.activeCards.length) return hint('No credit card available.');
    if (S.wealth >= 0) return hint('Your cash is not negative.');
    const debt = Math.abs(S.wealth);
    const cardId = S.bank.primaryCard || S.bank.activeCards[0];
    const limit = (typeof p38GetLimit === 'function') ? p38GetLimit(cardId) : Math.round((S.income || 0) * 0.25);
    const curr = Number(S.bank.cardDebt[cardId]) || 0;
    if (curr + debt > limit) return hint('Not enough credit room. Card limit ' + (typeof money === 'function' ? money(limit) : limit) + ', current balance ' + (typeof money === 'function' ? money(curr) : curr) + ', needed ' + (typeof money === 'function' ? money(debt) : debt) + '.');
    if (!confirm('Move ' + (typeof money === 'function' ? money(debt) : Math.round(debt * rate()) + ' EGP') + ' of overdraft onto ' + cardId + '?')) return;
    S.bank.cardDebt[cardId] = curr + debt;
    S.wealth = 0;
    log('Moved overdraft to credit card ' + cardId + '.');
    if (typeof realismNotice === 'function') realismNotice('Overdraft moved to credit card', 'You cleared the checking overdraft by borrowing on the card. Card balance is now ' + (typeof money === 'function' ? money(S.bank.cardDebt[cardId]) : S.bank.cardDebt[cardId]) + '.');
    render();
  };

  /* =================================================================
     PART 11 — VIEW INJECTIONS
     ================================================================= */
  function p43WhereDoILive() {
    if (!S) return '';
    const name = S.housing === 'parents' ? "Parents' home" : !S.housing ? 'Homeless — no fixed address' : ((S.ownedHomes || []).find(h => h.id === S.housing)?.name + ' (owned)') || (typeof HOUSING_CATALOG !== 'undefined' ? (HOUSING_CATALOG.find(c => c.id === S.housing && c.kind === 'rent')?.name + ' (rented)') : 'Unknown');
    const status = S.housing === 'parents' ? 'Living with family' : !S.housing ? 'Homeless' : (S.ownedHomes || []).some(h => h.id === S.housing) ? 'Living in your own property' : 'Renting';
    const color = S.housing === 'parents' ? 'var(--cyan)' : !S.housing ? 'var(--rose)' : (S.ownedHomes || []).some(h => h.id === S.housing) ? 'var(--mint)' : 'var(--amber)';
    return '<section class="card" style="padding:12px 14px;border-color:' + color + '"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><span class="muted" style="font-size:.72rem;letter-spacing:.06em">YOU CURRENTLY LIVE IN</span><div style="font-size:1rem;font-weight:600;margin-top:2px">' + name + '</div><span class="muted" style="font-size:.8rem">' + status + '</span></div><span style="font-size:1.8rem">🏠</span></div></section>';
  }

  function p42SharedPropertyPanel() {
    const spouse = (typeof partner === 'function') ? partner() : null;
    if (!spouse || (spouse.stage !== 'engaged' && spouse.stage !== 'married')) return '';
    const market = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket() : [];
    if (!market.length) return '';
    const herEGP = Math.round((Number(spouse.netWorth) || 0) * rate());
    let panel = '<section class="card"><h3>🏠 Buy a property together with ' + spouse.name + '</h3><p class="muted">Egyptian couples often buy a home jointly and split the ownership. She may refuse if she is unwilling to contribute.</p><div class="row"><span>Her available cash</span><b>' + herEGP.toLocaleString() + ' EGP</b></div><div class="row"><span>Her personality</span><b>' + (Number(spouse.generosity) > 0.6 ? 'Generous' : Number(spouse.generosity) < 0.35 ? 'Greedy' : 'Moderate') + '</b></div>';
    market.slice(0, 5).forEach(function (l) {
      const priceEGP = p42GetListingEGP(l);
      panel += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px"><b>' + l.name + '</b> — ' + priceEGP.toLocaleString() + ' EGP<p class="muted" style="font-size:.8rem">' + (l.location || '') + ' · Condition ' + (l.condition || 0) + '%</p><details><summary style="cursor:pointer;color:var(--cyan);font-weight:bold;padding:4px 0">Choose your share & payment method</summary><div style="margin-top:8px">' +
        ['30', '50', '70'].map(function (pct) {
          const share = pct / 100;
          const myEGP = Math.round(priceEGP * share);
          const cashNeeded = myEGP, depNeeded = Math.round(myEGP * 0.20);
          const canCash = Math.round(S.wealth * rate()) >= cashNeeded, canDep = Math.round(S.wealth * rate()) >= depNeeded;
          return '<div style="margin-top:8px;padding:8px;border:1px solid var(--line);border-radius:6px"><b>You ' + pct + '% / Her ' + (100 - Number(pct)) + '%</b> — your share: ' + myEGP.toLocaleString() + ' EGP<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap"><button class="btn" style="flex:1;min-width:140px;font-size:.82rem" ' + (canCash ? '' : 'disabled') + ' onclick="p42BuyTogether(\'' + l.id + '\',' + share + ',\'cash\')">Cash full · ' + cashNeeded.toLocaleString() + ' EGP' + (canCash ? '' : '<small>Not enough cash</small>') + '</button><button class="btn" style="flex:1;min-width:140px;font-size:.82rem" ' + (canDep ? '' : 'disabled') + ' onclick="p42BuyTogether(\'' + l.id + '\',' + share + ',\'mortgage\')">Mortgage · 20% deposit ' + depNeeded.toLocaleString() + ' EGP<small>Bank loan on the rest</small></button></div></div>';
        }).join('') + '</div></details></div>';
    });
    return panel + '</section>';
  }

  const _viewAssets = typeof viewAssets === 'function' ? viewAssets : null;
  if (_viewAssets) {
    window.viewAssets = function () {
      let html = '';
      try { html = _viewAssets.apply(this, arguments); } catch (e) { console.error('[p41] viewAssets:', e); }
      if (!S || S.age < 18) return html;

      // 1. Where Do I Live
      const banner = p43WhereDoILive();
      const firstSectionEnd = html.indexOf('</section>');
      if (firstSectionEnd !== -1) html = html.slice(0, firstSectionEnd + 10) + banner + html.slice(firstSectionEnd + 10);
      else html = banner + html;

      // 2. Parents Home
      if (S.housing === 'parents') {
        const pHome = p60ParentsHomePanel();
        html = html.replace(/<section class="card"><h3>🏠 Your parents' home<\/h3>[\s\S]*?<\/section>/, '');
        const bannerEnd = html.indexOf('</section>', html.indexOf(banner));
        if (bannerEnd !== -1 && pHome) html = html.slice(0, bannerEnd + 10) + pHome + html.slice(bannerEnd + 10);
      }

      // 3. Shared Property Panel
      html = html.replace(/<section class="card">\s*<h3>🏠 Buy a (home|property) together[\s\S]*?<\/section>/g, '');
      html += p42SharedPropertyPanel();

      // 4. Tenant Contract Data
      const homes = (S && Array.isArray(S.ownedHomes)) ? S.ownedHomes : [];
      homes.forEach(function (h) {
        if (!h || !h.name) return;
        const escName = h.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('(<b>' + escName + '<\\/b>[\\s\\S]*?<span class="muted" style="font-size:\\.85rem">Status: <b>)([^<]*)(<\\/b>)');
        const isLive = S.housing === h.id, isRented = h.status === 'p12-rented' && h.tenant, isListed = h.status === 'p12-listed', isVacant = !isLive && !isRented && !isListed;
        const statusLabel = isLive ? '🏠 YOU LIVE HERE' : isRented ? '✅ RENTED OUT — Tenant in place' : isListed ? '⏳ Listed for rent — waiting for tenant' : 'Vacant — no tenant';
        const statusColor = isLive ? 'var(--mint)' : isRented ? 'var(--mint)' : isListed ? 'var(--amber)' : 'var(--rose)';
        
        html = html.replace(re, function (m, pre, old, post) { return pre + '<span style="color:' + statusColor + ';font-weight:700">' + statusLabel + '</span>' + post; });
        if (isRented) {
          const monthlyEGP = Math.round((Number(h.rentLocalAmount) || (Number(h.rentAmount) || 0) * rate()) || 0);
          const contractStart = h.tenantStartYear || gameYear();
          const contractYears = Math.max(0, gameYear() - contractStart);
          const risePct = Number(h.rentStepPct) || 0;
          const detail = '<div style="margin-top:8px;padding:8px 10px;background:rgba(52,211,153,.08);border-left:3px solid var(--mint);border-radius:6px"><b style="font-size:.85rem">Tenant contract</b><div class="row"><span>Monthly rent collected</span><b class="mono">' + monthlyEGP.toLocaleString() + ' EGP</b></div><div class="row"><span>Tenant since</span><b>' + contractStart + ' (' + contractYears + ' year' + (contractYears === 1 ? '' : 's') + ')</b></div><div class="row"><span>Contract annual increase</span><b>' + (risePct > 0 ? risePct + '% per year' : 'Fixed — no increase') + '</b></div><div class="row"><span>Market-adjusted rent (auto)</span><b>' + (h.p23AutoMarketRent ? 'Yes — follows market' : 'No — fixed at your setting') + '</b></div></div>';
          const sPos = html.search(new RegExp('<span style="color:' + statusColor + ';font-weight:700">' + statusLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
          if (sPos !== -1) {
            const aStat = html.indexOf('</span>', sPos);
            if (aStat !== -1) {
              const iPoint = html.indexOf('</div>', aStat + 7) + 6;
              html = html.slice(0, iPoint) + detail + html.slice(iPoint);
            }
          }
        } else if (isVacant) {
          const lossNote = '<div style="margin-top:8px;padding:8px 10px;background:rgba(251,113,133,.08);border-left:3px solid var(--rose);border-radius:6px"><b style="font-size:.85rem">Vacant property — you are losing money</b><p class="muted" style="font-size:.8rem;margin-top:2px">Taxes, maintenance and any mortgage still apply every year. Set a market-based rent and find a tenant as soon as possible.</p></div>';
          const vPos = html.search(new RegExp('<span style="color:var(--rose);font-weight:700">Vacant — no tenant'));
          if (vPos !== -1) {
            const iPoint = html.indexOf('</div>', vPos) + 6;
            html = html.slice(0, iPoint) + lossNote + html.slice(iPoint);
          }
        }
      });
      return html;
    };
  }

  const _viewCareer = typeof viewCareer === 'function' ? viewCareer : null;
  if (_viewCareer) {
    window.viewCareer = function () {
      let html = _viewCareer.apply(this, arguments);
      if (!S || S.age < 18) return html;
      html = html.replace(/<section class="card"[^>]*id="p41-salary-coverage"[\s\S]*?<\/section>/g, '');
      html = html.replace(/<section class="card"><h3>Does your (salary|income) cover your life\?<\/h3>[\s\S]*?<\/section>/g, '');
      
      const income = Number(S.income) || 0, expenses = Number(S.expenses) || 0, salary = S.job ? Number(S.job.salary) || 0 : 0;
      if (salary <= 0 && income <= 0 && expenses <= 0) return html;
      
      const net = income - expenses, coverage = expenses > 0 ? income / expenses : 1;
      const label = coverage >= 1.25 ? 'Comfortable — you are saving money' : coverage >= 1.0 ? 'Just enough — no big cushion' : 'Not enough — you are losing money each year';
      const color = coverage >= 1.25 ? 'var(--mint)' : coverage >= 1.0 ? 'var(--amber)' : 'var(--rose)';
      const advice = coverage >= 1.25 ? 'You have a cushion. Consider saving or investing the surplus instead of upgrading lifestyle.' : coverage >= 1.0 ? 'You are breaking even. One unexpected bill could push you negative.' : 'You need to either earn more (raise, second job, remote work, rent a property) or cut costs (cheaper food, sell a car, reduce family support, cancel insurance).';
      
      const card = '<section class="card" id="p41-salary-coverage"><h3>Does your income cover your life?</h3><div class="row"><span>Yearly income (salary + rent + interest + remote)</span><b class="mono" style="color:var(--mint)">' + (typeof money === 'function' ? money(income) : income) + '</b></div><div class="row"><span>Yearly expenses</span><b class="mono" style="color:var(--rose)">' + (typeof money === 'function' ? money(expenses) : expenses) + '</b></div><div class="row"><span><b>Net this year</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + (typeof money === 'function' ? money(net) : net) + '</b></div><div class="row"><span><b>Status</b></span><b style="color:' + color + '">' + label + '</b></div><p class="muted" style="font-size:.82rem;margin-top:8px">' + advice + '</p></section>';
      return card + html;
    };
  }

  const _viewMoney = typeof viewMoney === 'function' ? viewMoney : null;
  if (_viewMoney) {
    window.viewMoney = function () {
      if (S && S.bill && S.bill.propertyRent) {
        S._p43RentalIncomeNote = (S._p43RentalIncomeNote || 0) + S.bill.propertyRent;
        delete S.bill.propertyRent;
      }
      let html = _viewMoney.apply(this, arguments);
      if (!S || S.age < 18) return html;
      
      if (S && S._p43RentalIncomeNote > 0) {
        html = html.replace('<section class="card"><h3>Last Year Expense Breakdown</h3>', '<section class="card"><h3>Last Year Expense Breakdown</h3><p class="muted" style="font-size:.82rem;margin-bottom:6px">Rental income received from tenants: <b style="color:var(--mint)">+' + (typeof money === 'function' ? money(S._p43RentalIncomeNote) : S._p43RentalIncomeNote) + '</b> (already included in your income above)</p>');
      }
      html = html.replace(/<div class="row"><span>property( )?Rent<\/span><b class="mono" style="color:var\(--rose\)">([^<]+)<\/b><\/div>/g, '<div class="row"><span>property Rent <small class="muted">(maintenance on rentals)</small></span><b class="mono" style="color:var(--rose)">$2</b></div>');
      html = html.replace(/<section class="card"[^>]*id="p41-neg-balance"[\s\S]*?<\/section>/g, '');

      if (S.wealth < 0) {
        const bill = S.bill || {};
        const lines = Object.entries(bill).filter(p => Number(p[1]) > 0).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 6).map(p => '<div class="row"><span>' + p[0].replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()) + '</span><b class="mono" style="color:var(--rose)">' + (typeof money === 'function' ? money(-Number(p[1])) : -Number(p[1])) + '</b></div>').join('');
        const income = Number(S.income) || 0, expenses = Number(S.expenses) || 0, gap = income - expenses;
        const explanation = '<section class="card" style="border-color:var(--rose)" id="p41-neg-balance"><h3>Why your cash is negative</h3><p class="muted">Your cash went below zero because this year\'s expenses were bigger than the money you had plus what you earned. The bills below came out of your account one by one.</p><div class="row"><span><b>Income this year</b></span><b class="mono" style="color:var(--mint)">' + (typeof money === 'function' ? money(income) : income) + '</b></div><div class="row"><span><b>Expenses this year</b></span><b class="mono" style="color:var(--rose)">' + (typeof money === 'function' ? money(expenses) : expenses) + '</b></div><div class="row"><span><b>Yearly gap</b></span><b class="mono" style="color:' + (gap < 0 ? 'var(--rose)' : 'var(--mint)') + '">' + (typeof money === 'function' ? money(gap) : gap) + '</b></div><h4 style="margin-top:12px;font-size:.85rem">Biggest bills</h4>' + lines + '<p class="muted" style="font-size:.8rem;margin-top:10px">To fix this: increase income (job raise, rent out a property, cut lifestyle), or reduce bills (change food to Cheap, cancel insurance, sell a car, cancel family support).</p></section>';
        const overviewEnd = html.indexOf('</section>');
        if (overviewEnd !== -1) html = html.slice(0, overviewEnd + 10) + explanation + html.slice(overviewEnd + 10);
        else html = explanation + html;
        
        if (S.bank && Array.isArray(S.bank.activeCards) && S.bank.activeCards.length) {
          const card = '<section class="card" style="border-color:var(--amber)"><h3>Use credit card to cover overdraft</h3><p class="muted">You can move part or all of your negative balance onto a credit card. This converts the overdraft into a card debt that you can pay off or convert to installments in the Bank tab.</p><button class="btn" onclick="p42PayNegativeWithCard()">Move ' + (typeof money === 'function' ? money(Math.abs(S.wealth)) : Math.abs(S.wealth)) + ' to credit card</button></section>';
          html = card + html;
        }
      }
      return html;
    };
  }

  const _viewSchool = typeof viewSchool === 'function' ? viewSchool : null;
  if (_viewSchool) {
    window.viewSchool = function () {
      let html = _viewSchool.apply(this, arguments);
      if (S && S.country === 'egy' && S.age >= 18 && !S.uni && !S.degree && S.diploma) {
        html = html.replace(/<section class="card"><h3>University Options<\/h3>[\s\S]*?<\/section>/, '');
        html = html.replace(/<section class="card"><h3>Who pays tuition\?<\/h3>[\s\S]*?<\/section>/, '');
        html = html.replace(/<section class="card" style="border:1px solid var\(--cyan\)">\s*<h3>Skip University<\/h3>[\s\S]*?<\/section>/, '');
      }
      if (S && S.p44GraduationPopup) {
        const p = S.p44GraduationPopup;
        html = '<section class="card" style="border-color:var(--violet)"><h3>🎓 Graduation</h3><p class="muted">You graduated from ' + p.university + ' — Faculty of ' + p.majorLabel + '. Would you like to hold a graduation party?</p><button class="btn" onclick="p44HoldGraduationParty()">Hold graduation party · ~' + Math.round(40000 * idx()).toLocaleString() + ' EGP</button><button class="btn" onclick="S.p44GraduationPopup=null;render();">Skip the ceremony</button></section>' + html;
      }
      return html;
    };
  }

  const _viewLove = typeof viewLove === 'function' ? viewLove : null;
  if (_viewLove) {
    window.viewLove = function () {
      let html = _viewLove.apply(this, arguments);
      html = html.replace(/<section class="card">\s*<h3>🏠 Buy a (home|property) together with[\s\S]*?<\/section>/g, '');
      html = html.replace(/<button[^>]*onclick="p35BuyHomeTogether\([^"]*"[^>]*>[\s\S]*?<\/button>/g, '');
      html = html.replace(/onclick="p35SetArrangement\('([^']+)'\)"/g, 'onclick="p41SetArrangement(\'$1\')"');
      
      const spouse = (typeof partner === 'function') ? partner() : null;
      if (spouse && spouse.stage === 'married' && S.marriage && !S.marriage.wifeWorks) {
        html = html.replace(/Her yearly income<\/span><b>[^<]*<\/b>/, 'Her yearly income</span><b>0 EGP (housewife)</b>');
        html = html.replace(/She works<\/span><b>No — housewife<\/b>/, 'She works</span><b>No — housewife</b>');
      }
      html = html.replace(/<button[^>]*onclick="gift\(6\)"[^>]*>Phone or tablet[^<]*<\/button>/, '<button class="btn" onclick="p41OpenShoppingForGift()">Phone or tablet<small>Choose from the Shopping tab</small></button>');
      return html;
    };
  }

  const _render = typeof render === 'function' ? render : null;
  if (_render) {
    window.render = function () {
      const r = _render.apply(this, arguments);
      if (S && S.p60 && S.p60.pendingDeath && S.p60.pendingDeath.length > 0 && !document.getElementById('p24-feedback-modal')) {
        setTimeout(p60ShowPendingDeathPopup, 300);
      }
      return r;
    };
  }

  /* =================================================================
     PART 12 — HOOKS (Age up & Ticks)
     ================================================================= */
  const _ageUp = typeof ageUp === 'function' ? ageUp : null;
  if (_ageUp) {
    window.ageUp = function () {
      const a0 = S && S.age;
      const r = _ageUp.apply(this, arguments);
      if (!S || S.age === a0) return r;
      try { p60ParentMortalityRoll(); } catch (e) { console.error('[p41] mortality:', e); }
      return r;
    };
  }

  const _p52Tick = typeof p52MonthlyTick === 'function' ? p52MonthlyTick : null;
  if (_p52Tick) {
    window.p52MonthlyTick = function () {
      _p52Tick.apply(this, arguments);
      if (!S || S.pacing !== 'monthly') return;
      p41Init(S);
      if (S.p60.homeMaid && S.p60.homeMaidCost > 0) {
        const internal = S.p60.homeMaidCost / rate();
        if (S.wealth >= internal) {
          S.wealth -= internal; S.expenses = (S.expenses || 0) + internal;
          if (!S.bill) S.bill = {}; S.bill.homeMaid = (S.bill.homeMaid || 0) + internal;
        }
      }
    };
  }

  const _p10Year = typeof p10Year === 'function' ? p10Year : null;
  if (_p10Year) {
    window.p10Year = function () {
      const r = _p10Year.apply(this, arguments);
      if (!S || S.pacing === 'monthly') return r;
      p41Init(S);
      if (S.p60.homeMaid && S.p60.homeMaidCost > 0) {
        const annual = S.p60.homeMaidCost * 12;
        const internal = annual / rate();
        if (S.wealth >= internal) {
          S.wealth -= internal; S.expenses = (S.expenses || 0) + internal;
          if (!S.bill) S.bill = {}; S.bill.homeMaid = (S.bill.homeMaid || 0) + internal;
          log('🏠 Paid ' + annual.toLocaleString() + ' EGP for household help at your parents\' home.');
        }
      }
      return r;
    };
  }

  if (typeof GameHooks !== 'undefined' && GameHooks.on) {
    GameHooks.on('year', p41MarriageYearSettlement);
  }

  console.log('[p41] Family & life consolidated (Phase 4) loaded — 5 files → 1.');
})();
