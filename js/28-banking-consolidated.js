/* =====================================================================
   28. BANKING CONSOLIDATED — Phase 3.5 v2
   Replaces: 28-global-banking, 32-banking-fix-egypt-certificates,
             33-debt-display-fix, 36-certificate-buy-fix,
             38-credit-limit-fix, 39-bank-bug-fix,
             58-certificate-monthly-fix, 59-early-payment-bank-ui
   Load AFTER 27-egypt-realism.js and BEFORE 29-egypt-universities.js
   ===================================================================== */

(function p28BankingConsolidated() {
  'use strict';

  function p28Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

  /* =================================================================
     SAFE HOOK INSTALLER — waits for a function to exist, then wraps it.
     ================================================================= */
  function p28Hook(targetName, handler, options) {
    options = options || {};
    const maxWait = options.maxWait || 30000;
    const interval = options.interval || 80;

    function install() {
      const target = window[targetName];
      if (typeof target !== 'function') return false;
      if (target.__p28Hooked === true) return true;
      const wrapped = function () {
        const r = target.apply(this, arguments);
        try { handler.apply(this, arguments); } catch (e) { console.error('[p28] hook ' + targetName + ' failed:', e); }
        return r;
      };
      wrapped.__p28Hooked = true;
      wrapped.__p28Original = target;
      window[targetName] = wrapped;
      return true;
    }

    if (install()) return true;
    const start = Date.now();
    const timer = setInterval(function () {
      if (install()) { clearInterval(timer); return; }
      if (Date.now() - start > maxWait) {
        clearInterval(timer);
        console.warn('[p28] gave up waiting for ' + targetName);
      }
    }, interval);
    return false;
  }

  /* =================================================================
     PART 1 — STATE
     ================================================================= */
  function p28Init(o) {
    o = o || S;
    if (!o) return;
    if (!o.bank || typeof o.bank !== 'object') {
      o.bank = { score: 680, savingsBal: 0, savingsUSD: 0, activeCards: [],
                 primaryCard: null, cardDebt: {}, installments: {}, loans: [], missedPmts: 0 };
    }
    if (!Array.isArray(o.bank.activeCards)) o.bank.activeCards = [];
    if (!o.bank.cardDebt || typeof o.bank.cardDebt !== 'object') o.bank.cardDebt = {};
    if (!o.bank.installments || typeof o.bank.installments !== 'object') o.bank.installments = {};
    if (!Array.isArray(o.bank.loans)) o.bank.loans = [];
    if (typeof o.bank.score !== 'number') o.bank.score = 680;
    if (typeof o.bank.savingsBal !== 'number') o.bank.savingsBal = 0;
    if (!Array.isArray(o.certificates)) o.certificates = [];
    if (!o.p58) o.p58 = { lastCertLogMonth: -1 };
    if (typeof o.p58.lastCertLogMonth !== 'number') o.p58.lastCertLogMonth = -1;
  }
  const _migrate = migrate;
  migrate = function (o) { const r = _migrate(o); p28Init(r); return r; };
  const _newGame = newGame;
  newGame = function () { _newGame.apply(this, arguments); p28Init(S); };
  p28Init(S);

  /* =================================================================
     PART 2 — CERTIFICATE HELPERS
     ================================================================= */
  function p28GetCertRate(year, tier) {
    const base = year <= 2020 ? 0.12 : year <= 2022 ? 0.11 : year <= 2024 ? 0.19 : year <= 2026 ? 0.22 : 0.18;
    return base * (tier === 'premium' ? 1.05 : 1);
  }

  function p28MatureCertificates() {
    if (!S || !Array.isArray(S.certificates)) return;
    const now = (typeof gameYear === 'function') ? gameYear() : 2026;
    const rate = p28Rate();
    S.certificates = S.certificates.filter(function (cert) {
      if (!cert || cert.matured) return false;
      const startYear = Number(cert.startedYear) || now;
      const yearsTotal = Number(cert.yearsTotal) || 3;
      if (now - startYear >= yearsTotal) {
        const principalInternal = Number(cert.principalInternal) || ((Number(cert.principalEGP) || 0) / rate);
        S.wealth += principalInternal;
        if (typeof log === 'function') log('📜 ' + (cert.name || 'Certificate') + ' matured. Principal returned.');
        if (typeof realismNotice === 'function') {
          realismNotice('Certificate matured', (cert.name || 'Certificate') + ' completed. Total interest earned: E£' +
            Math.round(Number(cert.totalPaid) || 0).toLocaleString() + '.');
        }
        return false;
      }
      return true;
    });
  }

  window.p28BuyCertificate = function (bank, name, principalEGP, years, tier) {
    if (!S || S.age < 18) return (typeof hint === 'function' ? hint('Available from age 18.') : null);
    p28Init(S);
    const rate = p28Rate();
    const principalInternal = principalEGP / rate;
    if (S.wealth < principalInternal) {
      return typeof hint === 'function'
        ? hint('You need E£' + principalEGP.toLocaleString() + ' to buy this certificate.') : null;
    }
    const now = (typeof gameYear === 'function') ? gameYear() : 2026;
    const ratePerYear = p28GetCertRate(now, tier);
    const schedule = [];
    for (let i = 0; i < years; i++) schedule.push(ratePerYear);
    S.wealth -= principalInternal;
    S.certificates.push({
      id: 'cert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      bank: bank || 'NBE',
      name: name || 'High-yield certificate',
      principalEGP: principalEGP,
      principalInternal: principalInternal,
      yearsTotal: years || 3,
      yearsHeld: 0,
      rateSchedule: schedule,
      totalPaid: 0,
      startedYear: now,
      startedAbsMonth: Number(S.pacingAbsoluteMonth) || 0,
      tier: tier || 'standard',
      matured: false
    });
    if (typeof log === 'function') log('💼 Bought ' + (name || 'certificate') + ' for E£' + principalEGP.toLocaleString() +
      ' (' + years + ' years, ' + (ratePerYear * 100).toFixed(1) + '% APY).');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     PART 3 — CERTIFICATE PROCESSING
     ================================================================= */
  function p28ProcessCertificates() {
    p28Init(S);
    if (!S || !S.certificates || !S.certificates.length) return;
    const rate = p28Rate();

    if (S.pacing === 'monthly') {
      S.certificates.forEach(function (cert) {
        if (!cert || cert.matured) return;
        if ((cert.yearsHeld || 0) >= (cert.yearsTotal || 3)) return;
        cert.yearsHeld = (cert.yearsHeld || 0) + 1;
      });
      p28MatureCertificates();
      return;
    }

    S.certificates.forEach(function (cert) {
      if (!cert || cert.matured) return;
      const idx = Math.min(cert.yearsHeld || 0, (cert.rateSchedule || []).length - 1);
      const r = (cert.rateSchedule || [])[idx] || 0;
      const annualEGP = (Number(cert.principalEGP) || 0) * r;
      const internal = annualEGP / rate;
      S.wealth += internal;
      S.income = (S.income || 0) + internal;
      cert.totalPaid = (Number(cert.totalPaid) || 0) + annualEGP;
      cert.yearsHeld = (cert.yearsHeld || 0) + 1;
      if (typeof log === 'function') log('📈 ' + (cert.name || 'Certificate') + ' paid E£' +
        Math.round(annualEGP).toLocaleString() + ' in interest.');
    });
    p28MatureCertificates();
  }

  /* Monthly cert log (interest already credited by p54's live income) */
  function p28MonthlyCertLog() {
    if (!S || S.pacing !== 'monthly') return;
    if (!S.certificates || !S.certificates.length) return;
    if (S.age < 18) return;
    let totalEGP = 0;
    S.certificates.forEach(function (c) {
      if (!c || c.matured) return;
      const idx = Math.min(c.yearsHeld || 0, (c.rateSchedule || []).length - 1);
      const r = (c.rateSchedule || [])[idx] || 0;
      const m = ((Number(c.principalEGP) || 0) * r) / 12;
      totalEGP += m;
      c.totalPaid = (Number(c.totalPaid) || 0) + m;
    });
    p28Init(S);
    const key = Number(S.pacingAbsoluteMonth) || 0;
    if (totalEGP > 0 && S.p58.lastCertLogMonth !== key) {
      S.p58.lastCertLogMonth = key;
      if (typeof log === 'function') log('📈 Certificate interest credited this month: +E£' +
        Math.round(totalEGP).toLocaleString() + '.');
    }
  }

  /* Card monthly interest */
  function p28CardMonthlyInterest() {
    p28Init(S);
    if (!S || !S.bank || !S.bank.cardDebt) return;
    let total = 0;
    Object.keys(S.bank.cardDebt).forEach(function (id) {
      const debt = Number(S.bank.cardDebt[id]) || 0;
      if (debt <= 0.01) return;
      const interest = debt * 0.022;
      S.bank.cardDebt[id] = debt + interest;
      total += interest;
    });
    if (total > 0.5 && typeof log === 'function') {
      log('💳 Credit card interest this month: ' + (typeof money === 'function' ? money(total) : total) + ' (2.2%/month).');
    }
  }

  /* Install via safe hook installer (waits for 52 to load) */
  p28Hook('p52MonthlyTick', function () {
    p28MonthlyCertLog();
    if (S && S.age >= 18) p28CardMonthlyInterest();
  });

  /* =================================================================
     PART 4 — CREDIT CARD HELPERS
     ================================================================= */
  window.p28GetLimit = function (cardId) {
    p28Init(S);
    if (!S) return 500;
    const income = (S.job && S.job.salary) || S.income || 0;
    const base = Math.max(500, Math.round(income * 0.25));
    const score = S.bank.score || 680;
    const mult = score >= 750 ? 1.5 : score >= 700 ? 1.2 : score >= 650 ? 1.0 : 0.7;
    return Math.round(base * mult);
  };

  window.p28PickCard = function (needed) {
    p28Init(S);
    if (!S || !S.bank || !Array.isArray(S.bank.activeCards) || !S.bank.activeCards.length) return null;
    for (let i = 0; i < S.bank.activeCards.length; i++) {
      const cid = S.bank.activeCards[i];
      const limit = window.p28GetLimit(cid);
      const debt = Number(S.bank.cardDebt[cid]) || 0;
      if (debt + needed <= limit) return cid;
    }
    return S.bank.primaryCard || S.bank.activeCards[0];
  };

  function p28FindCardWithDebt(preferredId) {
    p28Init(S);
    if (!S || !S.bank || !S.bank.cardDebt) return null;
    const cd = S.bank.cardDebt;
    if (preferredId && Number(cd[preferredId]) > 0.01) return preferredId;
    const lower = String(preferredId || '').toLowerCase();
    for (const k of Object.keys(cd)) {
      if (k.toLowerCase() === lower && Number(cd[k]) > 0.01) return k;
    }
    for (const k of Object.keys(cd)) {
      if (Number(cd[k]) > 0.01) return k;
    }
    return null;
  }

  window.p28PayCardFull = function (cardId) {
    p28Init(S);
    const realId = p28FindCardWithDebt(cardId);
    if (!realId) return typeof hint === 'function' ? hint('No balance on any card.') : null;
    const debt = Number(S.bank.cardDebt[realId]) || 0;
    if (S.wealth < debt) return typeof hint === 'function' ? hint('Not enough cash.') : null;
    S.wealth -= debt;
    S.bank.cardDebt[realId] = 0;
    S.bank.score = Math.min(850, (S.bank.score || 680) + 8);
    if (typeof log === 'function') log('Paid off ' + realId + ' in full. Credit score improved.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p28PayCardCustom = function (cardId) {
    p28Init(S);
    const realId = p28FindCardWithDebt(cardId);
    if (!realId) return typeof hint === 'function' ? hint('No balance.') : null;
    const debt = Number(S.bank.cardDebt[realId]) || 0;
    const rate = p28Rate();
    const debtEGP = Math.round(debt * rate);
    const input = prompt('How much to pay? (Full: ' + debtEGP.toLocaleString() + ' EGP)', String(debtEGP));
    if (input == null) return;
    const egp = Number(input);
    if (!isFinite(egp) || egp <= 0) return typeof hint === 'function' ? hint('Invalid amount.') : null;
    const internal = egp / rate;
    const pay = Math.min(internal, debt, Math.max(0, S.wealth));
    if (pay <= 0) return typeof hint === 'function' ? hint('Not enough cash.') : null;
    S.wealth -= pay;
    S.bank.cardDebt[realId] = Math.max(0, debt - pay);
    if (S.bank.cardDebt[realId] < 0.5) S.bank.cardDebt[realId] = 0;
    if (typeof log === 'function') log('Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP toward ' + realId + '.');
    if (S.bank.cardDebt[realId] === 0) S.bank.score = Math.min(850, (S.bank.score || 680) + 6);
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p28PayCardMin = function (cardId, minEGP) {
    p28Init(S);
    const realId = p28FindCardWithDebt(cardId);
    if (!realId) return;
    const debt = Number(S.bank.cardDebt[realId]) || 0;
    const rate = p28Rate();
    const internal = minEGP / rate;
    if (S.wealth < internal) return typeof hint === 'function' ? hint('You need E£' + minEGP.toLocaleString() + '.') : null;
    S.wealth -= internal;
    S.bank.cardDebt[realId] = Math.max(0, debt - internal);
    if (typeof log === 'function') log('Paid minimum E£' + minEGP.toLocaleString() + ' on ' + realId + '.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     PART 5 — INSTALLMENT / MORTGAGE EARLY PAYMENT
     ================================================================= */
  function p28AllInstallments() {
    p28Init(S);
    if (!S || !S.bank || !S.bank.installments) return [];
    return Object.entries(S.bank.installments).map(function (p) {
      return { key: p[0], data: p[1] };
    }).filter(function (x) { return x.data && Number(x.data.remaining) > 0.5; });
  }

  function p28AllMortgages() {
    p28Init(S);
    if (!S || !Array.isArray(S.ownedHomes)) return [];
    return S.ownedHomes.map(function (h, i) { return { idx: i, home: h }; })
      .filter(function (x) { return x.home && Number(x.home.balance) > 0.5; });
  }

  window.p28PayInstallmentCustom = function (key) {
    p28Init(S);
    if (!S.bank.installments[key]) return typeof hint === 'function' ? hint('Not found.') : null;
    const inst = S.bank.installments[key];
    const rate = p28Rate();
    const remEGP = Math.round(Number(inst.remaining) * rate);
    const input = prompt('How much to pay early? (Full: ' + remEGP.toLocaleString() + ' EGP)', '');
    if (input == null) return;
    const egp = Number(input);
    if (!isFinite(egp) || egp <= 0) return typeof hint === 'function' ? hint('Invalid amount.') : null;
    const internal = egp / rate;
    const pay = Math.min(internal, inst.remaining, Math.max(0, S.wealth));
    if (pay <= 0) return typeof hint === 'function' ? hint('Not enough cash.') : null;
    S.wealth -= pay;
    inst.remaining = Math.max(0, inst.remaining - pay);
    if (typeof log === 'function') log('💸 Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP early. Remaining: ' +
      Math.round(inst.remaining * rate).toLocaleString() + ' EGP.');
    if (inst.remaining <= 0.5) {
      delete S.bank.installments[key];
      if (typeof log === 'function') log('✅ ' + (inst.name || 'Installment') + ' fully paid off.');
    }
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p28PayInstallmentFull = function (key) {
    p28Init(S);
    if (!S.bank.installments[key]) return;
    const inst = S.bank.installments[key];
    if (Number(inst.remaining) > S.wealth) return typeof hint === 'function' ? hint('Not enough cash.') : null;
    const amt = inst.remaining;
    S.wealth -= amt;
    delete S.bank.installments[key];
    if (typeof log === 'function') log('✅ Paid off ' + (inst.name || 'installment') + ' in full.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p28PayMortgageCustom = function (homeId) {
    p28Init(S);
    const home = (S.ownedHomes || []).find(function (h) { return h.id === homeId; });
    if (!home) return;
    const bal = Number(home.balance) || 0;
    if (bal <= 0) return typeof hint === 'function' ? hint('No mortgage.') : null;
    const rate = p28Rate();
    const balEGP = Math.round(bal * rate);
    const input = prompt('How much to pay? (Full: ' + balEGP.toLocaleString() + ' EGP)', '');
    if (input == null) return;
    const egp = Number(input);
    if (!isFinite(egp) || egp <= 0) return typeof hint === 'function' ? hint('Invalid amount.') : null;
    const internal = egp / rate;
    const pay = Math.min(internal, bal, Math.max(0, S.wealth));
    if (pay <= 0) return typeof hint === 'function' ? hint('Not enough cash.') : null;
    S.wealth -= pay;
    home.balance = Math.max(0, home.balance - pay);
    if (typeof log === 'function') log('🏠 Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP toward mortgage. Remaining: ' +
      Math.round(home.balance * rate).toLocaleString() + ' EGP.');
    if (home.balance <= 0.5) {
      home.balance = 0;
      if (typeof log === 'function') log('✅ Mortgage fully paid off!');
    }
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p28PayMortgageFull = function (homeId) {
    p28Init(S);
    const home = (S.ownedHomes || []).find(function (h) { return h.id === homeId; });
    if (!home) return;
    const bal = Number(home.balance) || 0;
    if (bal <= 0) return;
    if (bal > S.wealth) return typeof hint === 'function' ? hint('Not enough cash.') : null;
    S.wealth -= bal;
    home.balance = 0;
    if (typeof log === 'function') log('✅ Mortgage fully paid off.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     PART 6 — SHARED ACCOUNT
     ================================================================= */
  window.p28DepositShared = function () {
    if (!S.marriage) S.marriage = {};
    const rate = p28Rate();
    const input = prompt('Amount to deposit (EGP):', '');
    if (input == null) return;
    const egp = Number(input);
    if (!isFinite(egp) || egp <= 0) return typeof hint === 'function' ? hint('Invalid amount.') : null;
    const internal = egp / rate;
    if (S.wealth < internal) return typeof hint === 'function' ? hint('Not enough cash.') : null;
    S.wealth -= internal;
    S.marriage.sharedBal = (S.marriage.sharedBal || 0) + internal;
    if (typeof log === 'function') log('You deposited E£' + egp.toLocaleString() + ' into the shared account.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p28WithdrawShared = function () {
    if (!S.marriage) S.marriage = {};
    const rate = p28Rate();
    const cur = Math.round((S.marriage.sharedBal || 0) * rate);
    const input = prompt('Amount to withdraw (EGP). Available: ' + cur.toLocaleString() + ' EGP:', '');
    if (input == null) return;
    const egp = Number(input);
    if (!isFinite(egp) || egp <= 0) return typeof hint === 'function' ? hint('Invalid amount.') : null;
    const internal = egp / rate;
    if ((S.marriage.sharedBal || 0) < internal) return typeof hint === 'function' ? hint('Not enough in shared account.') : null;
    S.marriage.sharedBal -= internal;
    S.wealth += internal;
    if (typeof log === 'function') log('You withdrew E£' + egp.toLocaleString() + ' from the shared account.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  function p28WifeSavings() {
    if (!S || !S.marriage) return;
    const spouse = (typeof partner === 'function') ? partner() : null;
    if (!spouse || spouse.stage !== 'married') return;
    if (S.marriage.sharedBank && (S.marriage.sharedBal || 0) > 0) {
      const earned = Math.round(S.marriage.sharedBal * 0.12);
      if (earned > 0) {
        S.marriage.sharedBal += earned;
        S.income = (S.income || 0) + earned;
        if (typeof log === 'function') log('Shared account earned ' + (typeof money === 'function' ? money(earned) : earned) + ' in interest.');
      }
    }
    if (S.marriage.sharedBank && S.marriage.wifeWorks) {
      const herInc = Number(spouse.income) || 0;
      if (herInc > 0) {
        const rate = 0.15 + (Number(spouse.generosity) || 0.5) * 0.25;
        const amt = Math.round(herInc * rate);
        if (amt > 0) {
          S.marriage.sharedBal = (S.marriage.sharedBal || 0) + amt;
          if (typeof log === 'function') log(spouse.name + ' deposited ' + (typeof money === 'function' ? money(amt) : amt) + ' into the shared account.');
        }
      }
    }
    if (S.marriage.wifeWorks) {
      const herInc = Number(spouse.income) || 0;
      if (herInc > 0) {
        const saved = Math.round(herInc * (0.10 + (Number(spouse.generosity) || 0.5) * 0.15));
        spouse.personalSavings = (Number(spouse.personalSavings) || 0) + saved;
        spouse.netWorth = (Number(spouse.netWorth) || 0) + saved;
      }
    } else {
      spouse.netWorth = Math.max(0, (Number(spouse.netWorth) || 0) * 0.94);
    }
  }

  /* =================================================================
     PART 7 — YEARLY HOOK (ageUp is defined in 05, so safe to wrap now)
     ================================================================= */
  const _ageUp = ageUp;
  ageUp = function () {
    const a0 = S && S.age;
    const r = _ageUp.apply(this, arguments);
    if (!S || S.age === a0) return r;
    try { p28ProcessCertificates(); } catch (e) { console.error('[p28] cert year:', e); }
    try { p28WifeSavings(); } catch (e) { console.error('[p28] wife savings:', e); }
    return r;
  };

  /* =================================================================
     PART 8 — viewBank WRAPPER
     ================================================================= */
  const _viewBank = viewBank;
  viewBank = function () {
    let html = '';
    try { html = _viewBank.apply(this, arguments); } catch (e) { console.error('[p28] viewBank chain:', e); html = ''; }
    if (!S || S.age < 18) return html;
    p28Init(S);
    const rate = p28Rate();

    /* Early payment panel */
    const insts = p28AllInstallments();
    const morts = p28AllMortgages();
    if (insts.length || morts.length) {
      html = html.replace(/<section class="card"[^>]*id="p28-early-payment"[\s\S]*?<\/section>/g, '');
      let panel = '<section class="card" style="border-color:var(--rose)" id="p28-early-payment">' +
        '<h3>💸 Pay off debt early</h3>' +
        '<p class="muted">Have extra cash? Pay down debt early to reduce interest and finish sooner.</p>';
      if (insts.length) {
        panel += '<h4 style="margin-top:12px;color:var(--cyan);font-size:.9rem">Installment plans</h4>';
        insts.forEach(function (x) {
          const inst = x.data;
          const remEGP = Math.round(Number(inst.remaining) * rate);
          const monthlyEGP = Math.round((Number(inst.monthlyPayment) || 0) * rate);
          const canFull = Number(inst.remaining) <= S.wealth;
          panel += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
            '<b>' + (inst.name || 'Installment') + '</b>' +
            '<div class="row"><span>Remaining</span><b class="mono">' + remEGP.toLocaleString() + ' EGP</b></div>' +
            '<div class="row"><span>Monthly</span><b class="mono">' + monthlyEGP.toLocaleString() + ' EGP</b></div>' +
            '<div class="acts" style="margin-top:6px">' +
            '<button class="btn" onclick="p28PayInstallmentCustom(\'' + x.key + '\')">Pay custom amount</button>' +
            '<button class="btn" ' + (canFull ? '' : 'disabled') + ' onclick="p28PayInstallmentFull(\'' + x.key + '\')">Pay off fully · ' + remEGP.toLocaleString() + ' EGP</button>' +
            '</div></div>';
        });
      }
      if (morts.length) {
        panel += '<h4 style="margin-top:14px;color:var(--cyan);font-size:.9rem">Home mortgages</h4>';
        morts.forEach(function (x) {
          const home = x.home;
          const balEGP = Math.round((Number(home.balance) || 0) * rate);
          const canFull = Number(home.balance) <= S.wealth;
          panel += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
            '<b>' + (home.name || 'Property') + '</b>' +
            '<div class="row"><span>Balance</span><b class="mono">' + balEGP.toLocaleString() + ' EGP</b></div>' +
            '<div class="acts" style="margin-top:6px">' +
            '<button class="btn" onclick="p28PayMortgageCustom(\'' + home.id + '\')">Pay custom amount</button>' +
            '<button class="btn" ' + (canFull ? '' : 'disabled') + ' onclick="p28PayMortgageFull(\'' + home.id + '\')">Pay off fully · ' + balEGP.toLocaleString() + ' EGP</button>' +
            '</div></div>';
        });
      }
      panel += '</section>';
      html = panel + html;
    }

    /* Per-card debt buttons */
    (S.bank.activeCards || []).forEach(function (cardId) {
      const debt = Number(S.bank.cardDebt[cardId]) || 0;
      if (debt <= 0) return;
      const debtEGP = Math.round(debt * rate);
      const minEGP = Math.max(500, Math.round(debtEGP * 0.05));
      const canFull = debt <= S.wealth;
      const canMin = (minEGP / rate) <= S.wealth;
      const escapedId = cardId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rowRe = new RegExp('(<div class="row"><span>' + escapedId + '[^<]*</span><b class="mono"[^>]*>[^<]*</b></div>)');
      const buttons = '<div class="acts" style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="btn" ' + (canFull ? '' : 'disabled') + ' onclick="p28PayCardFull(\'' + cardId + '\')">Pay full · ' + debtEGP.toLocaleString() + ' EGP</button>' +
        '<button class="btn" onclick="p28PayCardCustom(\'' + cardId + '\')">Pay custom</button>' +
        '<button class="btn" ' + (canMin ? '' : 'disabled') + ' onclick="p28PayCardMin(\'' + cardId + '\', ' + minEGP + ')">Pay minimum · ' + minEGP.toLocaleString() + ' EGP</button>' +
        '</div>';
      if (rowRe.test(html)) html = html.replace(rowRe, '$1' + buttons);
    });

    /* Certificate portfolio summary */
    const certs = (S.certificates || []).filter(function (c) { return c && !c.matured; });
    if (certs.length && html.indexOf('Certificate portfolio') === -1) {
      const principalEGP = certs.reduce(function (s, c) { return s + (Number(c.principalEGP) || 0); }, 0);
      const paidEGP = certs.reduce(function (s, c) { return s + (Number(c.totalPaid) || 0); }, 0);
      const summary = '<section class="card" style="border-color:var(--mint)"><h3>💼 Certificate portfolio</h3>' +
        '<div class="row"><span>Active certificates</span><b>' + certs.length + '</b></div>' +
        '<div class="row"><span>Total principal</span><b class="mono" style="color:var(--mint)">E£' + principalEGP.toLocaleString() + '</b></div>' +
        '<div class="row"><span>Total interest earned</span><b class="mono" style="color:var(--mint)">+E£' + Math.round(paidEGP).toLocaleString() + '</b></div>' +
        '</section>';
      const anchor = html.indexOf('</section>');
      if (anchor !== -1) html = html.slice(0, anchor + 10) + summary + html.slice(anchor + 10);
      else html = summary + html;
    }

    /* Shared account note */
    if (S.marriage && (S.marriage.sharedBal || 0) > 0) {
      const sharedEGP = Math.round(S.marriage.sharedBal * rate);
      const note = '<p class="muted" style="font-size:.78rem;margin-top:2px">Approximately E£' + sharedEGP.toLocaleString() + ' · earns 12% APY</p>';
      html = html.replace(
        /(<div class="row"><span>Shared balance<\/span><b[^>]*>)([^<]*)(<\/b><\/div>)/,
        function (m, pre, val, post) { return pre + val + post + note; }
      );
    }

    return html;
  };

  /* =================================================================
     PART 9 — viewMoney WRAPPER
     ================================================================= */
  const _viewMoney = viewMoney;
  viewMoney = function () {
    let html = '';
    try { html = _viewMoney.apply(this, arguments); } catch (e) { console.error('[p28] viewMoney chain:', e); html = ''; }
    if (!S || S.age < 18) return html;

    const rate = p28Rate();
    const insts = p28AllInstallments();
    const morts = p28AllMortgages();
    let cardTotal = 0;
    Object.values(S.bank.cardDebt || {}).forEach(function (v) {
      if (isFinite(v) && v > 0) cardTotal += Number(v);
    });

    const totalInst = insts.reduce(function (s, x) { return s + Number(x.data.remaining || 0); }, 0);
    const totalMort = morts.reduce(function (s, x) { return s + Number(x.home.balance || 0); }, 0);
    const totalDebt = totalInst + totalMort + cardTotal;

    if (totalDebt > 0.01) {
      html = html.replace(/<section class="card"[^>]*id="p28-debt-summary"[\s\S]*?<\/section>/g, '');
      let card = '<section class="card" style="border-color:var(--rose)" id="p28-debt-summary">' +
        '<h3>📱 Active debt</h3>';
      if (cardTotal > 0) card += '<div class="row"><span>Credit cards</span><b class="mono" style="color:var(--rose)">E£' + Math.round(cardTotal * rate).toLocaleString() + '</b></div>';
      if (totalInst > 0) card += '<div class="row"><span>Installments</span><b class="mono" style="color:var(--rose)">E£' + Math.round(totalInst * rate).toLocaleString() + '</b></div>';
      if (totalMort > 0) card += '<div class="row"><span>Mortgages</span><b class="mono" style="color:var(--rose)">E£' + Math.round(totalMort * rate).toLocaleString() + '</b></div>';
      card += '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>Total owed</b></span><b class="mono" style="color:var(--rose);font-size:1rem">E£' + Math.round(totalDebt * rate).toLocaleString() + '</b></div>' +
        '<button class="btn" style="margin-top:8px" onclick="go(\'bank\')">Manage in Bank tab</button></section>';
      const anchor = html.indexOf('</section>');
      if (anchor !== -1) html = html.slice(0, anchor + 10) + card + html.slice(anchor + 10);
      else html = card + html;
    }

    /* Certificate summary */
    const certs = (S.certificates || []).filter(function (c) { return c && !c.matured; });
    if (certs.length) {
      const earnedEGP = certs.reduce(function (s, c) { return s + (Number(c.totalPaid) || 0); }, 0);
      let monthlyProj = 0;
      certs.forEach(function (c) {
        const idx = Math.min(c.yearsHeld || 0, (c.rateSchedule || []).length - 1);
        const r = (c.rateSchedule || [])[idx] || 0;
        monthlyProj += ((Number(c.principalEGP) || 0) * r) / 12;
      });
      const certRows = '<div class="row"><span>Certificate interest earned (to date)</span>' +
        '<b class="mono" style="color:var(--mint)">+E£' + Math.round(earnedEGP).toLocaleString() + '</b></div>' +
        (monthlyProj > 0 ? '<div class="row"><span>Certificate income (projected)</span>' +
          '<b class="mono" style="color:var(--mint)">+E£' + Math.round(monthlyProj).toLocaleString() + '/month</b></div>' : '');
      const anchor = /(<div class="row"><span>Retirement pot<\/span><b[^>]*>[^<]*<\/b><\/div>)/;
      if (anchor.test(html)) html = html.replace(anchor, '$1' + certRows);
    }

    return html;
  };

  /* =================================================================
     PART 10 — DIAGNOSTICS
     ================================================================= */
  window.p28Diag = function () {
    console.log('=== p28 banking diag ===');
    console.log({
      bankScore: S && S.bank && S.bank.score,
      savingsBal: S && S.bank && S.bank.savingsBal,
      activeCards: S && S.bank && S.bank.activeCards.length,
      installments: S && S.bank && Object.keys(S.bank.installments || {}).length,
      certificates: S && S.certificates && S.certificates.length,
      certTotalPaid: S && S.certificates && S.certificates.reduce(function (s, c) { return s + (Number(c.totalPaid) || 0); }, 0),
      monthlyTickExists: typeof p52MonthlyTick === 'function',
      monthlyTickHooked: typeof p52MonthlyTick === 'function' && p52MonthlyTick.__p28Hooked === true,
      viewBankLen: (typeof viewBank === 'function') ? viewBank().length : 0,
      viewMoneyLen: (typeof viewMoney === 'function') ? viewMoney().length : 0
    });
  };

  console.log('[p28] Banking consolidated (Phase 3.5) v2 loaded — 8 files → 1');
})();
/* =====================================================================
   28-B. BANKING UI RESTORE
   Restores the certificate purchase panel and credit card application
   panel that were lost when 32/33/36/38/39/58/59 were consolidated.
   ===================================================================== */

(function p28bBankingUI() {
  'use strict';

  function rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

  /* ----------------------------------------------------------------
     Certificate products
     ---------------------------------------------------------------- */
  const CERT_PRODUCTS = [
    { id: 'nbe_1y',    bank: 'NBE',          name: 'NBE 1-Year CD',              years: 1, min: 1000,  apy: 0.19 },
    { id: 'nbe_3y',    bank: 'NBE',          name: 'NBE 3-Year CD',              years: 3, min: 1000,  apy: 0.22 },
    { id: 'nbe_5y',    bank: 'NBE',          name: 'NBE 5-Year CD (premium)',    years: 5, min: 50000, apy: 0.23 },
    { id: 'cib_3y',    bank: 'CIB',          name: 'CIB 3-Year Premium CD',      years: 3, min: 10000, apy: 0.24 },
    { id: 'alex_2y',   bank: 'AlexBank',     name: 'AlexBank 2-Year CD',         years: 2, min: 5000,  apy: 0.20 },
    { id: 'misr_3y',   bank: 'Banque Misr',  name: 'Banque Misr 3-Year CD',      years: 3, min: 5000,  apy: 0.21 },
    { id: 'cib_5y',    bank: 'CIB',          name: 'CIB 5-Year High-Yield',      years: 5, min: 100000, apy: 0.25 }
  ];

  window.p28bPromptBuyCert = function (productId) {
    if (!S) return;
    const p = CERT_PRODUCTS.find(function (x) { return x.id === productId; });
    if (!p) return;
    const r = rate();
    const cashEGP = Math.round(S.wealth * r);
    const input = prompt(
      'Buy "' + p.name + '"\n\n' +
      'Bank: ' + p.bank + '\n' +
      'Term: ' + p.years + ' year(s)\n' +
      'APY: ' + (p.apy * 100).toFixed(2) + '%\n' +
      'Minimum: E£' + p.min.toLocaleString() + '\n\n' +
      'You have E£' + cashEGP.toLocaleString() + '.\n' +
      'How much do you want to deposit?',
      String(p.min)
    );
    if (input == null) return;
    const amt = Number(input);
    if (!isFinite(amt) || amt < p.min) return hint('Minimum is E£' + p.min.toLocaleString());
    if (amt > cashEGP) return hint('You only have E£' + cashEGP.toLocaleString());

    const internal = amt / r;
    const schedule = [];
    for (let i = 0; i < p.years; i++) schedule.push(p.apy);
    const now = (typeof gameYear === 'function') ? gameYear() : 2026;

    S.wealth -= internal;
    S.certificates = S.certificates || [];
    S.certificates.push({
      id: 'cert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      bank: p.bank,
      name: p.name,
      principalEGP: amt,
      principalInternal: internal,
      yearsTotal: p.years,
      yearsHeld: 0,
      rateSchedule: schedule,
      totalPaid: 0,
      startedYear: now,
      startedAbsMonth: Number(S.pacingAbsoluteMonth) || 0,
      tier: p.min >= 50000 ? 'premium' : 'standard',
      matured: false
    });

    if (typeof log === 'function') log('💼 Bought ' + p.name + ' for E£' + amt.toLocaleString() +
      ' (' + p.years + ' years, ' + (p.apy * 100).toFixed(2) + '% APY).');
    if (typeof realismNotice === 'function') realismNotice('Certificate purchased',
      p.name + ' at ' + p.bank + ' — E£' + amt.toLocaleString() + ' for ' + p.years + ' years at ' +
      (p.apy * 100).toFixed(2) + '% APY.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* ----------------------------------------------------------------
     Credit card products
     ---------------------------------------------------------------- */
  const CARD_PRODUCTS = [
    { id: 'basic',     name: 'Basic Visa',           minIncome: 30000,  limitMult: 0.15, rate: 0.025, minScore: 500 },
    { id: 'gold',      name: 'Gold Visa',            minIncome: 80000,  limitMult: 0.25, rate: 0.022, minScore: 620 },
    { id: 'platinum',  name: 'Platinum Mastercard',  minIncome: 200000, limitMult: 0.40, rate: 0.020, minScore: 700 },
    { id: 'signature', name: 'Signature Visa',       minIncome: 500000, limitMult: 0.60, rate: 0.018, minScore: 750 }
  ];

  window.p28bApplyCard = function (productId) {
    if (!S) return;
    const p = CARD_PRODUCTS.find(function (x) { return x.id === productId; });
    if (!p) return;
    const r = rate();
    const incomeEGP = Math.round(((S.job && S.job.salary) || S.income || 0) * r);
    const score = (S.bank && S.bank.score) || 680;

    if (incomeEGP < p.minIncome) return hint('This card requires E£' + p.minIncome.toLocaleString() + '/yr income.');
    if (score < p.minScore) return hint('This card requires a credit score of ' + p.minScore + '+.');

    const cardId = p.name.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now().toString(36).slice(-4);
    S.bank.activeCards = S.bank.activeCards || [];
    S.bank.cardDebt = S.bank.cardDebt || {};
    S.bank.activeCards.push(cardId);
    S.bank.cardDebt[cardId] = 0;
    if (!S.bank.primaryCard) S.bank.primaryCard = cardId;

    const limitEGP = Math.round(incomeEGP * p.limitMult);
    if (typeof log === 'function') log('💳 Approved for ' + p.name + '. Limit: E£' + limitEGP.toLocaleString() + '.');
    if (typeof realismNotice === 'function') realismNotice('Credit card approved',
      p.name + ' — limit E£' + limitEGP.toLocaleString() + '.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* ----------------------------------------------------------------
     Panels
     ---------------------------------------------------------------- */
  function certPanel() {
    if (!S || S.age < 18) return '';
    const r = rate();
    const cashEGP = Math.round(S.wealth * r);

    const productRows = CERT_PRODUCTS.map(function (p) {
      const canBuy = cashEGP >= p.min;
      return '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
        '<div style="min-width:0;flex:1"><b>' + p.name + '</b>' +
        '<div class="muted" style="font-size:.75rem;margin-top:2px">' + p.bank + ' · ' + p.years + ' yr · min E£' + p.min.toLocaleString() + '</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0">' +
        '<div class="mono" style="font-size:.95rem;color:var(--mint);font-weight:700">' + (p.apy * 100).toFixed(2) + '%</div>' +
        '<div class="muted" style="font-size:.68rem">APY</div>' +
        '</div></div>' +
        '<button class="btn" style="margin-top:8px" ' + (canBuy ? '' : 'disabled') +
        ' onclick="p28bPromptBuyCert(\'' + p.id + '\')">' +
        (canBuy ? 'Buy certificate' : 'Need E£' + p.min.toLocaleString()) +
        '</button></div>';
    }).join('');

    const certs = (S.certificates || []).filter(function (c) { return c && !c.matured; });
    const now = (typeof gameYear === 'function') ? gameYear() : 2026;

    const certRows = certs.length ? certs.map(function (c) {
      const yearsIn = Math.max(0, now - (c.startedYear || now));
      const remaining = Math.max(0, (c.yearsTotal || 3) - yearsIn);
      const idx = Math.min(c.yearsHeld || 0, (c.rateSchedule || []).length - 1);
      const rr = (c.rateSchedule || [])[idx] || 0;
      const monthlyEGP = ((Number(c.principalEGP) || 0) * rr) / 12;
      return '<div style="margin-top:10px;padding:10px;background:rgba(52,211,153,.06);border-radius:8px">' +
        '<b>' + (c.name || 'Certificate') + '</b> <span class="muted" style="font-size:.75rem">· ' + (c.bank || 'Bank') + '</span>' +
        '<div class="row" style="padding:3px 0"><span>Principal</span><b class="mono">E£' + (Number(c.principalEGP) || 0).toLocaleString() + '</b></div>' +
        '<div class="row" style="padding:3px 0"><span>Earns</span><b class="mono" style="color:var(--mint)">+E£' + Math.round(monthlyEGP).toLocaleString() + '/month</b></div>' +
        '<div class="row" style="padding:3px 0"><span>Term progress</span><b>Year ' + (yearsIn + 1) + ' of ' + (c.yearsTotal || 3) + ' (' + remaining + ' to go)</b></div>' +
        '<div class="row" style="padding:3px 0"><span>Total interest earned</span><b class="mono" style="color:var(--mint)">+E£' + Math.round(Number(c.totalPaid) || 0).toLocaleString() + '</b></div>' +
        '</div>';
    }).join('') : '<p class="muted" style="font-size:.82rem;margin-top:8px">You have no active certificates.</p>';

    return '<section class="card" style="border-color:var(--mint)" id="p28b-cert-panel">' +
      '<h3>💼 Deposit certificates</h3>' +
      '<p class="muted" style="font-size:.82rem">Fixed-term deposits at Egyptian banks. Higher APY than savings. Money locked for the term.</p>' +
      '<h4 style="font-size:.85rem;margin-top:12px;color:var(--cyan)">Available products</h4>' +
      productRows +
      '<h4 style="font-size:.85rem;margin-top:16px;color:var(--cyan)">Your certificates</h4>' +
      certRows +
      '</section>';
  }

  function cardPanel() {
    if (!S || S.age < 18) return '';
    const r = rate();
    const score = (S.bank && S.bank.score) || 680;
    const incomeEGP = Math.round(((S.job && S.job.salary) || S.income || 0) * r);

    const owned = (S.bank && S.bank.activeCards) || [];
    const ownedRows = owned.length ? owned.map(function (cid) {
      const limit = (typeof window.p28GetLimit === 'function') ? window.p28GetLimit(cid) : 500;
      const debt = Number(S.bank.cardDebt[cid]) || 0;
      const debtEGP = Math.round(debt * r);
      const limitEGP = Math.round(limit * r);
      const util = limit > 0 ? Math.round((debt / limit) * 100) : 0;
      return '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
        '<b>' + cid + '</b>' +
        '<div class="row" style="padding:3px 0"><span>Balance / limit</span><b class="mono">E£' + debtEGP.toLocaleString() + ' / E£' + limitEGP.toLocaleString() + '</b></div>' +
        '<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-top:6px"><div style="height:100%;width:' + util + '%;background:' + (util > 70 ? 'var(--rose)' : util > 40 ? 'var(--amber)' : 'var(--mint)') + '"></div></div>' +
        '<div class="muted" style="font-size:.72rem;margin-top:4px">' + util + '% utilized</div>' +
        '</div>';
    }).join('') : '<p class="muted" style="font-size:.82rem;margin-top:8px">You have no credit cards.</p>';

    const productRows = CARD_PRODUCTS.map(function (p) {
      const incomeOK = incomeEGP >= p.minIncome;
      const scoreOK = score >= p.minScore;
      const eligible = incomeOK && scoreOK;
      const limitEGP = Math.round(incomeEGP * p.limitMult);
      let reason = '';
      if (!incomeOK) reason = 'Need E£' + p.minIncome.toLocaleString() + '/yr income';
      else if (!scoreOK) reason = 'Need score ' + p.minScore + '+';
      return '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
        '<div style="min-width:0;flex:1"><b>' + p.name + '</b>' +
        '<div class="muted" style="font-size:.75rem;margin-top:2px">Min income E£' + p.minIncome.toLocaleString() + ' · ' + (p.rate * 100).toFixed(1) + '%/mo interest</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0"><div class="mono" style="font-size:.85rem">≈ E£' + limitEGP.toLocaleString() + '</div>' +
        '<div class="muted" style="font-size:.68rem">limit</div></div></div>' +
        (eligible
          ? '<button class="btn" style="margin-top:8px" onclick="p28bApplyCard(\'' + p.id + '\')">Apply for card</button>'
          : '<p style="color:var(--rose);font-size:.75rem;margin-top:6px">' + reason + '</p>') +
        '</div>';
    }).join('');

    return '<section class="card" style="border-color:var(--violet)" id="p28b-card-panel">' +
      '<h3>💳 Credit cards</h3>' +
      '<p class="muted" style="font-size:.82rem">Credit score: <b>' + score + '</b> · Income: E£' + incomeEGP.toLocaleString() + '/yr</p>' +
      '<h4 style="font-size:.85rem;margin-top:12px;color:var(--cyan)">Your cards</h4>' +
      ownedRows +
      '<h4 style="font-size:.85rem;margin-top:16px;color:var(--cyan)">Available products</h4>' +
      productRows +
      '</section>';
  }

  /* ----------------------------------------------------------------
     Wire into viewBank
     ---------------------------------------------------------------- */
  const _viewBank = viewBank;
  viewBank = function () {
    let html = _viewBank.apply(this, arguments);
    if (!S || S.age < 18) return html;
    /* Remove any previous injection */
    html = html.replace(/<section class="card"[^>]*id="p28b-cert-panel"[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*id="p28b-card-panel"[\s\S]*?<\/section>/g, '');
    /* Insert at the TOP so they are prominent */
    return cardPanel() + certPanel() + html;
  };

  /* ----------------------------------------------------------------
     Diagnostics
     ---------------------------------------------------------------- */
  window.p28bDiag = function () {
    console.log({
      hasCertPanel: typeof window.p28bPromptBuyCert === 'function',
      hasCardPanel: typeof window.p28bApplyCard === 'function',
      certs: S && S.certificates && S.certificates.length,
      cards: S && S.bank && S.bank.activeCards && S.bank.activeCards.length,
      bankScore: S && S.bank && S.bank.score,
      viewBankLen: (typeof viewBank === 'function') ? viewBank().length : 0
    });
  };

  console.log('[p28-B] Certificate purchase + credit card UI restored');
})();
