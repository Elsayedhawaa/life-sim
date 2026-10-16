/* =====================================================================
   84. CAREER REALITY FIXES
   - Fix "You do not have work authorisation" → show student visa work rights
   - Diversify company names (was: everything is "Westbridge")
   - Remove " United Kingdom" suffix from company names
   - Hide family business card while abroad on a student visa
   - Rebuild passport panel with more reality checks and options
   - Fix "Egypt passport" → "Egyptian passport"
   Load AFTER 83-post-travel-fixes.js and BEFORE 99-boot.js
   ===================================================================== */

(function p84CareerRealityFixes() {

  /* ---- 1. Diversify company names ---- */
  const P84_BRANDS = [
    'Fenchurch', 'Kingsway', 'Aldgate', 'Paddington', 'Hampstead',
    'Richmond', 'Soho', 'Mayfair', 'Whitehall', 'Fleet',
    'Barbican', 'Bloomsbury', 'Chelsea', 'Greenwich', 'Kensington'
  ];
  function p84Brand(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return P84_BRANDS[Math.abs(h) % P84_BRANDS.length];
  }

  function p84RewriteCompanies(html) {
    /* Replace "Westbridge <industry>" with varied brands, deterministic by industry+title */
    html = html.replace(/Westbridge (finance|legal|tech|medical|bio|consulting|trading|logistics)([^<]{0,80})/g, function (m, industry, rest) {
      /* Use industry + first 30 chars of rest (role title) as the seed */
      const seed = industry + '|' + (rest || '').slice(0, 30);
      return p84Brand(seed) + ' ' + industry + (rest || '');
    });
    /* Strip " United Kingdom" from company names in listings */
    html = html.replace(/([A-Z][a-zA-Z]+) United Kingdom/g, '$1');
    return html;
  }

  /* ---- 2. Fix "no work authorisation" message ---- */
  function p84FixWorkAuthText(html) {
    if (typeof S === 'undefined' || !S) return html;
    if (S.country === S.home) return html;

    /* Compute the correct message from the visa */
    let replacement = 'You are not authorized to work in this country.';
    if (S.p81 && S.p81.visa) {
      const v = S.p81.visa;
      if (v.type === 'student') {
        replacement = 'Your ' + v.name + ' allows: ' + v.workRights + '. Full-time roles require employer sponsorship.';
      } else {
        replacement = 'Your ' + v.name + ' allows: ' + (v.workRights || 'limited work') + '.';
      }
    }
    html = html.replace(/You do not currently have work authorisation for this country\./g, replacement);
    return html;
  }

  /* ---- 3. Hide family business card while abroad ---- */
  function p84HideFamilyBizAbroad(html) {
    if (typeof S === 'undefined' || !S) return html;
    if (S.country === S.home) return html;
    /* The card starts with "<h3>💼 <BizName></h3>" and has "Family owns and operates this business" inside */
    html = html.replace(
      /<section class="card"[^>]*>[\s\S]*?<h3>💼 [^<]*<\/h3>[\s\S]*?Family owns and operates this business[\s\S]*?<\/section>/g,
      ''
    );
    return html;
  }

  /* ---- 4. Fix passport country label ---- */
  function p84FixPassportLabel(html) {
    html = html.replace(/🇪🇬 Egypt passport/g, '🇪🇬 Egyptian passport');
    html = html.replace(/>\s*Egypt passport\s*</g, '>Egyptian passport<');
    return html;
  }

  /* ---- 5. Apply all HTML rewrites ---- */
  function p84ProcessHtml(html) {
    if (!html) return html;
    try { html = p84RewriteCompanies(html); } catch (e) { console.warn('[p84] companies:', e); }
    try { html = p84FixWorkAuthText(html); } catch (e) { console.warn('[p84] workauth:', e); }
    try { html = p84HideFamilyBizAbroad(html); } catch (e) { console.warn('[p84] familybiz:', e); }
    try { html = p84FixPassportLabel(html); } catch (e) { console.warn('[p84] passport:', e); }
    return html;
  }

  /* Wrap render so the post-processing runs on the final HTML */
  try {
    const origRender = render;
    render = function () {
      /* Temporarily monkey-patch the view's innerHTML setter is too invasive;
         instead we patch after the fact. */
      const r = origRender.apply(this, arguments);
      setTimeout(p84ApplyToDom, 0);
      return r;
    };
  } catch (e) { console.warn('[p84] render wrap failed:', e); }

  /* Alternatively, patch the DOM by walking text nodes */
  function p84ApplyToDom() {
    if (typeof S === 'undefined' || !S) return;
    const view = document.getElementById('view');
    if (!view) return;

    /* Fix work auth text node-by-node */
    p84WalkText(view, function (node) {
      if (node.nodeValue.indexOf('You do not currently have work authorisation for this country.') !== -1) {
        let replacement = 'You are not authorized to work in this country.';
        if (S.country !== S.home && S.p81 && S.p81.visa) {
          const v = S.p81.visa;
          if (v.type === 'student') {
            replacement = 'Your ' + v.name + ' allows: ' + v.workRights + '. Full-time roles require employer sponsorship.';
          } else {
            replacement = 'Your ' + v.name + ' allows: ' + (v.workRights || 'limited work') + '.';
          }
        }
        node.nodeValue = node.nodeValue.replace(
          /You do not currently have work authorisation for this country\./g,
          replacement
        );
      }
      /* Fix "Egypt passport" */
      if (node.nodeValue.indexOf('Egypt passport') !== -1) {
        node.nodeValue = node.nodeValue.replace(/Egypt passport/g, 'Egyptian passport');
      }
    });

    /* Fix company names in text nodes */
    p84WalkText(view, function (node) {
      node.nodeValue = node.nodeValue.replace(/Westbridge (finance|legal|tech|medical|bio|consulting|trading|logistics)/g, function (m, industry) {
        const seed = industry + '|' + (node.parentElement ? (node.parentElement.textContent || '').slice(0, 30) : '');
        return p84Brand(seed) + ' ' + industry;
      });
      node.nodeValue = node.nodeValue.replace(/([A-Z][a-zA-Z]+) United Kingdom/g, '$1');
    });

    /* Hide family business card if abroad */
    if (S.country !== S.home) {
      view.querySelectorAll('section.card').forEach(function (sec) {
        const t = sec.textContent || '';
        if (t.indexOf('Family owns and operates this business') !== -1) sec.remove();
      });
    }
  }

  function p84WalkText(node, fn) {
    if (node.nodeType === 3) { fn(node); return; }
    for (let i = 0; i < node.childNodes.length; i++) {
      p84WalkText(node.childNodes[i], fn);
    }
  }

  /* Run frequently as a safety net */
  setInterval(p84ApplyToDom, 800);

  /* ---- 6. Rebuild passport panel with reality checks ---- */
  window.p84PassportPanel = function () {
    if (typeof S === 'undefined' || !S) return '';
    const abroad = S.country !== S.home;
    const homeName = { egy: 'Egypt', gbr: 'United Kingdom', usa: 'United States', deu: 'Germany', fra: 'France', can: 'Canada', aus: 'Australia', jpn: 'Japan', kor: 'South Korea', ita: 'Italy', nld: 'Netherlands', sgp: 'Singapore', sau: 'Saudi Arabia', uae: 'UAE' }[S.home || 'egy'] || 'Egypt';
    const homeFlag = { egy: '🇪🇬', gbr: '🇬🇧', usa: '🇺🇸', deu: '🇩🇪', fra: '🇫🇷', can: '🇨🇦', aus: '🇦🇺', jpn: '🇯🇵', kor: '🇰🇷', ita: '🇮🇹', nld: '🇳🇱', sgp: '🇸🇬', sau: '🇸🇦', uae: '🇦🇪' }[S.home || 'egy'] || '🇪🇬';
    const hostName = abroad ? ((typeof COUNTRIES !== 'undefined' && COUNTRIES[S.country] && COUNTRIES[S.country].n) || S.country) : null;
    const visa = S.p81 && S.p81.visa;

    let html = '<section class="card"><h3>🛂 Your passport and your options</h3>';

    /* Passport block */
    html += '<div class="row"><span>Your passport</span><b>' + homeFlag + ' ' + homeName + ' passport</b></div>';
    html += '<div class="row"><span>Visa-free access</span><b>~' +
      ({ egy: 50, gbr: 187, usa: 186, deu: 190, can: 186, fra: 190, nld: 190, aus: 186, jpn: 193, kor: 192, ita: 190, sgp: 195, sau: 78, uae: 180 }[S.home || 'egy'] || 50) +
      ' destinations</b></div>';

    if (abroad) {
      html += '<div class="row"><span>Currently living in</span><b>' + hostName + ' (on visa)</b></div>';
      if (visa) {
        html += '<div class="row"><span>Your visa</span><b>' + visa.name + '</b></div>';
        html += '<div class="row"><span>Work rights</span><b style="color:var(--cyan)">' + visa.workRights + '</b></div>';
        if (visa.expiresYear) {
          html += '<div class="row"><span>Expires</span><b>' + visa.expiresYear + '</b></div>';
        }
      }
      html += '<p class="muted" style="font-size:.78rem;margin-top:8px">Your passport is issued by ' + homeName + '. Living abroad does not change it — naturalization typically requires 5–8 years of permanent residence.</p>';
    } else {
      html += '<p class="muted" style="font-size:.78rem;margin-top:8px">Your passport is issued by ' + homeName + '.</p>';
    }

    /* Reality checks */
    html += '<h4 style="font-size:.82rem;color:var(--cyan);margin-top:14px">Reality checks</h4>';
    html += '<div class="muted" style="font-size:.78rem;line-height:1.5">';
    html += '• A visa application costs money, takes weeks, and is not refunded if refused.<br>';
    html += '• Officers look for proof you will return home: job, family, property, or savings.<br>';
    html += '• Visas for the US, UK, Canada and Australia require biometrics, interviews, and financial evidence.<br>';
    if (abroad && visa && visa.type === 'student') {
      html += '• Student visas allow limited work. Full-time roles need employer sponsorship.<br>';
      html += '• Overstaying or breaching visa conditions can lead to deportation and a 5–10 year ban.<br>';
    }
    html += '</div>';

    /* Options / next steps */
    html += '<h4 style="font-size:.82rem;color:var(--cyan);margin-top:14px">Your options</h4>';
    if (!abroad) {
      html += '<div class="muted" style="font-size:.78rem;line-height:1.5">';
      html += '• Study abroad — apply to university with IELTS and family/scholarship funding.<br>';
      html += '• Work abroad — get an employer to sponsor a work visa.<br>';
      html += '• Remote work — stay in ' + homeName + ' and earn USD/EUR from foreign clients.<br>';
      html += '• Stay home — build a career locally; no visa stress, but lower USD wages.<br>';
      html += '</div>';
    } else {
      html += '<div class="muted" style="font-size:.78rem;line-height:1.5">';
      html += '• Graduate route — many countries offer a post-study work visa (1–3 years).<br>';
      html += '• Skilled worker route — get employer sponsorship for a full-time role.<br>';
      html += '• Return home — keep the degree and any work experience; no visa stress.<br>';
      html += '• Naturalization — 5–8 years of permanent residence in most countries.<br>';
      html += '</div>';
    }

    html += '</section>';
    return html;
  };

  /* Diagnostics */
  window.p84Diag = function () {
    console.log({
      home: S && S.home,
      country: S && S.country,
      visa: S && S.p81 && S.p81.visa && S.p81.visa.name,
      workRights: S && S.p81 && S.p81.visa && S.p81.visa.workRights,
      worksForFamily: S && S.p77 && S.p77.worksForFamily,
      job: S && S.job && (S.job.title + ' @ ' + S.job.company)
    });
  };

  console.log('[p84] Career reality fixes loaded');
})();
