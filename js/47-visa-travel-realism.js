/* =====================================================================
   47. VISA & TRAVEL REALISM
   Adds: passport system, visa requirements per country, application flow,
   processing, approval chances based on ties and funds, refusal tracking.
   Also adds proof-of-funds panels on Education tab.
   Load AFTER 46-asset-display-fix.js and BEFORE 99-boot.js
   ===================================================================== */

/* ============ 1. STATE ============ */
function p47Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p47) {
    o.p47 = {
      passportIssuedYear: -1,
      passportExpiresYear: -1,
      passportRenewals: 0,
      visas: {},                     /* {countryCode: {type, issuedYear, expiresYear, name}} */
      visaApplications: [],          /* [{country, appliedYear, readyYear, fee, name, status}] */
      visaRefusals: [],              /* [{country, year, reason}] */
      travelHistory: []              /* [{year, country, purpose}] */
    };
  }
  if (!o.p47.visas || typeof o.p47.visas !== 'object') o.p47.visas = {};
  if (!Array.isArray(o.p47.visaApplications)) o.p47.visaApplications = [];
  if (!Array.isArray(o.p47.visaRefusals)) o.p47.visaRefusals = [];
  if (!Array.isArray(o.p47.travelHistory)) o.p47.travelHistory = [];
}
const P47_migrate = migrate;
migrate = function (o) { const r = P47_migrate(o); p47Init(r); return r; };
const P47_newGame = newGame;
newGame = function () {
  P47_newGame.apply(this, arguments);
  p47Init(S);
  /* Issue first passport at age 6 (born with it) */
  const y = gameYear();
  S.p47.passportIssuedYear = S.born;
  S.p47.passportExpiresYear = S.born + 7;
};

/* ============ 2. HELPERS ============ */
function p47Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }
function p47Idx() { return (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1; }
function p47EGP(egp2026) { return Math.round(egp2026 * p47Idx()); }
function p47LocalCountry() { return S && S.country ? S.country : 'egy'; }
function p47IsPassportValid() {
  p47Init();
  const y = gameYear();
  return S.p47.passportExpiresYear >= y;
}
function p47PassportYearsLeft() {
  p47Init();
  return Math.max(0, S.p47.passportExpiresYear - gameYear());
}

/* ============ 3. VISA RULES (real 2026 costs, simplified) ============ */
const P47_VISA_RULES = {
  /* Europe — Schengen */
  fra: { type: 'schengen', name: 'Schengen Visa (France)', feeEGP: 4700, days: 15, interview: false, minBankEGP: 60000, validityMonths: 6, multiEntry: false },
  deu: { type: 'schengen', name: 'Schengen Visa (Germany)', feeEGP: 4700, days: 15, interview: false, minBankEGP: 60000, validityMonths: 6, multiEntry: false },
  ita: { type: 'schengen', name: 'Schengen Visa (Italy)', feeEGP: 4700, days: 15, interview: false, minBankEGP: 60000, validityMonths: 6, multiEntry: false },
  nld: { type: 'schengen', name: 'Schengen Visa (Netherlands)', feeEGP: 4700, days: 15, interview: false, minBankEGP: 60000, validityMonths: 6, multiEntry: false },
  /* English-speaking */
  gbr: { type: 'uk-visitor', name: 'UK Standard Visitor Visa', feeEGP: 8200, days: 21, interview: false, minBankEGP: 80000, validityMonths: 6, multiEntry: true },
  usa: { type: 'usa-b1b2', name: 'USA B1/B2 Visitor Visa', feeEGP: 11500, days: 60, interview: true, minBankEGP: 150000, validityMonths: 24, multiEntry: true },
  can: { type: 'can-visitor', name: 'Canada Visitor Visa (TRV)', feeEGP: 7500, days: 45, interview: false, minBankEGP: 100000, validityMonths: 12, multiEntry: true },
  aus: { type: 'aus-visitor', name: 'Australia Visitor Visa (subclass 600)', feeEGP: 8500, days: 40, interview: false, minBankEGP: 90000, validityMonths: 12, multiEntry: true },
  nzl: { type: 'nzl-visitor', name: 'New Zealand Visitor Visa', feeEGP: 7000, days: 30, interview: false, minBankEGP: 90000, validityMonths: 12, multiEntry: true },
  /* Asia */
  jpn: { type: 'jpn-visitor', name: 'Japan Short-Term Visa', feeEGP: 3500, days: 15, interview: false, minBankEGP: 50000, validityMonths: 3, multiEntry: false },
  kor: { type: 'kor-visitor', name: 'South Korea Short-Term Visa', feeEGP: 4000, days: 20, interview: false, minBankEGP: 55000, validityMonths: 6, multiEntry: false },
  sgp: { type: 'sgp-evisa', name: 'Singapore e-Visa', feeEGP: 3000, days: 10, interview: false, minBankEGP: 40000, validityMonths: 6, multiEntry: false },
  /* Easy / e-visa for Egyptians */
  uae: { type: 'uae-evisa', name: 'UAE e-Visa', feeEGP: 2200, days: 7, interview: false, minBankEGP: 15000, validityMonths: 2, multiEntry: false },
  tur: { type: 'tur-evisa', name: 'Turkey e-Visa', feeEGP: 1800, days: 5, interview: false, minBankEGP: 12000, validityMonths: 6, multiEntry: false },
  sau: { type: 'sau-evisa', name: 'Saudi Arabia e-Visa', feeEGP: 3500, days: 10, interview: false, minBankEGP: 20000, validityMonths: 12, multiEntry: true },
  ind: { type: 'ind-evisa', name: 'India e-Visa', feeEGP: 1500, days: 7, interview: false, minBankEGP: 10000, validityMonths: 12, multiEntry: true },
  /* Others — visitor visa for Egyptian citizens */
  pak: { type: 'pak-visa', name: 'Pakistan Visitor Visa', feeEGP: 2500, days: 20, interview: false, minBankEGP: 20000, validityMonths: 6, multiEntry: false },
  nga: { type: 'nga-visa', name: 'Nigeria Visitor Visa', feeEGP: 3000, days: 25, interview: false, minBankEGP: 25000, validityMonths: 3, multiEntry: false },
  bra: { type: 'bra-visa', name: 'Brazil Visitor Visa', feeEGP: 5500, days: 30, interview: false, minBankEGP: 60000, validityMonths: 12, multiEntry: true }
};

/* Visa-free from Egypt for short trips (real, common cases) */
const P47_VISA_FREE = ['egy'];

function p47VisaRule(destCountry) {
  return P47_VISA_RULES[destCountry] || null;
}
function p47NeedsVisa(destCountry) {
  if (!destCountry) return false;
  if (destCountry === p47LocalCountry()) return false;
  if (P47_VISA_FREE.indexOf(destCountry) !== -1) return false;
  return !!p47VisaRule(destCountry);
}
function p47HasValidVisa(destCountry) {
  p47Init();
  const v = S.p47.visas[destCountry];
  if (!v) return false;
  return v.expiresYear >= gameYear();
}
function p47ActiveApplication(destCountry) {
  p47Init();
  return S.p47.visaApplications.find(function (a) { return a && a.country === destCountry && a.status === 'processing'; }) || null;
}

/* ============ 4. PASSPORT RENEWAL ============ */
function p47RenewPassport() {
  if (!S || S.age < 18) return hint('Renew your passport from age 18 (or with parents\' help before).');
  const cost = p47EGP(1500);
  const internal = cost / p47Rate();
  if (S.wealth < internal) return hint('Passport renewal costs about ' + cost.toLocaleString() + ' EGP.');
  if (!confirm('Renew your passport for ' + cost.toLocaleString() + ' EGP? It will be valid for 7 more years.')) return;
  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.passportRenewal = (S.bill.passportRenewal || 0) + internal;
  const y = gameYear();
  S.p47.passportIssuedYear = y;
  S.p47.passportExpiresYear = y + 7;
  S.p47.passportRenewals = (S.p47.passportRenewals || 0) + 1;
  log('You renewed your passport. New expiry: ' + S.p47.passportExpiresYear + '.');
  realismNotice('Passport renewed', 'Your new passport is valid for 7 more years, until ' + S.p47.passportExpiresYear + '.');
  render();
}
window.p47RenewPassport = p47RenewPassport;

/* ============ 5. VISA APPLICATION ============ */
function p47EstimateApproval(destCountry) {
  const rule = p47VisaRule(destCountry);
  if (!rule) return { chance: 0, reasons: ['No visa rule for this country.'] };

  let score = 0.35; /* base */
  const reasons = [];

  /* Bank balance */
  const bankEGP = Math.round(Number(S.wealth || 0) * p47Rate());
  const bankRatio = bankEGP / Math.max(1, rule.minBankEGP);
  if (bankRatio >= 3) { score += 0.25; reasons.push('Strong bank statement (3× minimum).'); }
  else if (bankRatio >= 2) { score += 0.15; reasons.push('Good bank statement.'); }
  else if (bankRatio >= 1) { score += 0.05; reasons.push('Bank statement meets the minimum.'); }
  else { score -= 0.15; reasons.push('Bank statement is below the required minimum.'); }

  /* Employment */
  if (S.job) {
    score += 0.15;
    reasons.push('Stable employment as ' + S.job.title + '.');
    if ((S.job.years || 0) >= 3) { score += 0.05; reasons.push('Long tenure at current employer.'); }
  } else if (S.uni || S.mast || S.localMast) {
    score -= 0.05;
    reasons.push('Currently a student — weak employment tie.');
  } else {
    score -= 0.10;
    reasons.push('No employment or study tie.');
  }

  /* Family ties in Egypt */
  const familyHere = (S.family || []).filter(function (m) { return m.alive !== false && ['Mother', 'Father', 'Sibling', 'Spouse'].indexOf(m.role) !== -1; });
  if (familyHere.length >= 2) { score += 0.10; reasons.push('Close family in Egypt — strong reason to return.'); }
  else if (familyHere.length === 1) { score += 0.05; }

  /* Property in Egypt */
  const propertyHere = (S.ownedHomes || []).filter(function (h) { return h && h.marketCountry === S.country; });
  if (propertyHere.length) { score += 0.08; reasons.push('Owns property in Egypt.'); }

  /* Previous refusals — hurts */
  p47Init();
  const priorRefusals = S.p47.visaRefusals.filter(function (r) { return r && r.country === destCountry; }).length;
  if (priorRefusals > 0) { score -= priorRefusals * 0.12; reasons.push(priorRefusals + ' previous refusal(s) for this country.'); }

  /* Previous travel history — helps */
  const priorTravel = (S.p47.travelHistory || []).length;
  if (priorTravel >= 5) { score += 0.10; reasons.push('Extensive travel history.'); }
  else if (priorTravel >= 2) { score += 0.05; reasons.push('Some travel history.'); }

  /* Interview countries are slightly harder */
  if (rule.interview) { score -= 0.05; reasons.push('Interview required — additional scrutiny.'); }

  /* Country-specific difficulty */
  if (['usa', 'gbr', 'can', 'aus'].indexOf(destCountry) !== -1) { score -= 0.05; reasons.push('Historically strict approval rate for Egyptian applicants.'); }
  if (['uae', 'tur', 'ind', 'sau'].indexOf(destCountry) !== -1) { score += 0.20; reasons.push('High approval rate for Egyptian tourists.'); }

  const chance = Math.max(0.05, Math.min(0.92, score));
  return { chance: chance, reasons: reasons };
}

function p47ApplyForVisa(destCountry) {
  p47Init();
  if (!S || S.age < 18) return hint('You need to be an adult to apply.');
  const rule = p47VisaRule(destCountry);
  if (!rule) return hint('No visa required for this country.');
  if (!p47IsPassportValid()) return hint('Your passport must be valid. Renew it first.');
  if (p47HasValidVisa(destCountry)) return hint('You already have a valid visa for this country.');
  if (p47ActiveApplication(destCountry)) return hint('You already have an application processing for this country.');

  const cost = p47EGP(rule.feeEGP);
  const internal = cost / p47Rate();
  if (S.wealth < internal) return hint('Application fee is ' + cost.toLocaleString() + ' EGP.');

  if (!confirm('Apply for ' + rule.name + '?\n\nFee: ' + cost.toLocaleString() + ' EGP (non-refundable).\nProcessing time: about ' + rule.days + ' days.\nMinimum bank balance: ' + rule.minBankEGP.toLocaleString() + ' EGP.')) return;

  S.wealth -= internal;
  S.expenses = (S.expenses || 0) + internal;
  S.bill = S.bill || {};
  S.bill.visaFees = (S.bill.visaFees || 0) + internal;

  S.p47.visaApplications.push({
    country: destCountry,
    appliedYear: gameYear(),
    readyYear: gameYear() + 1,     /* resolve next age-up */
    fee: internal,
    feeEGP: cost,
    name: rule.name,
    status: 'processing',
    rule: { type: rule.type, days: rule.days, interview: rule.interview, minBankEGP: rule.minBankEGP }
  });

  log('You applied for ' + rule.name + '. Fee: ' + cost.toLocaleString() + ' EGP. Processing.');
  realismNotice('Visa application submitted', 'Your ' + rule.name + ' application is processing. You will get a decision next year.');
  render();
}
window.p47ApplyForVisa = p47ApplyForVisa;

/* ============ 6. VISA PROCESSING ============ */
function p47ProcessApplications() {
  p47Init();
  if (!S || S.age < 18) return;
  const y = gameYear();
  const pending = S.p47.visaApplications.filter(function (a) { return a && a.status === 'processing'; });
  if (!pending.length) return;

  pending.forEach(function (app) {
    if (app.readyYear > y) return;
    const estimate = p47EstimateApproval(app.country);
    const roll = Math.random();
    const approved = roll < estimate.chance;

    if (approved) {
      const rule = p47VisaRule(app.country);
      const validity = rule ? rule.validityMonths : 6;
      const expiresYear = y + Math.max(1, Math.ceil(validity / 12));
      S.p47.visas[app.country] = {
        type: rule ? rule.type : 'visitor',
        name: app.name,
        issuedYear: y,
        expiresYear: expiresYear,
        multiEntry: rule ? rule.multiEntry : false
      };
      app.status = 'approved';
      log('✅ ' + app.name + ' APPROVED. Valid until ' + expiresYear + '.');
      realismNotice('Visa approved', 'Your ' + app.name + ' was approved. It is valid until ' + expiresYear + ' and you can now book trips to this country.');
    } else {
      const reasons = estimate.reasons;
      const refusalReason = reasons[Math.floor(Math.random() * Math.min(3, reasons.length))] || 'Application could not be approved.';
      S.p47.visaRefusals.push({ country: app.country, year: y, reason: refusalReason });
      app.status = 'refused';
      log('❌ ' + app.name + ' REFUSED. Reason: ' + refusalReason);
      realismNotice('Visa refused', 'Your ' + app.name + ' was refused. Reason given: "' + refusalReason + '" The fee was not refunded. A refusal makes future applications harder.');
    }
  });

  /* Clean up resolved applications older than 2 years */
  S.p47.visaApplications = S.p47.visaApplications.filter(function (a) {
    return a && (a.status === 'processing' || (y - (a.readyYear || y)) <= 2);
  });
}

/* Register yearly tick */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('year', p47ProcessApplications);
} else {
  const P47_ageUpBefore = ageUp;
  ageUp = function () {
    const before = S && S.age;
    P47_ageUpBefore.apply(this, arguments);
    if (S && S.age !== before) try { p47ProcessApplications(); } catch (e) {}
  };
}

/* ============ 7. BLOCK BOOKING WITHOUT VISA ============ */
const P47_p12BookTripBefore = p12BookTrip;
p12BookTrip = function (purpose) {
  const q = (typeof p12TripQuote === 'function') ? p12TripQuote() : null;
  if (q && q.international && q.d && q.d.country) {
    const dest = q.d.country;
    if (dest !== S.country && p47NeedsVisa(dest)) {
      if (!p47IsPassportValid()) {
        return hint('Your passport is expired. Renew it before travelling.');
      }
      if (!p47HasValidVisa(dest)) {
        const app = p47ActiveApplication(dest);
        const rule = p47VisaRule(dest);
        if (app) {
          return hint('Your ' + app.name + ' is still processing. You must wait for a decision before travelling.');
        }
        return hint('You need a ' + (rule ? rule.name : 'visa') + ' to travel to ' + (COUNTRIES[dest] ? COUNTRIES[dest].n : dest) + '. Apply in the World tab → Visa panel.');
      }
    }
  }
  return P47_p12BookTripBefore.apply(this, arguments);
};

/* Record travel history on successful booking */
const P47_p12BookTripAfterVisa = p12BookTrip;
p12BookTrip = function (purpose) {
  const before = S && S.tripHistory ? S.tripHistory.length : 0;
  const result = P47_p12BookTripAfterVisa.apply(this, arguments);
  if (S && S.tripHistory && S.tripHistory.length > before) {
    p47Init();
    const last = S.tripHistory[0];
    if (last && last.destinationCountry) {
      S.p47.travelHistory.push({
        year: gameYear(),
        country: last.destinationCountry,
        purpose: purpose || 'holiday'
      });
    }
  }
  return result;
};

/* ============ 8. UI PANEL ============ */
function p47PassportPanel() {
  p47Init();
  if (!S || S.age < 16) return '';
  const y = gameYear();
  const valid = p47IsPassportValid();
  const yearsLeft = p47PassportYearsLeft();
  const country = S.home || S.country;
  const code = (COUNTRIES[country] || {}).n || 'Unknown';
  const renewalCost = p47EGP(1500);

  const color = !valid ? 'var(--rose)' : yearsLeft <= 1 ? 'var(--amber)' : 'var(--mint)';

  let html = '<section class="card" style="border-color:' + color + '"><h3>🛂 Your passport</h3>' +
    '<div class="row"><span>Country</span><b>' + code + '</b></div>' +
    '<div class="row"><span>Issued</span><b>' + S.p47.passportIssuedYear + '</b></div>' +
    '<div class="row"><span>Expires</span><b style="color:' + color + '">' + S.p47.passportExpiresYear + '</b></div>' +
    '<div class="row"><span>Status</span><b style="color:' + color + '">' +
      (!valid ? '⚠️ Expired — renew now' : yearsLeft <= 1 ? 'Expires in ' + yearsLeft + ' year(s)' : 'Valid — ' + yearsLeft + ' year(s) left') +
    '</b></div>';

  if (!valid || yearsLeft <= 1) {
    html += '<button class="btn" onclick="p47RenewPassport()">Renew passport · ' + renewalCost.toLocaleString() + ' EGP<small>Valid for 7 more years</small></button>';
  }
  html += '</section>';
  return html;
}

function p47VisaPanel() {
  p47Init();
  if (!S || S.age < 18) return '';

  /* Group rules by region for clarity */
  const europeCodes = ['fra', 'deu', 'ita', 'nld'];
  const englishCodes = ['gbr', 'usa', 'can', 'aus', 'nzl'];
  const asiaCodes = ['jpn', 'kor', 'sgp'];
  const easyCodes = ['uae', 'tur', 'sau', 'ind', 'pak', 'nga', 'bra'];

  function rowFor(code) {
    const rule = P47_VISA_RULES[code];
    if (!rule) return '';
    const country = COUNTRIES[code] || {};
    const owned = p47HasValidVisa(code);
    const active = p47ActiveApplication(code);
    const refused = S.p47.visaRefusals.filter(function (r) { return r && r.country === code; }).length;
    const cost = p47EGP(rule.feeEGP);
    const flag = country.f || '';

    let status;
    if (owned) {
      const v = S.p47.visas[code];
      status = '<span style="color:var(--mint)">✓ Valid until ' + v.expiresYear + '</span>';
    } else if (active) {
      status = '<span style="color:var(--amber)">⏳ Processing — ready ' + active.readyYear + '</span>';
    } else if (refused > 0) {
      status = '<span style="color:var(--rose)">Previously refused (' + refused + '×)</span>';
    } else {
      status = '<span class="muted">Not held</span>';
    }

    let action = '';
    if (!owned && !active) {
      const afford = Math.round(Number(S.wealth) * p47Rate()) >= cost;
      action = '<button class="btn" ' + (afford ? '' : 'disabled') + ' onclick="p47ApplyForVisa(\'' + code + '\')" style="font-size:.85rem;padding:6px 10px">Apply · ' + cost.toLocaleString() + ' EGP</button>';
    }

    return '<div class="row" style="flex-direction:column;align-items:stretch;padding:8px 0;gap:4px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      '<span>' + flag + ' <b>' + (country.n || code) + '</b></span>' +
      '<span style="font-size:.82rem">' + status + '</span>' +
      '</div>' +
      '<span class="muted" style="font-size:.76rem">' + rule.name + ' · fee ' + cost.toLocaleString() + ' EGP · needs ' + rule.minBankEGP.toLocaleString() + ' EGP in bank · validity ' + rule.validityMonths + ' months' + (rule.interview ? ' · interview' : '') + '</span>' +
      action +
      '</div>';
  }

  let html = '<section class="card"><h3>✈️ Visas</h3>' +
    '<p class="muted">Egyptian passport holders need a visa for most destinations. Applications cost money (non-refundable), take time, and can be refused. Approval depends on your bank statement, employment, family ties, property, travel history and any previous refusals.</p>';

  html += '<details open><summary style="cursor:pointer;color:var(--cyan);font-weight:bold">🌍 Europe (Schengen)</summary>' + europeCodes.map(rowFor).join('') + '</details>';
  html += '<details><summary style="cursor:pointer;color:var(--cyan);font-weight:bold">🇬🇧 English-speaking destinations</summary>' + englishCodes.map(rowFor).join('') + '</details>';
  html += '<details><summary style="cursor:pointer;color:var(--cyan);font-weight:bold">🌏 Asia</summary>' + asiaCodes.map(rowFor).join('') + '</details>';
  html += '<details><summary style="cursor:pointer;color:var(--cyan);font-weight:bold">🟢 Easier / e-Visa destinations</summary>' + easyCodes.map(rowFor).join('') + '</details>';

  html += '</section>';

  /* Pending applications */
  const processing = S.p47.visaApplications.filter(function (a) { return a && a.status === 'processing'; });
  if (processing.length) {
    html += '<section class="card" style="border-color:var(--amber)"><h3>⏳ Applications processing</h3>';
    processing.forEach(function (a) {
      const country = COUNTRIES[a.country] || {};
      html += '<div class="row"><span>' + (country.f || '') + ' ' + (country.n || a.country) + '</span><b>Decision in ' + Math.max(0, a.readyYear - gameYear()) + ' year(s)</b></div>';
    });
    html += '<p class="muted" style="font-size:.82rem">You cannot travel to these destinations until you receive a decision.</p></section>';
  }

  /* Previous refusals */
  if (S.p47.visaRefusals.length) {
    html += '<section class="card"><h3>📋 Refusal history</h3>' +
      '<p class="muted">Refusals are recorded and can make future applications harder.</p>';
    S.p47.visaRefusals.slice(-5).reverse().forEach(function (r) {
      const country = COUNTRIES[r.country] || {};
      html += '<div class="row" style="flex-direction:column;align-items:stretch"><b>' + r.year + ' · ' + (country.n || r.country) + '</b><span class="muted" style="font-size:.82rem">' + r.reason + '</span></div>';
    });
    html += '</section>';
  }

  return html;
}

/* Wrap viewWorld to inject passport + visa panels */
const P47_viewWorldBefore = viewWorld;
viewWorld = function () {
  let html = P47_viewWorldBefore();
  if (!S || S.age < 12) return html;

  /* Insert passport + visa panels after "Current location" card */
  const insertAfterMatch = /(<section class="card">[\s\S]*?Current location[\s\S]*?<\/section>)/;
  const panels = p47PassportPanel() + p47VisaPanel();
  if (insertAfterMatch.test(html)) {
    html = html.replace(insertAfterMatch, '$1' + panels);
  } else {
    html = panels + html;
  }
  return html;
};

/* ============ 9. EDUCATION — PROOF-OF-FUNDS ============ */
const P47_PROOF_OF_FUNDS = {
  usa: { name: 'Proof of funds (US F-1 visa)', egp: 900000, notes: 'Bank statement showing 1 year of tuition + living costs.' },
  gbr: { name: 'Maintenance funds + IHS surcharge', egp: 650000, notes: 'UKVI requires 9 months of living costs + £470/year health surcharge.' },
  can: { name: 'GIC + proof of funds', egp: 550000, notes: 'Guaranteed Investment Certificate (CAD 20,635) plus tuition.' },
  deu: { name: 'Blocked account (Sperrkonto)', egp: 580000, notes: '€11,208/year blocked account (2026 rate) plus health insurance.' },
  aus: { name: 'Proof of funds (Australian student visa)', egp: 700000, notes: 'Tuition + living costs (AUD 29,710/year) + travel.' },
  nzl: { name: 'Funds for NZ student visa', egp: 620000, notes: 'NZD 20,000/year living costs + tuition.' },
  fra: { name: 'Proof of funds (French student visa)', egp: 400000, notes: '€615/month minimum + tuition.' },
  ita: { name: 'Proof of funds (Italian student visa)', egp: 350000, notes: '€6,000/year + accommodation proof.' },
  nld: { name: 'Proof of funds (Dutch student visa)', egp: 500000, notes: '€1,100/month living costs + tuition.' },
  jpn: { name: 'Proof of funds (Japanese student visa)', egp: 300000, notes: '¥2,000,000/year equivalent.' },
  kor: { name: 'Proof of funds (Korean student visa)', egp: 350000, notes: 'KRW 20,000,000/year equivalent.' },
  sgp: { name: 'Proof of funds (Singapore student pass)', egp: 450000, notes: 'SGD 12,000/year living costs.' },
  uae: { name: 'Proof of funds (UAE student visa)', egp: 150000, notes: 'AED 15,000 + tuition + sponsor.' },
  sau: { name: 'Proof of funds (Saudi student visa)', egp: 120000, notes: 'SAR 12,000 + sponsor letter.' }
};

function p47ProofOfFundsPanel() {
  if (!S || S.age < 18) return '';
  /* Only show if a master's application is not yet in progress */
  if (S.mast || S.studentVisaCase || S.localMast) return '';
  if (!S.degree) return '';
  const bankEGP = Math.round(Number(S.wealth || 0) * p47Rate());

  let html = '<section class="card"><h3>💰 Proof of funds for study abroad</h3>' +
    '<p class="muted">These are the extra funds each country requires for a student visa — separate from tuition. You must show this money in a bank account before applying.</p>' +
    '<div class="row"><span>Your available bank</span><b>' + bankEGP.toLocaleString() + ' EGP</b></div>';

  Object.keys(P47_PROOF_OF_FUNDS).forEach(function (code) {
    const req = P47_PROOF_OF_FUNDS[code];
    const country = COUNTRIES[code] || {};
    const needEGP = Math.round(req.egp * p47Idx());
    const met = bankEGP >= needEGP;
    html += '<div class="row" style="flex-direction:column;align-items:stretch;padding:6px 0">' +
      '<div style="display:flex;justify-content:space-between">' +
      '<span>' + (country.f || '') + ' <b>' + (country.n || code) + '</b></span>' +
      '<b style="color:' + (met ? 'var(--mint)' : 'var(--rose)') + '">' + needEGP.toLocaleString() + ' EGP</b>' +
      '</div>' +
      '<span class="muted" style="font-size:.76rem">' + req.name + ' · ' + req.notes + '</span>' +
      '</div>';
  });

  html += '</section>';
  return html;
}

/* Wrap viewSchool to inject the proof-of-funds panel */
const P47_viewSchoolBefore = viewSchool;
viewSchool = function () {
  let html = P47_viewSchoolBefore();
  if (!S || S.country !== S.home) return html; /* only for home-country players */
  const panel = p47ProofOfFundsPanel();
  if (!panel) return html;
  return html + panel;
};

/* ============ 10. RUN ON LOAD ============ */
p47Init(S);
