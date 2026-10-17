/* =====================================================================
   28. BANKING CONSOLIDATED — Phase 3.5
   Replaces: 28-global-banking.js, 32-banking-fix-egypt-certificates.js,
             33-debt-display-fix.js, 36-certificate-buy-fix.js,
             38-credit-limit-fix.js, 39-bank-bug-fix.js,
             58-certificate-monthly-fix.js, 59-early-payment-bank-ui.js
   Load AFTER 27-egypt-realism.js and BEFORE 29-egypt-universities.js
   ===================================================================== */

(function p28BankingConsolidated() {
  'use strict';

  function p28Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

  /* =================================================================
     PART 1 — STATE (from 28, 32, 58)
     ================================================================= */
  function p28Init(o) {
    o = o || S;
    if (!o) return;
    if (!o.bank || typeof o.bank !== 'object') {
      o.bank = {
        score: 680,
        savingsBal: 0,
        savingsUSD: 0,
        activeCards: [],
        primaryCard: null,
        cardDebt: {},
        installments: {},
        loans: [],
        missedPmts: 0
      };
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
     PART 2 — CERTIFICATE HELPERS (from 32, 36)
     ================================================================= */
  function p28CertRateNow() { return p28Rate(); }

  function p28GetCertRate(year, tier) {
    /* Egyptian deposit certificate rates (approximate historical) */
    const base = year <= 2020 ? 0.12 : year <= 2022 ? 0.11 : year <= 2024 ? 0.19 : year <= 2026 ? 0.22 : 0.18;
    const tierMult = tier === 'premium' ? 1.05 : 1;
    return base * tierMult;
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
        if (typeof log === 'function') {
          log('📜 ' + (cert.name || 'Certificate') + ' matured. Principal of ' +
              ((Number(cert.principalEGP) || 0)).toLocaleString() + ' EGP returned.');
        }
        if (typeof realismNotice === 'function') {
          realismNotice('Certificate matured',
            (cert.name || 'Certificate') + ' completed its term. Total interest earned: ' +
            Math.round(Number(cert.totalPaid) || 0).toLocaleString() + ' EGP.');
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
        ? hint('You need E£' + principalEGP.toLocaleString() + ' to buy this certificate.')
        : null;
    }
    const now = (typeof gameYear === 'function') ? gameYear() : 2026;
    const ratePerYear = p28GetCertRate(now, tier);
    const rateSchedule = [];
    for (let i = 0; i < years; i++) rateSchedule.push(ratePerYear);
    S.wealth -= principalInternal;
    S.certificates.push({
      id: 'cert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      bank: bank || 'NBE',
      name: name || 'High-yield certificate',
      principalEGP: principalEGP,
      principalInternal: principalInternal,
      yearsTotal: years || 3,
      yearsHeld: 0,
      rateSchedule: rateSchedule,
      totalPaid: 0,
      startedYear: now,
      startedAbsMonth: Number(S.pacingAbsoluteMonth) || 0,
      tier: tier || 'standard',
      matured: false
    });
    if (typeof log === 'function') {
      log('💼 Bought ' + (name || 'certificate') + ' for E£' + principalEGP.toLocaleString() +
          ' (' + (years || 3) + ' years, ' + (ratePerYear * 100).toFixed(1) + '% APY).');
    }
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     PART 3 — CERTIFICATE INTEREST LOGIC (from 58)
     ================================================================= */
  /* In monthly pacing, credit interest via the live-income calc in
     p54. In yearly pacing, credit at year-end and log. */

  function p28ProcessCertificates() {
    p28Init(S);
    if (!S || !S.certificates || !S.certificates.length) return;
    const rate = p28Rate();
    const now = (typeof gameYear === 'function') ? gameYear() : 2026;

    if (S.pacing === 'monthly') {
      /* Only advance yearsHeld and check maturity — interest already credited monthly */
      S.certificates.forEach(function (cert) {
        if (!cert || cert.matured) return;
        if ((cert.yearsHeld || 0) >= (cert.yearsTotal || 3)) return;
        cert.yearsHeld = (cert.yearsHeld || 0) + 1;
      });
      p28MatureCertificates();
      return;
    }

    /* Yearly pacing: credit interest once */
    S.certificates.forEach(function (cert) {
      if (!cert || cert.matured) return;
      const idx = Math.min(cert.yearsHeld || 0, (cert.rateSchedule || []).length - 1);
      const r = (cert.rateSchedule || [])[idx] || 0;
      const annualEGP = (Number(cert.principalEGP) || 0) * r;
      const annualInternal = annualEGP / rate;
      S.wealth += annualInternal;
      S.income = (S.income || 0) + annualInternal;
      cert.totalPaid = (Number(cert.totalPaid) || 0) + annualEGP;
      cert.yearsHeld = (cert.yearsHeld || 0) + 1;
      if (typeof log === 'function') {
        log('📈 ' + (cert.name || 'Certificate') + ' paid E£' +
            Math.round(annualEGP).toLocaleString() + ' in interest.');
      }
    });
    p28MatureCertificates();
  }

  /* Monthly log (interest already credited via p54, just log it) */
  const _p52Tick = p52MonthlyTick;
  p52MonthlyTick = function () {
    _p52Tick.apply(this, arguments);
    if (!S || S.pacing !== 'monthly') return;
    if (!S.certificates || !S.certificates.length) return;
    if (S.age < 18) return;

    let totalEGP = 0;
    S.certificates.forEach(function (c) {
      if (!c || c.matured) return;
      const idx = Math.min(c.yearsHeld || 0, (c.rateSchedule || []).length - 1);
      const r = (c.rateSchedule || [])[idx] || 0;
      const monthlyEGP = ((Number(c.principalEGP) || 0) * r) / 12;
      totalEGP += monthlyEGP;
      c.totalPaid = (Number(c.totalPaid) || 0) + monthlyEGP;
    });

    p28Init(S);
    const key = Number(S.pacingAbsoluteMonth) || 0;
    if (totalEGP > 0 && S.p58.lastCertLogMonth !== key) {
      S.p58.lastCertLogMonth = key;
      if (typeof log === 'function') {
        log('📈 Certificate interest credited this month: +E£' +
            Math.round(totalEGP).toLocaleString() + '.');
      }
    }
  };

  /* =================================================================
     PART 4 — CREDIT CARD HELPERS (from 38, 39)
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

  window.p28PickCard = function (neededAmount) {
    p28Init(S);
    if (!S || !S.bank || !Array.isArray(S.bank.activeCards) || !S.bank.activeCards.length) return null;
    /* Prefer card with enough room */
    for (let i = 0; i < S.bank.activeCards.length; i++) {
      const cid = S.bank.activeCards[i];
      const limit = window.p28GetLimit(cid);
      const debt = Number(S.bank.cardDebt[cid]) || 0;
      if (debt + neededAmount <= limit) return cid;
    }
    /* Otherwise return primary or first */
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
    if (typeof log === 'function') log('Paid off ' + realId + ' in full (' + (typeof money === 'function' ? money(debt) : debt) + '). Credit score improved.');
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
    if (S.bank.cardDebt[realId] === 0) {
      S.bank.score = Math.min(850, (S.bank.score || 680) + 6);
    }
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

  /* Monthly card interest (from 57 code, kept here for the bank) */
  function p28CardMonthlyInterest() {
    p28Init(S);
    if (!S || !S.bank || !S.bank.cardDebt) return;
    const monthlyRate = 0.022;
    let total = 0;
    Object.keys(S.bank.cardDebt).forEach(function (id) {
      const debt = Number(S.bank.cardDebt[id]) || 0;
      if (debt <= 0.01) return;
      const interest = debt * monthlyRate;
      S.bank.cardDebt[id] = debt + interest;
      total += interest;
    });
    if (total > 0.5) {
      if (typeof log === 'function') {
        log('💳 Credit card interest this month: ' + (typeof money === 'function' ? money(total) : total) + ' (2.2%/month).');
      }
    }
  }
  const _p52Tick2 = p52MonthlyTick;
  p52MonthlyTick = function () {
    _p52Tick2.apply(this, arguments);
    if (S && S.age >= 18) p28CardMonthlyInterest();
  };

  /* =================================================================
     PART 5 — EARLY PAYMENT: installments & mortgages (from 59)
     ================================================================= */
  function p28AllInstallments() {
    p28Init(S);
    if (!S || !S.bank || !S.bank.installments) return [];
    return Object.entries(S.bank.installments).map(function (pair) {
      return { key: pair[0], data: pair[1] };
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
    if (typeof log === 'function') log('💸 Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP early on ' + (inst.name || 'installment') + '. Remaining: ' + Math.round(inst.remaining * rate).toLocaleString() + ' EGP.');
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
    if (typeof log === 'function') log('✅ Paid off ' + (inst.name || 'installment') + ' in full (' + (typeof money === 'function' ? money(amt) : amt) + ').');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  window.p28PayMortgageCustom = function (homeId) {
    p28Init(S);
    const home = (S.ownedHomes || []).find(function (h) { return h.id === homeId; });
    if (!home) return;
    const bal = Number(home.balance) || 0;
    if (bal <= 0) return typeof hint === 'function' ? hint('No mortgage on this property.') : null;
    const rate = p28Rate();
    const balEGP = Math.round(bal * rate);
    const input = prompt('How much to pay toward the mortgage? (Full: ' + balEGP.toLocaleString() + ' EGP)', '');
    if (input == null) return;
    const egp = Number(input);
    if (!isFinite(egp) || egp <= 0) return typeof hint === 'function' ? hint('Invalid amount.') : null;
    const internal = egp / rate;
    const pay = Math.min(internal, bal, Math.max(0, S.wealth));
    if (pay <= 0) return typeof hint === 'function' ? hint('Not enough cash.') : null;
    S.wealth -= pay;
    home.balance = Math.max(0, home.balance - pay);
    if (typeof log === 'function') log('🏠 Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP toward the mortgage on ' + (home.name || 'property') + '. Remaining: ' + Math.round(home.balance * rate).toLocaleString() + ' EGP.');
    if (home.balance <= 0.5) {
      home.balance = 0;
      if (typeof log === 'function') log('✅ Mortgage on ' + (home.name || 'property') + ' fully paid off!');
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
    if (typeof log === 'function') log('✅ Mortgage on ' + (home.name || 'property') + ' fully paid off: ' + (typeof money === 'function' ? money(bal) : bal) + '.');
    if (typeof save === 'function') save();
    if (typeof render === 'function') render();
  };

  /* =================================================================
     PART 6 — SHARED ACCOUNT (from 39)
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
    const curEGP = Math.round((S.marriage.sharedBal || 0) * rate);
    const input = prompt('Amount to withdraw (EGP). Available: ' + curEGP.toLocaleString() + ' EGP:', '');
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

  /* Wife savings + shared yield on year */
  function p28ProcessWifeSavings() {
    if (!S || !S.marriage) return;
    const spouse = (typeof partner === 'function') ? partner() : null;
    if (!spouse || spouse.stage !== 'married') return;

    /* Shared account yield */
    if (S.marriage.sharedBank && (S.marriage.sharedBal || 0) > 0) {
      const earned = Math.round(S.marriage.sharedBal * 0.12);
      if (earned > 0) {
        S.marriage.sharedBal += earned;
        S.income = (S.income || 0) + earned;
        if (typeof log === 'function') log('Shared account earned ' + (typeof money === 'function' ? money(earned) : earned) + ' in interest.');
      }
    }
    /* Wife deposits to shared */
    if (S.marriage.sharedBank && S.marriage.wifeWorks) {
      const herIncome = Number(spouse.income) || 0;
      if (herIncome > 0) {
        const saveRate = 0.15 + (Number(spouse.generosity) || 0.5) * 0.25;
        const amt = Math.round(herIncome * saveRate);
        if (amt > 0) {
          S.marriage.sharedBal = (S.marriage.sharedBal || 0) + amt;
          if (typeof log === 'function') log(spouse.name + ' deposited ' + (typeof money === 'function' ? money(amt) : amt) + ' into the shared account.');
        }
      }
    }
    /* Wife personal savings */
    if (S.marriage.wifeWorks) {
      const herIncome = Number(spouse.income) || 0;
      if (herIncome > 0) {
        const saved = Math.round(herIncome * (0.10 + (Number(spouse.generosity) || 0.5) * 0.15));
        spouse.personalSavings = (Number(spouse.personalSavings) || 0) + saved;
        spouse.netWorth = (Number(spouse.netWorth) || 0) + saved;
      }
    } else {
      spouse.netWorth = Math.max(0, (Number(spouse.netWorth) || 0) * 0.94);
    }
  }

  /* =================================================================
     PART 7 — YEARLY TICK — hook into ageUp
     ================================================================= */
  const _ageUp = ageUp;
  ageUp = function () {
    const a0 = S && S.age;
    const r = _ageUp.apply(this, arguments);
    if (!S || S.age === a0) return r;
    try { p28ProcessCertificates(); } catch (e) { console.error('[p28] cert year failed:', e); }
    try { p28ProcessWifeSavings(); } catch (e) { console.error('[p28] wife savings failed:', e); }
    return r;
  };

  /* =================================================================
     PART 8 — viewBank REBUILD (single wrapper, clean)
     ================================================================= */
  const _viewBank = viewBank;
  viewBank = function () {
    let html = '';
    try { html = _viewBank.apply(this, arguments); } catch (e) { console.error('[p28] viewBank chain failed:', e); html = ''; }
    if (!S || S.age < 18) return html;
    p28Init(S);

    const rate = p28Rate();

    /* --- 8a. Add early payment panel with ACTIVE buttons --- */
    const insts = p28AllInstallments();
    const morts = p28AllMortgages();

    if (insts.length || morts.length) {
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
      /* Remove existing p28 panel and prepend our own */
      html = html.replace(/<section class="card"[^>]*id="p28-early-payment"[\s\S]*?<\/section>/g, '');
      html = panel + html;
    }

    /* --- 8b. Credit cards: ensure correct Pay buttons --- */
    (S.bank.activeCards || []).forEach(function (cardId) {
      const debt = Number(S.bank.cardDebt[cardId]) || 0;
      if (debt <= 0) return;
      const debtEGP = Math.round(debt * rate);
      const minEGP = Math.max(500, Math.round(debtEGP * 0.05));
      const canFull = debt <= S.wealth;
      const canMin = minEGP / rate <= S.wealth;
      /* Look for the debt row for this card */
      const escapedId = cardId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rowPattern = new RegExp('(<div class="row"><span>' + escapedId + '[^<]*</span><b class="mono"[^>]*>[^<]*</b></div>)');
      const buttons = '<div class="acts" style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap">' +
        '<button class="btn" ' + (canFull ? '' : 'disabled') + ' onclick="p28PayCardFull(\'' + cardId + '\')">Pay full · ' + debtEGP.toLocaleString() + ' EGP</button>' +
        '<button class="btn" onclick="p28PayCardCustom(\'' + cardId + '\')">Pay custom</button>' +
        '<button class="btn" ' + (canMin ? '' : 'disabled') + ' onclick="p28PayCardMin(\'' + cardId + '\', ' + minEGP + ')">Pay minimum · ' + minEGP.toLocaleString() + ' EGP</button>' +
        '</div>';
      if (rowPattern.test(html)) {
        html = html.replace(rowPattern, '$1' + buttons);
      }
    });

    /* --- 8c. Certificate portfolio summary --- */
    const certs = (S.certificates || []).filter(function (c) { return c && !c.matured; });
    if (certs.length) {
      const principalEGP = certs.reduce(function (s, c) { return s + (Number(c.principalEGP) || 0); }, 0);
      const paidEGP = certs.reduce(function (s, c) { return s + (Number(c.totalPaid) || 0); }, 0);
      const summary = '<section class="card" style="border-color:var(--mint)"><h3>💼 Certificate portfolio</h3>' +
        '<div class="row"><span>Active certificates</span><b>' + certs.length + '</b></div>' +
        '<div class="row"><span>Total principal</span><b class="mono" style="color:var(--mint)">E£' + principalEGP.toLocaleString() + '</b></div>' +
        '<div class="row"><span>Total interest earned</span><b class="mono" style="color:var(--mint)">+E£' + Math.round(paidEGP).toLocaleString() + '</b></div>' +
        '</section>';
      if (html.indexOf('Certificate portfolio') === -1) {
        const anchor = html.indexOf('</section>');
        if (anchor !== -1) html = html.slice(0, anchor + 10) + summary + html.slice(anchor + 10);
        else html = summary + html;
      }
    }

    /* --- 8d. Shared account display --- */
    if (S.marriage && (S.marriage.sharedBal || 0) > 0) {
      const sharedEGP = Math.round(S.marriage.sharedBal * rate);
      const sharedNote = '<p class="muted" style="font-size:.78rem;margin-top:2px">Approximately E£' + sharedEGP.toLocaleString() + ' · earns 12% APY</p>';
      html = html.replace(
        /(<div class="row"><span>Shared balance<\/span><b[^>]*>)([^<]*)(<\/b><\/div>)/,
        function (m, pre, val, post) { return pre + val + post + sharedNote; }
      );
    }

    return html;
  };

  /* =================================================================
     PART 9 — viewMoney REBUILD (debt display clarity)
     ================================================================= */
  const _viewMoney = viewMoney;
  viewMoney = function () {
    let html = '';
    try { html = _viewMoney.apply(this, arguments); } catch (e) { console.error('[p28] viewMoney chain failed:', e); html = ''; }
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
      /* Remove any old p28 debt summary card */
      html = html.replace(/<section class="card"[^>]*id="p28-debt-summary"[\s\S]*?<\/section>/g, '');

      let card = '<section class="card" style="border-color:var(--rose)" id="p28-debt-summary">' +
        '<h3>📱 Active debt</h3>';
      if (cardTotal > 0) {
        card += '<div class="row"><span>Credit cards</span><b class="mono" style="color:var(--rose)">E£' + Math.round(cardTotal * rate).toLocaleString() + '</b></div>';
      }
      if (totalInst > 0) {
        card += '<div class="row"><span>Installments</span><b class="mono" style="color:var(--rose)">E£' + Math.round(totalInst * rate).toLocaleString() + '</b></div>';
      }
      if (totalMort > 0) {
        card += '<div class="row"><span>Mortgages</span><b class="mono" style="color:var(--rose)">E£' + Math.round(totalMort * rate).toLocaleString() + '</b></div>';
      }
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
      /* Insert after Retirement pot row if present, else after Cash */
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
      cardDebt: S && S.bank && S.bank.cardDebt,
      installments: S && S.bank && Object.keys(S.bank.installments || {}).length,
      certificates: S && S.certificates && S.certificates.length,
      certTotalPaid: S && S.certificates && S.certificates.reduce(function (s, c) { return s + (Number(c.totalPaid) || 0); }, 0),
      sharedBal: S && S.marriage && S.marriage.sharedBal
    });
    console.log('viewBank len:', viewBank().length);
    console.log('viewMoney len:', viewMoney().length);
  };

  console.log('[p28] Banking consolidated (Phase 3.5) loaded — 8 files → 1');
})();
