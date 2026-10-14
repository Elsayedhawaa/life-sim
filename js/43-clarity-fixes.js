/* =====================================================================
   43. CLARITY FIXES
   Fixes:
   - Salary coverage double-counted salary → wrong status label
   - "propertyRent" (income) was displayed as an expense
   - Rental maintenance = % of property value (absurd for Egypt)
     → Realistic: 10% of collected rent
   Adds:
   - Big bold "Where do I live?" banner on Assets tab
   - Property cards show tenant / contract / next increase clearly
   Load AFTER 42-number-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. SALARY COVERAGE — remove double count ============ */
const P43_viewCareerBefore = viewCareer;
viewCareer = function () {
  let html = P43_viewCareerBefore();

  if (!S || S.age < 18) return html;

  /* Remove the wrongly-labelled summary we injected before */
  html = html.replace(/<section class="card"><h3>Does your salary cover your life\?<\/h3>[\s\S]*?<\/section>/, '');

  const income = Number(S.income) || 0;
  const expenses = Number(S.expenses) || 0;
  if (income <= 0 && expenses <= 0) return html;

  /* Income already includes salary. Do NOT add it again. */
  const net = income - expenses;
  const ratio = expenses > 0 ? income / expenses : 1;

  let label, color, advice;
  if (ratio >= 1.25) {
    label = 'Comfortable — you are saving money';
    color = 'var(--mint)';
    advice = 'You have a cushion. Consider saving or investing the surplus instead of upgrading lifestyle.';
  } else if (ratio >= 1.0) {
    label = 'Just enough — no big cushion';
    color = 'var(--amber)';
    advice = 'You are breaking even. One unexpected bill could push you negative.';
  } else {
    label = 'Not enough — you are losing money each year';
    color = 'var(--rose)';
    advice = 'You need to either earn more (raise, second job, remote work, rent a property) or cut costs (cheaper food, sell a car, reduce family support, cancel insurance).';
  }

  const card = '<section class="card"><h3>Does your income cover your life?</h3>' +
    '<div class="row"><span>Yearly income (salary + rent + interest + remote)</span><b class="mono" style="color:var(--mint)">' + money(income) + '</b></div>' +
    '<div class="row"><span>Yearly expenses</span><b class="mono" style="color:var(--rose)">' + money(expenses) + '</b></div>' +
    '<div class="row"><span><b>Net this year</b></span><b class="mono" style="color:' + (net >= 0 ? 'var(--mint)' : 'var(--rose)') + '">' + money(net) + '</b></div>' +
    '<div class="row"><span><b>Status</b></span><b style="color:' + color + '">' + label + '</b></div>' +
    '<p class="muted" style="font-size:.82rem;margin-top:8px">' + advice + '</p>' +
    '</section>';

  return card + html;
};

/* ============ 2. RENTAL MAINTENANCE — fix the absurd formula ============ */
/* The original charges maintenance = property_value × 1.2% (or 2.5% if run-down).
   For a 200M EGP property that means 2.4M–5M EGP per year — way too high.
   Realistic: landlord spends ~8–12% of collected rent on maintenance.
   We wrap the settlement to refund the difference. */

const P43_settleRentalBefore = (typeof p12SettleRentalYear === 'function') ? p12SettleRentalYear : null;
if (P43_settleRentalBefore) {
  p12SettleRentalYear = function () {
    P43_settleRentalBefore.apply(this, arguments);

    if (!S || !Array.isArray(S.ownedHomes)) return;
    let refund = 0;

    S.ownedHomes.forEach(function (h) {
      if (!h || !h.p12) return;
      if (h.status !== 'p12-rented') return;
      const val = Math.max(0, Number(h.value) || 0);
      const rent = Math.max(0, Number(h.rentAmount) || 0) * 12;
      const oldMaintenance = val * ((Number(h.cond) || 100) < 50 ? 0.025 : 0.012);
      const newMaintenance = rent * 0.10;   /* 10% of collected rent */
      const excess = Math.max(0, oldMaintenance - newMaintenance);
      refund += excess;
    });

    if (refund > 0.5) {
      S.wealth += refund;
      S.expenses = Math.max(0, (S.expenses || 0) - refund);
      if (!S.bill) S.bill = {};
      S.bill.rentalMaintenance = Math.max(0, (S.bill.rentalMaintenance || 0) - refund);
      if (S.yearPopup) S.yearPopup.expenses = Math.max(0, (S.yearPopup.expenses || 0) - refund);
      log('Rental maintenance adjusted to a realistic 10% of collected rent. Refunded ' + money(refund) + '.');
    }
  };
}

/* ============ 3. bill.propertyRent is income, not expense — hide it ============ */
/* The base game adds collected rent as a positive number into S.bill.
   The expense view then shows it with a minus sign, which is confusing.
   We strip it out of the bill entirely; the income side already counts it. */
const P43_viewMoneyBefore = viewMoney;
viewMoney = function () {
  if (S && S.bill && S.bill.propertyRent) {
    /* Move to a separate field so it doesn't appear as an expense */
    if (!S._p43RentalIncomeNote) S._p43RentalIncomeNote = 0;
    S._p43RentalIncomeNote += S.bill.propertyRent;
    delete S.bill.propertyRent;
  }
  let html = P43_viewMoneyBefore();
  /* Show a small income note above expense breakdown */
  if (S && S._p43RentalIncomeNote > 0) {
    html = html.replace('<section class="card"><h3>Last Year Expense Breakdown</h3>',
      '<section class="card"><h3>Last Year Expense Breakdown</h3>' +
      '<p class="muted" style="font-size:.82rem;margin-bottom:6px">Rental income received from tenants: <b style="color:var(--mint)">+' + money(S._p43RentalIncomeNote) + '</b> (already included in your income above)</p>');
  }
  return html;
};

/* ============ 4. WHERE DO I LIVE banner on Assets tab ============ */
function p43CurrentHomeName() {
  if (!S) return 'Unknown';
  if (S.housing === 'parents') return "Parents' home";
  if (!S.housing) return 'Homeless — no fixed address';
  const own = (S.ownedHomes || []).find(function (h) { return h.id === S.housing; });
  if (own) return own.name + ' (owned)';
  if (typeof HOUSING_CATALOG !== 'undefined') {
    const cat = HOUSING_CATALOG.find(function (c) { return c.id === S.housing && c.kind === 'rent'; });
    if (cat) return cat.name + ' (rented)';
  }
  return 'Unknown';
}

function p43WhereDoILive() {
  if (!S) return '';
  const home = p43CurrentHomeName();
  let status = 'unknown';
  let color = 'var(--muted)';
  if (S.housing === 'parents') { status = 'Living with family'; color = 'var(--cyan)'; }
  else if (!S.housing) { status = 'Homeless'; color = 'var(--rose)'; }
  else if ((S.ownedHomes || []).some(function (h) { return h.id === S.housing; })) { status = 'Living in your own property'; color = 'var(--mint)'; }
  else { status = 'Renting'; color = 'var(--amber)'; }

  return '<section class="card" style="padding:12px 14px;border-color:' + color + '">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px">' +
    '<div><span class="muted" style="font-size:.72rem;letter-spacing:.06em">YOU CURRENTLY LIVE IN</span>' +
    '<div style="font-size:1rem;font-weight:600;margin-top:2px">' + home + '</div>' +
    '<span class="muted" style="font-size:.8rem">' + status + '</span></div>' +
    '<span style="font-size:1.8rem">🏠</span>' +
    '</div></section>';
}

const P43_viewAssetsBefore = viewAssets;
viewAssets = function () {
  let html = P43_viewAssetsBefore();
  /* Insert banner right after the first section (portfolio) or at top */
  const firstSectionEnd = html.indexOf('</section>');
  if (firstSectionEnd !== -1) {
    html = html.slice(0, firstSectionEnd + 10) + p43WhereDoILive() + html.slice(firstSectionEnd + 10);
  } else {
    html = p43WhereDoILive() + html;
  }
  return html;
};

/* ============ 5. PROPERTY CARD — clear tenant / contract / increase info ============ */
/* Replace the status line in each owned property block */
const P43_viewAssetsForTenant = viewAssets;
viewAssets = function () {
  let html = P43_viewAssetsForTenant();

  /* Enhance the status line for each property */
  const homes = (S && Array.isArray(S.ownedHomes)) ? S.ownedHomes : [];
  homes.forEach(function (h) {
    if (!h || !h.name) return;
    /* Find the status block for this home by name */
    const escName = h.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp('(<b>' + escName + '<\\/b>[\\s\\S]*?<span class="muted" style="font-size:\\.85rem">Status: <b>)([^<]*)(<\\/b>)');

    const isLive = S.housing === h.id;
    const isRented = h.status === 'p12-rented' && h.tenant;
    const isListed = h.status === 'p12-listed';
    const isVacant = !isLive && !isRented && !isListed;

    let statusLabel = 'Vacant — no tenant';
    let statusColor = 'var(--rose)';
    if (isLive) { statusLabel = '🏠 YOU LIVE HERE'; statusColor = 'var(--mint)'; }
    else if (isRented) { statusLabel = '✅ RENTED OUT — Tenant in place'; statusColor = 'var(--mint)'; }
    else if (isListed) { statusLabel = '⏳ Listed for rent — waiting for tenant'; statusColor = 'var(--amber)'; }

    /* Extract the existing status line and replace */
    html = html.replace(re, function (m, pre, old, post) {
      return pre + '<span style="color:' + statusColor + ';font-weight:700">' + statusLabel + '</span>' + post;
    });

    /* Add a contract detail block if rented */
    if (isRented) {
      const rate = (typeof rateNow === 'function') ? rateNow() : 1;
      const monthlyEGP = Math.round((Number(h.rentLocalAmount) || (Number(h.rentAmount) || 0) * rate) || 0);
      const contractStart = h.tenantStartYear || gameYear();
      const contractYears = Math.max(0, gameYear() - contractStart);
      const risePct = Number(h.rentStepPct) || 0;

      const detail = '<div style="margin-top:8px;padding:8px 10px;background:rgba(52,211,153,.08);border-left:3px solid var(--mint);border-radius:6px">' +
        '<b style="font-size:.85rem">Tenant contract</b>' +
        '<div class="row"><span>Monthly rent collected</span><b class="mono">' + monthlyEGP.toLocaleString() + ' EGP</b></div>' +
        '<div class="row"><span>Tenant since</span><b>' + contractStart + ' (' + contractYears + ' year' + (contractYears === 1 ? '' : 's') + ')</b></div>' +
        '<div class="row"><span>Contract annual increase</span><b>' + (risePct > 0 ? risePct + '% per year' : 'Fixed — no increase') + '</b></div>' +
        '<div class="row"><span>Market-adjusted rent (auto)</span><b>' + (h.p23AutoMarketRent ? 'Yes — follows market' : 'No — fixed at your setting') + '</b></div>' +
        '</div>';

      /* Find the property block and append the detail after the status line */
      const statusPos = html.search(new RegExp('<span style="color:' + statusColor + ';font-weight:700">' + statusLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      if (statusPos !== -1) {
        /* Insert after closing </span> of status */
        const afterStatus = html.indexOf('</span>', statusPos);
        if (afterStatus !== -1) {
          const insertAt = html.indexOf('</span>', afterStatus + 7);
          const insertPoint = html.indexOf('</div>', afterStatus + 7) + 6;
          html = html.slice(0, insertPoint) + detail + html.slice(insertPoint);
        }
      }
    } else if (isVacant && !isLive) {
      const lossNote = '<div style="margin-top:8px;padding:8px 10px;background:rgba(251,113,133,.08);border-left:3px solid var(--rose);border-radius:6px">' +
        '<b style="font-size:.85rem">Vacant property — you are losing money</b>' +
        '<p class="muted" style="font-size:.8rem;margin-top:2px">Taxes, maintenance and any mortgage still apply every year. Set a market-based rent and find a tenant as soon as possible.</p>' +
        '</div>';
      const vPos = html.search(new RegExp('<span style="color:var(--rose);font-weight:700">Vacant — no tenant'));
      if (vPos !== -1) {
        const insertPoint = html.indexOf('</div>', vPos) + 6;
        html = html.slice(0, insertPoint) + lossNote + html.slice(insertPoint);
      }
    }
  });

  return html;
};

/* ============ 6. RUN ON LOAD ============ */
if (S) {
  /* Strip any old propertyRent lingering in the bill */
  if (S.bill && S.bill.propertyRent) {
    S._p43RentalIncomeNote = (S._p43RentalIncomeNote || 0) + S.bill.propertyRent;
    delete S.bill.propertyRent;
  }
}
