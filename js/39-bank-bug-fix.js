/* =====================================================================
   39. BANK BUG FIX + WIFE SAVINGS
   Fixes:
   - "Pay balance" showing "No balance" while a balance is visible
   - Shared account deposit treating EGP as internal units
   Adds:
   - Wife auto-deposits her savings into the shared account each year
   - Shared account earns yield each year
   Load AFTER 38-credit-limit-fix.js and BEFORE 99-boot.js
   ===================================================================== */

/* ---------- 1. Robust debt lookup ---------- */
function p39FindCardWithDebt(preferredId) {
  if (!S || !S.bank || !S.bank.cardDebt) return null;
  const cd = S.bank.cardDebt;
  if (preferredId && Number(cd[preferredId]) > 0.01) return preferredId;
  const lower = String(preferredId || '').toLowerCase();
  for (const k of Object.keys(cd)) {
    if (k.toLowerCase() === lower && Number(cd[k]) > 0.01) return k;
  }
  /* Any card with debt */
  for (const k of Object.keys(cd)) {
    if (Number(cd[k]) > 0.01) return k;
  }
  return null;
}

/* ---------- 2. Override p37PayCardPrompt with robust lookup ---------- */
function p39PayCardPrompt(cardId) {
  if (!S || !S.bank) return;
  const realId = p39FindCardWithDebt(cardId);
  if (!realId) return hint('No balance on any of your cards.');
  const debt = Number(S.bank.cardDebt[realId]) || 0;
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  const debtEGP = Math.round(debt * rate);
  const input = prompt(
    'How much to pay? (Full balance: ' + debtEGP.toLocaleString() + ' EGP)',
    String(debtEGP)
  );
  if (input == null) return;
  const egp = Number(input);
  if (!isFinite(egp) || egp <= 0) return hint('Invalid amount.');
  const internal = egp / rate;
  const pay = Math.min(internal, debt, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash in your checking account.');
  S.wealth -= pay;
  S.bank.cardDebt[realId] = debt - pay;
  if (S.bank.cardDebt[realId] < 0.5) S.bank.cardDebt[realId] = 0;
  log('Paid ' + money(pay) + ' toward ' + realId + ' balance.');
  if (S.bank.cardDebt[realId] === 0) {
    S.bank.score = Math.min(850, (S.bank.score || 680) + 5);
    log('Card fully paid off. Credit score improved.');
  }
  render();
}

/* Override p37PayCard too */
function p39PayCard(cardId, amount) {
  if (!S || !S.bank) return;
  const realId = p39FindCardWithDebt(cardId);
  if (!realId) return hint('No balance on any of your cards.');
  const debt = Number(S.bank.cardDebt[realId]) || 0;
  const pay = Math.min(amount, debt, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash.');
  S.wealth -= pay;
  S.bank.cardDebt[realId] = debt - pay;
  if (S.bank.cardDebt[realId] < 0.5) S.bank.cardDebt[realId] = 0;
  log('Paid ' + money(pay) + ' toward ' + realId + ' balance.');
  render();
}

/* ---------- 3. Fix shared account deposit/withdraw (EGP → internal) ---------- */
function p39DepositShared() {
  if (!S.marriage) S.marriage = {};
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  const input = prompt('Amount to deposit (EGP):', '');
  if (input == null) return;
  const egp = Number(input);
  if (!isFinite(egp) || egp <= 0) return hint('Invalid amount.');
  const internal = egp / rate;
  if (S.wealth < internal) return hint('Not enough cash. You have ' + money(S.wealth) + ' (about ' + Math.round(S.wealth * rate).toLocaleString() + ' EGP).');
  S.wealth -= internal;
  S.marriage.sharedBal = (S.marriage.sharedBal || 0) + internal;
  log('You deposited ' + egp.toLocaleString() + ' EGP (' + money(internal) + ') into the shared account.');
  realismNotice('Shared deposit', 'Deposited ' + egp.toLocaleString() + ' EGP. Shared balance: ' + egp.toLocaleString() + ' EGP equivalent.');
  render();
}

function p39WithdrawShared() {
  if (!S.marriage) S.marriage = {};
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  const currentEGP = Math.round((S.marriage.sharedBal || 0) * rate);
  const input = prompt('Amount to withdraw (EGP). Available: ' + currentEGP.toLocaleString() + ' EGP:', '');
  if (input == null) return;
  const egp = Number(input);
  if (!isFinite(egp) || egp <= 0) return hint('Invalid amount.');
  const internal = egp / rate;
  if ((S.marriage.sharedBal || 0) < internal) return hint('Not enough in shared account.');
  S.marriage.sharedBal -= internal;
  S.wealth += internal;
  log('You withdrew ' + egp.toLocaleString() + ' EGP from the shared account.');
  render();
}

/* ---------- 4. Wife auto-savings + shared account yield ---------- */
function p39ProcessWifeSavingsAndYield() {
  if (!S) return;
  if (!S.marriage) S.marriage = {};
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || spouse.stage !== 'married') return;

  /* --- Shared account yield (if it has money) --- */
  if (S.marriage.sharedBank && (S.marriage.sharedBal || 0) > 0) {
    const yieldRate = 0.12; /* realistic Egyptian savings yield */
    const earned = Math.round(S.marriage.sharedBal * yieldRate);
    if (earned > 0) {
      S.marriage.sharedBal += earned;
      S.income = (S.income || 0) + earned;
      log('Shared account earned ' + money(earned) + ' in interest this year (' + (yieldRate * 100).toFixed(1) + '%).');
    }
  }

  /* --- Wife deposits her own savings into the shared account --- */
  if (S.marriage.sharedBank && S.marriage.wifeWorks) {
    /* She has some income she can save */
    const herIncome = Number(spouse.income) || 0;
    if (herIncome > 0) {
      /* 15-40% of her income goes to shared savings, based on generosity */
      const saveRate = 0.15 + (spouse.generosity || 0.5) * 0.25;
      const amount = Math.round(herIncome * saveRate);
      if (amount > 0) {
        S.marriage.sharedBal = (S.marriage.sharedBal || 0) + amount;
        log(spouse.name + ' deposited ' + money(amount) + ' from her savings into the shared account.');
      }
    }
  }

  /* --- Wife saves on her own (not shared) even without a shared account --- */
  if (!S.marriage.sharedBank && S.marriage.wifeWorks) {
    const herIncome = Number(spouse.income) || 0;
    if (herIncome > 0) {
      const saved = Math.round(herIncome * (0.10 + (spouse.generosity || 0.5) * 0.15));
      spouse.personalSavings = (spouse.personalSavings || 0) + saved;
      if (saved > 0) {
        log(spouse.name + ' saved ' + money(saved) + ' from her own income this year.');
      }
    }
  }

  /* --- Wife may ask husband for a top-up if she is short --- */
  if (S.marriage.sharedBank && (S.marriage.sharedBal || 0) < 0 && Math.random() < 0.3) {
    /* She is concerned about the shared account being in the negative */
    if (spouse.bond > 40) {
      log(spouse.name + ' noticed the shared account is empty and asked you to keep contributing.');
    }
  }
}

/* Hook into yearly cycle */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('year', p39ProcessWifeSavingsAndYield);
} else {
  const _p39AgeUp = ageUp;
  ageUp = function () {
    const before = S && S.age;
    _p39AgeUp.apply(this, arguments);
    if (S && S.age !== before) try { p39ProcessWifeSavingsAndYield(); } catch (e) {}
  };
}

/* ---------- 5. Republish with fixed names ---------- */
window.p37PayCardPrompt = p39PayCardPrompt;
window.p37PayCard = p39PayCard;
window.p37DepositShared = p39DepositShared;
window.p37WithdrawShared = p39WithdrawShared;

/* Also alias the p35 versions in case older UI calls them */
window.p35DepositShared = p39DepositShared;
window.p35WithdrawShared = p39WithdrawShared;

/* ---------- 6. Bank view: show shared balance in EGP clearly ---------- */
const P39_viewBankBefore = viewBank;
viewBank = function () {
  let html = P39_viewBankBefore();
  if (!S || !S.marriage) return html;
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  const sharedEGP = Math.round((S.marriage.sharedBal || 0) * rate);
  /* Add a small EGP note under shared balance */
  html = html.replace(
    /(<div class="row"><span>Shared balance<\/span><b>)([\s\S]*?)(<\/b><\/div>)/,
    function (m, pre, _val, post) {
      return pre + money(S.marriage.sharedBal || 0) + post
        + '<p class="muted" style="font-size:.78rem;margin-top:2px">Approximately ' + sharedEGP.toLocaleString() + ' EGP · earns 12% APY</p>';
    }
  );
  return html;
};

/* ---------- 7. Run on load ---------- */
if (S) {
  /* nothing to do; the overrides above take effect on next click */
}
