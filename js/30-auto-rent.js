/* =====================================================================
   30. AUTO-RENT SYSTEM — one-click market-rate rental with instant tenant
   Load AFTER 29-egypt-universities.js and BEFORE 99-boot.js
   ===================================================================== */

function p30AutoRentProperty(homeId) {
  if (!S || S.age < 18) return hint('Renting out property requires age 18.');
  const h = (S.ownedHomes || []).find(x => x.id === homeId);
  if (!h) return hint('Property not found.');

  if (S.housing === h.id) return hint('Move into another home before renting this one out.');
  if (h.status === 'p12-rented' && h.tenant) return hint('This property already has a tenant.');

  const country = h.marketCountry || S.country || 'egy';
  const rate = Math.max(0.0001, rateForCountry(country, gameYear()));
  const yieldRate = Number(h.marketRentRate) || 0.0035;

  const localMonthlyRent = Math.max(1, Math.round((Number(h.value) || 1000) * yieldRate * rate));
  const internalMonthlyRent = localMonthlyRent / rate;

  h.p12 = true;
  h.marketCountry = country;
  h.rentCurrency = country;
  h.rentLocalAmount = localMonthlyRent;
  h.rentAmount = internalMonthlyRent;
  h.rentInc = internalMonthlyRent * 12;
  h.rentStepPct = 5;
  h.rentContractYears = 0;
  h.tenant = true;
  h.status = 'p12-rented';
  h.tenantStartYear = gameYear();
  h.p23AutoMarketRent = true;
  h.p23LastMarketTrendYear = gameYear();

  const currency = (COUNTRIES[country] || COUNTRIES.usa).cur;

  log(`You listed ${h.name} at market rent: ${localMonthlyRent.toLocaleString()} ${currency}/month. A tenant signed immediately.`);
  realismNotice(
    'Tenant found at market rent',
    `${h.name} is now rented at ${localMonthlyRent.toLocaleString()} ${currency}/month. This is the estimated market rate for this property. Rent will adjust gradually each year with the local market.`
  );
  hint();
  render();
}

/* Replace the "List for rent" button so it auto-fills and finds a tenant instantly.
   We do this by wrapping viewAssets after all previous patches have run. */
const P30_viewAssetsBefore = viewAssets;
viewAssets = function() {
  let html = P30_viewAssetsBefore();
  /* The old UI exposes p12SetRental('homeId') as a "List for rent" button and a "Publish rent listing" button.
     We redirect both to the auto-rent flow by intercepting the rendered button onclick. */
  html = html.replace(/onclick="p12SetRental\('([^']+)'\)"/g, "onclick=\"p30AutoRentProperty('$1')\"");
  return html;
};

/* Also add a clean auto-rent card at the top of the "Manage owned properties" section
   so players have an obvious one-click option. */
const P30_viewAssetsBefore2 = viewAssets;
viewAssets = function() {
  let html = P30_viewAssetsBefore2();
  if (!S || S.age < 18) return html;
  if (!Array.isArray(S.ownedHomes) || !S.ownedHomes.length) return html;

  const vacant = S.ownedHomes.filter(h =>
    h && S.housing !== h.id &&
    !(h.status === 'p12-rented' && h.tenant)
  );
  if (!vacant.length) return html;

  const cards = vacant.map(h => {
    const country = h.marketCountry || S.country || 'egy';
    const rate = Math.max(0.0001, rateForCountry(country, gameYear()));
    const yieldRate = Number(h.marketRentRate) || 0.0035;
    const monthly = Math.max(1, Math.round((Number(h.value) || 1000) * yieldRate * rate));
    const currency = (COUNTRIES[country] || COUNTRIES.usa).cur;
    return `<div style="margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:10px">
      <b>${h.name}</b>
      <div class="row"><span>Estimated market rent</span><b class="mono">${monthly.toLocaleString()} ${currency}/month</b></div>
      <div class="row"><span>Annual income</span><b class="mono">${(monthly * 12).toLocaleString()} ${currency}/year</b></div>
      <button class="btn" onclick="p30AutoRentProperty('${h.id}')">Rent out now at market value<small>Finds a tenant immediately. No typing required.</small></button>
    </div>`;
  }).join('');

  return html + `<section class="card"><h3>⚡ Quick rent — one click</h3>
    <p class="muted">Rent these properties at the automatically estimated market rate. A tenant will sign immediately.</p>
    ${cards}</section>`;
};
