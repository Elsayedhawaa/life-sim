/* =====================================================================
   58. ROBUST CERTIFICATES & FINANCIAL OVERVIEW FIX
   - Overrides certificate booking, monthly payouts, and financial display
   ===================================================================== */

/* --- 1. Ensure State Structures Exist --- */
function p58InitCertState() {
  if (!S) return;
  if (!Array.isArray(S.activeCertificates)) {
    /* Migrate older arrays if they exist */
    S.activeCertificates = Array.isArray(S.certificates) ? S.certificates : [];
  }
  if (typeof S.certificateInterestEarned !== 'number') {
    S.certificateInterestEarned = 0;
  }
}

/* --- 2. Robust Monthly Dividend Payout Engine --- */
function p58ProcessCertificates() {
  if (!S) return;
  p58InitCertState();

  if (!S.activeCertificates.length) return;

  let totalPayoutInternal = 0;
  const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;

  S.activeCertificates.forEach(function (cert) {
    if (!cert || cert.redeemed) return;

    /* Determine annual rate */
    let annualRate = 0.1775;
    const type = (cert.type || cert.name || '').toLowerCase();

    if (type.includes('ibn misr') || type.includes('descending')) {
      const yr = cert.currentYear || cert.year || 1;
      if (yr === 1) annualRate = 0.2050;
      else if (yr === 2) annualRate = 0.1625;
      else annualRate = 0.1225;
    } else if (type.includes('cib') || type.includes('premium')) {
      annualRate = 0.1800;
    } else if (type.includes('max') || type.includes('alexbank')) {
      annualRate = 0.1825;
    } else if (type.includes('quarterly')) {
      annualRate = 0.1785;
    }

    const principalInternal = Number(cert.principal || cert.amount || 0);
    if (principalInternal <= 0) return;

    /* Monthly payout calculation */
    const monthlyPayout = (principalInternal * annualRate) / 12;

    totalPayoutInternal += monthlyPayout;
    cert.totalEarned = (Number(cert.totalEarned) || 0) + monthlyPayout;
    S.certificateInterestEarned += monthlyPayout;
  });

  if (totalPayoutInternal > 0) {
    S.wealth = (Number(S.wealth) || 0) + totalPayoutInternal;
    if (typeof log === 'function') {
      const egp = Math.round(totalPayoutInternal * rate);
      log('🏦 Deposit Certificates Payout: +' + egp.toLocaleString() + ' EGP added to checking.');
    }
  }
}

/* Hook into monthly tick */
const P58_monthlyTickBefore = window.p52MonthlyTick;
window.p52MonthlyTick = function () {
  if (P58_monthlyTickBefore) P58_monthlyTickBefore.apply(this, arguments);
  p58ProcessCertificates();
};


/* --- 3. Override Certificate Booking to Store Properly --- */
window.p58BookCertificateCustom = function (name, principalInternal, type) {
  p58InitCertState();
  if (!S) return;

  if (S.wealth < principalInternal) {
    if (typeof hint === 'function') hint('Not enough cash to book this certificate.');
    return;
  }

  /* Deduct cash */
  S.wealth -= principalInternal;

  /* Push to active list */
  S.activeCertificates.push({
    id: 'cert_' + Date.now(),
    name: name,
    type: type || name,
    principal: principalInternal,
    totalEarned: 0,
    year: 1,
    currentYear: 1,
    startDate: (typeof gameYear === 'function' ? gameYear() : 2026)
  });

  if (typeof log === 'function') {
    log('🔒 Successfully booked certificate: ' + name + ' for E£' + Math.round(principalInternal * (typeof rateNow === 'function' ? rateNow() : 52.7)).toLocaleString());
  }

  if (typeof render === 'function') render();
};


/* --- 4. Fully Override Financial Overview to Show Real Numbers --- */
const P58_viewFinancialOverviewBefore = window.viewFinancialOverview;
window.viewFinancialOverview = function () {
  let html = P58_viewFinancialOverviewBefore ? P58_viewFinancialOverviewBefore() : '';
  p58InitCertState();
  if (!S) return html;

  const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;

  let totalPrincipalInternal = 0;
  let totalEarnedInternal = S.certificateInterestEarned || 0;

  S.activeCertificates.forEach(function (c) {
    if (!c || c.redeemed) return;
    totalPrincipalInternal += Number(c.principal || c.amount || 0);
  });

  const principalEGP = Math.round(totalPrincipalInternal * rate);
  const earnedEGP = Math.round(totalEarnedInternal * rate);
  const rentEGP = Math.round(Number(S.monthlyRent || S.rent || 0) * rate);

  /* Build replacement sections or inject them cleanly */
  let certSection = '';
  if (principalEGP > 0 || S.activeCertificates.length > 0) {
    certSection = '<div class="row"><span>Active Deposit Certificates</span><b>E£' + principalEGP.toLocaleString() + '</b></div>' +
                  '<div class="row"><span>Certificate Total Interest Earned</span><b style="color:var(--green)">+E£' + earnedEGP.toLocaleString() + '</b></div>';
    
    if (html.includes('Deposit certificates')) {
      html = html.replace(/<div class="row"><span>Deposit certificates[^<]*<\/div>[^<]*<\/div>/i, certSection);
    } else {
      html = html.replace(/(<div class="card">|<section class="card">)/i, '$1' + certSection);
    }
  }

  if (rentEGP > 0) {
    const rentRow = '<div class="row"><span>Monthly Housing Rent</span><b style="color:var(--red)">-E£' + rentEGP.toLocaleString() + '/mo</b></div>';
    if (!html.includes('Monthly Housing Rent')) {
      html = html.replace(/(<div class="card">|<section class="card">)/i, '$1' + rentRow);
    }
  }

  return html;
};

/* --- 5. Render Active Certificates List in UI --- */
window.p58RenderActiveCertificatesList = function () {
  p58InitCertState();
  if (!S || !S.activeCertificates.length) return '<p>No active certificates.</p>';

  const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;
  let listHtml = '<div class="card"><h3>Your Active Certificates</h3>';

  S.activeCertificates.forEach(function (cert, idx) {
    if (!cert || cert.redeemed) return;
    const pEGP = Math.round(Number(cert.principal || 0) * rate);
    const eEGP = Math.round(Number(cert.totalEarned || 0) * rate);

    listHtml += '<div class="row" style="flex-direction:column; align-items:flex-start; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:8px;">' +
      '<div><b>' + (cert.name || cert.type) + '</b></div>' +
      '<div style="font-size:0.9em; opacity:0.8;">Principal: E£' + pEGP.toLocaleString() + ' · Year ' + (cert.currentYear || cert.year || 1) + ' of 3</div>' +
      '<div style="font-size:0.9em; color:var(--green);">Total Dividends Earned: +E£' + eEGP.toLocaleString() + '</div>' +
      '</div>';
  });

  listHtml += '</div>';
  return listHtml;
};

p58InitCertState();
