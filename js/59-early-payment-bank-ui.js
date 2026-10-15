/* =====================================================================
   59. EARLY PAYMENT + BANK UI
   - Pay any installment early (custom or full)
   - Pay extra on any mortgage early (custom or full)
   - Fix Money tab "Manage" buttons to show real content in Bank
   - Add a full Debts manager to Bank tab
   Load AFTER 58-certificate-monthly-fix.js and BEFORE 99-boot.js
   ===================================================================== */

function p59Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

function p59AllInstallments() {
  if (!S || !S.bank || !S.bank.installments) return [];
  return Object.entries(S.bank.installments).map(function (pair) {
    return { key: pair[0], data: pair[1] };
  }).filter(function (x) { return x.data && Number(x.data.remaining) > 0.5; });
}

function p59AllMortgages() {
  if (!S || !Array.isArray(S.ownedHomes)) return [];
  return S.ownedHomes.map(function (h, i) { return { idx: i, home: h }; })
    .filter(function (x) { return x.home && Number(x.home.balance) > 0.5; });
}

/* ---------- 1. Pay installment: custom ---------- */
function p59PayInstallmentCustom(key) {
  if (!S || !S.bank || !S.bank.installments || !S.bank.installments[key]) return hint('Not found.');
  const inst = S.bank.installments[key];
  const rate = p59Rate();
  const remainingEGP = Math.round(Number(inst.remaining) * rate);
  const input = prompt('How much to pay early? (Full remaining: ' + remainingEGP.toLocaleString() + ' EGP)', '');
  if (input == null) return;
  const egp = Number(input);
  if (!isFinite(egp) || egp <= 0) return hint('Enter a valid amount.');
  const internal = egp / rate;
  const pay = Math.min(internal, inst.remaining, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash.');
  S.wealth -= pay;
  inst.remaining = Math.max(0, inst.remaining - pay);
  log('💸 Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP early on ' + (inst.name || 'installment') + '. Remaining: ' + Math.round(inst.remaining * rate).toLocaleString() + ' EGP.');
  if (inst.remaining <= 0.5) {
    delete S.bank.installments[key];
    log('✅ ' + (inst.name || 'Installment') + ' fully paid off early.');
  }
  render();
}
window.p59PayInstallmentCustom = p59PayInstallmentCustom;

/* ---------- 2. Pay installment: full ---------- */
function p59PayInstallmentFull(key) {
  if (!S || !S.bank || !S.bank.installments || !S.bank.installments[key]) return hint('Not found.');
  const inst = S.bank.installments[key];
  if (Number(inst.remaining) > S.wealth) return hint('You need ' + money(inst.remaining) + ' to clear this.');
  const amt = inst.remaining;
  S.wealth -= amt;
  delete S.bank.installments[key];
  log('✅ Paid off ' + (inst.name || 'installment') + ' in full (' + money(amt) + ').');
  render();
}
window.p59PayInstallmentFull = p59PayInstallmentFull;

/* ---------- 3. Mortgage: custom early payment ---------- */
function p59PayMortgageCustom(homeId) {
  const home = (S.ownedHomes || []).find(function (h) { return h.id === homeId; });
  if (!home) return hint('Property not found.');
  const bal = Number(home.balance) || 0;
  if (bal <= 0) return hint('No mortgage on this property.');
  const rate = p59Rate();
  const balEGP = Math.round(bal * rate);
  const input = prompt('How much to pay toward the mortgage? (Full balance: ' + balEGP.toLocaleString() + ' EGP)', '');
  if (input == null) return;
  const egp = Number(input);
  if (!isFinite(egp) || egp <= 0) return hint('Enter a valid amount.');
  const internal = egp / rate;
  const pay = Math.min(internal, bal, Math.max(0, S.wealth));
  if (pay <= 0) return hint('Not enough cash.');
  S.wealth -= pay;
  home.balance = Math.max(0, home.balance - pay);
  log('🏠 Paid ' + Math.round(pay * rate).toLocaleString() + ' EGP toward the mortgage on ' + (home.name || 'property') + '. Remaining: ' + Math.round(home.balance * rate).toLocaleString() + ' EGP.');
  if (home.balance <= 0.5) {
    home.balance = 0;
    log('✅ Mortgage on ' + (home.name || 'property') + ' fully paid off!');
  }
  render();
}
window.p59PayMortgageCustom = p59PayMortgageCustom;

/* ---------- 4. Mortgage: full early payoff ---------- */
function p59PayMortgageFull(homeId) {
  const home = (S.ownedHomes || []).find(function (h) { return h.id === homeId; });
  if (!home) return hint('Property not found.');
  const bal = Number(home.balance) || 0;
  if (bal <= 0) return hint('No mortgage on this property.');
  if (bal > S.wealth) return hint('You need ' + money(bal) + ' to clear this mortgage.');
  S.wealth -= bal;
  home.balance = 0;
  log('✅ Mortgage on ' + (home.name || 'property') + ' fully paid off: ' + money(bal) + '.');
  render();
}
window.p59PayMortgageFull = p59PayMortgageFull;

/* ---------- 5. Bank tab: full debts manager ---------- */
const P59_viewBankBefore = viewBank;
viewBank = function () {
  let html = P59_viewBankBefore();
  if (!S || S.age < 18) return html;

  const insts = p59AllInstallments();
  const morts = p59AllMortgages();

  /* Remove any old p59 panel */
  html = html.replace(/<section class="card" id="p59-debts-manager"[\s\S]*?<\/section>/g, '');

  if (!insts.length && !morts.length) return html;

  let card = '<section class="card" id="p59-debts-manager" style="border-color:var(--rose)">' +
    '<h3>💸 Pay off debt early</h3>' +
    '<p class="muted">Have extra cash this month? Pay down debt early to reduce interest and finish sooner.</p>';

  /* Installments */
  if (insts.length) {
    card += '<h4 style="margin-top:12px;color:var(--cyan)">Installment plans</h4>';
    insts.forEach(function (x) {
      const inst = x.data;
      const remaining = Number(inst.remaining) || 0;
      const rate = p59Rate();
      const remEGP = Math.round(remaining * rate);
      const monthlyEGP = Math.round((Number(inst.monthlyPayment) || 0) * rate);
      const canFull = remaining <= S.wealth;

      card += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
        '<b>' + (inst.name || 'Installment') + '</b>' +
        '<div class="row"><span>Remaining</span><b class="mono">' + remEGP.toLocaleString() + ' EGP</b></div>' +
        '<div class="row"><span>Monthly payment</span><b class="mono">' + monthlyEGP.toLocaleString() + ' EGP</b></div>' +
        '<div class="row"><span>Months left</span><b>' + (Number(inst.monthsLeft) || 0) + '</b></div>' +
        '<div class="acts" style="margin-top:6px">' +
        '<button class="btn" onclick="p59PayInstallmentCustom(\'' + x.key + '\')">Pay custom amount</button>' +
        '<button class="btn" ' + (canFull ? '' : 'disabled') + ' onclick="p59PayInstallmentFull(\'' + x.key + '\')">Pay off fully · ' + remEGP.toLocaleString() + ' EGP</button>' +
        '</div></div>';
    });
  }

  /* Mortgages */
  if (morts.length) {
    card += '<h4 style="margin-top:14px;color:var(--cyan)">Home mortgages</h4>';
    morts.forEach(function (x) {
      const home = x.home;
      const bal = Number(home.balance) || 0;
      const rate = p59Rate();
      const balEGP = Math.round(bal * rate);
      const canFull = bal <= S.wealth;

      card += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
        '<b>' + (home.name || 'Property') + '</b>' +
        '<div class="row"><span>Mortgage balance</span><b class="mono">' + balEGP.toLocaleString() + ' EGP</b></div>' +
        '<div class="row"><span>Annual payment</span><b class="mono">' + Math.round((Number(home.pay) || 0) * rate).toLocaleString() + ' EGP/yr</b></div>' +
        '<div class="acts" style="margin-top:6px">' +
        '<button class="btn" onclick="p59PayMortgageCustom(\'' + home.id + '\')">Pay custom amount</button>' +
        '<button class="btn" ' + (canFull ? '' : 'disabled') + ' onclick="p59PayMortgageFull(\'' + home.id + '\')">Pay off fully · ' + balEGP.toLocaleString() + ' EGP</button>' +
        '</div></div>';
    });
  }

  card += '</section>';

  /* Insert after the first section (dashboard) */
  const firstEnd = html.indexOf('</section>');
  if (firstEnd !== -1) {
    return html.slice(0, firstEnd + 10) + card + html.slice(firstEnd + 10);
  }
  return card + html;
};

/* ---------- 6. Money tab: fix "Manage" buttons ---------- */
/* The buttons currently do go('bank') which lands on an empty tab if the bank view
   doesn't show the relevant section. Now the debts manager is always visible. */
const P59_viewMoneyBefore = viewMoney;
viewMoney = function () {
  let html = P59_viewMoneyBefore();
  if (!S || S.age < 18) return html;

  /* Compute debt totals */
  const mortTotal = (S.ownedHomes || []).reduce(function (s, h) {
    return s + Math.max(0, Number(h && h.balance) || 0);
  }, 0);
  let instTotal = 0;
  if (S.bank && S.bank.installments) {
    Object.values(S.bank.installments).forEach(function (i) {
      if (i && Number(i.remaining) > 0) instTotal += Number(i.remaining);
    });
  }

  /* Inject an "Early payment" button next to Manage */
  const earlyBtns = '<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">' +
    (mortTotal > 0 ? '<button class="btn" onclick="go(\'bank\')">Pay mortgage early</button>' : '') +
    (instTotal > 0 ? '<button class="btn" onclick="go(\'bank\')">Pay installments early</button>' : '') +
    '</div>';

  /* Insert after "Debt — actionable" card's first row */
  html = html.replace(
    /(<h3>Debt — actionable<\/h3>[\s\S]*?<div class="row"><span><b>Total owed<\/b><\/span><b[^>]*>[^<]*<\/b><\/div>)/,
    '$1' + earlyBtns
  );
  return html;
};

/* ---------- 7. Init on load ---------- */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    /* Force the debts manager to render any time the Bank tab is shown */
  });
}
