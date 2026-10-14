/* ================= PHASE 18 — CAREER WIDTH, COUNTRY TRAVEL & FAMILY LANGUAGE =================
   Makes all degree pathways discoverable, keeps country/year vacancies stable, expands
   the travel planner, uses relationship labels for money requests, and tightens status rules.
*/

/* One stable job market per country and game year, including all specialist pathways.
   The player's own degree / postgraduate specialisation sorts first; other career
   directions remain discoverable with their real qualification requirements. */
const P18_companyListBeforeAllMajors = (typeof P15_companyListBeforeMajorMerge === 'function') ? P15_companyListBeforeMajorMerge : companyListFor;
companyListFor = function(country = S ? S.country : 'usa') {
  if (!S) return P18_companyListBeforeAllMajors(country);
  p12InitState(S);
  const year = gameYear();
  const cacheKey = `p18-all-major-${country}-${year}`;
  if (Array.isArray(S.jobBoards?.[cacheKey])) return S.jobBoards[cacheKey];
  let base = [];
  try { base = P18_companyListBeforeAllMajors(country) || []; } catch (_) { base = []; }
  const merged = Array.isArray(base) ? base.slice() : [];
  const seen = new Set(merged.map(p => p.id));
  for (const major of Object.keys(P15_DEGREE_JOBS || {})) {
    const posts = p15DegreePosts(country, major) || [];
    for (const post of posts) {
      if (!seen.has(post.id)) { merged.push(post); seen.add(post.id); }
    }
  }
  const trackFor = {law:'law',business:'finance',cs:'tech',medicine:'medical',biology:'bio'};
  const degree = S.degree;
  const masterMap = {finance:'business',accounting:'business',mba:'business',analytics:'business',data:'cs',computer:'cs',law:'law',health:'biology',biology:'biology'};
  const master = masterMap[String(S.masterField || '').toLowerCase()] || null;
  const score = p => {
    if (degree && p.p15DegreeMajor === degree) return 120;
    if (degree && ((p.degree === degree) || (p.degrees || []).includes(degree))) return 110;
    if (degree && p15RoleTrackRelevant(p, degree)) return 100;
    if (master && p.p15DegreeMajor === master) return 80;
    if (master && ((p.degree === master) || (p.degrees || []).includes(master))) return 70;
    if (!p.degree && !(p.degrees || []).length && !p.p15DegreeMajor) return 30;
    return 10;
  };
  merged.sort((a,b) => score(b) - score(a));
  S.jobBoards[`${country}-${year}`] = merged;
  S.jobBoards[cacheKey] = merged;
  return merged;
};

/* Family-help cards use relationship first — e.g. “Your mother (Mariam)” —
   while normal family profiles continue to show each person's name normally. */
const P18_familyRequestsBeforeRelationshipLabels = p12FamilyRequests;
p12FamilyRequests = function() {
  let html = P18_familyRequestsBeforeRelationshipLabels();
  for (const m of (S && S.family) || []) {
    if (!m || !m.name || typeof p17Relation !== 'function') continue;
    const safeName = String(m.name);
    const rel = p17Relation(m, true);
    html = html.replaceAll(`${safeName} asked for help with`, `${rel} asked for help with`);
    html = html.replaceAll(`${safeName} needs help with`, `${rel} needs help with`);
    html = html.replaceAll(`${safeName} needs help`, `${rel} needs help`);
    html = html.replaceAll(`${safeName}’s request`, `${rel}’s request`);
    html = html.replaceAll(`${safeName}'s request`, `${rel}'s request`);
  }
  return html;
};

function p18RelabelNewestLog(m, patterns) {
  if (!S || !m || !m.name || !Array.isArray(S.logRows) || !S.logRows.length) return;
  const row = S.logRows[0];
  if (!row || typeof row.t !== 'string') return;
  for (const prefix of patterns || []) row.t = row.t.replace(prefix, p17Relation(m, true));
}
const P18_answerParentBeforeRelationshipLog = p12AnswerParentNeed;
p12AnswerParentNeed = function(yes) {
  const id = S && S.parentNeed && S.parentNeed.id;
  const m = id && S.family.find(x => x.id === id);
  P18_answerParentBeforeRelationshipLog(yes);
  p18RelabelNewestLog(m, [m?.name ? `${m.name} asked` : '', m?.name ? `help ${m.name}` : '', m?.name ? `${m.name}` : ''].filter(Boolean));
};
const P18_answerSpecificBeforeRelationshipLog = p12RespondSpecific;
p12RespondSpecific = function(yes) {
  const id = S && S.familyNeed && S.familyNeed.id;
  const m = id && S.family.find(x => x.id === id);
  P18_answerSpecificBeforeRelationshipLog(yes);
  p18RelabelNewestLog(m, [m?.name ? `${m.name}` : ''].filter(Boolean));
};

/* Add many city-level holiday destinations across the countries that can be played.
   Prices stay estimates and are calculated in the selected destination's currency. */
const P18_CITY_DESTINATIONS = [
  ['trip-manchester','Manchester','gbr'],['trip-edinburgh','Edinburgh','gbr'],
  ['trip-nice','Nice / French Riviera','fra'],['trip-berlin','Berlin','deu'],['trip-munich','Munich','deu'],
  ['trip-rome','Rome','ita'],['trip-milan','Milan','ita'],['trip-amsterdam','Amsterdam','nld'],
  ['trip-new-york','New York','usa'],['trip-los-angeles','Los Angeles','usa'],['trip-chicago','Chicago','usa'],
  ['trip-vancouver','Vancouver','can'],['trip-montreal','Montreal','can'],
  ['trip-dubai-city','Dubai','uae'],['trip-abu-dhabi','Abu Dhabi','uae'],
  ['trip-riyadh','Riyadh','sau'],['trip-jeddah','Jeddah','sau'],
  ['trip-sydney','Sydney','aus'],['trip-melbourne','Melbourne','aus'],
  ['trip-auckland','Auckland','nzl'],['trip-queenstown','Queenstown','nzl'],
  ['trip-istanbul-city','Istanbul','tur'],['trip-cappadocia','Cappadocia','tur'],
  ['trip-mumbai','Mumbai','ind'],['trip-delhi','Delhi','ind'],['trip-lahore','Lahore','pak'],
  ['trip-lagos','Lagos','nga'],['trip-sao-paulo','São Paulo','bra'],
  ['trip-tokyo','Tokyo','jpn'],['trip-osaka','Osaka','jpn'],
  ['trip-seoul','Seoul','kor'],['trip-busan','Busan','kor'],['trip-singapore','Singapore','sgp']
];
const P18_destinationOptionsBeforeCityExpansion = p12DestinationOptions;
p12DestinationOptions = function() {
  const arr = P18_destinationOptionsBeforeCityExpansion();
  const seen = new Set(arr.map(d => d.id));
  for (const [id,name,country] of P18_CITY_DESTINATIONS) {
    if (!seen.has(id) && COUNTRIES[country]) arr.push({id,name,country,local:country === S.country,cityDestination:true});
  }
  if (!seen.has('trip-custom')) arr.push({id:'trip-custom',name:'Custom city / country…',country:S.country,local:true,custom:true});
  return arr;
};

function p18MoneyDefaultFood(country) {
  const local = {egy:650,ind:900,nga:18000,pak:1200,bra:85,tur:500,usa:45,gbr:35,can:45,deu:32,fra:35,ita:30,nld:35,uae:50,sau:45,aus:55,nzl:50,jpn:4200,kor:38000,sgp:45};
  return local[country] || (country === 'egy' ? 650 : 30);
}
function p18MoneyDefaultTransport(country) {
  const local = {egy:220,ind:250,nga:3500,pak:350,bra:25,tur:180,usa:22,gbr:18,can:25,deu:15,fra:18,ita:15,nld:18,uae:25,sau:22,aus:28,nzl:25,jpn:2400,kor:22000,sgp:18};
  return local[country] || (country === 'egy' ? 220 : 18);
}
function p18DestinationCountry() {
  const sel = $('p12-trip-dest');
  if (sel && sel.value === 'trip-custom') return $('p18-trip-country')?.value || S.country;
  return p12DestinationOptions().find(d => d.id === (sel?.value || ''))?.country || S.country;
}
function p18TripDestinationChanged() {
  const country = p18DestinationCountry();
  const food = $('p12-trip-spend'), transport = $('p18-trip-local-transport');
  if (food && food.dataset.userEdited !== '1') food.value = p18MoneyDefaultFood(country);
  if (transport && transport.dataset.userEdited !== '1') transport.value = p18MoneyDefaultTransport(country);
  p12RefreshTripQuote();
}

const P18_renderTravelBeforeCustomDestination = p12RenderTravel;
p12RenderTravel = function() {
  let html = P18_renderTravelBeforeCustomDestination();
  html = html.replace('id="p12-trip-dest" onchange="p12RefreshTripQuote()"','id="p12-trip-dest" onchange="p18TripDestinationChanged()"');
  html = html.replace('id="p12-trip-spend" type="number" min="0" value="1500" oninput="p12RefreshTripQuote()"','id="p12-trip-spend" type="number" min="0" value="650" oninput="this.dataset.userEdited=\'1\';p12RefreshTripQuote()"');
  const countryOptions = Object.entries(COUNTRIES).map(([k,c]) => `<option value="${k}" ${k===S.country?'selected':''}>${c.n} (${c.cur})</option>`).join('');
  const customFields = `<details style="margin-top:10px"><summary>Custom destination — choose any supported country and type a city</summary><label class="muted" for="p18-trip-city">City / destination name</label><input id="p18-trip-city" type="text" maxlength="70" placeholder="e.g. Valencia, Madrid, Kyoto" value="" style="width:100%;margin:5px 0 10px"><label class="muted" for="p18-trip-country">Destination country</label><select id="p18-trip-country" onchange="p18TripDestinationChanged()" style="width:100%;margin:5px 0 8px">${countryOptions}</select><p class="muted">Custom routes use the country-pair fare estimate and your chosen city name; they are not live fares.</p></details>`;
  html = html.replace('<div id="p12-trip-estimate"', `${customFields}<div><label class="muted" for="p18-trip-local-transport">Daily local transport budget (destination currency)</label><input id="p18-trip-local-transport" type="number" min="0" value="${p18MoneyDefaultTransport((p12DestinationOptions()[0]||{}).country||S.country)}" oninput="this.dataset.userEdited='1';p12RefreshTripQuote()" style="width:100%"></div><div id="p12-trip-estimate"`);
  html = html.replace('id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()"','id="p17-trip-gifts" type="number" min="0" value="0" oninput="p12RefreshTripQuote()"');
  html = html.replace('<div id="p12-trip-estimate"', '<div><label class="muted" for="p18-trip-gift-details">Gift details (optional)</label><input id="p18-trip-gift-details" type="text" maxlength="70" placeholder="e.g. groceries for my parents" style="width:100%"></div><div id="p12-trip-estimate"');
  return html;
};

/* Reprice the trip against the actual chosen city/country, and include local transport.
   The custom-city branch calculates the route again; it does not reuse the placeholder country fare. */
const P18_tripQuoteBeforeCustomAndTransport = p12TripQuote;
p12TripQuote = function() {
  const destSel = $('p12-trip-dest');
  const selectedId = destSel?.value;
  const originalValue = selectedId;
  const customCountry = selectedId === 'trip-custom' ? ($('p18-trip-country')?.value || S.country) : null;
  const selectedStay = $('p17-trip-stay')?.value || 'hotel';
  let temporarilyUseHome = false;
  if (selectedId === 'trip-custom' && customCountry === (S.home || S.country) && ['parents','sibling'].includes(selectedStay)) {
    if (destSel) destSel.value = 'trip-home';
    temporarilyUseHome = true;
  }
  const q = P18_tripQuoteBeforeCustomAndTransport();
  if (temporarilyUseHome && destSel) destSel.value = originalValue;
  if (!q) return q;
  if (selectedId === 'trip-custom') {
    const target = customCountry || S.country;
    const typed = String($('p18-trip-city')?.value || '').replace(/[<>"`]/g,'').trim();
    q.d = {id:'trip-custom',name:typed || `Custom city in ${(COUNTRIES[target]||COUNTRIES.usa).n}`,country:target,local:target===S.country,custom:true};
    q.international = S.country !== target;
    q.classKey = $('p12-trip-class')?.value || 'economy';
    const era = typeof prOf === 'function' ? prOf(gameYear(),S) : 1;
    q.airfare = q.international ? flightFareUsd(S.country,target) * p12FlightClassFactor(q.classKey) * q.people * era : 0;
    if (q.international) q.transport = 0;
    const hotelKey = $('p12-trip-hotel')?.value || 'comfort';
    let hotelBase = p12HotelInternal(q.d,hotelKey,1,gameYear()) * q.nights * q.rooms;
    const stay = selectedStay;
    if (stay === 'airbnb') hotelBase = Math.round(hotelBase * .78);
    else if (stay === 'motel') hotelBase = Math.round(hotelBase * .48);
    else if (['parents','sibling','friend'].includes(stay) && (stay === 'friend' || target === (S.home || S.country))) hotelBase = 0;
    const customNight = Math.max(0,Number($('p17-trip-night')?.value)||0);
    if (customNight > 0) hotelBase = p12LocalCurrencyInternal(customNight*q.nights*q.rooms,target,gameYear());
    q.hotel = hotelBase;
    const spendLocal = Math.max(0,Number($('p12-trip-spend')?.value)||0);
    q.spendLocal = spendLocal;
    q.spend = p12LocalCurrencyInternal(spendLocal*q.days*q.people,target,gameYear());
    const activity = $('p12-trip-activity')?.value || 'normal';
    q.activities = ({budget:0,normal:30,luxury:125}[activity]||30) * q.people * q.days * ((COUNTRIES[target]||COUNTRIES.usa).p||1) * era;
    q.shoppingLocal = Math.max(0,Number($('p17-trip-shopping')?.value)||0);
    q.shopping = p12LocalCurrencyInternal(q.shoppingLocal*q.days*q.people,target,gameYear());
    q.giftLocal = Math.max(0,Number($('p17-trip-gifts')?.value)||0);
    q.gifts = q.giftType === 'none' ? 0 : p12LocalCurrencyInternal(q.giftLocal,target,gameYear());
    q.stayType = stay;
    q.lodgingLabel = ({hotel:`${hotelKey} hotel`,airbnb:'Airbnb / serviced apartment',motel:'Motel / hostel / budget guesthouse',parents:'parents’ home',sibling:'brother’s / sister’s home',friend:'friend’s home / host stay'})[stay] || 'hotel';
  }
  const transportLocal = Math.max(0,Number($('p18-trip-local-transport')?.value)||0);
  q.destinationTransportLocal = transportLocal;
  q.destinationTransport = p12LocalCurrencyInternal(transportLocal*q.days*q.people,q.d.country,gameYear());
  q.giftDetails = String($('p18-trip-gift-details')?.value||'').replace(/[<>"`]/g,'').trim();
  if (q.giftType === 'custom' && q.giftDetails) q.giftLabel = q.giftDetails;
  q.total = q.airfare + q.transport + q.hotel + q.spend + q.activities + (q.shopping||0) + (q.gifts||0) + q.destinationTransport;
  return q;
};

function p18RefreshTripQuote() {
  const q = p12TripQuote(), el = $('p12-trip-estimate');
  if (!q || !el) return;
  const currency = COUNTRIES[q.d.country]?.cur || C().cur;
  el.innerHTML = `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><b>Estimated trip budget</b><strong style="font-size:1.15rem;color:var(--mint)">${money(q.total)}</strong></div>${ROW(q.international?'Return airfare · '+q.classKey:'Intercity / local transport',money(q.airfare||q.transport))}${ROW('Transport while there',money(q.destinationTransport||0))}${ROW(`Accommodation · ${q.lodgingLabel||'hotel'} · ${q.nights} night(s)`,money(q.hotel))}${ROW('Food / meals',money(q.spend))}${ROW('Shopping / clothes',money(q.shopping||0))}${ROW('Activities / excursions',money(q.activities))}${ROW(q.gifts?`Gift · ${q.giftLabel} for ${q.giftRecipient}`:'Gift budget',money(q.gifts||0))}${ROW('Trip length',`${q.days} day(s) · ${q.people} traveller(s)`)}${ROW('Annual leave requested',`${q.leaveDays} day(s)`)}${PR(`Food, local transport and gifts are in ${currency}. Lodging and airfare are estimates, not live bookable fares. The employer can refuse your leave, and travelling without valid status can create re-entry problems.`)}`;
}
p12RefreshTripQuote = p18RefreshTripQuote;

/* Correct the leave-approval probability's benefits bonus, then block a pretend return trip
   that would let an undocumented resident exit and re-enter as if nothing happened. */
const P18_bookTripBeforeReentryCheck = p12BookTrip;
p12BookTrip = function(purpose='holiday') {
  const q = p12TripQuote();
  if (S && S.undocumented && q && q.d && q.d.id === 'trip-home') {
    return hint('A home visit is not a round trip you can safely assume you can re-enter from. Choose voluntary return home, or remain in-country and plan a local trip instead.');
  }
  const before = S && S.tripHistory ? S.tripHistory.length : 0;
  P18_bookTripBeforeReentryCheck(purpose);
  if (S && S.tripHistory && S.tripHistory.length > before && q) {
    const record = S.tripHistory[0];
    record.destinationTransport = q.destinationTransport || 0;
    record.customCity = q.d && q.d.id === 'trip-custom' ? q.d.name : null;
    record.giftDetails = q.giftDetails || '';
    if (S.logRows && S.logRows[0] && typeof S.logRows[0].t === 'string' && (q.destinationTransport||0)>0) {
      S.logRows[0].t = S.logRows[0].t.replace(/\. Total /, `; destination transport ${money(q.destinationTransport)}. Total `);
    }
    if (S.logRows && S.logRows[0] && q.giftDetails && S.logRows[0].t.includes('you brought')) {
      S.logRows[0].t = S.logRows[0].t.replace('you brought ', `you brought ${q.giftDetails} `);
    }
    save();
  }
};

/* Broaden informal fallback work in the host country; it remains explicitly precarious and
   does not create visa rights. The existing annual income simulation applies to these options. */
Object.assign(P14_informalJobs, {
  cafe:{name:'Cafe / restaurant kitchen shifts',base:12500,stress:4,desc:'Low-paid kitchen prep, dishwashing or clearing tables, often with short notice and inconsistent shifts.'},
  hotel:{name:'Hotel housekeeping / laundry',base:13800,stress:4,desc:'Physically tiring cleaning and room-turnover work with little bargaining power and no guaranteed hours.'},
  warehouse:{name:'Warehouse picker / packer',base:16000,stress:5,desc:'Shift work with physical demands, possible unpaid waiting time and no reliable formal protection.'},
  seasonal:{name:'Seasonal farm / packing work',base:11200,stress:5,desc:'Seasonal work may disappear between harvests; accommodation or transport deductions can reduce take-home pay.'},
  delivery:{name:'Cash-paid delivery / errands',base:13200,stress:5,desc:'Unstable cash work with transport costs, accident risk and no normal employee benefits.'}
});

/* Show needs-goal priorities on the Life screen too, rather than hiding all needs under Activities. */
const P18_viewLifeBeforeGoalReminder = viewLife;
viewLife = function() {
  let html = P18_viewLifeBeforeGoalReminder();
  const active = (S && Array.isArray(S.p17Goals) ? S.p17Goals : []).filter(g => !g.done);
  if (active.length) {
    const top = active.slice(0,3).map(g => ROW(g.label,`${Math.min(100,Math.round((g.savedInternal||0)/Math.max(1,g.targetInternal)*100))}% funded · ${money(Math.max(0,g.targetInternal-(g.savedInternal||0)))} to go`)).join('');
    html += SEC('Your current priorities',PR('Important needs compete with rent, family support and daily costs. Save gradually and decide which goal matters most first.')+top+B('Manage needs & savings goals','Phones, clothing, courses, family visits, medical costs, rent deposits and home deposits.','go(\'act\')'));
  }
  return html;
};

/* Final UI clean-up: the historic rate table stays in JavaScript but the game UI never explains
   the pound's history / outlook unprompted. The actual local currency still displays on prices. */
const P18_viewWorldBeforeRateNarrativeCleanup = viewWorld;
viewWorld = function() {
  let html = P18_viewWorldBeforeRateNarrativeCleanup();
  html = html.replace(/<section class="card"[^>]*>[\s\S]*?<h3[^>]*>[^<]*(?:Egyptian pound|USD\s*\/\s*EGP|exchange-rate)[^<]*(?:history|outlook|forecast)[^<]*<\/h3>[\s\S]*?<\/section>/gi,'');
  html = html.replace(/The US Dollar rose from 5\.5 EGP in 2007 to over 50 EGP today\. Holding USD protects wealth\./g,'Imported goods can be expensive relative to local salaries.');
  return html;
};
const P18_renderBeforeVisibleRateCleanup = render;
render = function() {
  if (S && S.job && (S.remote || S.remoteJob)) { S.remote = null; S.remoteJob = null; }
  const out = P18_renderBeforeVisibleRateCleanup();
  const panel = $('p14-fx-panel'); if (panel) panel.remove();
  if (S && S.yearPopup && typeof S.yearPopup.note === 'string') {
    S.yearPopup.note = S.yearPopup.note.replace(/\n\nUSD\/EGP context:[\s\S]*/,'');
    S.yearPopup.note = S.yearPopup.note.replace(/Egyptian pound history and outlook[\s\S]*/i,'');
  }
  return out;
};


