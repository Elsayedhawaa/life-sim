/* =====================================================================
   85. VIEW REBUILDS — patch viewCareer and viewWorld at the HTML level
   - Career: diversify companies deterministically, hide family biz abroad,
     fix work-authorization text using the actual visa
   - World: hide Egypt-context Schengen visa picker when abroad
   Load AFTER 84-career-reality-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

(function p85ViewRebuilds() {

  /* ---- Brand pool (UK-style, varied) ---- */
  const P85_BRANDS = [
    'Fenchurch', 'Kingsway', 'Aldgate', 'Paddington', 'Hampstead',
    'Richmond', 'Soho', 'Mayfair', 'Whitehall', 'Fleet',
    'Barbican', 'Bloomsbury', 'Chelsea', 'Greenwich', 'Kensington',
    'Westminster', 'Camden', 'Shoreditch', 'Islington', 'Southwark'
  ];

  function p85Hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
    return Math.abs(h);
  }
  function p85Brand(seed) {
    return P85_BRANDS[p85Hash(seed) % P85_BRANDS.length];
  }

  /* ---- 1. Company diversification, seeded by role so names stay stable ---- */
  function p85RewriteCompanies(html) {
    /* Pattern:  "Westbridge finance · Junior Accountant"
                 "Westbridge legal · Contracts Assistant" */
    return html.replace(
      /Westbridge (finance|legal|tech|medical|bio)((?:[^a-zA-Z]|\s)[^<]{0,60}?)(?=<|\n|$)/g,
      function (m, industry, tail) {
        /* Use industry + first meaningful words of tail as seed */
        const seed = industry + '|' + (tail || '').trim().slice(0, 25);
        const brand = p85Brand(seed);
        return brand + ' ' + industry + (tail || '');
      }
    );
  }

  /* ---- 2. Work authorization message (visa-aware) ---- */
  function p85FixWorkAuth(html) {
    if (typeof S === 'undefined' || !S) return html;
    if (S.country === S.home) return html;

    let replacement = '';
    if (S.p81 && S.p81.visa) {
      const v = S.p81.visa;
      if (v.type === 'student') {
        replacement = '⚠️ You are on a ' + v.name + '. Work allowed: ' + v.workRights + '. Full-time roles require employer sponsorship — most entry-level postings do not sponsor.';
      } else {
        replacement = '⚠️ Your ' + v.name + ' allows: ' + (v.workRights || 'limited work') + '.';
      }
    } else {
      replacement = '⚠️ You need a valid work visa for this country.';
    }

    html = html.replace(
      /You do not currently have work authorisation for this country\./g,
      replacement
    );
    html = html.replace(
      /You are not authorized to work in this country\./g,
      replacement
    );
    return html;
  }

  /* ---- 3. Remove family business card from Career while abroad ---- */
  function p85StripFamilyBizCard(html) {
    if (typeof S === 'undefined' || !S) return html;
    if (S.country === S.home) return html;
    /* The card starts with <section class="card" ...><h3>💼 <BizName></h3> and contains "Family owns and operates this business" */
    html = html.replace(
      /<section class="card"[^>]*>\s*<h3>💼 [^<]*<\/h3>[\s\S]*?Family owns and operates this business[\s\S]*?<\/section>/g,
      ''
    );
    return html;
  }

  /* ---- 4. Strip remaining " United Kingdom" suffixes ---- */
  function p85StripCountrySuffix(html) {
    return html.replace(/([A-Z][a-zA-Z]{2,}) United Kingdom/g, '$1');
  }

  /* ---- 5. Wire into viewCareer ---- */
  try {
    const orig = viewCareer;
    viewCareer = function () {
      let html = orig.apply(this, arguments);
      if (!html) return html;
      try { html = p85RewriteCompanies(html); } catch (e) {}
      try { html = p85FixWorkAuth(html); } catch (e) {}
      try { html = p85StripFamilyBizCard(html); } catch (e) {}
      try { html = p85StripCountrySuffix(html); } catch (e) {}
      return html;
    };
  } catch (e) { console.warn('[p85] viewCareer wrap failed:', e); }

  /* ---- 6. Wire into viewWorld — strip Egypt-context visa picker while abroad ---- */
  try {
    const origW = viewWorld;
    viewWorld = function () {
      let html = origW.apply(this, arguments);
      if (!html) return html;

      if (typeof S === 'undefined' || !S) return html;
      if (S.country === S.home) return html; /* at home — keep everything */

      /* (a) Remove the "Egyptian passport holders need a visa..." paragraph */
      html = html.replace(
        /<p class="muted"[^>]*>\s*Egyptian passport holders need a visa for most destinations[\s\S]*?<\/p>/g,
        ''
      );

      /* (b) Remove the "✈️ Visas" section with Schengen pickers */
      html = html.replace(
        /<section class="card"[^>]*>\s*<h3>✈️ Visas<\/h3>[\s\S]*?<\/section>/g,
        ''
      );

      /* (c) Remove "🌍 Europe (Schengen)" heading and country cards if they're standalone */
      html = html.replace(
        /<section class="card"[^>]*>\s*<h3>🌍 Europe \(Schengen\)[\s\S]*?<\/section>/g,
        ''
      );

      /* (d) Remove any "Apply · <fee> EGP" buttons for Schengen */
      html = html.replace(
        /<button[^>]*onclick="applyVisa[^"]*"[^>]*>Apply · [\d,]+ EGP<\/button>/g,
        ''
      );

      /* (e) Add a "you are abroad" note where the visa section was */
      const abroadNote =
        '<section class="card" style="border-color:var(--cyan)">' +
        '<h3>✈️ Travelling while abroad</h3>' +
        '<p class="muted" style="font-size:.82rem">You are currently in ' +
        ((typeof COUNTRIES !== 'undefined' && COUNTRIES[S.country] && COUNTRIES[S.country].n) || S.country) +
        '. Your travel options now depend on your residence permit / student visa here, not your Egyptian passport alone.</p>' +
        '<p class="muted" style="font-size:.78rem">Re-entering Egypt is always allowed. Entering other countries still requires their visas.</p>' +
        '</section>';

      /* Insert the note before the first section that mentions "Trips & family time" */
      const tripMarker = html.indexOf('Trips &amp; family time');
      const tripMarker2 = html.indexOf('Trips & family time');
      const insertAt = tripMarker !== -1 ? html.lastIndexOf('<section', tripMarker)
                     : tripMarker2 !== -1 ? html.lastIndexOf('<section', tripMarker2)
                     : -1;
      if (insertAt !== -1) {
        html = html.slice(0, insertAt) + abroadNote + html.slice(insertAt);
      }

      return html;
    };
  } catch (e) { console.warn('[p85] viewWorld wrap failed:', e); }

  /* ---- Diagnostics ---- */
  window.p85Diag = function () {
    console.log({
      home: S && S.home,
      country: S && S.country,
      isAbroad: S && S.country !== S.home,
      visaName: S && S.p81 && S.p81.visa && S.p81.visa.name,
      visaWork: S && S.p81 && S.p81.visa && S.p81.visa.workRights,
      familyBizWorks: S && S.p77 && S.p77.worksForFamily
    });
  };

  console.log('[p85] Career + World view rebuilds loaded');
})();
