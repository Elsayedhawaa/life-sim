/* =====================================================================
   38. CREDIT LIMIT FIX
   - Card selector: uses ANY card with room, not just the primary
   - Pretty card names in the UI
   - Credit score influences the limit
   - Clear warning when all cards are near limit
   Load AFTER 37-life-integration.js and BEFORE 99-boot.js
   ===================================================================== */

/* ---------- 1. Card catalogs (mirror the banking file) ---------- */
const P38_CARD_NAMES = {
  cashback_everyday:  'Everyday Freedom Cashback Card',
  sapphire_reserve:   'Premier Passport World Elite',
  cib_classic:        'CIB / NBE Classic Credit Card',
  cib_wealth:         'CIB Wealth / HSBC Premier Visa Infinite'
};
function p38CardName(id) {
  return P38_CARD_NAMES[id] || String(id || 'Card').replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/* ---------- 2. Smarter limit: income + card type + credit score ---------- */
function p38GetLimit(cardId) {
  if (!S) return 0;
  const income = (S.job && S.job.salary) ? S.job.salary : (S.income || 0);
  const premium = /premium|wealth|infinite|world|sapphire|signature|platinum/i.test(String(cardId || ''));
  const baseMult = premium ? 0.6 : 0.25;
  const score = Number(S.bank && S.bank.score) || 680;
  /* Score 300 → ×0.4, Score 850 → ×1.4 */
  const scoreMult = Math.max(0.4, Math.min(1.4, 0.4 + (score - 300) / 550));
  return Math.max(500, Math.round(income * baseMult * scoreMult));
}

/* ---------- 3. Pick the best card for a purchase ---------- */
function p38PickCard(amountNeeded) {
  if (!S.bank || !Array.isArray(S.bank.activeCards) || !S.bank.activeCards.length) return null;
  /* Try primary first, then others */
  const ordered = [];
  if (S.bank.primaryCard && S.bank.activeCards.indexOf(S.bank.primaryCard) !== -1) {
    ordered.push(S.bank.primaryCard);
  }
  S.bank.activeCards.forEach(id => { if (ordered.indexOf(id) === -1) ordered.push(id); });

  let best = null, bestRoom = -1;
  ordered.forEach(id => {
    const debt = Number(S.bank.cardDebt[id]) || 0;
    const limit = p38GetLimit(id);
    const room = limit - debt;
    if (room >= amountNeeded && room > bestRoom) {
      best = id; bestRoom = room;
    }
  });
  return best;
}

/* ---------- 4. Override the credit purchase ---------- */
function p38BuyWithCredit(key) {
  if (!S || S.age < 18) return hint('Credit cards require age 18.');
  if (!S.bank || !Array.isArray(S.bank.activeCards) || !S.bank.activeCards.length) {
    return hint('You need a credit card first. Apply in the Bank tab.');
  }
  const it = catalog().find(x => x.key === key);
  if (!it) return hint('Item not found.');

  let add = 0, st = null;
  if (it.cat === 'phone') {
    const sel = $('st_' + key);
    const i = sel ? Number(sel.value) : 0;
    const o = it.sto && it.sto[i] ? it.sto[i] : (it.sto ? it.sto[0] : [0, 0]);
    add = o[1] || 0; st = o[0] || null;
  }
  const total = shopPrice(it, add);

  const card = p38PickCard(total);
  if (!card) {
    /* Show why all cards failed */
    let detail = '';
    S.bank.activeCards.forEach(id => {
      const debt = Number(S.bank.cardDebt[id]) || 0;
      const limit = p38GetLimit(id);
      detail += p38CardName(id) + ': ' + money(debt) + ' / ' + money(limit) + '\n';
    });
    return hint('Not enough credit room on any card for ' + money(total) + '.\n' + detail + 'Pay down a balance or apply for a card with a higher limit in the Bank tab.');
  }

  const currentDebt = Number(S.bank.cardDebt[card]) || 0;
  S.bank.cardDebt[card] = currentDebt + total;

  const portable = PORTABLE.indexOf(it.cat) !== -1;
  const home = portable ? null : targetHome();
  S.inventory.push({
    uid: 'u' + (S.uidN++), key: it.key, cat: it.cat, type: it.type || it.cat,
    model: it.model, price: total, age: it.start || 0, life: it.life,
    hap: it.hap, hp: it.hp, soc: it.soc, tier: it.tier == null ? 1 : it.tier,
    homeId: home, broken: false, insured: false, storage: st, portable: portable
  });
  fx({ happiness: it.hap * 2, social: it.soc * 2 });

  const limit = p38GetLimit(card);
  const roomAfter = limit - S.bank.cardDebt[card];
  log('Charged ' + money(total) + ' to ' + p38CardName(card) + '. New balance: ' + money(S.bank.cardDebt[card]) + ' of ' + money(limit) + '.');
  realismNotice('Charged to credit card', p38CardName(card) + ' — ' + money(total) + '. Balance now ' + money(S.bank.cardDebt[card]) + ' of ' + money(limit) + ' limit. ' + (roomAfter < limit * 0.1 ? 'You are nearly at your credit limit — pay it down soon to avoid fees.' : ''));
  hint();
  render();
}

/* Hook the fix into buyItem */
const P38_buyItemBefore = buyItem;
buyItem = function (key, method) {
  if (method === 'credit') return p38BuyWithCredit(key);
  return P38_buyItemBefore.apply(this, arguments);
};

/* ---------- 5. Bank tab — show pretty names, per-card room ---------- */
const P38_viewBankBefore = viewBank;
viewBank = function () {
  let html = P38_viewBankBefore();
  /* Replace raw IDs in the credit card manager with pretty names */
  Object.keys(P38_CARD_NAMES).forEach(id => {
    html = html.replace(new RegExp('<b>' + id + '</b>', 'g'), '<b>' + P38_CARD_NAMES[id] + '</b>');
  });
  /* Replace raw IDs in the credit-limit hint blocks */
  Object.keys(P38_CARD_NAMES).forEach(id => {
    html = html.replace(new RegExp('Card balance — ' + id, 'g'), 'Card balance — ' + P38_CARD_NAMES[id]);
  });
  /* Replace the "(reading 'X')" style strings everywhere */
  html = html.replace(/cib_classic/g, P38_CARD_NAMES.cib_classic);
  html = html.replace(/cib_wealth/g, P38_CARD_NAMES.cib_wealth);
  html = html.replace(/cashback_everyday/g, P38_CARD_NAMES.cashback_everyday);
  html = html.replace(/sapphire_reserve/g, P38_CARD_NAMES.sapphire_reserve);
  return html;
};

/* ---------- 6. Show "you have X credit room" warning on Shopping page ---------- */
const P38_viewShopBefore = viewShop;
viewShop = function () {
  let html = P38_viewShopBefore();
  if (!S || S.age < 18) return html;
  if (!S.bank || !Array.isArray(S.bank.activeCards) || !S.bank.activeCards.length) return html;

  /* Sum up available room across cards */
  let totalRoom = 0, totalLimit = 0, totalDebt = 0;
  S.bank.activeCards.forEach(id => {
    const debt = Number(S.bank.cardDebt[id]) || 0;
    const limit = p38GetLimit(id);
    totalDebt += debt;
    totalLimit += limit;
    totalRoom += Math.max(0, limit - debt);
  });
  if (totalLimit <= 0) return html;

  const color = totalRoom < totalLimit * 0.1 ? 'var(--rose)' : totalRoom < totalLimit * 0.3 ? 'var(--amber)' : 'var(--mint)';
  const warning = totalRoom < totalLimit * 0.1
    ? 'You are nearly at your credit limit.'
    : totalRoom < totalLimit * 0.3
    ? 'Your credit room is getting low.'
    : 'You have room on your credit cards.';

  const bar = '<section class="card" style="padding:10px 12px;border-color:' + color + '">' +
    '<div class="row" style="border:0"><span>Credit available</span><b class="mono" style="color:' + color + '">' + money(totalRoom) + '</b></div>' +
    '<p class="muted" style="font-size:.78rem;margin-top:2px">' + warning + ' Total debt ' + money(totalDebt) + ' of ' + money(totalLimit) + '.</p>' +
    '</section>';

  return bar + html;
};

/* ---------- 7. Run on load ---------- */
if (S) {
  /* No initial action needed — the fix is in the function overrides above. */
}
