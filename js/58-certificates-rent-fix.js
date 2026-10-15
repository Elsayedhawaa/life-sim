/* =====================================================================
   58. DEPOSIT CERTIFICATES MONTHLY PAYOUT + RENT IN FINANCIAL OVERVIEW FIX
   - Fixes certificate monthly dividend payouts to checking account & earnings tracker
   - Fixes financial overview rendering to properly include monthly rent expenses
   ===================================================================== */

/* --- 1. Fix Certificate Monthly Payouts & Accumulation --- */
const P58_p52MonthlyTickBefore = (typeof p52MonthlyTick === 'function') ? p52MonthlyTick : null;

p52MonthlyTick = function () {
  if (P58_p52MonthlyTickBefore) P58_p52MonthlyTickBefore.apply(this, arguments);

  if (!S || !Array.isArray(S.activeCertificates) || S.activeCertificates.length === 0) return;

  const rate = (typeof rateNow === 'function') ? rateNow() : 52.7;

  S.activeCertificates.forEach(function (cert) {
    if (!cert) return;

    /* Determine annual yield for the current year of the certificate */
    let annualRate = 0.1775; /* default fallback */
    const yr = cert.year || 1;

    if (cert.schedule && Array.isArray(cert.schedule)) {
      annualRate = cert.schedule[yr - 1] || cert.schedule[cert.schedule.length - 1];
    } else if (cert.rate) {
      annualRate = cert.rate;
    }

    /* Calculate monthly payout in internal currency */
    const principalInternal = Number(cert.principal) || 0;
    const monthlyRate = annualRate / 12;
    const monthlyPayoutInternal = principalInternal * monthlyRate;

    /* Add payout directly to checking account (wealth) */
    S.wealth = (Number(S.wealth) || 0) + monthlyPayoutInternal;

    /* Track total dividends earned */
    cert.totalEarned = (Number(cert.totalEarned) || 0) + monthlyPayoutInternal;

    /* Global certificate tracking if exists */
    S.certTotalEarned = (Number(S.certTotalEarned) || 0) + monthlyPayoutInternal;
  });
};
window.p52MonthlyTick = p52MonthlyTick;


/* --- 2. Fix Financial Overview: Include Monthly Rent --- */
const P58_viewFinancialOverviewBefore = (typeof viewFinancialOverview === 'function') ? viewFinancialOverview : null;

if (P58_viewFinancialOverviewBefore) {
  viewFinancialOverview = function () {
    let html = P58_viewFinancialOverviewBefore();
    
    /* Ensure monthly rent or housing expense is reflected cleanly in the overview if S.housing is active */
    if (S && S.housing && S.housing !== 'parents') {
      const rentEGP = S.housingRentEGP || (typeof p14EgyptPriceIndex === 'function' ? Math.round(5000 * p14EgyptPriceIndex(gameYear())) : 5000);
      /* If rent row isn't visible in overview, we can append a clean indicator row or inject it */
      if (!html.includes('Monthly Rent') && !html.includes('Housing Rent')) {
        const insertionMarker = '</div>';
        const rentRow = '<div class="row"><span>Monthly Housing / Rent</span><b>' + rentEGP.toLocaleString() + ' EGP / mo</b></div>';
        html = html.replace(insertionMarker, rentRow + insertionMarker);
      }
    }
    return html;
  };
}
