/* =====================================================================
   61. INHERITANCE + MONTHLY DISPLAY FIXES
   Load AFTER 60-family-home-inheritance.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. GENERATE PARENTS HOME ON MIGRATE (for old saves) ============ */
const P61_migrateBefore = migrate;
migrate = function (o) {
  const r = P61_migrateBefore(o);
  if (!r) return r;
  if (r.housing === 'parents' && (!r.p60 || !r.p60.parentsHome)) {
    const prevS = (typeof S !== 'undefined') ? S : undefined;
    try {
      if (typeof S !== 'undefined') S = r;
      if (typeof p60GenerateParentsHome === 'function') p60GenerateParentsHome();
    } catch (e) {
      console.error('p61: parents home generation failed:', e);
    } finally {
      if (typeof S !== 'undefined' && prevS !== undefined) S = prevS;
    }
  }
  return r;
};

/* ============ 2. SAFETY NET — run after boot if still missing ============ */
function p61EnsureParentsHome() {
  if (!S) return false;
  if (typeof p60Init === 'function') p60Init(S);
  if (S.housing !== 'parents') return false;
  if (S.p60 && S.p60.parentsHome) return false;
  if (typeof p60GenerateParentsHome !== 'function') return false;
  try {
    p60GenerateParentsHome();
    if (typeof save === 'function') save();
    return true;
  } catch (e) {
    console.error('p61: parents home generation failed at runtime:', e);
    return false;
  }
}
setTimeout(p61EnsureParentsHome, 800);
setTimeout(p61EnsureParentsHome, 2000);
setTimeout(p61EnsureParentsHome, 4000);

if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () {
    if (S && S.housing === 'parents' && (!S.p60 || !S.p60.parentsHome)) {
      if (p61EnsureParentsHome()) render();
    }
  });
}

/* ============ 3. FIX COMPOUND INSTALLMENT DISPLAY (double rate bug) ============ */
/* The contract annualAmt is stored in EGP, but P56's monthly view wraps it in
   money() which multiplies by rate again → 20× inflation. Fix: rewrite the
   Compound installments row in the monthly property card using raw EGP. */
const P61_viewAssetsBefore = viewAssets;
viewAssets = function () {
  let html = P61_viewAssetsBefore();
  if (!S) return html;

  /* Only patch if the broken row exists */
  if (html.indexOf('Compound installments') === -1) return html;

  /* Recompute the correct EGP value from contracts */
  let installMonthlyEGP = 0;
  if (S.housingStore && Array.isArray(S.housingStore.contracts)) {
    S.housingStore.contracts.forEach(function (c) {
      if (!c || Number(c.remainingAmt) <= 0) return;
      installMonthlyEGP += (Number(c.annualAmt) || 0) / 12;
    });
  }

  /* Replace the inflated display with the accurate EGP figure */
  const brokenRow = /<div class="row"><span>Compound installments<\/span><b class="mono" style="color:var\(--rose\)">[^<]*<\/b><\/div>/;
  if (brokenRow.test(html)) {
    const goodRow = '<div class="row"><span>Compound installments</span>' +
      '<b class="mono" style="color:var(--rose)">' +
      Math.round(installMonthlyEGP).toLocaleString() +
      ' EGP/month</b></div>';
    html = html.replace(brokenRow, goodRow);
  }

  /* Also fix the net cashflow row by recomputing it */
  const netRow = /<div class="row" style="border-top:1px solid var\(--line\);margin-top:6px;padding-top:6px"><span><b>Net property cashflow<\/b><\/span><b class="mono"[^>]*>[^<]*<\/b><\/div>/;

  /* Compute each component in EGP */
  const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;

  /* Rental income in EGP/month */
  let rentEGP = 0;
  (S.ownedHomes || []).forEach(function (h) {
    if (!h) return;
    if ((h.status === 'p12-rented' || h.status === 'rent')) {
      if (h.rentLocalAmount) rentEGP += Number(h.rentLocalAmount);
      else if (h.rentAmount) rentEGP += Number(h.rentAmount) * rate;
    }
  });

  /* Mortgage in EGP/month */
  let mortgageEGP = 0;
  (S.ownedHomes || []).forEach(function (h) {
    if (!h || !(Number(h.balance) > 0)) return;
    if (h.pay && Number(h.pay) > 1) {
      /* h.pay is internal USD; convert to EGP */
      mortgageEGP += (Number(h.pay) * rate) / 12;
    }
  });

  /* Maintenance in EGP/month: 1% of value/year */
  let maintEGP = 0;
  (S.ownedHomes || []).forEach(function (h) {
    if (!h) return;
    maintEGP += (Number(h.value) || 0) * rate * 0.01 / 12;
  });

  /* Utilities in EGP/month */
  let utilEGP = 0;
  if (S.bill && S.bill.utilities) {
    utilEGP += (Number(S.bill.utilities) * rate) / 12;
  }

  const netEGP = rentEGP - mortgageEGP - installMonthlyEGP - maintEGP - utilEGP;

  if (netRow.test(html)) {
    const color = netEGP >= 0 ? 'var(--mint)' : 'var(--rose)';
    const goodNet = '<div class="row" style="border-top:1px solid var(--line);margin-top:6px;padding-top:6px"><span><b>Net property cashflow</b></span>' +
      '<b class="mono" style="color:' + color + '">' +
      (netEGP >= 0 ? '+' : '') + Math.round(netEGP).toLocaleString() + ' EGP/month</b></div>';
    html = html.replace(netRow, goodNet);
  }

  /* Also fix the "Mortgage payments" row if it's wrong */
  const mortRow = /<div class="row"><span>Mortgage payments<\/span><b class="mono" style="color:var\(--rose\)">[^<]*<\/b><\/div>/;
  if (mortRow.test(html) && mortgageEGP > 0) {
    const goodMort = '<div class="row"><span>Mortgage payments</span>' +
      '<b class="mono" style="color:var(--rose)">' +
      Math.round(mortgageEGP).toLocaleString() + ' EGP/month</b></div>';
    html = html.replace(mortRow, goodMort);
  }

  /* Fix the "Maintenance" row similarly */
  const maintRow = /<div class="row"><span>Maintenance \(1% of value\/year\)<\/span><b class="mono" style="color:var\(--rose\)">[^<]*<\/b><\/div>/;
  if (maintRow.test(html) && maintEGP > 0) {
    const goodMaint = '<div class="row"><span>Maintenance (1% of value/year)</span>' +
      '<b class="mono" style="color:var(--rose)">' +
      Math.round(maintEGP).toLocaleString() + ' EGP/month</b></div>';
    html = html.replace(maintRow, goodMaint);
  }

  /* Fix the "Rental income" row similarly */
  const rentRow = /<div class="row"><span>Rental income \(from tenants\)<\/span><b class="mono" style="color:var\(--mint\)">[^<]*<\/b><\/div>/;
  if (rentRow.test(html) && rentEGP > 0) {
    const goodRent = '<div class="row"><span>Rental income (from tenants)</span>' +
      '<b class="mono" style="color:var(--mint)">+' +
      Math.round(rentEGP).toLocaleString() + ' EGP/month</b></div>';
    html = html.replace(rentRow, goodRent);
  }

  return html;
};

/* ============ 4. VERIFY PANEL RENDERS ============ */
/* Force-render the parents home panel on the Real Estate tab when relevant */
const P61_viewAssetsBefore2 = viewAssets;
viewAssets = function () {
  let html = P61_viewAssetsBefore2();
  if (!S || S.housing !== 'parents') return html;

  /* If the parents home panel is missing from the rendered output, append it */
  if (html.indexOf('Your parents&#39; home') === -1 && html.indexOf("Your parents' home") === -1) {
    if (typeof p60ParentsHomePanel === 'function') {
      const panel = p60ParentsHomePanel();
      if (panel) html = panel + html;
    }
  }
  return html;
};

/* ============ 5. DEBUG HELPER ============ */
window.p61Debug = function () {
  if (!S) return console.log('No S.');
  console.log('housing:', S.housing);
  console.log('p60 init:', !!S.p60);
  console.log('parentsHome:', S.p60 && S.p60.parentsHome);
  console.log('contracts:', S.housingStore && S.housingStore.contracts && S.housingStore.contracts.length);
  if (S.housingStore && S.housingStore.contracts) {
    S.housingStore.contracts.forEach(function (c, i) {
      console.log('  #' + i, c.name, '| annualAmt:', c.annualAmt, '| remainingAmt:', c.remainingAmt);
    });
  }
  const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
  console.log('rate:', rate);
};

/* ============ 6. RUN ON LOAD ============ */
p61EnsureParentsHome();
