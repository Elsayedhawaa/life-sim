/* =====================================================================
   79. EMERGENCY FIXES
   - Family car offer respects wealth tier (no old Honda for ultra-rich)
   - Hide all Egyptian/Thanaweya content when on IGCSE/IB/American
   - Fix frozen car offer modal (accept/decline buttons work)
   - Remove duplicate EDUCATION STATUS cards
   - Remove duplicate Thanaweya cards
   - Force-close stuck modals on load
   Load AFTER 78-fixes-and-extensions.js and BEFORE 99-boot.js
   ===================================================================== */

function p79Rate() { return (typeof rateNow === 'function') ? rateNow() : 52.7; }

/* =================================================================
   1. FIX FAMILY CAR OFFER — respect wealth tier
   ================================================================= */
/* The original p62AcceptParentCar uses `m[3]` (price) as class check.
   That's wrong. Also ultra-wealthy should get LUXURY cars, not old econ. */

p62AcceptParentCar = function () {
  p62Init();
  if (!S || !S.p62 || !S.p62.pendingOffers || !S.p62.pendingOffers.length) return;
  const off = S.p62.pendingOffers.shift();
  const fw = off.wealthTier;
  const tier = (S.p76 && S.p76.wealthLevel) || 0;
  const year = gameYear();
  const rate = p79Rate();

  /* ---- Pick a car based on the actual family tier ---- */
  let pool = [];
  if (tier >= 5) {
    /* Ultra-wealthy — brand-new luxury */
    pool = P62_MODELS.filter(function (m) {
      if (!p64ModelValid(m, year)) return false;
      const cls = m[2];   /* CLASS is index 2, not 3 */
      const brand = P62_BRANDS[m[0]] || {};
      return brand.tier >= 3 && ['lux', 'exec', 'sport', 'suv'].indexOf(cls) >= 0;
    });
  } else if (tier === 4) {
    /* Wealthy — new luxury-ish or premium */
    pool = P62_MODELS.filter(function (m) {
      if (!p64ModelValid(m, year)) return false;
      const cls = m[2];
      const brand = P62_BRANDS[m[0]] || {};
      return (brand.tier === 3 || cls === 'suv' || cls === 'lux') && cls !== 'econ' && cls !== 'compact';
    });
  } else if (tier === 3) {
    /* Upper-middle — new compact/mid/suv */
    pool = P62_MODELS.filter(function (m) {
      if (!p64ModelValid(m, year)) return false;
      const cls = m[2];
      return ['compact', 'mid', 'suv'].indexOf(cls) >= 0;
    });
  } else {
    /* Middle and below — used econ/compact */
    pool = P62_MODELS.filter(function (m) {
      if (!p64ModelValid(m, year)) return false;
      const cls = m[2];
      return ['econ', 'compact'].indexOf(cls) >= 0;
    });
  }

  if (!pool.length) {
    /* Fallback to any model */
    pool = P62_MODELS.filter(function (m) { return p64ModelValid(m, year); });
  }
  if (!pool.length) {
    const m = document.getElementById('p62-offer-modal');
    if (m) m.remove();
    return hint('No suitable car available from your parents.');
  }

  /* Age of car: new for tier 4+, used for tier 3, older used for tier <= 2 */
  const carAge = tier >= 4 ? 0 : tier === 3 ? 1 : 2 + Math.floor(Math.random() * 4);
  const model = pool[Math.floor(Math.random() * pool.length)];
  const brand = P62_BRANDS[model[0]] || { name: model[0] };
  const base = p62BasePriceUSD(model, year);
  const depreciation = (typeof p62Depreciation === 'function') ? p62Depreciation(carAge) : 1;
  const value = Math.round(base * depreciation);

  const uid = 'cg' + Math.random().toString(36).slice(2, 8);
  const car = {
    uid: uid,
    make: brand.name,
    name: model[1],
    cls: model[2],                       /* FIX: class is [2] */
    year: year - carAge,
    trim: 0, color: 0, interior: 0, opts: [],
    msrp: base,
    paid: 0,
    insurance: 'compreh',
    insuranceExpiry: year + 1,
    registrationExpiry: year + 1,
    miles: carAge * 12000,
    cond: tier >= 4 ? 98 : tier === 3 ? 80 : 65,
    age: carAge,
    acc: false, broken: false, fix: 0,
    mods: [], modCost: 0,
    seller: 'parents',
    brand: model[0],
    fuel: model[11] ? 'e' : (model[10] && year >= model[10] ? 'h' : 'g'),
    life: model[7],
    value: value,
    int: 0, intc: 0,
    hasLoan: false
  };

  S.cars = S.cars || [];
  S.cars.push(car);
  S.cars = S.cars.slice(-4);

  (typeof parents === 'function' ? parents() : []).forEach(function (p) {
    if (p && p.alive !== false) p.bond = Math.min(100, (p.bond || 50) + 8);
  });
  fx({ happiness: 6, social: tier >= 4 ? 5 : 3 });

  const brandName = brand.name || model[0];
  log('🎁 Your parents gave you a ' + (year - carAge) + ' ' + brandName + ' ' + model[1] +
      (carAge === 0 ? ' — brand new!' : ' (used)') + ' You cover insurance and maintenance.');

  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  save(); hint(); render();
};
window.p62AcceptParentCar = p62AcceptParentCar;

/* Also ensure decline works reliably */
window.p62DeclineParentCar = function () {
  p62Init();
  if (!S || !S.p62 || !S.p62.pendingOffers) return;
  if (!S.p62.pendingOffers.length) {
    const m = document.getElementById('p62-offer-modal');
    if (m) m.remove();
    return render();
  }
  S.p62.pendingOffers.shift();
  (typeof parents === 'function' ? parents() : []).forEach(function (p) {
    if (p && p.alive !== false) p.bond = Math.max(0, (p.bond || 50) - 3);
  });
  log('You politely declined your parents\' car offer.');
  const m = document.getElementById('p62-offer-modal');
  if (m) m.remove();
  save(); hint(); render();
};

/* Also make sure the offer text matches tier */
const P79_p62ShowOfferBefore = (typeof p62ShowPendingOffer === 'function') ? p62ShowPendingOffer : null;
if (P79_p62ShowOfferBefore) {
  p62ShowPendingOffer = function () {
    if (!S || !S.p62 || !S.p62.pendingOffers || !S.p62.pendingOffers.length) return;
    if (document.getElementById('p62-offer-modal')) return;

    const off = S.p62.pendingOffers[0];
    const tier = (S.p76 && S.p76.wealthLevel) || 0;
    const rate = p79Rate();

    /* Build tier-appropriate message */
    let title = '🚗 Your parents offer you a car';
    let text;
    if (tier >= 5) {
      text = 'Your parents want you to have a proper car. They will buy you a brand-new luxury vehicle — ' +
             'something appropriate for the family name. You will cover insurance and any running costs yourself.';
    } else if (tier === 4) {
      text = 'Your parents offer to buy you a new car. Something safe, modern, and respectable. ' +
             'You will cover insurance and maintenance yourself.';
    } else if (tier === 3) {
      text = 'Your parents can afford a decent new car for you. You will still need to pay insurance and maintenance yourself.';
    } else if (tier === 2) {
      text = 'Your parents will look for a good used car within their budget. Insurance and maintenance will be on you.';
    } else {
      text = 'Your family has a spare older car you can have. It is not new, but it runs. Insurance and repairs are on you.';
    }

    const modal = document.getElementById('p62-offer-modal');
    if (modal) modal.remove();

    const el = document.createElement('div');
    el.id = 'p62-offer-modal';
    el.className = 'p24-modal-backdrop';
    el.style.cssText = 'position:fixed;inset:0;background:rgba(4,5,12,.78);backdrop-filter:blur(7px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:18px';
    el.innerHTML = '<div class="p24-modal" style="max-width:460px">' +
      '<div class="p24-pill">FAMILY OFFER · ' + gameYear() + '</div>' +
      '<h2>' + title + '</h2>' +
      '<p>' + text + '</p>' +
      '<div class="acts" style="margin-top:14px">' +
      '<button class="btn" style="background:var(--mint);color:#000;font-weight:700" onclick="p62AcceptParentCar();return false;">Accept the offer</button>' +
      '<button class="btn" onclick="p62DeclineParentCar();return false;">Politely decline</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(el);
  };
}

/* =================================================================
   2. HIDE EGYPTIAN UNIVERSITY CONTENT WHEN ON IGCSE / IB / AMERICAN
   ================================================================= */
function p79IsInternationalSystem() {
  if (!S || !S.p78) return false;
  return ['igcse', 'american', 'ib'].indexOf(S.p78.educationSystem) !== -1;
}

const P79_viewSchoolBeforeFilter = viewSchool;
viewSchool = function () {
  let html = P79_viewSchoolBeforeFilter.apply(this, arguments);
  if (!S) return html;
  p79Init(S);

  /* If on an international system, hide every Egyptian-specific block */
  if (p79IsInternationalSystem()) {
    /* Thanaweya cutoffs table */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Egyptian university cutoffs[\s\S]*?<\/section>/g, '');
    /* Thanaweya result card */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Thanaweya Amma:[\s\S]*?<\/section>/g, '');
    /* Thanaweya position card */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📊 Your Thanaweya Amma position[\s\S]*?<\/section>/g, '');
    /* Choose Thanaweya track */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>📝 Choose Thanaweya Amma track[\s\S]*?<\/section>/g, '');
    /* Egyptian university selection */
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🏛️ Choose Your University[\s\S]*?<\/section>/g, '');
    html = html.replace(/<section class="card"[^>]*>\s*<h3>🎓 Choose your university[\s\S]*?<\/section>/g, '');
    /* "Get score" button */
    html = html.replace(/<button[^>]*onclick="p69ComputeAndShowResult\(\)"[^>]*>[\s\S]*?<\/button>/g, '');
    /* "Choose track" action button */
    html = html.replace(/<button[^>]*onclick="p68ChooseTrack[\s\S]*?<\/button>/g, '');
  }

  return html;
};

/* =================================================================
   3. REMOVE DUPLICATE STATUS CARDS
   ================================================================= */
const P79_viewSchoolBeforeDedup = viewSchool;
viewSchool = function () {
  let html = P79_viewSchoolBeforeDedup.apply(this, arguments);
  if (!S) return html;

  /* Remove duplicate EDUCATION STATUS cards — keep only the first */
  const statusMatches = html.match(/<section class="card"[^>]*>\s*<div class="muted"[^>]*>EDUCATION STATUS<\/div>[\s\S]*?<\/section>/g);
  if (statusMatches && statusMatches.length > 1) {
    let count = 0;
    html = html.replace(
      /<section class="card"[^>]*>\s*<div class="muted"[^>]*>EDUCATION STATUS<\/div>[\s\S]*?<\/section>/g,
      function (match) {
        count++;
        return count === 1 ? match : '';
      }
    );
  }

  /* Remove duplicate "What to do next" cards */
  const wtdMatches = html.match(/<section class="card">\s*<h3>✅ What to do next<\/h3>[\s\S]*?<\/section>/g);
  if (wtdMatches && wtdMatches.length > 1) {
    let count = 0;
    html = html.replace(
      /<section class="card">\s*<h3>✅ What to do next<\/h3>[\s\S]*?<\/section>/g,
      function (match) {
        count++;
        return count === 1 ? match : '';
      }
    );
  }

  return html;
};

/* =================================================================
   4. KILL STUCK MODALS ON LOAD
   ================================================================= */
function p79ClearStuckModals() {
  if (!S) return;
  /* Close any modal that's been open for a suspiciously long time.
     We detect by checking if the offer modal exists but no pending offer. */
  const offerModal = document.getElementById('p62-offer-modal');
  if (offerModal && (!S.p62 || !S.p62.pendingOffers || !S.p62.pendingOffers.length)) {
    offerModal.remove();
  }
  /* Same for application modal */
  const appModal = document.getElementById('p62-cfg-modal');
  if (appModal && (!S.p62 || !S.p62.carCfg || !S.p62.carCfg.modelId)) {
    appModal.remove();
  }
}
setTimeout(p79ClearStuckModals, 500);
setTimeout(p79ClearStuckModals, 2000);

const P79_renderBeforeModalCheck = render;
render = function () {
  const r = P79_renderBeforeModalCheck.apply(this, arguments);
  try { p79ClearStuckModals(); } catch (e) {}
  return r;
};

/* =================================================================
   5. LOWER-LEVEL INIT (must exist for p79Init to work)
   ================================================================= */
function p79Init(o) {
  o = o || S;
  if (!o) return;
  if (!o.p79) o.p79 = {};
}
const P79_migrate = migrate;
migrate = function (o) { const r = P79_migrate(o); p79Init(r); return r; };

/* =================================================================
   6. FORCE-UNLOCK THE MODAL IF A CLICK FAILED
   ================================================================= */
/* If p62AcceptParentCar threw, the modal stays open. Add a keyboard escape. */
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const offerModal = document.getElementById('p62-offer-modal');
      if (offerModal) {
        offerModal.remove();
        if (S && S.p62 && S.p62.pendingOffers) S.p62.pendingOffers = [];
        render();
      }
    }
  });
}

/* =================================================================
   7. FIX — "Choose track first" text when track is already chosen
   ================================================================= */
const P79_viewSchoolBeforeTrackText = viewSchool;
viewSchool = function () {
  let html = P79_viewSchoolBeforeTrackText.apply(this, arguments);
  if (!S) return html;
  /* If track is chosen, remove any "Choose a Thanaweya Amma track first." message */
  if (S.p68 && S.p68.thanaweyaTrack) {
    html = html.replace(/Choose a Thanaweya Amma track first\./g, '');
    html = html.replace(/<button[^>]*onclick="p68ChooseTrack\(&#39;adabi&#39;\)"[^>]*>[\s\S]*?<\/button>/g, '');
    html = html.replace(/<button[^>]*onclick="p68ChooseTrack\('adabi'\)"[^>]*>[\s\S]*?<\/button>/g, '');
    html = html.replace(/<button[^>]*onclick="p68ChooseTrack\(&#39;elmi-riyada&#39;\)"[^>]*>[\s\S]*?<\/button>/g, '');
    html = html.replace(/<button[^>]*onclick="p68ChooseTrack\('elmi-riyada'\)"[^>]*>[\s\S]*?<\/button>/g, '');
    html = html.replace(/<button[^>]*onclick="p68ChooseTrack\(&#39;elmi-olom&#39;\)"[^>]*>[\s\S]*?<\/button>/g, '');
    html = html.replace(/<button[^>]*onclick="p68ChooseTrack\('elmi-olom'\)"[^>]*>[\s\S]*?<\/button>/g, '');
  }
  return html;
};

/* =================================================================
   8. RUN ON LOAD
   ================================================================= */
p79Init(S);
p79ClearStuckModals();
console.log('[p79] Emergency fixes loaded');
