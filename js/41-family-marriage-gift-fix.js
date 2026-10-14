/* =====================================================================
   41. FAMILY SUPPORT + MARRIAGE + SHARED PROPERTY + BRAND GIFTS
   Fixes:
   - Family support amount being taken wrong (typed 100,000, taken as ~380k/month)
   - Family support does not raise relationship bond
   - Household arrangement has no money/bond effect
   - Housewife has "yearly income" displayed (contradiction)
   - "Buy a home together" is in the wrong tab (should be Real Estate)
   - Wife's contribution is static
   Adds:
   - Real luxury brand gifts (Gucci, LV, Hermès, Rolex, Cartier)
   - "Phone/tablet" gift now links to Shopping
   - Dynamic wife net worth growth over the years
   - Marriage arrangement reactions and yearly money settlement
   Load AFTER 40-medical-system.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. FAMILY SUPPORT — clean EGP handling ============ */
function p41Rate() { return (typeof rateNow === 'function') ? rateNow() : 1; }

/* Override the P24 family support panel and buttons */
p24FamilySupport = function (mode) {
  if (!S || S.age < 18) return hint('You can manage family support from age 18.');
  const id = document.getElementById('p24-support-member')?.value;
  const m = (S.family || []).find(function (x) { return x.id === id && x.alive !== false; });
  if (!m) return hint('Choose a living family member first.');

  const rel = (typeof p24Relation === 'function') ? p24Relation(m) : (m.name || 'family');

  if (mode === 'once') {
    const localEGP = Number(document.getElementById('p24-support-once')?.value);
    if (!isFinite(localEGP) || localEGP <= 0) return hint('Enter an amount greater than zero.');
    const internal = localEGP / p41Rate();
    if (S.wealth < internal) return hint('You need ' + localEGP.toLocaleString() + ' EGP available to send this transfer.');
    S.wealth -= internal;
    m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 45) + 8));
    log('You sent ' + localEGP.toLocaleString() + ' EGP to ' + rel + '.');
    fx({ happiness: 1, social: 1 });
    render();
    p24Popup(rel + ' replied', '“Thank you for sending ' + localEGP.toLocaleString() + ' EGP. This helps me with my expenses. I know you have responsibilities of your own, and I really appreciate you thinking of me.”');
    return;
  }

  if (mode === 'monthly') {
    const monthlyEGP = Number(document.getElementById('p24-support-monthly')?.value);
    if (!isFinite(monthlyEGP) || monthlyEGP < 0) return hint('Enter zero or a positive monthly amount.');

    /* Store explicitly in EGP to avoid double-conversion bugs */
    m.allowLocalEGP = Math.round(monthlyEGP * 12);
    m.allowLocal = m.allowLocalEGP;
    m.allowCurrency = S.country;
    m.allow = m.allowLocalEGP / p41Rate();
    m.allowPaidYear = null;

    if (monthlyEGP > 0) {
      m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 45) + 4));
      log('You arranged monthly support of ' + monthlyEGP.toLocaleString() + ' EGP for ' + rel + ' (' + (monthlyEGP * 12).toLocaleString() + ' EGP per year).');
      render();
      p24Popup(rel + ' is grateful', '“Thank you for making this regular. Knowing I can count on ' + monthlyEGP.toLocaleString() + ' EGP each month makes planning much easier.”');
    } else {
      log('You cancelled recurring support for ' + rel + '.');
      render();
      p24Popup('Support cancelled', 'Recurring financial support for ' + rel + ' has been stopped. No future yearly payment will be taken.');
    }
    return;
  }

  if (mode === 'stop') {
    m.allowLocalEGP = 0;
    m.allowLocal = 0;
    m.allow = 0;
    m.allowPaidYear = null;
    log('You cancelled recurring support for ' + rel + '.');
    render();
    p24Popup('Support cancelled', 'Recurring financial support for ' + rel + ' has been stopped. No future yearly payment will be taken.');
  }
};

/* Also override p24FamilySupportCard to show correct EGP amounts */
p24FamilySupportCard = function () {
  if (!S || S.age < 18) return '';
  const members = (S.family || []).filter(function (m) { return m && m.alive !== false && ['Mother', 'Father', 'Sibling', 'Child', 'Partner', 'Spouse'].indexOf(m.role) !== -1; });
  if (!members.length) return '';
  const selected = members.find(function (m) { return (Number(m.allow) || 0) > 0; }) || members[0];
  const opts = members.map(function (m) { return '<option value="' + m.id + '"' + (m.id === selected.id ? ' selected' : '') + '>' + (typeof p24Relation === 'function' ? p24Relation(m) : m.name) + '</option>'; }).join('');

  const monthlyEGP = (selected.allowLocalEGP != null)
    ? Math.round(selected.allowLocalEGP / 12)
    : Math.round((Number(selected.allow) || 0) * p41Rate() / 12);

  return '<section class="card"><h3>Family financial support</h3>' +
    '<p class="muted">Choose one person, then decide how to help. Monthly support is charged yearly as 12 × the monthly amount. Amounts are entered in EGP.</p>' +
    '<label class="muted" for="p24-support-member">Family member</label>' +
    '<select id="p24-support-member" onchange="p24UpdateSupportPreview()">' + opts + '</select>' +
    '<div id="p24-support-current" class="row" style="margin-top:8px"><span>Current monthly support</span><b>' + monthlyEGP.toLocaleString() + ' EGP/month</b></div>' +
    '<div class="p24-field" style="margin-top:12px"><label for="p24-support-once">One-time transfer · EGP</label>' +
    '<input id="p24-support-once" type="number" min="1" step="100" placeholder="e.g. 100000"></div>' +
    '<button class="btn" onclick="p24FamilySupport(\'once\')">Send one-time support<small>The recipient responds, and your cash changes immediately.</small></button>' +
    '<div class="p24-field" style="margin-top:14px"><label for="p24-support-monthly">Monthly allowance · EGP</label>' +
    '<input id="p24-support-monthly" type="number" min="0" step="100" value="' + Math.max(0, monthlyEGP) + '"></div>' +
    '<div class="p24-filter-grid">' +
    '<button class="btn" style="margin:0" onclick="p24FamilySupport(\'monthly\')">Set monthly support<small>Charged yearly as 12 × the monthly amount.</small></button>' +
    '<button class="btn" style="margin:0" onclick="p24FamilySupport(\'stop\')">Stop recurring support<small>No future yearly deduction.</small></button>' +
    '</div>' +
    '<p class="muted" style="font-size:.77rem;margin-top:10px">Currently costs ' + (selected.allowLocalEGP ? selected.allowLocalEGP.toLocaleString() : '0') + ' EGP/year for ' + (typeof p24Relation === 'function' ? p24Relation(selected) : selected.name) + '. Support raises the relationship bond.</p>' +
    '</section>';
};

/* Update p24UpdateSupportPreview to show EGP too */
p24UpdateSupportPreview = function () {
  const id = document.getElementById('p24-support-member')?.value;
  const m = (S.family || []).find(function (x) { return x.id === id && x.alive !== false; });
  const el = document.getElementById('p24-support-current');
  if (el && m) {
    const monthlyEGP = (m.allowLocalEGP != null) ? Math.round(m.allowLocalEGP / 12) : Math.round((Number(m.allow) || 0) * p41Rate() / 12);
    el.innerHTML = '<span>Current monthly support</span><b>' + monthlyEGP.toLocaleString() + ' EGP/month</b>';
  }
  const monthly = document.getElementById('p24-support-monthly');
  if (monthly && m) {
    const monthlyEGP = (m.allowLocalEGP != null) ? Math.round(m.allowLocalEGP / 12) : Math.round((Number(m.allow) || 0) * p41Rate() / 12);
    monthly.value = Math.max(0, monthlyEGP);
  }
};

/* Fix the family-year settlement to use allowLocalEGP reliably */
const P41_familyYearBefore = familyYear;
familyYear = function () {
  const result = P41_familyYearBefore.apply(this, arguments);
  if (!S || !Array.isArray(S.family)) return result;
  const year = gameYear();
  S.family.forEach(function (m) {
    if (!m || m.alive === false) return;
    if (!(Number(m.allow) > 0) && !(Number(m.allowLocalEGP) > 0)) return;
    if (m.allowPaidYear === year) return;
    /* Recompute internal from EGP every year (handles FX changes) */
    const egp = Number(m.allowLocalEGP) || Math.round((Number(m.allow) || 0) * p41Rate());
    const internal = egp / p41Rate();
    /* Only charge if the base game hasn't already. Track by flag. */
    m.allow = internal;
    m.allowPaidYear = year;
    m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 45) + 3));
  });
  return result;
};

/* ============ 2. MARRIAGE ARRANGEMENT — real effects ============ */
function p41SetArrangement(mode) {
  if (!S.marriage) S.marriage = {};
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || spouse.stage !== 'married') return hint('You must be married.');

  const generosity = Number(spouse.generosity) || 0.5;

  /* She may refuse arrangements that require her to pay */
  if ((mode === 'split' || mode === 'wife-pays') && generosity < 0.35) {
    const chance = 0.5 + (0.35 - generosity) * 2;
    if (Math.random() < chance) {
      spouse.bond = Math.max(0, Math.min(100, (Number(spouse.bond) || 50) - 4));
      log(spouse.name + ' refused the "' + mode + '" arrangement. She says the husband should provide.');
      p24Popup(spouse.name + ' refused', '“In our culture, the husband provides for the household. I am not going to pay half of the bills.”');
      render();
      return;
    }
  }

  S.marriage.arrangement = mode;

  /* Reaction popup */
  const reactions = {
    'split': { label: 'Split bills 50/50', msg: '“Fine, we share everything equally. Fair is fair.”', bond: 1 },
    'man-pays': { label: 'You pay all bills', msg: '“Thank you. I feel cared for — you are a real man.”', bond: 3 },
    'wife-pays': { label: 'She pays most', msg: '“I will pay, but I do not feel respected. This is not how it should be.”', bond: -4 },
    'traditional': { label: 'Traditional mixed', msg: '“This feels right — you lead, I help where I can.”', bond: 2 }
  };
  const r = reactions[mode] || reactions.split;
  spouse.bond = Math.max(0, Math.min(100, (Number(spouse.bond) || 50) + r.bond));

  log('Household arrangement set to: ' + r.label + '.');
  p24Popup('Household arrangement updated', r.msg);
  render();
}
window.p41SetArrangement = p41SetArrangement;

/* Also override p35SetArrangement to route through p41 */
p35SetArrangement = p41SetArrangement;

/* Yearly settlement of household arrangement */
function p41MarriageYearSettlement() {
  if (!S || !S.marriage) return;
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || spouse.stage !== 'married') return;

  const arr = S.marriage.arrangement || 'split';
  const household = (S.bill && (Number(S.bill.rent) || 0) + (Number(S.bill.utilities) || 0) + (Number(S.bill.groceries) || 0) + (Number(S.bill.mortgage) || 0) + (Number(S.bill.propertyTax) || 0)) || 0;

  if (household <= 0) return;

  let refund = 0;
  let label = '';
  if (arr === 'split') {
    refund = household * 0.5 * (Number(spouse.shareWill) || 0.5);
    label = 'shared 50/50';
  } else if (arr === 'traditional') {
    refund = household * 0.2;
    label = 'traditional split';
  } else if (arr === 'wife-pays') {
    refund = household * 0.7;
    label = 'she paid most';
  }
  /* 'man-pays' → no refund */

  if (refund > 0) {
    S.wealth += refund;
    S.income = (S.income || 0) + refund;
    log(spouse.name + ' contributed ' + money(refund) + ' to the household this year (' + label + ').');
  }

  /* Shared account yield */
  if (S.marriage.sharedBank && (S.marriage.sharedBal || 0) > 0) {
    const yieldRate = 0.12;
    const earned = Math.round(S.marriage.sharedBal * yieldRate);
    if (earned > 0) {
      S.marriage.sharedBal += earned;
      S.income = (S.income || 0) + earned;
      log('Shared account earned ' + money(earned) + ' in interest (' + (yieldRate * 100).toFixed(1) + '% APY).');
    }
  }

  /* Wife auto-deposit into shared account */
  if (S.marriage.sharedBank && S.marriage.wifeWorks) {
    const herIncome = Number(spouse.income) || 0;
    if (herIncome > 0) {
      const saveRate = 0.15 + (Number(spouse.generosity) || 0.5) * 0.25;
      const amount = Math.round(herIncome * saveRate);
      if (amount > 0) {
        S.marriage.sharedBal = (S.marriage.sharedBal || 0) + amount;
        log(spouse.name + ' deposited ' + money(amount) + ' from her savings into the shared account.');
      }
    }
  }

  /* Wife personal savings growth */
  if (S.marriage.wifeWorks) {
    const herIncome = Number(spouse.income) || 0;
    if (herIncome > 0) {
      const growth = Math.round(herIncome * (0.10 + (Number(spouse.generosity) || 0.5) * 0.15));
      spouse.personalSavings = (Number(spouse.personalSavings) || 0) + growth;
      spouse.netWorth = (Number(spouse.netWorth) || 0) + growth;
    }
  } else {
    /* Housewife — no income; net worth slowly erodes from personal spending */
    spouse.netWorth = Math.max(0, (Number(spouse.netWorth) || 0) * 0.94);
  }

  /* Housewife — zero her income explicitly */
  if (!S.marriage.wifeWorks) spouse.income = 0;
}
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('year', p41MarriageYearSettlement);
}

/* ============ 3. SHARED PROPERTY — move to Assets ============ */

/* Remove the shared-property panel from the Love tab */
const P41_viewLoveBefore = viewLove;
viewLove = function () {
  let html = P41_viewLoveBefore();
  /* Remove the "Buy a home together" section if rendered */
  html = html.replace(/<section class="card">\s*<h3>🏠 Buy a home together with[\s\S]*?<\/section>/g, '');
  /* Clean up any dangling panel */
  html = html.replace(/<button[^>]*onclick="p35BuyHomeTogether\([^"]*"[^>]*>[\s\S]*?<\/button>/g, '');
  return html;
};

/* Add shared-property panel to Assets */
const P41_viewAssetsBefore = viewAssets;
viewAssets = function () {
  let html = P41_viewAssetsBefore();
  if (!S || S.age < 18) return html;

  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || (spouse.stage !== 'engaged' && spouse.stage !== 'married')) return html;

  /* Panel with listings you can buy together */
  const market = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket() : [];
  if (!market.length) return html;

  const herCashEGP = Math.round((Number(spouse.netWorth) || 0) * p41Rate());
  let panel = '<section class="card"><h3>🏠 Buy a property together with ' + spouse.name + '</h3>' +
    '<p class="muted">Egyptian couples often buy a home jointly and split the ownership. If she refuses to contribute, you may need to buy it alone. Her available cash grows or shrinks each year depending on her work.</p>' +
    '<div class="row"><span>Her available cash</span><b>' + herCashEGP.toLocaleString() + ' EGP</b></div>' +
    '<div class="row"><span>Her personality</span><b>' + (Number(spouse.generosity) > 0.6 ? 'Generous' : Number(spouse.generosity) < 0.35 ? 'Greedy' : 'Moderate') + '</b></div>';

  /* Show first 4 listings */
  market.slice(0, 4).forEach(function (l, i) {
    const priceEGP = Math.round(Number(l.priceInternal || 0) * p41Rate());
    panel += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<b>' + l.name + '</b> — ' + priceEGP.toLocaleString() + ' EGP' +
      '<p class="muted" style="font-size:.8rem">' + l.location + ' · Condition ' + l.condition + '%</p>' +
      '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">' +
      ['30', '50', '70'].map(function (pct) {
        return '<button class="btn" style="flex:1;min-width:120px;font-size:.8rem" onclick="p41BuyTogether(\'' + l.id + '\',' + (pct / 100) + ')">You ' + pct + '% / Her ' + (100 - Number(pct)) + '%</button>';
      }).join('') +
      '</div></div>';
  });
  panel += '</section>';
  return html + panel;
};

function p41BuyTogether(listingId, playerShare) {
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (!spouse || (spouse.stage !== 'engaged' && spouse.stage !== 'married')) return hint('You need an engaged or married partner.');
  if (playerShare < 0.1 || playerShare > 0.9) return hint('Share must be between 10% and 90%.');

  const listing = (typeof p12PropertyMarket === 'function') ? p12PropertyMarket().find(function (x) { return x.id === listingId; }) : null;
  if (!listing) return hint('Listing not found.');

  const price = Number(listing.priceInternal) || 0;
  const playerOwes = price * playerShare;
  const partnerOwes = price * (1 - playerShare);

  /* Check her affordability */
  const herCash = Number(spouse.netWorth) || 0;
  if (herCash < partnerOwes * 0.5) {
    return hint(spouse.name + ' cannot afford ' + Math.round(partnerOwes * p41Rate()).toLocaleString() + ' EGP. She has ' + Math.round(herCash * p41Rate()).toLocaleString() + ' EGP.');
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

  if (S.wealth < playerOwes) return hint('You need ' + Math.round(playerOwes * p41Rate()).toLocaleString() + ' EGP for your share.');

  /* Deduct player's share */
  S.wealth -= playerOwes;
  spouse.netWorth = Math.max(0, herCash - partnerOwes);

  /* Register home with coOwned fields */
  const cat = (typeof p12EnsureListingCategory === 'function') ? p12EnsureListingCategory(listing) : null;
  const homeId = 'h_shared_' + Math.random().toString(36).slice(2, 8);
  const home = {
    id: homeId,
    catId: cat ? cat.id : 'shared_fallback',
    name: listing.name,
    value: price,
    balance: 0,
    cond: listing.condition || 80,
    rentInc: listing.marketRentRate ? price * listing.marketRentRate * 12 : price * 0.003 * 12,
    status: 'vacant',
    pay: 0, rate: 0,
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

  /* Remove listing from market */
  if (Array.isArray(S.propertyMarket)) S.propertyMarket = S.propertyMarket.filter(function (x) { return x.id !== listingId; });

  spouse.bond = Math.max(0, Math.min(100, (Number(spouse.bond) || 50) + 8));
  log('You and ' + spouse.name + ' bought ' + listing.name + ' together. You own ' + Math.round(playerShare * 100) + '%, she owns ' + Math.round((1 - playerShare) * 100) + '%.');
  p24Popup('Shared property purchased', listing.name + ' is now co-owned with ' + spouse.name + '. You contributed ' + Math.round(playerOwes * p41Rate()).toLocaleString() + ' EGP (' + Math.round(playerShare * 100) + '%), she contributed ' + Math.round(partnerOwes * p41Rate()).toLocaleString() + ' EGP.');
  render();
}
window.p41BuyTogether = p41BuyTogether;

/* ============ 4. HOUSEHOLD ARRANGEMENT — update UI to use p41SetArrangement ============ */
/* The p35MarriagePanel buttons need to route through p41SetArrangement */
const P41_originalViewLove = viewLove;
viewLove = function () {
  let html = P41_originalViewLove();
  /* Rewrite the arrangement buttons */
  html = html.replace(/onclick="p35SetArrangement\('([^']+)'\)"/g, 'onclick="p41SetArrangement(\'$1\')"');
  /* Fix housewife income display */
  const spouse = (typeof partner === 'function') ? partner() : null;
  if (spouse && spouse.stage === 'married' && S.marriage && !S.marriage.wifeWorks) {
    html = html.replace(/Her yearly income<\/span><b>[^<]*<\/b>/, 'Her yearly income</span><b>0 EGP (housewife)</b>');
    html = html.replace(/She works<\/span><b>No — housewife<\/b>/, 'She works</span><b>No — housewife</b>');
  }
  return html;
};

/* ============ 5. BRAND GIFT CATALOG ============ */
const P41_BRAND_GIFTS = {
  jewelry: [
    { id: 'g18_chain',      name: '18K gold chain (5g)',                 brand: 'Local jeweler',   egp: 26500,  bond: 6 },
    { id: 'g21_set',        name: '21K gold jewelry set (10g)',          brand: 'Gold souk',       egp: 61800,  bond: 9 },
    { id: 'g_diamond_ring', name: 'Diamond ring 18K white gold (2g)',    brand: 'Local jeweler',   egp: 27290,  bond: 10 },
    { id: 'g_diamond_rose', name: 'Rose-gold diamond ring (9g)',         brand: 'Al Hedia',        egp: 124650, bond: 15 },
    { id: 'g_full_set',     name: 'Full diamond jewelry set',            brand: 'Luxury house',    egp: 350000, bond: 20 }
  ],
  bag: [
    { id: 'bag_gucci',       name: 'Gucci Small Lunetta Shoulder Bag',   brand: 'Gucci',           egp: 66024,  bond: 10 },
    { id: 'bag_lv_speedy',   name: 'Louis Vuitton Speedy 30',            brand: 'Louis Vuitton',   egp: 80000,  bond: 12 },
    { id: 'bag_lv_vanity',   name: 'Louis Vuitton Vanity Case PM',       brand: 'Louis Vuitton',   egp: 266866, bond: 18 },
    { id: 'bag_chanel',      name: 'Chanel Classic Flap Medium',         brand: 'Chanel',          egp: 450000, bond: 22 },
    { id: 'bag_hermes',      name: 'Hermès Birkin 25',                   brand: 'Hermès',          egp: 829000, bond: 28 }
  ],
  watch: [
    { id: 'watch_casio',     name: 'Casio / Seiko entry watch',          brand: 'Casio / Seiko',   egp: 8000,    bond: 5 },
    { id: 'watch_cartier',   name: 'Cartier Tank Solo SM',               brand: 'Cartier',         egp: 200000,  bond: 15 },
    { id: 'watch_rolex26',   name: 'Rolex Lady-Datejust 26',             brand: 'Rolex',           egp: 344000,  bond: 20 },
    { id: 'watch_rolex31',   name: 'Rolex Datejust 31',                  brand: 'Rolex',           egp: 400000,  bond: 22 },
    { id: 'watch_patek',     name: 'Patek Philippe Nautilus',            brand: 'Patek Philippe',  egp: 1500000, bond: 32 }
  ]
};

/* Override gift() to show brand submenu when a brand category is chosen */
const P41_giftBefore = gift;
gift = function (i) {
  /* Legacy behavior for basic items */
  if (i < 6) return P41_giftBefore.apply(this, arguments);

  /* Map legacy gift index to a brand category */
  const m = (typeof lp === 'function') ? lp() : null;
  if (!m) return hint('No partner.');
  if (S.gact >= 3) return hint('Three gifts per year.');

  const legacyIndex = i;
  let category = null;
  if (i === 6) category = 'watch';
  else if (i === 7) category = 'jewelry';
  else if (i === 8) category = 'bag';
  else if (i === 9) category = 'bag'; /* luxury shopping spree → bag */

  if (!category) return P41_giftBefore.apply(this, arguments);
  return p41GiftSubmenu(category);
};

function p41GiftSubmenu(category) {
  const m = (typeof lp === 'function') ? lp() : null;
  if (!m) return hint('No partner.');
  if (S.gact >= 3) return hint('Three gifts per year.');

  const items = P41_BRAND_GIFTS[category] || [];
  if (!items.length) return hint('No items in this category.');

  const rate = p41Rate();
  const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;

  let html = '<section class="card"><h3>Choose a brand gift for ' + m.name + '</h3>' +
    '<p class="muted">Real 2026 Egypt market prices. She has her own taste — some brands will please her more than others.</p>';

  items.forEach(function (it, i) {
    const priceEGP = Math.round(it.egp * idx);
    const internal = priceEGP / rate;
    const canAfford = S.wealth >= internal;
    /* Her preference bonus */
    const isHerStyle = (m.likes === 'jewelry' && category === 'jewelry') || (m.likes === 'fashion' && category === 'bag') || (m.likes === 'tech' && false);
    html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<b>' + it.name + '</b>' +
      '<div class="row"><span>Brand</span><b>' + it.brand + '</b></div>' +
      '<div class="row"><span>Price</span><b>' + priceEGP.toLocaleString() + ' EGP</b></div>' +
      '<div class="row"><span>Bond boost</span><b>+' + it.bond + (isHerStyle ? ' (her taste!)' : '') + '</b></div>' +
      '<button class="btn" ' + (canAfford ? '' : 'disabled') + ' onclick="p41BuyBrandGift(\'' + category + '\',\'' + it.id + '\')">' + (canAfford ? 'Buy for ' + m.name : 'Not enough cash') + '</button>' +
      '</div>';
  });

  html += '<button class="btn" style="margin-top:12px" onclick="render()">Back</button></section>';
  /* Show as modal */
  const modal = document.createElement('div');
  modal.className = 'p24-modal-backdrop';
  modal.id = 'p41-gift-modal';
  modal.innerHTML = '<div class="p24-modal" style="max-width:520px">' + html + '</div>';
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}
window.p41GiftSubmenu = p41GiftSubmenu;

function p41BuyBrandGift(category, itemId) {
  const m = (typeof lp === 'function') ? lp() : null;
  if (!m) return hint('No partner.');
  if (S.gact >= 3) return hint('Three gifts per year.');

  const items = P41_BRAND_GIFTS[category] || [];
  const it = items.find(function (x) { return x.id === itemId; });
  if (!it) return hint('Item not found.');

  const rate = p41Rate();
  const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
  const priceEGP = Math.round(it.egp * idx);
  const internal = priceEGP / rate;

  if (S.wealth < internal) return hint('You need ' + priceEGP.toLocaleString() + ' EGP.');

  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.gifts = (S.bill.gifts || 0) + internal;
  S.gact = (S.gact || 0) + 1;

  const isHerStyle = (m.likes === 'jewelry' && category === 'jewelry') || (m.likes === 'fashion' && category === 'bag');
  const boost = it.bond + (isHerStyle ? 5 : 0);
  m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) + boost));

  fx({ happiness: 3 });
  log('You gave ' + m.name + ' a ' + it.name + ' (' + it.brand + ') for ' + priceEGP.toLocaleString() + ' EGP.');

  /* Close modal */
  const modal = document.getElementById('p41-gift-modal');
  if (modal) modal.remove();

  /* Reaction popup */
  let reaction;
  if (isHerStyle) reaction = '“Oh my God — ' + it.brand + '! You actually remembered. This is exactly what I wanted.”';
  else if (it.bond >= 20) reaction = '“This is beautiful. I cannot believe you bought me a ' + it.brand + '. Thank you.”';
  else if (it.bond >= 10) reaction = '“Thank you, it’s lovely. I appreciate the thought.”';
  else reaction = '“Oh, thanks.”';
  p24Popup(m.name + ' reacted', reaction);
  render();
}
window.p41BuyBrandGift = p41BuyBrandGift;

/* ============ 6. PHONE/TABLET GIFT → Shopping tab ============ */
/* Replace the "Phone or tablet" gift with a shopping shortcut */
const P41_giftListBefore = null; /* not used */

/* Add a helper that opens shopping in gift mode */
function p41OpenShoppingForGift() {
  const m = (typeof lp === 'function') ? lp() : null;
  if (!m) return hint('No partner.');
  S.p41GiftTarget = m.id;
  activeTab = 'shop';
  if (typeof activeShopTab !== 'undefined') activeShopTab = 'apple';
  hint('Choose a phone or tablet from the store. Buying it will gift it to ' + m.name + '.');
  render();
}
window.p41OpenShoppingForGift = p41OpenShoppingForGift;

/* When S.p41GiftTarget is set, override buyItem to send item to partner */
const P41_buyItemBefore = buyItem;
buyItem = function (key, method) {
  if (S && S.p41GiftTarget) {
    const m = (S.family || []).find(function (x) { return x.id === S.p41GiftTarget && x.alive !== false; });
    if (m) {
      if (method !== 'cash') return hint('Gifts are paid with cash only.');
      const it = catalog().find(function (x) { return x.key === key; });
      if (!it) return hint('Item not found.');
      const total = shopPrice(it, 0);
      if (S.wealth < total) return hint('Not enough cash.');
      S.wealth -= total;
      S.expenses = (S.expenses || 0) + total;
      S.bill = S.bill || {};
      S.bill.gifts = (S.bill.gifts || 0) + total;
      S.gact = (S.gact || 0) + 1;
      m.bond = Math.max(0, Math.min(100, (Number(m.bond) || 50) + 12));
      log('You bought a ' + it.model + ' for ' + m.name + ' (' + money(total) + ').');
      S.p41GiftTarget = null;
      p24Popup(m.name + ' loved it', '“Thank you for the ' + it.model + '! I’ve been wanting one of these.”');
      render();
      return;
    }
  }
  return P41_buyItemBefore.apply(this, arguments);
};

/* Replace the "Phone or tablet" gift line in the gifts list with a button */
const P41_viewLoveForGift = viewLove;
viewLove = function () {
  let html = P41_viewLoveForGift();
  /* The "Phone or tablet" button from the base GIFT array has onclick="gift(6)" (or similar).
     Replace it with a shopping link. The exact index depends on base GIFT order. */
  html = html.replace(/<button[^>]*onclick="gift\(6\)"[^>]*>Phone or tablet[^<]*<\/button>/, 
    '<button class="btn" onclick="p41OpenShoppingForGift()">Phone or tablet<small>Choose from the Shopping tab</small></button>');
  return html;
};

/* ============ 7. RUN ON LOAD ============ */
if (S) {
  /* Nothing extra needed — the overrides take effect on next click */
}
