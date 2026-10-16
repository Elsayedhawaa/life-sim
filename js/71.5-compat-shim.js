/* =====================================================================
   71.5 — COMPATIBILITY SHIM
   Runs BEFORE 72 and 73 so their wrappers find the symbols they expect.
   Fixes:
   - companyListFor is not defined        (72)
   - P12_EGY_BRANDS is not defined        (73)
   - langCard: reading '.n' of undefined  (25)
   ===================================================================== */

(function p715CompatShim() {
  'use strict';

  /* ---------------------------------------------------------------
     1. companyListFor — expected by files 72 and 73
     --------------------------------------------------------------- */
  if (typeof window.companyListFor !== 'function') {
    window.companyListFor = function (country) {
      country = country || (typeof S !== 'undefined' && S && S.country) || 'egy';
      if (country === 'egy') {
        return [
          { id: 'shim_egy_1',  name: 'Cairo Business Services',       title: 'Customer Support Agent',  trackId: 'entry',   factor: 1, smarts: 20, eng: 40 },
          { id: 'shim_egy_2',  name: 'Nile Digital Solutions',         title: 'Junior Developer',        trackId: 'tech',    factor: 1, smarts: 50, eng: 50 },
          { id: 'shim_egy_3',  name: 'Alexandria Commercial Bank',     title: 'Junior Analyst',          trackId: 'finance', factor: 1, smarts: 45, eng: 40 },
          { id: 'shim_egy_4',  name: 'Cleopatra Healthcare Network',   title: 'Junior Clinical Role',    trackId: 'medical', factor: 1, smarts: 60, eng: 45 },
          { id: 'shim_egy_5',  name: 'Sphinx Legal Partners',          title: 'Junior Legal Associate',  trackId: 'law',     factor: 1, smarts: 55, eng: 45 }
        ];
      }
      return [
        { id: 'shim_local_1', name: 'Local Business Services', title: 'Assistant', trackId: 'entry', factor: 1, smarts: 20, eng: 60 }
      ];
    };
  }

  /* ---------------------------------------------------------------
     2. P12_EGY_BRANDS — expected by file 73
     --------------------------------------------------------------- */
  if (typeof window.P12_EGY_BRANDS === 'undefined') {
    window.P12_EGY_BRANDS = [
      'Vodafone Egypt', 'Vodafone VOIS', 'Teleperformance Egypt', 'Concentrix Egypt',
      'Raya CX', 'Xceed', 'Alorica Egypt', 'Foundever Egypt', 'Sutherland Egypt',
      'Nile Data Systems', 'Pyramid Digital Solutions', 'Cairo Business Process Services',
      'Fawry', 'Commercial International Bank', 'Alexandria Commercial Bank',
      'National Bank of Egypt', 'Cleopatra Healthcare Network', 'NileCare Medical Network',
      'Mediterranean Medical Group', 'Eva Pharma', 'Ibnsina Pharma', 'El Ezaby Pharmacies',
      'Sphinx Legal Partners', 'Al-Ahram', 'Al-Masry Al-Youm',
      'Delta Audit & Tax', 'Mansoura Industrial Group', 'Orascom Construction'
    ];
  }

  /* ---------------------------------------------------------------
     3. COUNTRIES defaults — stops langCard from throwing
     --------------------------------------------------------------- */
  if (typeof COUNTRIES === 'object' && COUNTRIES) {
    const fallbacks = {
      'egy': { n: 'Egypt',           f: '🇪🇬', sym: 'E£', cur: 'EGP' },
      'gbr': { n: 'United Kingdom',  f: '🇬🇧', sym: '£',  cur: 'GBP' },
      'usa': { n: 'United States',   f: '🇺🇸', sym: '$',  cur: 'USD' },
      'deu': { n: 'Germany',         f: '🇩🇪', sym: '€',  cur: 'EUR' },
      'fra': { n: 'France',          f: '🇫🇷', sym: '€',  cur: 'EUR' },
      'ita': { n: 'Italy',           f: '🇮🇹', sym: '€',  cur: 'EUR' },
      'nld': { n: 'Netherlands',     f: '🇳🇱', sym: '€',  cur: 'EUR' },
      'esp': { n: 'Spain',           f: '🇪🇸', sym: '€',  cur: 'EUR' },
      'can': { n: 'Canada',          f: '🇨🇦', sym: 'C$', cur: 'CAD' },
      'aus': { n: 'Australia',       f: '🇦🇺', sym: 'A$', cur: 'AUD' },
      'nzl': { n: 'New Zealand',     f: '🇳🇿', sym: 'NZ$', cur: 'NZD' },
      'jpn': { n: 'Japan',           f: '🇯🇵', sym: '¥',  cur: 'JPY' },
      'kor': { n: 'South Korea',     f: '🇰🇷', sym: '₩',  cur: 'KRW' },
      'sgp': { n: 'Singapore',       f: '🇸🇬', sym: 'S$', cur: 'SGD' },
      'uae': { n: 'UAE',             f: '🇦🇪', sym: 'د.إ', cur: 'AED' },
      'sau': { n: 'Saudi Arabia',    f: '🇸🇦', sym: '﷼',   cur: 'SAR' },
      'tur': { n: 'Türkiye',         f: '🇹🇷', sym: '₺',  cur: 'TRY' },
      'ind': { n: 'India',           f: '🇮🇳', sym: '₹',  cur: 'INR' },
      'pak': { n: 'Pakistan',        f: '🇵🇰', sym: '₨',  cur: 'PKR' },
      'nga': { n: 'Nigeria',         f: '🇳🇬', sym: '₦',  cur: 'NGN' },
      'bra': { n: 'Brazil',          f: '🇧🇷', sym: 'R$', cur: 'BRL' }
    };
    Object.keys(fallbacks).forEach(function (code) {
      if (!COUNTRIES[code] || !COUNTRIES[code].n) {
        COUNTRIES[code] = Object.assign({}, fallbacks[code], COUNTRIES[code] || {});
      }
    });
  }

  /* ---------------------------------------------------------------
     4. langCard defensive re-wrap — never throws again
     --------------------------------------------------------------- */
  if (typeof window.langCard === 'function') {
    const origLangCard = window.langCard;
    window.langCard = function (lang, info) {
      try {
        if (!info) return '';
        /* Ensure info.country exists so downstream code can't crash */
        if (!info.country) info.country = 'egy';
        /* Ensure the country entry exists */
        if (typeof COUNTRIES === 'object' && COUNTRIES && !COUNTRIES[info.country]) {
          COUNTRIES[info.country] = { n: String(info.country).toUpperCase(), f: '🌐', sym: '', cur: '' };
        }
        return origLangCard.apply(this, arguments);
      } catch (e) {
        console.error('[p71.5] langCard failed for', lang, e && e.message);
        return '';
      }
    };
  }

  console.log('[p71.5] Compat shim loaded — companyListFor, P12_EGY_BRANDS, COUNTRIES defaults');
})();
