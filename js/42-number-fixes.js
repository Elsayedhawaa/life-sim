/* =====================================================================
   42. NUMBER FIXES ROUND 2
   Fixes:
   - Family requests showing wrong affordability (typed 101k, asked for 387k)
   - Shared property prices absurd (100M+ EGP for a 2-bedroom)
   - Shared property needed cash/installment/mortgage options
   - Negative cash with no explanation
   - Rent income vs rent expense ambiguity
   Load AFTER 41-family-marriage-gift-fix.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. HELPER ============ */
function p42Rate() { return (typeof rateNow === 'function') ? rateNow() : 1; }
function p42Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }

/* ============ 2. FAMILY REQUEST — clean EGP handling ============ */
/* Override p14RespondFamilyNeed — the request always lives in EGP */
p14RespondFamilyNeed = function (send) {
  const r = (typeof p14RequestState === 'function') ? p14RequestState() : null;
  if (!r) return hint('No pending family request.');
  const m = r.m;

  if (!send) {
    if (m) m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) - 7));
    fx({ happiness: -3 });
    log('You declined ' + r.name + '\'s request for ' + r.reason + '.');
    if (r.kind === 'parent') S.parentNeed = null; else S.familyNeed = null;
    render();
    return;
  }

  const input = document.getElementById('p14-family-request-amount');
  const egpInput = Number(input && input.value);
  if (!isFinite(egpInput) || egpInput < 0) return hint('Enter a valid amount.');

  /* EGP → internal USD */
  const transfer = egpInput / p42Rate();
  const fee = S.country !== (S.home || S.country) ? transfer * 0.025 : 0;
  const total = transfer + fee;

  if (total > S.wealth) {
    const haveEGP = Math.round(S.wealth * p42Rate());
    return hint('You cannot afford ' + Math.round(egpInput * (1 + (fee > 0 ? 0.025 : 0))).toLocaleString() + ' EGP including fees. You have ' + haveEGP.toLocaleString() + ' EGP.');
  }

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
  hint();
  render();
};

/* The suggestion amount is in EGP too — override the base */
p14SuggestedFamilyNeed = function (reason, familyTier, year, country) {
  country = country || 'egy';
  const r = String(reason || '').toLowerCase();
  const t = Math.max(0, Math.min(2, Number(familyTier) || 0));
  const table = [
    [4500, 18000, 55000],
    [1800, 5500, 15000],
    [2500, 10000, 45000],
    [7000, 30000, 100000],
    [3000, 12000, 45000],
    [2500, 8000, 24000],
    [2500, 8500, 25000]
  ];
  let pick = table[6];
  if (/hospital|treatment|medical|medication|medicine/.test(r)) pick = table[0];
  else if (/grocery|food/.test(r)) pick = table[1];
  else if (/school|education|fees/.test(r)) pick = table[2];
  else if (/wedding|event/.test(r)) pick = table[3];
  else if (/repair|plumbing|roof/.test(r)) pick = table[4];
  else if (/rent|bill|utility|electric|gas/.test(r)) pick = table[5];
  const base = pick[t];
  if (country === 'egy') return Math.round(base * p42Idx());
  /* Non-Egypt: rough USD */
  return Math.round(base / 52.7);
};

/* Force the modal display to show EGP clearly */
const P42_showParentRequestModal = p14ShowParentRequestModal;
p14ShowParentRequestModal = function () {
  if (!S || S.pending || S.yearPopup) return;
  const r = (typeof p14RequestState === 'function') ? p14RequestState() : null;
  const existing = document.getElementById('p14-parent-request-modal');
  if (!r) { if (existing) existing.remove(); return; }
  let el = existing;
  if (!el) { el = document.createElement('div'); el.id = 'p14-parent-request-modal'; el.style.cssText = 'position:fixed;inset:0;z-index:10001;background:rgba(2,2,10,.82);display:flex;align-items:center;justify-content:center;padding:16px;'; document.body.appendChild(el); }

  const reqEGP = Math.round(Number(r.amountInternal) * p42Rate());
  const suggested = Math.min(reqEGP, Math.round(S.wealth * p42Rate()));
  el.innerHTML = '<div style="background:#14141f;color:#e8e8f2;border:1px solid #51416e;border-radius:16px;padding:20px;max-width:480px;width:100%;max-height:86vh;overflow:auto;box-shadow:0 18px 60px #0009">' +
    '<div style="font-size:.75rem;letter-spacing:.08em;color:#22d3ee;font-weight:700">FAMILY MESSAGE · ' + gameYear() + '</div>' +
    '<h2 style="font-size:1.45rem;margin:8px 0">' + r.name + ' asks for your help</h2>' +
    '<p style="line-height:1.5;margin-bottom:10px">They need help with <b>' + r.reason + '</b>. The requested amount is <b>' + reqEGP.toLocaleString() + ' EGP</b>.</p>' +
    '<label for="p14-family-request-amount" class="muted">Amount you choose to send (EGP)</label>' +
    '<input id="p14-family-request-amount" type="number" min="0" step="100" value="' + suggested + '" style="width:100%;margin:8px 0 12px;padding:12px;background:#0b0b12;color:#e8e8f2;border:1px solid #35354b;border-radius:10px;font:inherit">' +
    '<p class="muted" style="font-size:.8rem">You may send the full amount, a smaller amount, or nothing. ' +
    (S.country !== (S.home || S.country) ? 'An estimated 2.5% transfer fee applies when sending internationally.' : '') +
    '</p>' +
    '<div class="acts"><button class="btn" style="text-align:center;background:#8b5cf6" onclick="p14RespondFamilyNeed(true)">Send chosen amount</button>' +
    '<button class="btn" style="text-align:center" onclick="p14RespondFamilyNeed(false)">Decline for now</button></div></div>';
};

/* ============ 3. SHARED PROPERTY — fix prices + add financing ============ */
/* The base game exposes p12PropertyMarket() with priceInternal in internal units.
   We display it as EGP and offer cash / installment / mortgage options. */

function p42GetListingEGP(l) {
  /* Try the internal unit and convert. Fall back to the category price if needed. */
  let internal = Number(l && l.priceInternal) || 0;
  if (!internal && l && l.catId && typeof HOUSING_CATALOG !== 'undefined') {
    const cat = HOUSING_CATALOG.find(c => c.id === l.catId);
    if (cat) internal = Number(cat.price) || 0;
  }
  /* Return EGP for display */
  return Math.round(internal * p42Rate());
}

/* Override the panel — clean display + financing */
const P42_viewAssetsBefore = viewAssets;
viewAssets = function () {
  let html = P42_viewAssetsBefore();
  if (!S || S.age < 18) return html;

  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || (spouse.stage !== 'engaged' && spouse.stage !== 'married')) return html;

  /* Strip any old panel first */
  html = html.replace(/<section class="card">\s*<h3>🏠 Buy a property together[\s\S]*?<\/section>/g, '');

  const market = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket() : [];
  if (!market.length) return html;

  const herEGP = Math.round((Number(spouse.netWorth) || 0) * p42Rate());

  let panel = '<section class="card"><h3>🏠 Buy a property together with ' + spouse.name + '</h3>' +
    '<p class="muted">Egyptian couples often buy a home jointly and split the ownership. She may refuse if she is unwilling to contribute.</p>' +
    '<div class="row"><span>Her available cash</span><b>' + herEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row"><span>Her personality</span><b>' + (Number(spouse.generosity) > 0.6 ? 'Generous' : Number(spouse.generosity) < 0.35 ? 'Greedy' : 'Moderate') + '</b></div>';

  market.slice(0, 5).forEach(function (l) {
    const priceEGP = p42GetListingEGP(l);
    /* Down payments */
    const cash30 = Math.round(priceEGP * 0.30);
    const cash50 = Math.round(priceEGP * 0.50);
    const cash70 = Math.round(priceEGP * 0.70);
    /* Mortgage deposit (20%) of the player's share */
    const dep30 = Math.round(priceEGP * 0.30 * 0.20);
    const dep50 = Math.round(priceEGP * 0.50 * 0.20);
    const dep70 = Math.round(priceEGP * 0.70 * 0.20);

    panel += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<b>' + l.name + '</b> — ' + priceEGP.toLocaleString() + ' EGP' +
      '<p class="muted" style="font-size:.8rem">' + (l.location || '') + ' · Condition ' + (l.condition || 0) + '%</p>' +
      '<details><summary style="cursor:pointer;color:var(--cyan);font-weight:bold;padding:4px 0">Choose your share & payment method</summary>' +
      '<div style="margin-top:8px">' +
      ['30', '50', '70'].map(function (pct) {
        const share = pct / 100;
        const myEGP = Math.round(priceEGP * share);
        const herPct = 100 - Number(pct);
        const cashNeeded = myEGP;
        const depNeeded = Math.round(myEGP * 0.20);
        const canCash = Math.round(S.wealth * p42Rate()) >= cashNeeded;
        const canDep = Math.round(S.wealth * p42Rate()) >= depNeeded;
        return '<div style="margin-top:8px;padding:8px;border:1px solid var(--line);border-radius:6px">' +
          '<b>You ' + pct + '% / Her ' + herPct + '%</b> — your share: ' + myEGP.toLocaleString() + ' EGP' +
          '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">' +
          '<button class="btn" style="flex:1;min-width:140px;font-size:.82rem" ' + (canCash ? '' : 'disabled') + ' onclick="p42BuyTogether(\'' + l.id + '\',' + share + ',\'cash\')">' +
          'Cash full · ' + cashNeeded.toLocaleString() + ' EGP' +
          (canCash ? '' : '<small>Not enough cash</small>') + '</button>' +
          '<button class="btn" style="flex:1;min-width:140px;font-size:.82rem" ' + (canDep ? '' : 'disabled') + ' onclick="p42BuyTogether(\'' + l.id + '\',' + share + ',\'mortgage\')">' +
          'Mortgage · 20% deposit ' + depNeeded.toLocaleString() + ' EGP<small>Bank loan on the rest</small></button>' +
          '</div></div>';
      }).join('') +
      '</div></details></div>';
  });
  panel += '</section>';
  return html + panel;
};

function p42BuyTogether(listingId, playerShare, mode) {
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || (spouse.stage !== 'engaged' && spouse.stage !== 'married')) return hint('You need an engaged or married partner.');

  const listing = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket().find(x => x.id === listingId) : null;
  if (!listing) return hint('Listing not found.');

  const priceEGP = p42GetListingEGP(listing);
  const priceInternal = priceEGP / p42Rate();
  const myInternal = priceInternal * playerShare;
  const herInternal = priceInternal * (1 - playerShare);

  /* Her cash */
  const herCash = Number(spouse.netWorth) || 0;
  if (herCash < herInternal * 0.5) {
    return hint(spouse.name + ' cannot afford ' + Math.round(herInternal * p42Rate()).toLocaleString() + ' EGP. She has ' + Math.round(herCash * p42Rate()).toLocaleString() + ' EGP.');
  }

  /* Generosity check */
  const agreeChance = 0.25 + (Number(spouse.generosity) || 0.5) * 0.7;
  if (Math.random() > agreeChance) {
    spouse.bond = Math.max(0, Math.min(100, (Number(spouse.bond) || 50) - 5));
    log(spouse.name + ' refused to share the property purchase.');
    p24Popup(spouse.name + ' refused', '“No, I will not split this. If you want a property, you buy it yourself.”');
    render();
    return;
  }

  /* Financing */
  const down = mode === 'mortgage' ? myInternal * 0.20 : myInternal;
  if (S.wealth < down) return hint('You need ' + Math.round(down * p42Rate()).toLocaleString() + ' EGP available.');

  S.wealth -= down;
  spouse.netWorth = Math.max(0, herCash - herInternal);

  /* Create co-owned home */
  const homeId = 'h_shared_' + Math.random().toString(36).slice(2, 8);
  const mortgageInternal = mode === 'mortgage' ? myInternal * 0.80 : 0;
  const home = {
    id: homeId,
    catId: 'shared_custom',
    name: listing.name,
    value: priceInternal,
    balance: mortgageInternal,
    cond: listing.condition || 80,
    rentInc: listing.marketRentRate ? priceInternal * listing.marketRentRate * 12 : priceInternal * 0.003 * 12,
    status: 'vacant',
    pay: mortgageInternal > 0 ? Math.round(mortgageInternal * 0.08) : 0,
    rate: mortgageInternal > 0 ? (S.mortRate || 0.19) : 0,
    features: listing.features || [],
    location: listing.location,
    marketCountry: S.country,
    typeId: listing.typeId,
    p12: true,
    coOwnedWith: spouse.id,
    coOwnedName: spouse.name,
    playerEquity: playerShare,
    partnerEquity: 1 - playerShare
  };
  S.ownedHomes = S.ownedHomes || [];
  S.ownedHomes.push(home);

  /* Remove listing */
  if (Array.isArray(S.propertyMarket)) S.propertyMarket = S.propertyMarket.filter(x => x.id !== listingId);

  spouse.bond = Math.max(0, Math.min(100, (Number(spouse.bond) || 50) + 8));

  const modeLabel = mode === 'mortgage' ? 'with a mortgage (20% deposit)' : 'in cash';
  log('You and ' + spouse.name + ' bought ' + listing.name + ' together ' + modeLabel + '. You own ' + Math.round(playerShare * 100) + '%, she owns ' + Math.round((1 - playerShare) * 100) + '%.');
  p24Popup('Shared property purchased',
    listing.name + ' is now co-owned with ' + spouse.name + '.\n\n' +
    'You contributed ' + Math.round(down * p42Rate()).toLocaleString() + ' EGP (' + Math.round(playerShare * 100) + '% share' + (mode === 'mortgage' ? ', 20% down payment' : ', paid in full') + ')\n' +
    'She contributed ' + Math.round(herInternal * p42Rate()).toLocaleString() + ' EGP\n' +
    (mode === 'mortgage' ? 'Mortgage on your share: ' + Math.round(mortgageInternal * p42Rate()).toLocaleString() + ' EGP\n' : ''));
  render();
}
window.p42BuyTogether = p42BuyTogether;

/* ============ 4. NEGATIVE BALANCE EXPLANATION ============ */
const P42_viewMoneyBefore = viewMoney;
viewMoney = function () {
  let html = P42_viewMoneyBefore();
  if (!S || S.age < 18) return html;

  /* Explanation card if cash is negative */
  if (S.wealth < 0) {
    const bill = S.bill || {};
    const lines = Object.entries(bill)
      .filter(([k, v]) => Number(v) > 0)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .map(([k, v]) => '<div class="row"><span>' + k.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()) + '</span><b class="mono" style="color:var(--rose)">' + money(-Number(v)) + '</b></div>')
      .join('');

    const income = Number(S.income) || 0;
    const expenses = Number(S.expenses) || 0;
    const gap = income - expenses;

    const explanation = '<section class="card" style="border-color:var(--rose)">' +
      '<h3>Why your cash is negative</h3>' +
      '<p class="muted">Your cash went below zero because this year\'s expenses were bigger than the money you had plus what you earned. The bills below came out of your account one by one.</p>' +
      '<div class="row"><span><b>Income this year</b></span><b class="mono" style="color:var(--mint)">' + money(income) + '</b></div>' +
      '<div class="row"><span><b>Expenses this year</b></span><b class="mono" style="color:var(--rose)">' + money(expenses) + '</b></div>' +
      '<div class="row"><span><b>Yearly gap</b></span><b class="mono" style="color:' + (gap < 0 ? 'var(--rose)' : 'var(--mint)') + '">' + money(gap) + '</b></div>' +
      '<h4 style="margin-top:12px;font-size:.85rem">Biggest bills</h4>' + lines +
      '<p class="muted" style="font-size:.8rem;margin-top:10px">To fix this: increase income (job raise, rent out a property, cut lifestyle), or reduce bills (change food to Cheap, cancel insurance, sell a car, cancel family support).</p>' +
      '</section>';

    /* Insert right after the first Financial Overview card */
    const overviewEnd = html.indexOf('</section>');
    if (overviewEnd !== -1) {
      html = html.slice(0, overviewEnd + 10) + explanation + html.slice(overviewEnd + 10);
    } else {
      html = explanation + html;
    }
  }

  /* Add clarity to "property Rent" line */
  html = html.replace(
    /<div class="row"><span>property Rent<\/span><b class="mono" style="color:var\(--rose\)">([^<]+)<\/b><\/div>/g,
    function (m, val) {
      return '<div class="row"><span>property Rent <small class="muted">(maintenance you paid on rentals — this is a cost, not income)</small></span><b class="mono" style="color:var(--rose)">' + val + '</b></div>';
    }
  );
  html = html.replace(
    /<div class="row"><span>propertyRent<\/span><b class="mono" style="color:var\(--rose\)">([^<]+)<\/b><\/div>/g,
    function (m, val) {
      return '<div class="row"><span>property Rent <small class="muted">(maintenance on rentals)</small></span><b class="mono" style="color:var(--rose)">' + val + '</b></div>';
    }
  );

  return html;
};

/* ============ 5. CREDIT CARD CAN COVER NEGATIVE CASH ============ */
function p42PayNegativeWithCard() {
  if (!S || !S.bank || !S.bank.activeCards || !S.bank.activeCards.length) return hint('No credit card available.');
  if (S.wealth >= 0) return hint('Your cash is not negative.');

  const debt = Math.abs(S.wealth);
  const cardId = S.bank.primaryCard || S.bank.activeCards[0];
  const limit = (typeof p38GetLimit === 'function') ? p38GetLimit(cardId) : Math.round((S.income || 0) * 0.25);
  const currentCardDebt = Number(S.bank.cardDebt[cardId]) || 0;

  if (currentCardDebt + debt > limit) {
    return hint('Not enough credit room. Card limit ' + money(limit) + ', current balance ' + money(currentCardDebt) + ', needed ' + money(debt) + '.');
  }

  if (!confirm('Move ' + money(debt) + ' of overdraft onto ' + cardId + '? You will owe it on the card instead of being negative in checking.')) return;

  S.bank.cardDebt[cardId] = currentCardDebt + debt;
  S.wealth = 0;
  log('Moved ' + money(debt) + ' of negative balance onto credit card ' + cardId + '. Balance is now a card debt instead of an overdraft.');
  realismNotice('Overdraft moved to credit card', 'You cleared the checking overdraft by borrowing on the card. Card balance is now ' + money(S.bank.cardDebt[cardId]) + '.');
  render();
}
window.p42PayNegativeWithCard = p42PayNegativeWithCard;

/* Show the button on the Money tab when cash is negative */
const P42_viewMoneyForCard = viewMoney;
viewMoney = function () {
  let html = P42_viewMoneyForCard();
  if (S && S.age >= 18 && S.wealth < 0 && S.bank && Array.isArray(S.bank.activeCards) && S.bank.activeCards.length) {
    const card = '<section class="card" style="border-color:var(--amber)"><h3>Use credit card to cover overdraft</h3>' +
      '<p class="muted">You can move part or all of your negative balance onto a credit card. This converts the overdraft into a card debt that you can pay off or convert to installments in the Bank tab.</p>' +
      '<button class="btn" onclick="p42PayNegativeWithCard()">Move ' + money(Math.abs(S.wealth)) + ' to credit card</button>' +
      '</section>';
    html = card + html;
  }
  return html;
};

/* ============ 6. SALARY VS EXPENSES CLARITY ============ */
/* Add a top-of-career summary showing whether your salary covers expenses */
const P42_viewCareerBefore = viewCareer;
viewCareer = function () {
  let html = P42_viewCareerBefore();
  if (!S || S.age < 18) return html;
  const income = Number(S.income) || 0;
  const expenses = Number(S.expenses) || 0;
  const salary = S.job ? Number(S.job.salary) || 0 : 0;
  if (salary <= 0 && income <= 0) return html;

  const coverage = expenses > 0 ? (income + salary) / expenses : 1;
  const label = coverage >= 1.2 ? 'Comfortable — you are saving money' : coverage >= 1 ? 'Just enough — no big cushion' : 'Not enough — you are losing money each year';
  const color = coverage >= 1.2 ? 'var(--mint)' : coverage >= 1 ? 'var(--amber)' : 'var(--rose)';

  const summary = '<section class="card"><h3>Does your salary cover your life?</h3>' +
    '<div class="row"><span>Current salary</span><b class="mono" style="color:var(--mint)">' + money(salary) + '/year</b></div>' +
    '<div class="row"><span>Other income (rent, interest, remote)</span><b class="mono">' + money(Math.max(0, income - salary)) + '</b></div>' +
    '<div class="row"><span>Total income</span><b class="mono" style="color:var(--mint)">' + money(income) + '</b></div>' +
    '<div class="row"><span>Total expenses last year</span><b class="mono" style="color:var(--rose)">' + money(expenses) + '</b></div>' +
    '<div class="row"><span><b>Status</b></span><b style="color:' + color + '">' + label + '</b></div>' +
    '<p class="muted" style="font-size:.82rem;margin-top:8px">' +
    (coverage < 1
      ? 'You need to either earn more (request a raise, take a second job, work remote, rent a property) or cut costs (cheaper food, sell a car, reduce family support, cancel insurance).'
      : coverage < 1.2
        ? 'You are breaking even. One unexpected bill could push you negative.'
        : 'You have a cushion. Consider saving or investing the surplus instead of upgrading lifestyle.') +
    '</p></section>';
  return summary + html;
};

/* ============ 7. RUN ON LOAD ============ */
if (S) { /* no immediate action */ }
