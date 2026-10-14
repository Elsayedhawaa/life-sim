/* ================= PHASE 17 — FAMILY, HOST-COUNTRY WORK, TRAVEL & NEEDS =================
   Adds relation-labelled family requests, country-specific sponsored hiring,
   an asylum decision path, a detailed editable trip planner and savings goals.
*/

/* Keep historical exchange-rate data in the simulation, but remove its history / outlook wording from the visible UI. */
if (COUNTRIES.egy) {
  COUNTRIES.egy.hiddenCurrencyDescription = COUNTRIES.egy.d;
  COUNTRIES.egy.d = 'A large, diverse economy with substantial differences between cities, employers and household budgets. Imported goods can be expensive relative to local salaries, and building enough savings to move out or buy a home can take many years.';
}

function p17Relation(m, capital=false) {
  if (!m) return capital ? 'Your family member' : 'your family member';
  const name = String(m.name || '').replace(/[<>]/g, '').trim();
  let relation = 'family member';
  if (m.role === 'Mother') relation = 'mother';
  else if (m.role === 'Father') relation = 'father';
  else if (m.role === 'Sibling') relation = m.g === 'f' ? 'sister' : 'brother';
  else if (m.role === 'Partner') relation = 'partner';
  else if (m.role === 'Spouse') relation = 'spouse';
  else if (m.role === 'Child') relation = 'child';
  else if (m.role === 'Friend') relation = 'friend';
  const result = `your ${relation}${name ? ` (${name})` : ''}`;
  return capital ? result.charAt(0).toUpperCase() + result.slice(1) : result;
}

/* Use relationship titles in prompts, not a bare name that hides who is asking. */
const P17_requestStateBefore = p14RequestState;
p14RequestState = function() {
  const r = P17_requestStateBefore();
  if (r && r.m) r.name = p17Relation(r.m, true);
  return r;
};

/* Family requests now include siblings as well as parents and state a concrete need. */
p12GenerateFamilyNeed = function() {
  if (!S || S.age < 18 || S.p12NeedAge === S.age || S.familyNeed || S.parentNeed) return;
  S.p12NeedAge = S.age;
  const eligible = (S.family || []).filter(m => m && m.alive !== false && ['Mother','Father','Sibling'].includes(m.role));
  if (!eligible.length) return;
  const seniorParents = eligible.filter(m => ['Mother','Father'].includes(m.role) && m.age >= 58).length;
  const chance = Math.min(.30, (S.famWealth === 0 ? .17 : S.famWealth === 1 ? .11 : .06) + seniorParents * .035);
  if (Math.random() > chance) return;
  const m = pick(eligible);
  const reasons = m.role === 'Sibling'
    ? ['monthly groceries and bills','rent deposit or overdue rent','medical treatment or medicine','school / university fees','work clothes or transport for a new job','an urgent phone repair','a family event','temporary loss of income']
    : m.age >= 58
      ? ['monthly groceries','electricity and gas bills','blood tests and medication','hospital treatment','urgent plumbing repair','rent and household bills','home maintenance']
      : ['monthly groceries','electricity and gas bills','helping a younger sibling with school fees','a hospital or clinic bill','medication','a family wedding expense','urgent home repair','temporary loss of income'];
  const reason = pick(reasons), home = S.home || 'egy';
  const local = p14SuggestedFamilyNeed(reason, S.famWealth, gameYear(), home);
  const need = {id:m.id,reason,amountHomeLocal:local,amountHomeCurrency:(COUNTRIES[home]||COUNTRIES.egy).cur,amountInternal:localCurrencyInternal(local,home,gameYear()),year:gameYear()};
  if (m.role === 'Sibling') S.familyNeed = need; else S.parentNeed = need;
  log(`${p17Relation(m, true)} asked for help with ${reason}. The request is about ${money(need.amountInternal)} in today's player-currency equivalent; you can send a smaller amount or refuse.`);
  realismNotice('A family member asks for help',`${p17Relation(m, true)} needs help with ${reason}. You decide how much to send, if anything. Refusing may hurt trust; sending too much may delay your own rent, education, phone or housing goals.`);
};

p14RespondFamilyNeed = function(send) {
  const r = p14RequestState();
  if (!r) return;
  const m = r.m;
  if (send) {
    const value = Number($('p14-family-request-amount')?.value);
    if (!Number.isFinite(value) || value < 0) return hint('Enter a valid amount of zero or more.');
    const transfer = p12LocalCurrencyInternal(value, S.country, gameYear());
    const fee = S.country !== (S.home || S.country) ? transfer * .025 : 0;
    const total = transfer + fee;
    if (total > S.wealth) return hint(`You cannot afford ${money(total)} including the estimated transfer fee. Choose a smaller amount or decline.`);
    S.wealth -= total; S.expenses = (S.expenses || 0) + total;
    S.bill = S.bill || {}; S.bill.familySupport = (S.bill.familySupport || 0) + total;
    if (S.yearPopup) S.yearPopup.expenses = (S.yearPopup.expenses || 0) + total;
    if (m) {
      const ratio = r.amountInternal > 0 ? transfer / r.amountInternal : 0;
      m.bond = clamp(m.bond + (ratio >= .9 ? 9 : ratio >= .35 ? 5 : ratio > 0 ? 2 : -3));
    }
    if (transfer > 0) {
      fx({happiness: Math.min(3, Math.round(transfer / Math.max(1, r.amountInternal) * 2))});
      log(`You sent ${money(transfer)} to ${p17Relation(m)} for ${r.reason}${fee ? `; the international transfer fee was ${money(fee)}` : ''}. The requested amount was ${money(r.amountInternal)} and you chose what fit your budget.`);
    } else {
      fx({happiness:-2}); log(`You sent no money to ${p17Relation(m)} for ${r.reason}. They understood your budget was tight, but felt disappointed.`);
    }
  } else {
    if (m) m.bond = clamp(m.bond - 7);
    fx({happiness:-3}); log(`You declined ${p17Relation(m)}'s request for ${r.reason}. They were disappointed, but you protected your own limited savings.`);
  }
  if (r.kind === 'parent') S.parentNeed = null; else S.familyNeed = null;
  const el = document.getElementById('p14-parent-request-modal'); if (el) el.remove();
  hint(); render();
};

/* Also make ordinary gifts and recurring support explain the relationship in the Life log. */
transferFamilyCustom = function(id) {
  const m = S.family.find(x => x.id === id); if (!m || m.alive === false) return hint('This family member is not available.');
  const local = Number($(`gift-${id}`)?.value); if (!Number.isFinite(local) || local <= 0) return hint('Enter an amount greater than zero.');
  const amount = p12LocalCurrencyInternal(local, S.country, gameYear()); if (S.wealth < amount) return hint('You do not have enough cash for that transfer.');
  S.wealth -= amount; m.bond = clamp(m.bond + (amount > p12LocalCurrencyInternal(S.country === 'egy' ? 1000 : 25, S.country, gameYear()) ? 5 : 2));
  fx({happiness:1,social:1}); log(`You transferred ${money(amount)} to ${p17Relation(m)}.`); hint(); render();
};
p12GiveFamily = function(id) {
  const m = S.family.find(x => x.id === id); if (!m) return;
  const local = Number($(`p12-gift-${id}`)?.value); if (!Number.isFinite(local) || local <= 0) return hint('Enter an amount greater than zero.');
  const amount = p12LocalCurrencyInternal(local, S.country, gameYear()); if (amount > S.wealth) return hint('Not enough cash.');
  S.wealth -= amount; m.bond = clamp(m.bond + (amount > p12LocalCurrencyInternal(S.country === 'egy' ? 1000 : 25, S.country, gameYear()) ? 5 : 2));
  log(`You gave ${money(amount)} to ${p17Relation(m)}.`); render();
};
p12SetAllowance = function(id) {
  const m = S.family.find(x => x.id === id); if (!m) return;
  const local = Number($(`p12-allow-${id}`)?.value); if (!Number.isFinite(local) || local < 0) return hint('Enter zero or a positive annual amount.');
  m.allowLocal = local; m.allowCurrency = S.country; m.allow = p12LocalCurrencyInternal(local, S.country, gameYear());
  log(`You set ${p17Relation(m)}'s recurring allowance to ${money(m.allow)} per year.`); hint(); render();
};

/* Clear visible EGP history / forecast text while retaining the historic rate table and calculation functions in code. */
const P17_viewWorldBeforeCurrencyCleanup = viewWorld;
viewWorld = function() {
  let html = P17_viewWorldBeforeCurrencyCleanup();
  html = html.replace(/<section class="card"><h3>Egyptian pound history and outlook<\/h3>[\s\S]*?(?=<section class="card">|$)/, '');
  html = html.replace(/The US Dollar rose from 5\.5 EGP in 2007 to over 50 EGP today\. Holding USD protects wealth\./g, 'Imported goods can be expensive relative to local salaries.');
  return html + p17HostWorkSection() + p17AsylumPanel();
};

/* Country-specific work board: every employer, salary and sponsorship flag belongs to the country the player is actually living in. */
function p17HostWorkSection() {
  if (!S || S.country === S.home || !S.imm) return '';
  const c = COUNTRIES[S.country] || COUNTRIES.usa;
  const posts = (companyListFor(S.country) || []).slice();
  const trackRecord = S.careerRecords || {};
  const degree = S.degree;
  const score = p => {
    if (!degree) return p.degree == null ? 60 : 0;
    if (p.p15DegreeMajor === degree || p.degree === degree || (p.degrees || []).includes(degree) || (typeof p15RoleTrackRelevant === 'function' && p15RoleTrackRelevant(p, degree))) return 100;
    return p.degree == null ? 30 : 0;
  };
  posts.sort((a,b)=>score(b)-score(a));
  const status = S.undocumented || S.imm.stage === 'irregular' ? 'No valid status' : S.imm.stage === 'student' ? 'Student status — work is restricted' : S.imm.stage === 'post' ? 'Post-study job-search window' : S.imm.stage === 'pr' || S.imm.stage === 'gc' || S.imm.stage === 'citizen' || S.imm.stage === 'asylum' ? 'May work subject to the status / permit conditions' : 'Sponsorship or a separate work right may be required';
  const blockedStudent = S.imm.stage === 'student';
  const pendingAsylum = !!S.asylumCase;
  const listings = posts.slice(0, 24).map(p => {
    const rec = trackRecord[p.trackId], level = Math.max(0, Math.min(4, rec ? rec.level || 0 : 0));
    const title = (typeof p12RoleTitle === 'function' ? p12RoleTitle(p, level) : salaryTitle(p.trackId, level));
    const salary = jobSalaryForPost(p, level, S.country, gameYear());
    const allowedDegrees = p.degrees && p.degrees.length ? p.degrees : p.degree ? [p.degree] : [];
    const education = allowedDegrees.length ? allowedDegrees.map(d=>MAJORS[d]?.name||d).join(' / ') : 'Degree not always required';
    const sponsor = p.sponsorship ? '<span class="badge badge-mint">May sponsor</span>' : '<span class="badge badge-amber">No sponsorship</span>';
    const why = pendingAsylum ? 'An asylum claim is pending; this simulation does not assume it gives you immediate work permission.' : blockedStudent ? 'Student status may restrict hours and type of work; use permitted campus work for now.' : p12Eligibility(p);
    const noWork = !!why || (S.pendingJobOffer && S.pendingJobOffer.years >= 0);
    return `<details class="p17-posting"><summary>${p.name} · ${title} ${S.country !== S.home ? sponsor : ''}</summary>${PR(p.desc || 'Employer posting; duties and terms depend on the vacancy.')}${ROW('Country / market', c.n)}${ROW('Estimated annual gross pay', p.isRemoteUSD ? usd(salary) : money(salary))}${ROW('Education', education)}${ROW('Experience', `${p.minExp || 0} relevant year(s) minimum`)}${ROW('Benefits', benefitsSummary({medical:p.medical,social:p.social,bonus:p.bonus,leave:p.leave,remote:p.remote,hours:p.hours,contract:p.contract}))}${ROW('Work-visa sponsorship', S.country === S.home ? 'Not needed for a home-country role' : p.sponsorship ? 'Employer is willing to consider sponsorship; government approval is separate' : 'Not offered for this vacancy')}${noWork ? PR(`Not currently applicable: ${why}`) : ''}<button class="btn" onclick="applyCompany('${p.id}')" ${noWork ? 'disabled' : ''}>${noWork ? 'Not currently available' : 'Apply to this local employer'}</button></details>`;
  }).join('');
  return SEC(`Jobs in ${c.n}`, PR(`These employers and vacancies are generated for ${c.n}, not ${COUNTRIES[S.home]?.n || 'your home country'}. Salaries, healthcare and sponsorship vary by company; a “may sponsor” label is not a visa guarantee.`)+ROW('Current immigration status',status)+PR(blockedStudent ? 'Finish or check your study conditions first. Some student visas allow limited hours or internships but do not allow unrestricted full-time work.' : 'Look for relevant roles, check sponsorship before accepting, and keep enough time for visa processing before your current permission expires.')+(listings || PR('No openings were generated this year; check again after the next age-up.')));
}

/* Asylum / protection is a separate uncertain branch. It does not promise approval, work authorisation or protection from removal. */
function p17AsylumPanel() {
  if (!S || S.country === S.home || !S.imm || ['citizen','pr','gc','asylum'].includes(S.imm.stage)) return '';
  if (S.asylumDecisionPending) {
    const d = S.asylumDecisionPending;
    return SEC('Protection claim refused — choose what happens next', PR(`The host country's decision-maker refused the claim based on “${d.reasonLabel}”. Refusal does not guarantee an immediate physical return, but your remaining options and any appeal rights depend on local law and your facts.`)+B('Seek an appeal / qualified legal review',`Estimated filing and advice cost ${money(imp(250))}; another uncertain processing period.`,'p17ChooseAsylumRefusal(\'appeal\')',S.wealth<imp(250))+B('Remain without valid status','You may stay in the game, but risks include exploitation, housing insecurity, status checks and future visa problems.','p17ChooseAsylumRefusal(\'stay\')')+B('Return home voluntarily','End your stay abroad and restart your plans at home.','p17ChooseAsylumRefusal(\'return\')'));
  }
  if (S.asylumCase) return SEC('Protection / asylum application',ROW('Ground raised',S.asylumCase.reasonLabel)+ROW('Evidence / support',S.asylumCase.evidenceLabel)+ROW('Processing',`${S.asylumCase.years || 0} of about 1 game year`)+PR('The outcome is uncertain. Eligibility depends on individual circumstances, evidence and the host country’s law. A pending claim does not automatically authorise work in this simulation.')+B('Withdraw the claim','This does not automatically renew any expired visa.','p17WithdrawAsylum()'));
  const opts = [
    ['orientation','Risk related to sexual orientation or gender identity'],
    ['persecution','Risk of persecution or serious harm if returned'],
    ['humanitarian','Humanitarian circumstances / unsafe conditions']
  ].map(([id,l])=>`<option value="${id}">${l}</option>`).join('');
  const evidence = `<option value="limited">Limited independent evidence</option><option value="some">Some supporting documents / credible records</option><option value="legal">Qualified legal support and supporting evidence</option>`;
  return SEC('Protection / asylum options',PR('If you genuinely fear persecution or serious harm, the game lets you explore a protection claim. Claims can be accepted or refused; rules, evidence standards, deadlines and work rights differ by country. This is a game system, not legal advice.')+`<label class="muted" for="p17-asylum-reason">Reason for seeking protection</label><select id="p17-asylum-reason" style="width:100%;margin:6px 0 10px">${opts}</select><label class="muted" for="p17-asylum-evidence">How supported is the claim?</label><select id="p17-asylum-evidence" style="width:100%;margin:6px 0 10px">${evidence}</select>`+B('Apply for protection / asylum',`Filing and translation cost about ${money(imp(120))}; approval is not guaranteed.`,'p17ApplyAsylum()',S.asylumAttempts>=2||S.wealth<imp(120)));
}
function p17ApplyAsylum() {
  if (!S || S.country === S.home || !S.imm) return hint('A protection claim is only available in a country outside your home country.');
  if (S.asylumCase || S.asylumDecisionPending) return hint('Resolve the current protection case first.');
  if ((S.asylumAttempts || 0) >= 2) return hint('You have used the two modeled attempts for this life.');
  const reasonId = $('p17-asylum-reason')?.value || 'persecution';
  const evidence = $('p17-asylum-evidence')?.value || 'limited';
  const reasons = {orientation:'sexual-orientation / gender-identity risk',persecution:'risk of persecution or serious harm',humanitarian:'humanitarian / unsafe conditions'};
  const labels = {limited:'limited evidence',some:'some supporting evidence',legal:'qualified legal support and evidence'};
  const fee = imp(120);
  if (S.wealth < fee) return hint(`You need ${money(fee)} for the modeled application and translation costs.`);
  S.wealth -= fee; S.expenses = (S.expenses || 0) + fee;
  S.asylumCase = {reason:reasonId,reasonLabel:reasons[reasonId]||reasons.persecution,evidence,evidenceLabel:labels[evidence]||labels.limited,years:0,appeal:false,startedYear:gameYear()};
  S.asylumAttempts = (S.asylumAttempts || 0) + 1;
  log(`You filed a protection claim in ${C().n}, citing ${S.asylumCase.reasonLabel}. Filing costs were ${money(fee)}; the outcome and any work rights remain uncertain.`);
  realismNotice('Protection claim filed',`Your claim in ${C().n} has entered the modeled process. A claim can be accepted or refused; do not assume a pending claim allows work or settles your immigration status.`);
  hint(); render();
}
function p17ChooseAsylumRefusal(action) {
  const d = S && S.asylumDecisionPending; if (!d) return;
  if (action === 'appeal') {
    const fee = imp(250);
    if (S.wealth < fee) return hint(`You need ${money(fee)} for the modeled appeal / legal review.`);
    S.wealth -= fee; S.expenses = (S.expenses || 0) + fee;
    S.asylumDecisionPending = null;
    S.asylumCase = {reason:d.reason,reasonLabel:d.reasonLabel,evidence:d.evidence,evidenceLabel:d.evidenceLabel,years:0,appeal:true,startedYear:gameYear()};
    log(`You requested an appeal / legal review of the refused protection claim. It will take more time and money, and can still be refused.`);
    realismNotice('Appeal lodged',`Your appeal is pending. The process may take time; it does not automatically create unrestricted work rights.`);
  } else if (action === 'stay') {
    S.asylumDecisionPending = null; S.undocumented = true; S.undocumentedYears = S.undocumentedYears || 0;
    S.imm = {stage:'irregular',left:0,yrs:0,tries:0}; S.futureVisaPenalty = (S.futureVisaPenalty || 0) + 1;
    log(`Your protection claim was refused. You chose to remain in ${C().n} without valid status; your future stays, informal income and risk are uncertain.`);
    realismNotice('You stayed after a refusal',`You can continue the simulation without status, but the game will model precarious work, exploitation, housing insecurity, checks and future visa difficulties.`);
  } else {
    S.asylumDecisionPending = null; S.asylumCase = null; S.undocumented = false;
    leaveAbroad(`After the protection claim was refused, you chose to return to ${COUNTRIES[S.home].n}. The application cost time and money, but you can plan your next steps at home.`);
    return;
  }
  hint(); render();
}
function p17WithdrawAsylum() {
  if (!S || !S.asylumCase) return;
  S.asylumCase = null; log('You withdrew your protection claim. This did not renew or extend any previous visa or work permission.'); hint(); render();
}

/* Process a protection case at age-up, without automatically forcing a return after a refusal. */
const P17_immYearBeforeAsylum = immYear;
immYear = function() {
  if (S && S.asylumCase) {
    const a = S.asylumCase; a.years = (a.years || 0) + 1;
    if (a.years < 1) { log(`Protection case processing continues in ${C().n}.`); return; }
    let chance = a.reason === 'orientation' ? (sameSex() ? (C().ssm ? .62 : .47) : .20) : a.reason === 'persecution' ? .43 : .32;
    chance += a.evidence === 'legal' ? .16 : a.evidence === 'some' ? .08 : -.08;
    chance += S.smarts >= 65 ? .02 : 0;
    chance = Math.max(.05, Math.min(.88, chance));
    S.asylumCase = null;
    if (Math.random() < chance) {
      S.undocumented = false; S.undocumentedWork = null;
      S.imm = {stage:'asylum',left:5,yrs:0,tries:0,route:'protection granted'};
      log(`Your protection claim was accepted in ${C().n}. You received a protected status in this simulation; renewal, travel rights and employment conditions still depend on the country.`);
      realismNotice('Protection granted',`Your claim was accepted. The game treats this status as permitting ordinary work, but actual work and travel rights are country-specific and subject to your documents.`);
    } else {
      S.asylumDecisionPending = {reason:a.reason,evidence:a.evidence,reasonLabel:a.reasonLabel,evidenceLabel:a.evidenceLabel};
      log(`Your protection claim was refused in ${C().n}. You were not automatically transported out of the country; you must choose whether to seek review, return voluntarily or stay without valid status.`);
    }
    return;
  }
  return P17_immYearBeforeAsylum();
};
const P17_canWorkBeforeAsylum = p12CanWorkWithoutSponsor;
p12CanWorkWithoutSponsor = function() {
  return P17_canWorkBeforeAsylum() || !!(S && S.imm && S.imm.stage === 'asylum' && !S.asylumCase);
};
const P17_eligibilityBeforeAsylum = p12Eligibility;
p12Eligibility = function(post) {
  if (S && S.asylumCase) return 'Your protection claim is pending; this game does not assume it grants immediate work authorisation.';
  return P17_eligibilityBeforeAsylum(post);
};

/* More specific annual leave / travel planner. The player controls food, shopping,
   host gifts, lodging, cabin class, duration and the exact leave requested. */
const P17_tripRenderBefore = p12RenderTravel;
p12RenderTravel = function() {
  let html = P17_tripRenderBefore();
  html = html.replace(/<div><label class="muted">Daily food, shopping and spending budget \(destination currency\)<\/label><input id="p12-trip-spend"[^>]*><\/div>/,
    '<div><label class="muted" for="p12-trip-spend">Daily food budget (destination currency)</label><input id="p12-trip-spend" type="number" min="0" value="1500" oninput="p12RefreshTripQuote()" style="width:100%"></div><div><label class="muted" for="p17-trip-shopping">Daily shopping / clothes / souvenirs budget (destination currency)</label><input id="p17-trip-shopping" type="number" min="0" value="0" oninput="p12RefreshTripQuote()" style="width:100%"></div>');
  html = html.replace('<div class="acts"><div><label class="muted">Return airfare class</label>',
    '<div style="margin:8px 0"><label class="muted" for="p17-trip-stay">Where will you stay?</label><select id="p17-trip-stay" onchange="p12RefreshTripQuote()" style="width:100%;margin-top:5px"><option value="hotel">Hotel (use selected quality)</option><option value="airbnb">Airbnb / serviced apartment</option><option value="motel">Motel / hostel / budget guesthouse</option><option value="parents">Parents’ home (family visit only)</option><option value="sibling">Brother’s / sister’s home (family visit only)</option><option value="friend">Friend’s home / staying with a host</option></select></div><div><label class="muted" for="p17-trip-night">Custom cost per night (destination currency; 0 = estimate / free host stay)</label><input id="p17-trip-night" type="number" min="0" value="0" oninput="p12RefreshTripQuote()" style="width:100%"></div><div style="margin:8px 0"><label class="muted" for="p17-trip-leave-days">Days off requested from work</label><input id="p17-trip-leave-days" type="number" min="0" max="60" value="4" oninput="p12RefreshTripQuote()" style="width:100%"><p class="muted" style="margin-top:4px">Trip duration and leave days can differ. Paid days reduce your available annual-leave balance; your manager can refuse.</p></div><div class="acts"><div><label class="muted">Return airfare class</label>');
  html = html.replace('<div><label class="muted">Time off from work</label>',
    '<div style="margin-top:8px"><label class="muted" for="p17-trip-gift-type">Gift to bring</label><select id="p17-trip-gift-type" onchange="p12RefreshTripQuote()" style="width:100%"><option value="none">No gift</option><option value="sweets">Sweets / groceries / small souvenirs</option><option value="clothes">Clothes or a useful household gift</option><option value="medicine">Medicine / health items</option><option value="electronics">Electronics / a more expensive gift</option><option value="cash">Cash gift / contribution</option><option value="custom">Custom gift</option></select></div><div><label class="muted" for="p17-trip-gift-recipient">Gift recipient</label><select id="p17-trip-gift-recipient" style="width:100%"><option value="family">Family in general</option><option value="mother">Mother</option><option value="father">Father</option><option value="sibling">Brother / sister</option><option value="friend">Friend / host</option><option value="partner">Partner</option></select></div><div><label class="muted" for="p17-trip-gifts">One-time gift budget (destination currency)</label><input id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()" style="width:100%"></div><div><label class="muted">Time off from work</label>');
  html = html.replace('Time off from work</label><select id="p12-trip-leave"', 'Time off / wage treatment</label><select id="p12-trip-leave"');
  return html;
};

const P17_tripQuoteBefore = p12TripQuote;
p12TripQuote = function() {
  const q = P17_tripQuoteBefore(); if (!q) return q;
  const staySelect = $('p17-trip-stay');
  let stay = staySelect?.value || 'hotel';
  const isFamilyVisit = q.d && q.d.id === 'trip-home';
  if (!isFamilyVisit && (stay === 'parents' || stay === 'sibling')) {
    stay = 'hotel'; if (staySelect) staySelect.value = 'hotel';
  }
  const defaultHotel = q.hotel;
  const customNight = Math.max(0, Number($('p17-trip-night')?.value) || 0);
  const freeStay = ['parents','sibling','friend'].includes(stay);
  if (stay === 'airbnb') q.hotel = Math.round(defaultHotel * .78);
  else if (stay === 'motel') q.hotel = Math.round(defaultHotel * .48);
  else if (freeStay) q.hotel = 0;
  else q.hotel = defaultHotel;
  if (customNight > 0) q.hotel = p12LocalCurrencyInternal(customNight * q.nights * q.rooms, q.d.country, gameYear());
  q.stayType = stay;
  q.lodgingLabel = ({hotel:`${$('p12-trip-hotel')?.value || 'comfort'} hotel`,airbnb:'Airbnb / serviced apartment',motel:'Motel / hostel / budget guesthouse',parents:'parents’ home',sibling:'brother’s / sister’s home',friend:'friend’s home / host stay'})[stay] || 'hotel';
  q.shoppingLocal = Math.max(0, Number($('p17-trip-shopping')?.value) || 0);
  q.shopping = p12LocalCurrencyInternal(q.shoppingLocal * q.days * q.people, q.d.country, gameYear());
  q.giftType = $('p17-trip-gift-type')?.value || 'none';
  q.giftRecipient = $('p17-trip-gift-recipient')?.value || 'family';
  q.giftLocal = Math.max(0, Number($('p17-trip-gifts')?.value) || 0);
  q.giftLabel = ({none:'no gift',sweets:'sweets / groceries / small souvenirs',clothes:'clothes / household gift',medicine:'medicine / health items',electronics:'electronics gift',cash:'cash gift / contribution',custom:'custom gift'})[q.giftType] || 'gift';
  q.gifts = q.giftType === 'none' ? 0 : p12LocalCurrencyInternal(q.giftLocal, q.d.country, gameYear());
  q.leaveDays = Math.max(0, Math.min(60, Math.floor(Number($('p17-trip-leave-days')?.value ?? q.days))));
  q.food = q.spend;
  q.total = q.airfare + q.transport + q.hotel + q.spend + q.activities + q.shopping + q.gifts;
  return q;
};
function p17RefreshTripQuote() {
  const q = p12TripQuote(), el = $('p12-trip-estimate'); if (!el || !q) return;
  const currency = COUNTRIES[q.d.country]?.cur || C().cur;
  el.innerHTML = `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><b>Estimated total</b><strong style="font-size:1.15rem;color:var(--mint)">${money(q.total)}</strong></div>${ROW(q.international?'Return airfare · '+q.classKey:'Local transport',money(q.airfare||q.transport))}${q.international?ROW('Local transport',money(q.transport)):''}${ROW(`Stay · ${q.lodgingLabel} · ${q.nights} night(s)`,money(q.hotel))}${ROW('Food / meals',money(q.spend))}${ROW('Activities',money(q.activities))}${ROW('Shopping / clothes',money(q.shopping))}${ROW(q.gifts?`Gift · ${q.giftLabel}`:'Gifts',money(q.gifts))}${ROW('Trip length',`${q.days} day(s) · ${q.people} traveller(s)`)}${ROW('Annual leave requested',`${q.leaveDays} day(s)`)}${PR(`Local spending fields are in ${currency}. Return-fare and hotel values are estimates, not bookable live quotes. If you stay with family or a friend, accommodation may be free, but food, gifts, transport and your host’s circumstances still matter.`)}`;
}
p12RefreshTripQuote = p17RefreshTripQuote;

/* This booking handler respects the manager's decision and paid-leave balance, then records all itemised costs. */
p12BookTrip = function(purpose='holiday') {
  const q = p12TripQuote(); if (!q) return hint('Choose a destination.');
  const leaveDays = q.leaveDays == null ? q.days : q.leaveDays;
  const leaveType = $('p12-trip-leave')?.value || 'paid'; let lost = 0;
  if (S.p17LastFamilyVisitYear === gameYear() && q.d.id === 'trip-home') return hint('You already completed a family visit this in-game year.');
  if (S.undocumented && q.international && q.d.country !== S.home) return hint('Without valid status, leaving for another country may prevent you from re-entering this country. You can plan local outings or decide to return home.');
  if (S.job && leaveType === 'unpaid') lost = Math.round((S.job.salary || 0) / 260 * leaveDays);
  if (S.wealth < q.total + lost) return hint(`The trip and any unpaid wages total about ${money(q.total + lost)}. You cannot afford this yet.`);
  if (S.job) {
    if (leaveType === 'paid' && leaveDays > (S.vacationDays || 0)) return hint(`You have ${Math.floor(S.vacationDays || 0)} paid-leave day(s). Request fewer days or choose unpaid leave.`);
    const approval = purpose === 'funeral' ? .92 : Math.min(.94,.53+(S.job.perf||45)/240+(S.job.benefits && S.job.benefits.leave ? .08 : 0)+(leaveDays<=5?.08:0)-(leaveDays>12?.16:0)-(leaveType==='unpaid'?.12:0));
    if (Math.random() > approval) { log(`${S.job.company || 'Your manager'} refused your ${purpose==='funeral'?'emergency funeral':'holiday'} leave request for ${leaveDays} day(s). You did not buy tickets and no travel expenses were charged.`); fx({happiness:-3}); realismNotice('Leave request refused',`Your manager refused ${leaveDays} day(s) off. No travel money was spent. You can try different dates, fewer days or a different leave arrangement.`); render(); return; }
    if (leaveType === 'paid') S.vacationDays = Math.max(0,(S.vacationDays||0)-leaveDays);
    else { S.wealth -= lost; S.income = Math.max(0,(S.income||0)-lost); S.expenses = (S.expenses||0)+lost; }
  } else if (S.imm && S.imm.stage === 'student' && Math.random() < .12) {
    log('Your university schedule / exam dates made the trip risky, so you postponed it.'); realismNotice('Trip postponed',`Your study or attendance schedule made this trip risky. You kept your money and can plan during a break.`); render(); return;
  }
  S.wealth -= q.total; S.expenses = (S.expenses||0)+q.total; S.bill = S.bill||{}; S.bill.travel=(S.bill.travel||0)+q.total;
  S.tripHistory = S.tripHistory || [];
  const record = {year:gameYear(),destination:q.d.name,destinationCountry:q.d.country,days:q.days,leaveDays,people:q.people,total:q.total,purpose,class:q.classKey,stay:q.lodgingLabel,food:q.spend,shopping:q.shopping,gifts:q.gifts,giftType:q.giftLabel};
  S.tripHistory.unshift(record); S.tripHistory=S.tripHistory.slice(0,20);
  if(q.d.id==='trip-home') S.p17LastFamilyVisitYear=gameYear();
  if(q.stayType==='parents'||q.stayType==='sibling') (S.family||[]).filter(m=>m&&m.alive!==false&&['Mother','Father','Sibling'].includes(m.role)).forEach(m=>m.bond=clamp(m.bond+4));
  if(q.gifts>0 && q.giftType!=='none') {
    let m=null;
    if(q.giftRecipient==='mother')m=(S.family||[]).find(x=>x.role==='Mother');
    else if(q.giftRecipient==='father')m=(S.family||[]).find(x=>x.role==='Father');
    else if(q.giftRecipient==='sibling')m=(S.family||[]).find(x=>x.role==='Sibling');
    else if(q.giftRecipient==='partner')m=partner();
    else if(q.giftRecipient==='friend')m=(S.friends||[])[0]||null;
    else m=(S.family||[]).find(x=>['Mother','Father','Sibling'].includes(x.role));
    if(m)m.bond=clamp(m.bond+Math.min(12,Math.max(2,Math.round(q.gifts/Math.max(1,q.giftLocal||1)*3+2))));
  }
  fx({happiness:Math.min(18,5+q.days*1.2),social:q.people>1?5:2});
  const companion=$('p12-trip-with')?.value||'solo';
  if(companion==='partner'&&partner())partner().bond=clamp(partner().bond+8);
  if(companion==='friend'&&S.friends&&S.friends.length)S.friends[0].bond=clamp(S.friends[0].bond+8);
  if(companion==='family')(S.family||[]).filter(m=>m.alive!==false&&['Mother','Father','Sibling','Child'].includes(m.role)).forEach(m=>m.bond=clamp(m.bond+5));
  if(purpose==='funeral'&&S.funeralNotice)S.funeralNotice=null;
  const giftLog=q.gifts?`; you brought ${q.giftLabel} for ${q.giftRecipient==='mother'?'your mother':q.giftRecipient==='father'?'your father':q.giftRecipient==='sibling'?'your brother / sister':q.giftRecipient==='partner'?'your partner':q.giftRecipient==='friend'?'your friend / host':'your family'} (${money(q.gifts)})`:'';
  const unpaidLog=lost?`; unpaid leave / missed wages ${money(lost)}`:'';
  log(`${purpose==='funeral'?'Funeral trip':q.d.id==='trip-home'?'Annual family visit':'Holiday'}: ${q.d.name}, ${q.days} day(s), ${q.people} traveller(s); ${q.international?`return ${q.classKey} airfare ${money(q.airfare)}`:`local transport ${money(q.transport)}`}; stay ${q.lodgingLabel} ${money(q.hotel)}; food ${money(q.spend)}; shopping ${money(q.shopping)}; activities ${money(q.activities)}${giftLog}${unpaidLog}. Total ${money(q.total+lost)}.`);
  realismNotice(purpose==='funeral'?'Family funeral trip':q.d.id==='trip-home'?'Annual family visit':'Holiday completed',`You spent ${money(q.total+lost)} on ${q.d.name} for ${q.days} day(s) and requested ${leaveDays} day(s) off. ${S.job?`Remaining paid leave: ${Math.floor(S.vacationDays||0)} day(s). `:''}The trip improved your mood and relationships, but slowed your savings goals.`);
  hint(); render();
};

/* Needs / goals: phones, clothing, study, family visits, health costs and a home deposit. */
const P17_NEED_TYPES = {
  phone:{label:'Phone / phone replacement',egy:18000,usd:350},
  clothes:{label:'New clothes / work wardrobe',egy:9000,usd:180},
  laptop:{label:'Laptop / work equipment',egy:45000,usd:850},
  visit:{label:'Visit family / airfare and gifts',egy:65000,usd:1200},
  holiday:{label:'Holiday / trip with friends',egy:22000,usd:450},
  medical:{label:'Medical treatment / emergency fund',egy:18000,usd:500},
  course:{label:'English course / certification',egy:12000,usd:250},
  rent:{label:'Rent deposit / moving out',egy:90000,usd:1800},
  home:{label:'Home / property down payment',egy:650000,usd:25000}
};
function p17GoalDefaultLocal(type) {
  const item=P17_NEED_TYPES[type]||P17_NEED_TYPES.phone;
  const y=gameYear();
  if(S.country==='egy')return Math.round(item.egy*(typeof p14EgyptPriceIndex==='function'?p14EgyptPriceIndex(y):1));
  const c=COUNTRIES[S.country]||COUNTRIES.usa, infl=typeof prOf==='function'?prOf(y,S):1;
  return Math.round(item.usd*(c.rate||1)*infl);
}
function p17NeedsGoalsPanel() {
  if(!S||S.age<16)return '';
  S.p17Goals=Array.isArray(S.p17Goals)?S.p17Goals:[];
  const opts=Object.entries(P17_NEED_TYPES).filter(([id])=>S.age>=18||!['rent','home'].includes(id)).map(([id,v])=>`<option value="${id}">${v.label}</option>`).join('');
  const goals=S.p17Goals;
  const rows=goals.length?goals.map(g=>{
    const left=Math.max(0,g.targetInternal-(g.savedInternal||0)),percent=Math.min(100,Math.round((g.savedInternal||0)/Math.max(1,g.targetInternal)*100));
    const amountId=`p17-fund-${g.id}`;
    return `<div class="card" style="padding:12px;margin-top:8px;border-color:${g.done?'var(--mint)':'var(--line)'}"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><b>${g.label}</b><span class="badge ${g.done?'badge-mint':'badge-violet'}">${g.done?'Completed':percent+'%'}</span></div><div class="row"><span>Target</span><b>${money(g.targetInternal)}</b></div><div class="row"><span>Saved toward goal</span><b>${money(g.savedInternal||0)}</b></div><div class="row"><span>Still needed</span><b>${money(left)}</b></div><div class="bar" style="height:7px;margin:8px 0"><div class="fill" style="width:${percent}%;background:var(--mint)"></div></div>${g.done?PR(`Completed in ${g.completedYear||gameYear()}. The action is recorded in your Life log.`):`<div class="row"><label for="${amountId}">Add savings (${C().cur})</label><input id="${amountId}" type="number" min="1" placeholder="Amount to save" style="width:145px"></div><div class="acts"><button class="btn" onclick="p17FundGoal('${g.id}')">Move money into goal</button><button class="btn" onclick="p17CompleteGoal('${g.id}')" ${left>0?'disabled':''}>Use savings / complete goal</button></div>`}</div>`;
  }).join(''):'<p class="muted">No active goals yet. Create one for something you need, then set aside money gradually.</p>';
  return `<section class="card" style="border-color:var(--cyan)"><h3>Needs & savings goals</h3><p class="muted">Plan for a phone, work clothes, a laptop, a family visit, treatment, English courses, a rent deposit or a home down payment. Goals do not buy the item automatically—you decide when to use the saved amount.</p><div class="row"><label for="p17-goal-type">Goal</label><select id="p17-goal-type" onchange="p17SetGoalDefault()" style="width:65%">${opts}</select></div><div class="row"><label for="p17-goal-label">Name / details</label><input id="p17-goal-label" type="text" maxlength="70" placeholder="e.g. visit family next summer" style="width:65%"></div><div class="row"><label for="p17-goal-target">Target amount (${C().cur})</label><input id="p17-goal-target" type="number" min="1" value="${p17GoalDefaultLocal('phone')}" style="width:145px"></div><button class="btn btn-primary" onclick="p17CreateGoal()">Create savings goal</button>${rows}</section>`;
}
function p17SetGoalDefault() { const el=$('p17-goal-target'),type=$('p17-goal-type')?.value;if(el&&type)el.value=p17GoalDefaultLocal(type); }
function p17CreateGoal() {
  const type=$('p17-goal-type')?.value||'phone',local=Number($('p17-goal-target')?.value),userLabel=String($('p17-goal-label')?.value||'').replace(/[<>]/g,'').trim();
  if(!Number.isFinite(local)||local<=0)return hint('Enter a target amount greater than zero.');
  S.p17Goals=Array.isArray(S.p17Goals)?S.p17Goals:[];
  if(S.p17Goals.filter(g=>!g.done).length>=8)return hint('Complete or remove a goal before adding another.');
  const id='g'+Math.random().toString(36).slice(2,9),amount=p12LocalCurrencyInternal(local,S.country,gameYear()),label=userLabel||P17_NEED_TYPES[type].label;
  S.p17Goals.push({id,type,label,targetInternal:amount,savedInternal:0,createdYear:gameYear(),done:false});
  log(`You set a savings goal: ${label}, targeting ${money(amount)}. This gives you a plan for an important need instead of spending the money on something else.`);hint();render();
}
function p17FundGoal(id) {
  const g=(S.p17Goals||[]).find(x=>x.id===id);if(!g||g.done)return;
  const local=Number($(`p17-fund-${id}`)?.value);if(!Number.isFinite(local)||local<=0)return hint('Enter an amount greater than zero.');
  const desired=p12LocalCurrencyInternal(local,S.country,gameYear()),left=Math.max(0,g.targetInternal-(g.savedInternal||0)),amount=Math.min(desired,left);
  if(S.wealth<amount)return hint(`You only have ${money(S.wealth)} available. Add a smaller amount to the goal.`);
  if(amount<=0)return hint('This goal is already fully funded.');
  S.wealth-=amount;g.savedInternal=(g.savedInternal||0)+amount;S.expenses=(S.expenses||0);log(`You moved ${money(amount)} into your “${g.label}” savings goal. ${money(Math.max(0,g.targetInternal-g.savedInternal))} remains.`);hint();render();
}
function p17CompleteGoal(id) {
  const g=(S.p17Goals||[]).find(x=>x.id===id);if(!g||g.done)return;
  if((g.savedInternal||0)<g.targetInternal)return hint(`Save another ${money(g.targetInternal-(g.savedInternal||0))} first.`);
  const saved=g.savedInternal;g.savedInternal=0;g.done=true;g.completedYear=gameYear();
  if(g.type==='phone'){
    S.inventory=S.inventory||[];S.inventory.push({uid:'p17-'+id,key:'p17-budget-phone',cat:'phone',type:'phone',model:'Budget smartphone',price:saved,age:0,life:3,hap:1,hp:0,soc:1,tier:1,homeId:null,broken:false,insured:false,portable:true});
  } else if(g.type==='clothes') {
    S.inventory=S.inventory||[];S.inventory.push({uid:'p17-'+id,key:'p17-work-clothes',cat:'fashion',type:'fashion',model:g.label,price:saved,age:0,life:2,hap:1,hp:0,soc:1,tier:1,homeId:null,broken:false,insured:false,portable:true});
  }
  fx({happiness: g.type==='visit'||g.type==='holiday'?5:2});
  log(`You used ${money(saved)} to complete your goal: ${g.label}. The savings became a purchase or funded plan; your liquid cash fell, but you reached an important milestone.`);hint();render();
}
const P17_viewActivitiesBeforeGoals=viewActivities;
viewActivities=function(){ return P17_viewActivitiesBeforeGoals()+p17NeedsGoalsPanel(); };
const P17_netWorthBeforeGoals=netWorth;
netWorth=function(){ return P17_netWorthBeforeGoals()+(S&&Array.isArray(S.p17Goals)?S.p17Goals.reduce((sum,g)=>sum+(!g.done?(g.savedInternal||0):0),0):0); };

/* Polish the career view, use role-specific names instead of only generic track titles, and group degree matches first for every major. */
function p17CurrentJobCard() {
  if(!S.job)return '';
  const j=S.job,b=j.benefits||{},remote=!!j.isRemoteUSD;
  const salary=remote?`${usd(j.salary)}/year in USD · approx. ${money(j.salary)}/year equivalent`:money(j.salary)+'/year';
  const status=remote?'REMOTE · USD CONTRACT':S.country!==S.home&&j.visaSponsorship?'HOST-COUNTRY EMPLOYMENT · SPONSORSHIP ATTACHED':'ACTIVE MAIN JOB';
  return `<section class="card" style="border-color:var(--violet);background:linear-gradient(150deg,rgba(139,92,246,.13),var(--card));box-shadow:0 8px 28px rgba(0,0,0,.2)"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><span class="badge badge-violet">${status}</span><span class="muted" style="font-size:.78rem">Only one main job can be active</span></div><h3 style="margin-top:10px">${j.title}</h3><p style="font-size:.92rem;color:var(--muted)">${j.company||'Employer'} · ${(COUNTRIES[S.country]||COUNTRIES.usa).n}</p><div class="row"><span>Annual gross pay</span><b>${salary}</b></div><div class="row"><span>Seniority / track level</span><b>${(j.level||0)+1}/5</b></div><div class="row"><span>Tenure</span><b>${j.years||0} year(s)</b></div><div class="row"><span>Healthcare</span><b>${b.medical?'Employer medical cover':'No employer cover'}</b></div><div class="row"><span>Paid annual leave</span><b>${b.leave||14} days · ${Math.floor(S.vacationDays||0)} available</b></div><div class="row"><span>Work arrangement</span><b>${b.remote||'On-site'} · ${b.hours||40} h/week</b></div><div class="row"><span>Visa sponsorship</span><b>${S.country===S.home?'Not needed at home':remote?'Not included':j.visaSponsorship?'Employer willing to sponsor':'Not attached to this role'}</b></div>${PR(`Benefits: ${benefitsSummary(b)}. A remote USD role replaces any previous main job; it does not stack a second salary.`)}<div class="acts"><button class="btn" onclick="workHarder()" ${S.worked?'disabled':''}>Work harder</button><button class="btn" onclick="askPromotion()" ${S.promoTried?'disabled':''}>Request promotion</button></div>${B('Resign / leave this job','Your work history remains recorded; income from the role stops.','quitJob()')}</section>`;
}
function p17CareerSearchBoard() {
  if(!S||S.age<18)return '';
  const list=companyListFor(S.country)||[],degree=S.degree,trackMap={law:'law',business:'finance',cs:'tech',medicine:'medical',biology:'bio'};
  const match=p=>!!degree&&((p.p15DegreeMajor===degree)||(p.degree===degree)||(p.degrees||[]).includes(degree)||(p.trackId===trackMap[degree]));
  const sorted=list.slice().sort((a,b)=>Number(match(b))-Number(match(a)));
  const levelFor=p=>Math.max(0,Math.min(4,(S.careerRecords||{})[p.trackId]?.level||0));
  const card=p=>{
    const level=levelFor(p),title=p12RoleTitle(p,level),pay=jobSalaryForPost(p,level,S.country,gameYear());
    const req=p12Eligibility(p),degList=p.degrees&&p.degrees.length?p.degrees:p.degree?[p.degree]:[];
    const ed=degList.length?degList.map(x=>MAJORS[x]?.name||x).join(' / '):'Degree may not be required';
    const sponsor=S.country!==S.home?(p.sponsorship?'<span class="badge badge-mint">May sponsor</span>':'<span class="badge badge-amber">No sponsorship</span>'):'';
    return `<details class="p17-posting"><summary><b>${p.name}</b> · ${title} ${sponsor}</summary>${PR(p.desc||'Role duties depend on the employer and department.')}${ROW('Estimated annual gross pay',money(pay))}${ROW('Relevant degree',ed)}${ROW('Experience',`${p.minExp||0} year(s) minimum`)}${ROW('Hours / contract',`${p.hours||40} hours/week · ${p.contract||'Terms vary'}`)}${ROW('Benefits',benefitsSummary({medical:p.medical,social:p.social,bonus:p.bonus,leave:p.leave,remote:p.remote,hours:p.hours,contract:p.contract}))}${S.country!==S.home?ROW('Work sponsorship',p.sponsorship?'Employer may sponsor; immigration approval is separate':'This employer does not sponsor this vacancy'):''}${req?PR(`Not currently available: ${req}`):''}<button class="btn" onclick="applyCompany('${p.id}')" ${req?'disabled':''}>${req?'Requirements not met':`Apply · ${title}`}</button></details>`;
  };
  const relevant=sorted.filter(match),other=sorted.filter(p=>!match(p));
  const recommend=(relevant.length?relevant:sorted.filter(p=>!p.degree&&!p.degrees)).slice(0,8);
  const shown=new Set(recommend.map(p=>p.id));
  return SEC(`Job search · ${C().n}`,PR(`Job postings are generated for your current country. ${degree?`Your ${MAJORS[degree]?.name||degree} degree places related options first, including entry-level and adjacent roles.`:'You can still pursue general entry-level roles, while many specialist vacancies require a degree.'} Applications may be rejected, and salaries / perks differ by employer.`)+`<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:10px 0"><div class="card" style="padding:10px"><span class="muted" style="font-size:.72rem">APPLICATIONS</span><b style="display:block">${S.jobAppsAge===S.age?Math.max(0,4-(S.jobAppsCount||0)):4} left</b></div><div class="card" style="padding:10px"><span class="muted" style="font-size:.72rem">EXPERIENCE</span><b style="display:block">${allExperience()} yr</b></div><div class="card" style="padding:10px"><span class="muted" style="font-size:.72rem">STATUS</span><b style="display:block;font-size:.78rem">${S.job?'Employed':'Searching'}</b></div></div>${recommend.length?`<h4 style="margin:12px 0 4px;color:var(--cyan)">Recommended for your degree / background</h4>${recommend.map(card).join('')}`:PR('No matching vacancies this year; check the general openings below.')}${other.length?`<details style="margin-top:12px"><summary>Other openings (${other.length})</summary>${other.map(card).join('')}</details>`:''}`);
}
const P17_viewCareerBeforeBoard = viewCareer;
viewCareer = function() {
  let html=P17_viewCareerBeforeBoard();
  html=html.replace(/<section class="card"><h3>Your current job<\/h3>[\s\S]*?(?=<section class="card">|$)/, p17CurrentJobCard());
  html=html.replace(/<section class="card"><h3>Local job postings · [^<]*<\/h3>[\s\S]*?(?=<section class="card">|$)/, p17CareerSearchBoard());
  return html;
};

/* Preserve exactly one main job across changes of employer, remote contracts and migration. */
const P17_moveAbroadBeforeSingleJob = moveAbroad;
moveAbroad = function(dest,fund,cover) {
  if(S&&S.job) recordCareer({...S.job},true);
  if(S){S.remote=null;S.remoteJob=null;S.pendingJobOffer=null;}
  P17_moveAbroadBeforeSingleJob(dest,fund,cover);
  if(S){S.remote=null;S.remoteJob=null;S.job=null;}
};
const P17_leaveAbroadBeforeSingleJob = leaveAbroad;
leaveAbroad = function(msg) {
  if(S){S.remote=null;S.remoteJob=null;S.asylumCase=null;S.asylumDecisionPending=null;S.undocumented=false;S.undocumentedWork=null;}
  P17_leaveAbroadBeforeSingleJob(msg);
  if(S){S.remote=null;S.remoteJob=null;S.job=null;}
};
const P17_applyCompanyBeforeSingleJob = applyCompany;
applyCompany = function(id) {
  const result=P17_applyCompanyBeforeSingleJob(id);
  if(S&&S.job){S.remote=null;S.remoteJob=null;}
  return result;
};

/* The original start screen / HUD and old saves may still hold the exchange outlook panel or note. Hide it in rendered output only. */
const P17_renderBeforeUiCleanup = render;
render = function() {
  if(S){
    if(S.job && (S.remote || S.remoteJob)){S.remote=null;S.remoteJob=null;}
    if(S.job && S.job.isRemoteUSD){S.remote=null;S.remoteJob=null;}
    if(S.undocumentedWork){S.job=null;S.remote=null;S.remoteJob=null;}
    if(S.yearPopup&&S.yearPopup.note)S.yearPopup.note=S.yearPopup.note.replace(/\n\nUSD\/EGP context:[\s\S]*/,'');
  }
  const r=P17_renderBeforeUiCleanup();
  const fxPanel=$('p14-fx-panel');if(fxPanel)fxPanel.remove();
  const startDesc=$('country-desc');if(startDesc&&startDesc.textContent)startDesc.textContent=startDesc.textContent.replace(/The US Dollar rose from 5\.5 EGP in 2007 to over 50 EGP today\. Holding USD protects wealth\./g,'Imported goods can be expensive relative to local salaries.');
  return r;
};


