/* =====================================================================
   58. CERTIFICATE + MONTHLY INCOME + OVERVIEW FIXES
   Fixes:
   - Certificates credit interest monthly in monthly mode (no year-end
     double-credit)
   - Certificate "totalPaid" counter updated every month so displays
     reflect real earned interest
   - Financial Overview shows ACTUAL earned vs PROJECTED monthly
   - Financial Overview shows monthly rental income in monthly mode
   - Bank tab totals match the Financial Overview
   Load AFTER 57-credit-uni-events.js and BEFORE 99-boot.js
   ===================================================================== */

function p58Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

function p58Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p58) o.p58 = { lastCertLogMonth: -1 };
}
const P58_migrate = migrate;
migrate = function (o) { const r = P58_migrate(o); p58Init(r); return r; };
const P58_newGame = newGame;
newGame = function () { P58_newGame.apply(this, arguments); p58Init(S); };

/* ============ 1. p32ProcessCertificates — skip interest in monthly mode ============ */
if (typeof p32ProcessCertificates === 'function') {
  const P58_p32Before = p32ProcessCertificates;
  p32ProcessCertificates = function () {
    if (S && S.pacing === 'monthly') {
      /* Monthly mode already credited interest via p54's live-income tick.
         Here we only advance yearsHeld and handle maturity. */
      if (!S || !S.certificates || !S.certificates.length) return;
      const rate = p58Rate();
      S.certificates.forEach(function (cert) {
        if (!cert || cert.matured) return;
        if ((cert.yearsHeld || 0) >= (cert.yearsTotal || 3)) return;
        cert.yearsHeld = (cert.yearsHeld || 0) + 1;
        if (cert.yearsHeld >= cert.yearsTotal) {
          const principalInternal = Number(cert.principalInternal)
            || ((Number(cert.principalEGP) || 0) / rate);
          S.wealth += principalInternal;
          cert.matured = true;
          log('📜 ' + (cert.name || 'Certificate') + ' matured. Principal of ' +
              (Number(cert.principalEGP) || 0).toLocaleString() + ' EGP returned to checking.');
          if (typeof realismNotice === 'function') {
            realismNotice('Certificate matured',
              (cert.name || 'Certificate') + ' completed its term. Principal returned. ' +
              'Total interest earned: ' + Math.round(Number(cert.totalPaid) || 0).toLocaleString() + ' EGP.');
          }
        }
      });
      S.certificates = S.certificates.filter(function (c) { return c && !c.matured; });
      return;
    }
    return P58_p32Before.apply(this, arguments);
  };
}

/* ============ 2. Monthly tick: update totalPaid + log (no wealth change) ============ */
const P58_p52TickBefore = p52MonthlyTick;
p52MonthlyTick = function () {
  P58_p52TickBefore.apply(this, arguments);
  if (!S || S.pacing !== 'monthly') return;
  if (!S.certificates || !S.certificates.length) return;
  if (S.age < 18) return;

  let totalEGP = 0;
  S.certificates.forEach(function (c) {
    if (!c || c.matured) return;
    const idx = Math.min(c.yearsHeld || 0, (c.rateSchedule || []).length - 1);
    const r = (c.rateSchedule || [])[idx] || 0;
    const monthlyEGP = ((Number(c.principalEGP) || 0) * r) / 12;
    if (monthlyEGP <= 0) return;
    totalEGP += monthlyEGP;
    c.totalPaid = (Number(c.totalPaid) || 0) + monthlyEGP;
  });

  /* Log once per month */
  p58Init(S);
  const monthKey = S.pacingAbsoluteMonth || 0;
  if (totalEGP > 0 && S.p58.lastCertLogMonth !== monthKey) {
    S.p58.lastCertLogMonth = monthKey;
    log('📈 Certificate interest credited this month: +' +
        Math.round(totalEGP).toLocaleString() + ' EGP.');
  }
};

/* ============ 3. Financial Overview fix (viewMoney) ============ */
const P58_viewMoneyBefore = viewMoney;
viewMoney = function () {
  let html = P58_viewMoneyBefore();
  if (!S || S.age < 18) return html;

  const certs = Array.isArray(S.certificates)
    ? S.certificates.filter(function (c) { return c && !c.matured; })
    : [];

  /* Remove any existing certificate rows to avoid duplicates */
  html = html.replace(/<div class="row"><span>Certificate interest earned[^<]*<\/span>[\s\S]*?<\/div>/g, '');
  html = html.replace(/<div class="row"><span>Certificate income \(projected\)<\/span>[\s\S]*?<\/div>/g, '');
  html = html.replace(/<div class="row"><span>Rental income \(monthly\)<\/span>[\s\S]*?<\/div>/g, '');
  html = html.replace(/<div class="row"><span>Rented properties<\/span>[\s\S]*?<\/div>/g, '');

  if (certs.length) {
    const earnedEGP = certs.reduce(function (s, c) {
      return s + (Number(c.totalPaid) || 0);
    }, 0);

    let monthlyProj = 0;
    certs.forEach(function (c) {
      const idx = Math.min(c.yearsHeld || 0, (c.rateSchedule || []).length - 1);
      const r = (c.rateSchedule || [])[idx] || 0;
      monthlyProj += ((Number(c.principalEGP) || 0) * r) / 12;
    });

    const certRows =
      '<div class="row"><span>Certificate interest earned (to date)</span>' +
      '<b class="mono" style="color:var(--mint)">+E£' + Math.round(earnedEGP).toLocaleString() + '</b></div>' +
      (monthlyProj > 0
        ? '<div class="row"><span>Certificate income (projected)</span>' +
          '<b class="mono" style="color:var(--mint)">+E£' + Math.round(monthlyProj).toLocaleString() + '/month</b></div>'
        : '');

    const anchor = /(<div class="row"><span>Retirement pot<\/span><b[^>]*>[^<]*<\/b><\/div>)/;
    if (anchor.test(html)) {
      html = html.replace(anchor, '$1' + certRows);
    }
  }

  /* Monthly rental income row (monthly mode only) */
  if (S.pacing === 'monthly') {
    const rentals = (S.ownedHomes || []).filter(function (h) {
      return h && (h.status === 'p12-rented' || h.status === 'rent') && h.rentInc;
    });
    const monthlyRentInternal = rentals.reduce(function (sum, h) {
      return sum + (Number(h.rentAmount) || 0);
    }, 0);

    if (monthlyRentInternal > 0) {
      const rentRow =
        '<div class="row"><span>Rental income (monthly)</span>' +
        '<b class="mono" style="color:var(--mint)">+' + money(monthlyRentInternal) + '/month</b></div>' +
        '<div class="row"><span>Rented properties</span><b>' + rentals.length + '</b></div>';
      const propAnchor = /(<div class="row"><span>Property \(gross value\)<\/span>[\s\S]*?<\/div>)/;
      if (propAnchor.test(html)) {
        html = html.replace(propAnchor, rentRow + '$1');
      }
    }
  }

  return html;
};

/* ============ 4. Bank tab: keep certificate totals consistent ============ */
const P58_viewBankBefore = viewBank;
viewBank = function () {
  let html = P58_viewBankBefore();
  if (!S || S.age < 18) return html;

  const certs = Array.isArray(S.certificates)
    ? S.certificates.filter(function (c) { return c && !c.matured; })
    : [];
  const earnedEGP = certs.reduce(function (s, c) {
    return s + (Number(c.totalPaid) || 0);
  }, 0);

  /* Force "Total interest earned" to the accurate value */
  html = html.replace(
    /<div class="row"><span>Total interest earned<\/span>[\s\S]*?<\/div>/,
    '<div class="row"><span>Total interest earned</span>' +
    '<b class="mono" style="color:var(--mint)">+E£' + Math.round(earnedEGP).toLocaleString() + '</b></div>'
  );

  /* Force per-cert "Total Dividends Earned" lines to match */
  certs.forEach(function (cert) {
    const cid = cert.id;
    if (!cid) return;
    const pattern = new RegExp('(Total (?:Dividends|interest) [^:<]*:\\s*)([\\d,\\.]+)(\\s*EGP)', 'g');
    /* Not per-cert scoped — the base shows only the current row; leave as-is. */
  });

  return html;
};

/* ============ 5. Diagnostics helper ============ */
window.p58Debug = function () {
  if (!S) return console.log('No state.');
  const certs = S.certificates || [];
  console.log('Pacing:', S.pacing, '| Month:', S.pacingMonth);
  console.log('Certificates:', certs.length);
  certs.forEach(function (c, i) {
    console.log('  #' + i, c.name, '| principal:', c.principalEGP,
      '| yearsHeld:', c.yearsHeld, '| totalPaid:', c.totalPaid);
  });
  const rate = p58Rate();
  let annual = 0;
  certs.forEach(function (c) {
    const idx = Math.min(c.yearsHeld || 0, (c.rateSchedule || []).length - 1);
    annual += (Number(c.principalEGP) || 0) * ((c.rateSchedule || [])[idx] || 0);
  });
  console.log('Projected annual EGP:', Math.round(annual),
    '| monthly EGP:', Math.round(annual / 12),
    '| internal monthly:', (annual / 12 / rate).toFixed(2));
};

/* ============ 6. Init on load ============ */
p58Init(S);
