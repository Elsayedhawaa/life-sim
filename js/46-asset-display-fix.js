/* =====================================================================
   46. ASSET DISPLAY + PROPERTY PURCHASE FIX
   Fixes:
   - Property purchase used egyRate() for the check but rateNow() for the
     display. Any currency crash or living abroad made it disagree.
     Now both use rateNow() consistently.
   - Certificates and insurance now shown in Financial Overview
   - Medical event coverage check recognises private insurance
   Load AFTER 45-medical-work-loans.js and BEFORE 99-boot.js
   ===================================================================== */

function p46Rate() { return (typeof rateNow === 'function') ? rateNow() : 1; }

/* ============ 1. PROPERTY PURCHASE — use rateNow() everywhere ============ */
purchaseProperty = function (rosterId, unitId, planId, isCompound, isEgypt) {
  if (typeof housingInit === 'function') housingInit(S);
  const y = gameYear();
  const catalog = isCompound
    ? (COMPOUND_ROSTER[isEgypt ? 'egy' : S.country] || COMPOUND_ROSTER.egy)
    : (LOCAL_MARKET_ROSTER[isEgypt ? 'egy' : S.country] || LOCAL_MARKET_ROSTER.egy);

  const prop = catalog.find(p => p.id === rosterId);
  const unit = PROPERTY_UNITS.find(u => u.id === unitId);
  const plan = isCompound ? COMPOUND_PLANS.find(p => p.id === planId) : { downPct: 1.0, years: 0, markup: 1.0 };

  if (!prop || !unit) return hint('Selected property or unit is no longer available.');

  const idx = (isEgypt && typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(y) : 1;
  const rawPrice = unit.area * prop.ppm * unit.mult * idx;
  const basePrice = isEgypt ? Math.round(rawPrice / 1000) * 1000 : Math.round(rawPrice);

  const finalPriceAmt = Math.round(basePrice * plan.markup);
  const downPaymentAmt = Math.round(finalPriceAmt * plan.downPct);

  /* Use the SAME rate as money() display so the check matches the display */
  const rate = p46Rate();
  const internalFinalPrice = finalPriceAmt / rate;
  const internalDownPayment = downPaymentAmt / rate;
  const internalRemaining = internalFinalPrice - internalDownPayment;

  if (S.wealth < internalDownPayment) {
    const missingInternal = internalDownPayment - S.wealth;
    const missingDisplay = missingInternal * rate;
    alert('INSUFFICIENT FUNDS!\n\n' +
      'Required Down Payment: E£' + downPaymentAmt.toLocaleString() + '\n' +
      'Your Bank Balance: E£' + Math.round(S.wealth * rate).toLocaleString() + '\n\n' +
      'You need E£' + Math.round(missingDisplay).toLocaleString() + ' more to complete this transaction.');
    return hint('Insufficient cash balance for down payment.');
  }

  S.wealth -= internalDownPayment;
  const homeId = 'h_' + Math.random().toString(36).slice(2, 8);

  const newHome = {
    id: homeId,
    name: (unit.name || 'Unit') + ' - ' + (prop.name || 'Property'),
    catId: 'custom_' + prop.id,
    value: Math.round(internalFinalPrice),
    balance: isCompound && plan.years > 0 ? Math.round(internalRemaining) : 0,
    cond: 100,
    rentInc: Math.round(internalFinalPrice * (isCompound ? 0.0045 : 0.0035) * 12),
    status: 'vacant',
    pay: isCompound && plan.years > 0 ? Math.round(internalRemaining / plan.years) : 0,
    rate: isCompound && plan.years > 0 ? 0.0001 : (S.mortRate || 0.05),
    features: isCompound
      ? ['24/7 Gated Security', 'Clubhouse & Pool', 'Private Parking', 'Landscaped Gardens']
      : ['Local Neighborhood Access', 'Private Meter'],
    location: prop.loc,
    marketCountry: isEgypt ? 'egy' : S.country,
    typeId: unit.id,
    p12: true,
    hapBuff: prop.hap,
    hpBuff: prop.hp
  };

  S.ownedHomes = S.ownedHomes || [];
  S.ownedHomes.push(newHome);

  if (isCompound && plan.years > 0) {
    const annualInstallmentAmt = Math.round((finalPriceAmt - downPaymentAmt) / plan.years);
    if (!S.housingStore) S.housingStore = { selectedTab: 'compounds', selectedLoc: 'all', contracts: [] };
    if (!Array.isArray(S.housingStore.contracts)) S.housingStore.contracts = [];
    S.housingStore.contracts.push({
      id: 'c_' + homeId,
      homeId: homeId,
      name: newHome.name,
      totalAmt: finalPriceAmt,
      remainingAmt: finalPriceAmt - downPaymentAmt,
      annualAmt: annualInstallmentAmt,
      yearsLeft: plan.years,
      isEgypt: isEgypt
    });
  }

  log('Purchased ' + newHome.name + ' in ' + prop.loc + '. Down payment: E£' + downPaymentAmt.toLocaleString() + '.');
  if (typeof realismNotice === 'function') {
    realismNotice('Property purchased', 'You acquired ' + newHome.name + '. Down payment paid: E£' + downPaymentAmt.toLocaleString() + '.');
  }
  render();
};

/* ============ 2. FINANCIAL OVERVIEW — show certificates and insurance ============ */
const P46_viewMoneyBefore = viewMoney;
viewMoney = function () {
  const base = P46_viewMoneyBefore();
  if (!S || S.age < 18) return base;

  /* ---- Certificates ---- */
  let certRows = '';
  const certs = Array.isArray(S.certificates) ? S.certificates.filter(c => c && !c.matured) : [];
  if (certs.length) {
    const principalEGP = certs.reduce((s, c) => s + (Number(c.principalEGP) || 0), 0);
    const paidEGP = certs.reduce((s, c) => s + (Number(c.totalPaid) || 0), 0);
    certRows = '<div class="row"><span>Deposit certificates (' + certs.length + ' active)</span><b class="mono" style="color:var(--mint)">E£' + principalEGP.toLocaleString() + '</b></div>';
    if (paidEGP > 0) {
      certRows += '<div class="row"><span>Certificate interest earned</span><b class="mono" style="color:var(--mint)">+E£' + paidEGP.toLocaleString() + '</b></div>';
    }
  }

  /* ---- Insurance ---- */
  let insuranceRow = '';
  const empIns = S.p45 && S.p45.employerInsurance;
  const jobIns = S.job && S.job.benefits && S.job.benefits.medical;
  const privIns = S.medical && S.medical.hasInsurance && ['basic', 'premium'].includes(S.medical.insuranceTier);
  if (empIns || jobIns) {
    insuranceRow = '<div class="row"><span>Health insurance</span><b style="color:var(--mint)">Employer plan (75%, 150k EGP cap)</b></div>';
  } else if (privIns) {
    const tier = S.medical.insuranceTier;
    const label = tier === 'premium' ? 'Premium private (85%, 250k cap)' : 'Basic private (60%, 100k cap)';
    insuranceRow = '<div class="row"><span>Health insurance</span><b style="color:var(--mint)">' + label + '</b></div>';
  } else {
    insuranceRow = '<div class="row"><span>Health insurance</span><b style="color:var(--rose)">None — you pay every bill</b></div>';
  }

  /* Insert after "Retirement pot" row (or "Cash" if not found) */
  const anchor = /(<div class="row"><span>Retirement pot<\/span><b[^>]*>[^<]*<\/b><\/div>)/;
  if (anchor.test(base)) {
    return base.replace(anchor, '$1' + certRows + insuranceRow);
  }
  const anchor2 = /(<div class="row"><span>Cash<\/span><b[^>]*>[^<]*<\/b><\/div>)/;
  if (anchor2.test(base)) {
    return base.replace(anchor2, '$1' + certRows + insuranceRow);
  }
  return base;
};

/* ============ 3. MEDICAL COVERAGE CHECK — recognise private + employer insurance ============ */
if (typeof effectiveMedicalCover === 'function') {
  const P46_effBefore = effectiveMedicalCover;
  effectiveMedicalCover = function () {
    if (S && S.p45 && S.p45.employerInsurance) return true;
    if (S && S.medical && S.medical.hasInsurance && ['basic', 'premium', 'employer'].includes(S.medical.insuranceTier)) return true;
    if (S && S.job && S.job.benefits && S.job.benefits.medical) return true;
    return P46_effBefore.apply(this, arguments);
  };
}

/* Also route the base medical event text via this improved check */
(function patchMedicalEventText() {
  if (typeof EVENTS === 'undefined') return;
  const ev = EVENTS.find(function (e) { return e.id === 'medical'; });
  if (!ev) return;
  ev.text = function () {
    const covered = effectiveMedicalCover();
    const idx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
    const est = 15000 * idx;
    if (covered) {
      return 'A health problem requires treatment. Your health insurance covers most of the bill, but there is still a co-payment. Estimated total: E£' + Math.round(est).toLocaleString() + ' before coverage.';
    }
    return 'A health problem requires treatment and you do not have effective insurance. The estimated bill is E£' + Math.round(est).toLocaleString() + ', which could wipe out your savings.';
  };
})();

/* ============ 4. CERTIFICATE INCOME IN CAREER SUMMARY ============ */
const P46_viewCareerBefore = viewCareer;
viewCareer = function () {
  let html = P46_viewCareerBefore();
  if (!S || S.age < 18) return html;
  const certs = Array.isArray(S.certificates) ? S.certificates.filter(c => c && !c.matured) : [];
  if (!certs.length) return html;
  const principalEGP = certs.reduce((s, c) => s + (Number(c.principalEGP) || 0), 0);
  const paidEGP = certs.reduce((s, c) => s + (Number(c.totalPaid) || 0), 0);
  const card = '<section class="card" style="border-color:var(--mint)"><h3>💰 Certificate income</h3>' +
    '<p class="muted">Your Egyptian deposit certificates earn interest directly into your checking account each year.</p>' +
    '<div class="row"><span>Active certificates</span><b>' + certs.length + '</b></div>' +
    '<div class="row"><span>Principal</span><b class="mono" style="color:var(--mint)">E£' + principalEGP.toLocaleString() + '</b></div>' +
    '<div class="row"><span>Total interest earned</span><b class="mono" style="color:var(--mint)">+E£' + paidEGP.toLocaleString() + '</b></div>' +
    '<button class="btn" onclick="activeTab=\'bank\';render();">Manage in Bank tab</button>' +
    '</section>';
  return card + html;
};

/* ============ 5. BANK TAB — show certificate income summary at top ============ */
const P46_viewBankBefore = viewBank;
viewBank = function () {
  let html = P46_viewBankBefore();
  if (!S || S.age < 18) return html;
  const certs = Array.isArray(S.certificates) ? S.certificates.filter(c => c && !c.matured) : [];
  if (!certs.length) return html;
  const principalEGP = certs.reduce((s, c) => s + (Number(c.principalEGP) || 0), 0);
  const paidEGP = certs.reduce((s, c) => s + (Number(c.totalPaid) || 0), 0);
  const summary = '<section class="card" style="border-color:var(--mint)"><h3>💼 Certificate portfolio</h3>' +
    '<div class="row"><span>Active certificates</span><b>' + certs.length + '</b></div>' +
    '<div class="row"><span>Total principal</span><b class="mono" style="color:var(--mint)">E£' + principalEGP.toLocaleString() + '</b></div>' +
    '<div class="row"><span>Total interest earned</span><b class="mono" style="color:var(--mint)">+E£' + paidEGP.toLocaleString() + '</b></div>' +
    '</section>';
  /* Insert after the financial dashboard card */
  const firstCardEnd = html.indexOf('</section>');
  if (firstCardEnd !== -1) {
    html = html.slice(0, firstCardEnd + 10) + summary + html.slice(firstCardEnd + 10);
  }
  return html;
};

/* ============ 6. RUN ON LOAD ============ */
if (S) {
  /* Strip matured certificates from state */
  if (Array.isArray(S.certificates)) {
    S.certificates = S.certificates.filter(c => c && !c.matured);
  }
}
