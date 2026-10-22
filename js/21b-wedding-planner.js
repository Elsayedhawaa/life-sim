/* ============================================================
   WEDDING & ENGAGEMENT PLANNER UI (Restored Verbose Version)
   ============================================================ */

function marRenderEngagementReview() {
  const m = S.marriage;
  const e = m.engagement;
  if (!e) return '';

  return `<div class="card"><h3>💍 Engagement Finalized</h3>
    <div class="row"><span>Shabka & Mahr</span><b>${money(marEGP(e.totalPaid || 0))}</b></div>
    <div class="row"><span>Demands Met</span><b>${m.negotiation.demands.length} / ${m.negotiation.demands.length}</b></div>
    <p class="muted small" style="margin-top:10px">You are officially engaged to ${m.partner.name}. Now it's time to plan the wedding.</p>
    <button class="opt" style="margin-top:8px;width:100%;text-align:center;background:#34d399;color:#000;font-weight:700" onclick="marOpenWeddingPlanner()">Plan Wedding →</button>
  </div>`;
}

window.marSelectProposal = function(optId) {
  const isArab = _marIsArabCulture();
  const list = isArab ? MARRIAGE_CULTURAL_PROPOSALS.arab : MARRIAGE_CULTURAL_PROPOSALS.western;
  const opt = list.find(o => o.id === optId);
  if (!opt) return;
  const cost = marEGP(opt.costEGP);
  if (S.wealth < cost) { log('❌ Not enough cash.'); render(); return; }
  S.wealth -= cost;

  if (Math.random() > 0.8) {
    log('💔 ' + S.marriage.partner.name + ' said no. "I am not ready."');
    S.marriage.partner.bond = Math.max(0, S.marriage.partner.bond - 20);
    S.marriage.engagement = null;
    render(); return;
  }

  log('💍 ' + S.marriage.partner.name + ' said YES!');
  S.marriage.status = 'engaged';
  S.marriage.engagement = { proposal: optId, finalized: false };
  marStartFatherNegotiation();
  render();
};

window.marOpenWeddingPlanner = function() {
  S.marriage.wedding = { venue: 'local_hall', guests: 'medium', catering: 'standard', photography: 'professional', dress: 'offrack', decoration: 'flowers', music: 'dj', honeymoon: 'egypt_beach', planner: 'day_of', payer: (S.gender === 'm' ? 'self' : 'partner_family'), prenup: 'none', financeModel: 'male_provider' };
  render();
};
window.marWeddingSet = function(key, value) { if (S.marriage.wedding) S.marriage.wedding[key] = value; render(); };
window.marCancelWeddingPlanner = function() { S.marriage.wedding = null; render(); };

function marRenderWeddingPlanner() {
  const w = S.marriage.wedding;
  if (!w) return '';

  function picker(label, items, key, selectedId, costFn, cols) {
    const c = cols || 2;
    return `<h4 style="font-size:.8rem;color:#34d399;margin-top:10px">${label}</h4>
      <div style="display:grid;grid-template-columns:repeat(${c},1fr);gap:4px">
      ${items.map(item => {
        const cost = costFn ? costFn(item) : '';
        return `<button class="pill ${selectedId === item.id ? 'on' : ''}" style="padding:5px;font-size:.66rem" onclick="marWeddingSet('${key}','${item.id}')">
          ${item.label} ${cost ? `<br><span class="muted" style="font-size:.6rem">${cost}</span>` : ''}</button>`;
      }).join('')}</div>`;
  }

  const venue = MARRIAGE_WEDDING_VENUES.find(x => x.id === w.venue) || MARRIAGE_WEDDING_VENUES[0];
  const guests = MARRIAGE_GUEST_COUNTS.find(x => x.id === w.guests) || MARRIAGE_GUEST_COUNTS[0];
  const catering = MARRIAGE_CATERING_TIERS.find(x => x.id === w.catering) || MARRIAGE_CATERING_TIERS[0];
  const photo = MARRIAGE_PHOTOGRAPHY_TIERS.find(x => x.id === w.photography) || MARRIAGE_PHOTOGRAPHY_TIERS[0];
  const dress = MARRIAGE_DRESS_TIERS.find(x => x.id === w.dress) || MARRIAGE_DRESS_TIERS[0];
  const decor = (MARRIAGE_DECORATION_TIERS || []).find(x => x.id === w.decoration) || (MARRIAGE_DECORATION_TIERS || [])[0] || { costEGP: 0 };
  const music = (MARRIAGE_MUSIC_OPTIONS || []).find(x => x.id === w.music) || (MARRIAGE_MUSIC_OPTIONS || [])[0] || { costEGP: 0 };
  const honey = MARRIAGE_HONEYMOON_TIERS.find(x => x.id === w.honeymoon) || MARRIAGE_HONEYMOON_TIERS[0];
  const planner = (MARRIAGE_PLANNER_OPTIONS || []).find(x => x.id === w.planner) || (MARRIAGE_PLANNER_OPTIONS || [])[0] || { costEGP: 0 };
  const prenup = MARRIAGE_PRENUP_OPTIONS.find(x => x.id === w.prenup) || MARRIAGE_PRENUP_OPTIONS[0];

  const total = venue.baseCostEGP + (guests.guests * catering.perGuestEGP) + photo.costEGP + dress.costEGP + (decor.costEGP || 0) + (music.costEGP || 0) + honey.costEGP + (planner.costEGP || 0);
  const totalLocal = marEGP(total);
  const prenupLocal = marEGP(prenup.legalCostEGP);
  const canAfford = S.wealth >= totalLocal + prenupLocal;

  let html = '';
  html += picker('Venue', MARRIAGE_WEDDING_VENUES, 'venue', w.venue, t => money(marEGP(t.baseCostEGP)));
  html += picker('Guests', MARRIAGE_GUEST_COUNTS, 'guests', w.guests, t => t.guests + ' ppl', 3);
  html += picker('Catering', MARRIAGE_CATERING_TIERS, 'catering', w.catering, t => money(marEGP(t.perGuestEGP)) + '/g');
  html += picker('Photography', MARRIAGE_PHOTOGRAPHY_TIERS, 'photography', w.photography, t => money(marEGP(t.costEGP)));
  html += picker('Attire', MARRIAGE_DRESS_TIERS, 'dress', w.dress, t => money(marEGP(t.costEGP)));
  if (MARRIAGE_DECORATION_TIERS) html += picker('Decoration', MARRIAGE_DECORATION_TIERS, 'decoration', w.decoration, t => money(marEGP(t.costEGP)));
  if (MARRIAGE_MUSIC_OPTIONS) html += picker('Music', MARRIAGE_MUSIC_OPTIONS, 'music', w.music, t => money(marEGP(t.costEGP)));
  html += picker('Honeymoon', MARRIAGE_HONEYMOON_TIERS, 'honeymoon', w.honeymoon, t => money(marEGP(t.costEGP)));
  if (MARRIAGE_PLANNER_OPTIONS) html += picker('Planner', MARRIAGE_PLANNER_OPTIONS, 'planner', w.planner, t => money(marEGP(t.costEGP)));

  html += `<div class="card" style="background:#0f0f1a;margin-top:12px;padding:10px">
    <div class="row"><span>Venue</span><b>${money(marEGP(venue.baseCostEGP))}</b></div>
    <div class="row"><span>Catering (${guests.guests}×${money(marEGP(catering.perGuestEGP))})</span><b>${money(marEGP(guests.guests * catering.perGuestEGP))}</b></div>
    <div class="row"><span>Photography</span><b>${money(marEGP(photo.costEGP))}</b></div>
    <div class="row"><span>Attire</span><b>${money(marEGP(dress.costEGP))}</b></div>
    ${decor.costEGP > 0 ? `<div class="row"><span>Decoration</span><b>${money(marEGP(decor.costEGP))}</b></div>` : ''}
    ${music.costEGP > 0 ? `<div class="row"><span>Music</span><b>${money(marEGP(music.costEGP))}</b></div>` : ''}
    <div class="row"><span>Honeymoon</span><b>${money(marEGP(honey.costEGP))}</b></div>
    ${planner.costEGP > 0 ? `<div class="row"><span>Planner</span><b>${money(marEGP(planner.costEGP))}</b></div>` : ''}
    <div class="row" style="border-top:1px solid #25253a;margin-top:6px;padding-top:6px"><b>Wedding total</b><b style="color:#34d399">${money(totalLocal)}</b></div>
    ${prenup.legalCostEGP > 0 ? `<div class="row"><span>Prenup (${prenup.label})</span><b>${money(prenupLocal)}</b></div>` : ''}
  </div>`;

  html += `<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Prenup</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">`;
  MARRIAGE_PRENUP_OPTIONS.forEach(o => {
    html += `<button class="pill ${w.prenup === o.id ? 'on' : ''}" style="padding:6px;font-size:.65rem" onclick="marWeddingSet('prenup','${o.id}')">
      ${o.label} ${o.legalCostEGP > 0 ? `<br><span class="muted" style="font-size:.6rem">${money(marEGP(o.legalCostEGP))}</span>` : ''}</button>`;
  });
  html += `</div>`;

  html += `<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Finance model</h4><div style="display:grid;grid-template-columns:1fr;gap:4px">`;
  MARRIAGE_FINANCE_MODELS.forEach(fm => {
    html += `<button class="pill ${w.financeModel === fm.id ? 'on' : ''}" style="padding:6px;font-size:.7rem;text-align:left" onclick="marWeddingSet('financeModel','${fm.id}')">
      ${fm.label}<br><span class="muted" style="font-size:.62rem">${fm.desc}</span></button>`;
  });
  html += `</div>`;

  html += `<h4 style="font-size:.8rem;color:#34d399;margin-top:12px">Who pays?</h4><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">
    <button class="pill ${w.payer === 'self' ? 'on' : ''}" style="padding:6px;font-size:.72rem" onclick="marWeddingSet('payer','self')">You pay all</button>
    <button class="pill ${w.payer === 'split' ? 'on' : ''}" style="padding:6px;font-size:.72rem" onclick="marWeddingSet('payer','split')">Split 50/50</button>
    <button class="pill ${w.payer === 'partner_family' ? 'on' : ''}" style="padding:6px;font-size:.72rem" onclick="marWeddingSet('payer','partner_family')">Partner's family</button>
    <button class="pill ${w.payer === 'own_family' ? 'on' : ''}" style="padding:6px;font-size:.72rem" onclick="marWeddingSet('payer','own_family')">Your family helps</button>
  </div>`;

  const grand = totalLocal + prenupLocal;
  html += `<button class="opt" style="margin-top:12px;text-align:center;background:${canAfford ? '#34d399' : '#25253a'};color:${canAfford ? '#000' : '#666'};font-weight:700" ${canAfford ? '' : 'disabled'} onclick="marConfirmWedding(${total},${prenup.legalCostEGP})">${canAfford ? '🎉 Confirm wedding · ' + money(grand) : 'Need ' + money(grand)}</button>`;
  html += `<button class="opt" style="margin-top:6px;text-align:center;border-color:#fb7185;color:#fb7185" onclick="marCancelWeddingPlanner()">Cancel planning</button>`;

  return html;
}

window.marConfirmWedding = function(total, prenupCostEGP) {
  const m = S.marriage;
  const w = m.wedding;
  if (!w) return;
  const totalLocal = marEGP(total + prenupCostEGP);
  if (S.wealth < totalLocal) { log('Not enough cash.'); render(); return; }
  S.wealth -= totalLocal;

  let prenupRecord = null;
  if (w.prenup !== 'none') {
    const prenupDef = MARRIAGE_PRENUP_OPTIONS.find(o => o.id === w.prenup);
    const refusalChance = w.prenup === 'full' ? 0.50 : 0.30;
    if (Math.random() < refusalChance) {
      log('💔 ' + m.partner.name + ' refused the prenup. Wedding cancelled.');
      m.partner.bond = Math.max(0, m.partner.bond - 25);
      m.wedding = null; render(); return;
    }
    prenupRecord = { type: prenupDef.label, signedYear: gameYear() };
  }

  m.wedding = { venue: w.venue, guests: w.guests, catering: w.catering, photography: w.photography, dress: w.dress, decoration: w.decoration, music: w.music, honeymoon: w.honeymoon, planner: w.planner, totalCost: total, payer: w.payer };
  m.prenup = prenupRecord; m.financeModel = w.financeModel;
  m.status = 'married'; m.partner.bond = 100; m.partner.marriedYear = gameYear();

  marUnlockAchievement('married');
  if (total < 2000000) marUnlockAchievement('budget_wedding');
  if (total > 8000000) marUnlockAchievement('dream_wedding');
  marUnlockAchievement('financial_planners'); marReachMilestone('marriage');
  if (MARRIAGE_WEDDING_EVENTS) { const ev = MARRIAGE_WEDDING_EVENTS[Math.floor(Math.random() * MARRIAGE_WEDDING_EVENTS.length)]; log('💒 ' + ev.title + ': ' + ev.text); }
  log('🎉 You married ' + m.partner.name + '! Total cost: ' + money(totalLocal) + '.');
  fx({ happiness: 30 });
  S.spouse = { name: m.partner.name, age: m.partner.age, gender: m.partner.gender, bond: m.partner.bond, income: m.partner.income, works: m.partner.income > 0 };
  render();
};
