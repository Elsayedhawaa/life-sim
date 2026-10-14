/* =====================================================================
   36. CERTIFICATE PURCHASE FIX
   The certificate code was dividing EGP by a hard-coded rate (52.7)
   while the game's money() display uses rateNow() for the current year.
   That mismatch made affordable purchases look unaffordable.
   This file makes the purchase use the same rate as the display.
   Load AFTER 35-marriage-system.js and BEFORE 99-boot.js
   ===================================================================== */

function p36EGPtoInternal(egp) {
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  if (!isFinite(rate) || rate <= 0) return 0;
  return Number(egp) / rate;
}
function p36InternalToEGP(internal) {
  const rate = (typeof rateNow === 'function') ? rateNow() : 1;
  return Number(internal) * rate;
}

/* Certificate data (mirrors what the UI shows) */
const P36_CERTS = [
  { id: 'nbe_monthly',   bank: 'National Bank of Egypt', name: 'Platinum Certificate — Monthly',   rates: [0.1775, 0.1775, 0.1775], years: 3, minEGP: 1000 },
  { id: 'nbe_quarterly', bank: 'National Bank of Egypt', name: 'Platinum Certificate — Quarterly', rates: [0.1785, 0.1785, 0.1785], years: 3, minEGP: 1000 },
  { id: 'bm_alqimma',    bank: 'Banque Misr',            name: 'Al Qimma Certificate',              rates: [0.1775, 0.1775, 0.1775], years: 3, minEGP: 1000 },
  { id: 'bm_ibnmisr',    bank: 'Banque Misr',            name: 'Ibn Misr Al Tholatheya',            rates: [0.205, 0.1625, 0.1225], years: 3, minEGP: 1000 },
  { id: 'cib_premium',   bank: 'CIB',                    name: 'CIB Premium Certificate',           rates: [0.18, 0.18, 0.18], years: 3, minEGP: 50000 },
  { id: 'alexbank_cdmax',bank: 'ALEXBANK',               name: 'CD MAX High-Yield',                 rates: [0.1825, 0.1825, 0.1825], years: 3, minEGP: 1000000 }
];

function p36FindCert(certId) {
  if (!certId) return null;
  const key = String(certId).toLowerCase();
  let cert = P36_CERTS.find(c => c.id === key);
  if (cert) return cert;
  /* fuzzy match */
  if (key.indexOf('quarterly') !== -1) return P36_CERTS.find(c => c.id === 'nbe_quarterly');
  if (key.indexOf('platinum') !== -1 || key.indexOf('nbe') !== -1) return P36_CERTS.find(c => c.id === 'nbe_monthly');
  if (key.indexOf('alqimma') !== -1 || key.indexOf('al_qimma') !== -1) return P36_CERTS.find(c => c.id === 'bm_alqimma');
  if (key.indexOf('ibnmisr') !== -1 || key.indexOf('ibn_misr') !== -1) return P36_CERTS.find(c => c.id === 'bm_ibnmisr');
  if (key.indexOf('cib') !== -1) return P36_CERTS.find(c => c.id === 'cib_premium');
  if (key.indexOf('cdmax') !== -1 || key.indexOf('cd_max') !== -1 || key.indexOf('alex') !== -1) return P36_CERTS.find(c => c.id === 'alexbank_cdmax');
  return null;
}

function p36BookCertificate(certId, egpInput) {
  if (!S || S.age < 18) return hint('Certificates require age 18.');
  const cert = p36FindCert(certId);
  if (!cert) return hint('Certificate not found. Try clicking again from the Bank tab.');

  /* Fallback: read from input fields if no value was passed */
  if (egpInput == null || isNaN(Number(egpInput))) {
    const ids = ['amt-' + cert.id, 'p32-amt-' + cert.id, 'p36-amt-' + cert.id, 'amt-' + certId];
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el && el.value) { egpInput = el.value; break; }
    }
  }

  const egp = Math.round(Number(egpInput) || 0);
  if (egp <= 0) return hint('Enter a positive amount in EGP.');
  if (egp < cert.minEGP) return hint('Minimum for ' + cert.name + ' is ' + cert.minEGP.toLocaleString() + ' EGP.');

  const internal = p36EGPtoInternal(egp);
  if (S.wealth < internal) {
    const haveEGP = Math.round(p36InternalToEGP(S.wealth));
    return hint('Insufficient funds. Required: ' + egp.toLocaleString() + ' EGP. You have: ' + haveEGP.toLocaleString() + ' EGP.');
  }

  S.wealth -= internal;
  S.certificates = S.certificates || [];
  S.certificates.push({
    id: 'cert_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    certId: cert.id,
    bank: cert.bank,
    name: cert.name,
    principalEGP: egp,
    principalInternal: internal,
    rateSchedule: cert.rates.slice(),
    yearsTotal: cert.years,
    yearsHeld: 0,
    totalPaid: 0,
    startedYear: gameYear()
  });

  log('Purchased ' + cert.name + ' from ' + cert.bank + ' for ' + egp.toLocaleString() + ' EGP.');
  realismNotice('Certificate purchased', cert.bank + ' — ' + cert.name + '. Principal: ' + egp.toLocaleString() + ' EGP. Year 1 yield: ' + (cert.rates[0] * 100).toFixed(2) + '%.');
  hint();
  render();
}

/* Publish under every likely name so any existing button works */
window.p36BookCertificate = p36BookCertificate;
window.bookCertificate = p36BookCertificate;
window.buyCertificate = p36BookCertificate;
window.p32BuyCertificate = p36BookCertificate;

/* Scan and replace any existing global certificate-purchase function */
Object.getOwnPropertyNames(window).forEach(function (name) {
  if (/^(p\d+_)?(buy|book)_?Certificate$/i.test(name)) {
    try { window[name] = p36BookCertificate; } catch (e) {}
  }
});

/* After every render, rewire certificate buttons in the DOM */
function p36PatchButtons() {
  const buttons = document.querySelectorAll('button');
  buttons.forEach(function (btn) {
    const txt = (btn.textContent || '').trim().toLowerCase();
    if (txt.indexOf('book certificate') === -1 && txt.indexOf('buy certificate') === -1) return;
    if (btn.dataset.p36 === '1') return;
    btn.dataset.p36 = '1';

    /* Find the input in the same card */
    let scope = btn;
    let input = null;
    for (let i = 0; i < 5 && scope; i++) {
      scope = scope.parentElement;
      if (!scope) break;
      input = scope.querySelector('input[type="number"]');
      if (input) break;
    }

    /* Get the cert id from the original onclick, or from nearby text */
    const onclickAttr = btn.getAttribute('onclick') || '';
    const m = onclickAttr.match(/['"]([a-zA-Z_0-9\-]+)['"]/);
    let certId = m ? m[1] : null;

    if (!certId) {
      /* Fall back to the card text */
      const card = btn.closest('details') || btn.closest('section') || btn.closest('div');
      const cardText = card ? (card.textContent || '').toLowerCase() : '';
      if (cardText.indexOf('quarterly') !== -1) certId = 'nbe_quarterly';
      else if (cardText.indexOf('platinum') !== -1) certId = 'nbe_monthly';
      else if (cardText.indexOf('al qimma') !== -1) certId = 'bm_alqimma';
      else if (cardText.indexOf('ibn misr') !== -1) certId = 'bm_ibnmisr';
      else if (cardText.indexOf('cib') !== -1) certId = 'cib_premium';
      else if (cardText.indexOf('cd max') !== -1 || cardText.indexOf('alexbank') !== -1) certId = 'alexbank_cdmax';
    }

    btn.onclick = function (e) {
      if (e) e.preventDefault();
      const val = input ? input.value : 0;
      if (!certId) { hint('Could not identify the certificate.'); return; }
      p36BookCertificate(certId, val);
    };
  });
}

/* Run the button patch after each render */
if (typeof GameHooks !== 'undefined' && GameHooks.on) {
  GameHooks.on('render', function () { setTimeout(p36PatchButtons, 20); });
} else {
  const _p36render = render;
  render = function () {
    const r = _p36render.apply(this, arguments);
    setTimeout(p36PatchButtons, 20);
    return r;
  };
}

/* Run once on load */
setTimeout(p36PatchButtons, 200);
