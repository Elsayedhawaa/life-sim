/* =====================================================================
   PHASE 22 — COMPLETE UI OVERHAUL, FIXES & LIFE SIMULATION POLISH
   ===================================================================== */

/* ---------------------------------------------------------------------
   1. RANDOM FAMILY WEALTH & FIX SCHOOL DROPOUT GATING
   --------------------------------------------------------------------- */
const P22_newGameBefore = typeof newGame === 'function' ? newGame : function(){};
newGame = function(...args) {
  P22_newGameBefore(...args);
  if (S) {
    const r = Math.random();
    S.famWealth = r < 0.2 ? 0 : r < 0.8 ? 1 : 2; // 20% Low, 60% Mid, 20% High
    S.droppedOut = false;
    S.ged = false;
  }
};

/* Prevent involuntary GED redirects or dropouts during high school */
if (typeof checkSchoolState === 'function') {
  const P22_checkSchoolBefore = checkSchoolState;
  checkSchoolState = function() {
    if (S && S.age >= 14 && S.age <= 18 && !S.droppedOutByChoice) {
      S.droppedOut = false;
    }
    return P22_checkSchoolBefore();
  };
}

/* ---------------------------------------------------------------------
   2. FIX PART-TIME JOBS (INCOME PAYOUT, COLLEGE AGE, VARIETY)
   --------------------------------------------------------------------- */
const P22_TEEN_JOBS = [
  { id: 'barista', title: 'Barista / Café Shift', basePay: 700, minSmarts: 15, desc: 'Espresso prep and counter service; physically active.' },
  { id: 'cashier', title: 'Retail Cashier / Sales Assistant', basePay: 650, minSmarts: 10, desc: 'Handling checkouts, stocking shelves, and assisting customers.' },
  { id: 'delivery', title: 'Delivery Rider / Driver', basePay: 800, minSmarts: 10, desc: 'Local order deliveries; flexible shifts with transport costs.' },
  { id: 'tutor', title: 'Private Tutor', basePay: 950, minSmarts: 40, desc: 'Helping younger students with academic subjects.' },
  { id: 'library', title: 'Campus / Community Library Assistant', basePay: 600, minSmarts: 25, desc: 'Sorting books, cataloguing, and assisting visitors.' },
  { id: 'freelance', title: 'Freelance Content / Design Helper', basePay: 1100, minSmarts: 50, desc: 'Remote tasks; requires good digital skills and portfolio.' },
  { id: 'valet', title: 'Event Valet / Venue Host', basePay: 750, minSmarts: 15, desc: 'Event hospitality, greeting guests, and parking support.' }
];

p20ApplyTeenJob = function(id, pay) {
  if (!S) return;
  if (S.age < 14 || S.age > 25) return hint('Part-time work is available between ages 14 and 25.');
  if (S.p20TeenJob) return hint('Leave your current part-time job before accepting a new one.');
  
  const job = P22_TEEN_JOBS.find(j => j.id === id);
  if (!job) return;
  if (S.smarts < job.minSmarts) return hint(`Requires at least ${job.minSmarts}% Smarts.`);

  const actualPay = typeof p20LocalCost === 'function' ? p20LocalCost(job.basePay) : job.basePay;
  S.p20TeenJob = { id: job.id, title: job.title, pay: actualPay };
  log(`Started part-time work as ${job.title} (${money(actualPay)}/yr estimated).`);
  if (typeof realismNotice === 'function') {
    realismNotice('Part-time Job Accepted', `You took a job as ${job.title}. Annual earnings are estimated around ${money(actualPay)}.`);
  }
  render();
};

/* Ensure income is reliably added on age-up */
const P22_ageUpForTeenPay = ageUp;
ageUp = function() {
  const ageBefore = S ? S.age : 0;
  P22_ageUpForTeenPay();
  if (S && S.p20TeenJob && ageBefore >= 14 && ageBefore <= 25) {
    const base = Number(S.p20TeenJob.pay) || 500;
    const earned = Math.round(base * (0.85 + Math.random() * 0.3)); // Realistic variation
    S.wealth = (S.wealth || 0) + earned;
    S.income = (S.income || 0) + earned;
    log(`Part-time earnings: Made ${money(earned)} as ${S.p20TeenJob.title}.`);
    if (S.age > 25) {
      log(`Your student/part-time job as ${S.p20TeenJob.title} ended as you reached age 26.`);
      S.p20TeenJob = null;
    }
    render();
  }
};

/* ---------------------------------------------------------------------
   3. RELATIONSHIP LABELS & UNIFIED FAMILY TRANSFER HUB
   --------------------------------------------------------------------- */
p17Relation = function(m, capital = false) {
  if (!m) return capital ? 'Your family member' : 'your family member';
  const name = String(m.name || '').replace(/[<>]/g, '').trim();
  let roleLabel = 'family member';
  if (m.role === 'Mother') roleLabel = 'Mother';
  else if (m.role === 'Father') roleLabel = 'Father';
  else if (m.role === 'Sibling') roleLabel = m.g === 'f' ? 'Sister' : 'Brother';
  else if (m.role === 'Partner') roleLabel = 'Partner';
  else if (m.role === 'Spouse') roleLabel = 'Spouse';
  else if (m.role === 'Child') roleLabel = 'Child';
  else if (m.role === 'Friend') roleLabel = 'Friend';
  
  const result = name ? `Your ${roleLabel} (${name})` : `Your ${roleLabel.toLowerCase()}`;
  return capital ? result : result.toLowerCase();
};

/* Unified Transfer Hub View Component */
function p22RenderFamilyTransferHub() {
  if (!S || !Array.isArray(S.family) || !S.family.length) return '';
  const members = S.family.filter(m => m && m.alive !== false);
  if (!members.length) return '';

  const options = members.map(m => `<option value="${m.id}">${p17Relation(m, true)}</option>`).join('');

  return `
    <section class="card" style="border-color:var(--violet)">
      <h3>Family Support & Money Transfer</h3>
      <p class="muted">Send financial assistance or set up a regular allowance for family members.</p>
      
      <div class="row">
        <label for="p22-transfer-target">Recipient</label>
        <select id="p22-transfer-target" style="width:60%">${options}</select>
      </div>
      
      <div class="row">
        <label for="p22-transfer-type">Transfer Type</label>
        <select id="p22-transfer-type" style="width:60%">
          <option value="once">One-Time Gift / Assistance</option>
          <option value="allowance">Recurring Annual Allowance</option>
        </select>
      </div>

      <div class="row">
        <label for="p22-transfer-amount">Amount (${C().cur})</label>
        <input id="p22-transfer-amount" type="number" min="1" placeholder="e.g. 500" style="width:140px">
      </div>

      <button class="btn btn-primary" onclick="p22ExecuteFamilyTransfer()">Send Support</button>
    </section>
  `;
}

p22ExecuteFamilyTransfer = function() {
  const targetId = $('p22-transfer-target')?.value;
  const type = $('p22-transfer-type')?.value;
  const val = Number($('p22-transfer-amount')?.value);

  const m = S.family.find(x => x.id === targetId);
  if (!m) return hint('Select a valid family member.');
  if (!Number.isFinite(val) || val <= 0) return hint('Enter an amount greater than zero.');

  const internalAmt = p12LocalCurrencyInternal(val, S.country, gameYear());

  if (type === 'once') {
    if (S.wealth < internalAmt) return hint('You do not have enough cash for this transfer.');
    S.wealth -= internalAmt;
    m.bond = clamp((m.bond || 0) + (internalAmt > 500 ? 6 : 3));
    fx({ happiness: 2, social: 2 });
    
    log(`Sent ${money(internalAmt)} to ${p17Relation(m, true)}.`);
    realismNotice('Transfer Received', `${p17Relation(m, true)} sent a text: "Thank you so much! This makes a huge difference for our household this month."`);
  } else {
    m.allowLocal = val;
    m.allowCurrency = S.country;
    m.allow = internalAmt;
    m.bond = clamp((m.bond || 0) + 4);
    log(`Set ${p17Relation(m, true)}'s recurring allowance to ${money(internalAmt)}/year.`);
    realismNotice('Allowance Updated', `${p17Relation(m, true)} expressed deep gratitude for your commitment to regular support.`);
  }
  render();
};

/* Override Family tab view to integrate the unified transfer hub */
const P22_viewFamilyBefore = viewFamily;
viewFamily = function() {
  let html = P22_viewFamilyBefore();
  // Remove cluttered repeated transfer boxes
  html = html.replace(/<section class="card"><h3>Money for [^<]+<\/h3>[\s\S]*?<\/section>/gi, '');
  return html + p22RenderFamilyTransferHub();
};

/* ---------------------------------------------------------------------
   4. SIMPLIFY WORLD TAB & COUNTRY CARDS
   --------------------------------------------------------------------- */
const P22_viewWorldBefore = viewWorld;
viewWorld = function() {
  let html = P22_viewWorldBefore();

  // Strip unnecessary economic clutter (mortgage rates, stock market, credit score)
  html = html.replace(/Mortgage rate[\s\S]*?<\/div>/gi, '');
  html = html.replace(/Stock market last year[\s\S]*?<\/div>/gi, '');
  html = html.replace(/Credit score[\s\S]*?<\/div>/gi, '');
  html = html.replace(/Prices vs\. 2007[\s\S]*?<\/div>/gi, '');

  // Remove duplicate job vacancy sections inside World tab
  html = html.replace(/<section class="card"><h3>Jobs in [^<]+<\/h3>[\s\S]*?<\/section>/gi, '');

  return html;
};

/* ---------------------------------------------------------------------
   5. CAREER TAB OVERHAUL (FILTERING, BENEFIT BADGES & INFORMAL WORK)
   --------------------------------------------------------------------- */
p17CareerSearchBoard = function() {
  if (!S || S.age < 18) return '';
  
  const list = companyListFor(S.country) || [];
  const filter = S.p22JobFilter || 'all'; // 'all', 'sponsored', 'nosponsor'

  const filtered = list.filter(p => {
    if (filter === 'sponsored') return p.sponsorship === true;
    if (filter === 'nosponsor') return !p.sponsorship;
    return true;
  });

  const filterBar = `
    <div class="acts" style="margin-bottom:12px">
      <button class="btn ${filter === 'all' ? 'sel' : ''}" onclick="S.p22JobFilter='all';render()">All Openings</button>
      <button class="btn ${filter === 'sponsored' ? 'sel' : ''}" onclick="S.p22JobFilter='sponsored';render()">Visa Sponsored Only</button>
      <button class="btn ${filter === 'nosponsor' ? 'sel' : ''}" onclick="S.p22JobFilter='nosponsor';render()">Local / Direct Only</button>
    </div>
  `;

  const cards = filtered.map(p => {
    const level = Math.max(0, Math.min(4, (S.careerRecords || {})[p.trackId]?.level || 0));
    const title = p12RoleTitle(p, level);
    const pay = jobSalaryForPost(p, level, S.country, gameYear());
    const req = p12Eligibility(p);

    const sponsorBadge = S.country !== S.home 
      ? (p.sponsorship ? '<span class="badge badge-mint">MAY SPONSOR VISA</span>' : '<span class="badge badge-amber">NO SPONSORSHIP</span>')
      : '';

    return `
      <details class="p17-posting" style="border:1px solid var(--line);border-radius:10px;padding:10px;margin-bottom:8px">
        <summary>
          <strong style="color:var(--text);font-size:1rem">${p.name}</strong> · ${title} ${sponsorBadge}
        </summary>
        <div style="margin-top:8px">
          ${PR(p.desc || 'Standard employment role.')}
          ${ROW('Annual Salary', `<strong style="color:var(--mint)">${money(pay)}</strong>`)}
          ${ROW('Healthcare Cover', p.medical ? 'Medical Insurance Included' : 'No Employer Cover')}
          ${ROW('Paid Annual Leave', `${p.leave || 14} days/year`)}
          ${ROW('Work Arrangement', `${p.remote \vert{}\vert{} 'On-site'} (${p.hours || 40}h/week)`)}
          ${req ? PR(`Not available: ${req}`) : ''}
          <button class="btn btn-primary" onclick="applyCompany('${p.id}')" ${req ? 'disabled' : ''}>
            ${req ? 'Requirements Not Met' : `Apply for ${title}`}
          </button>
        </div>
      </details>
    `;
  }).join('');

  return SEC(`Job Market · ${C().n}`, filterBar + (cards || PR('No job vacancies match your filter.')));
};

/* Expand Informal / Undocumented Work Options Abroad */
Object.assign(P14_informalJobs, {
  builder: { name: 'Construction Labourer / Site Helper', base: 18500, stress: 6, desc: 'Hard physical construction shifts; high injury risk but steady cash pay.' },
  waiter: { name: 'Café Waiter / Bistro Shift', base: 13500, stress: 4, desc: 'Long hours on your feet, customer service, and tips.' },
  housekeeping: { name: 'Hotel Housekeeping / Room Attendant', base: 14000, stress: 4, desc: 'Turnover cleaning in hotels; physically demanding with strict time targets.' },
  valet: { name: 'Valet Parking & Luggage Host', base: 15000, stress: 4, desc: 'Event parking and luggage support with variable tip earnings.' },
  warehouse: { name: 'Warehouse Picker & Packer', base: 16500, stress: 5, desc: 'Logistics shift work in sorting facilities.' }
});

/* ---------------------------------------------------------------------
   6. CONDITIONAL PARENT CARE, HOME HELP & CLEAN TAB LAYOUTS
   --------------------------------------------------------------------- */
/* Ageing Parent Care: Only show if at least one parent is >= 60 */
p20CareCard = function() {
  if (!S || !Array.isArray(S.family)) return '';
  const eligibleParents = S.family.filter(m => ['Mother', 'Father'].includes(m.role) && m.alive !== false && m.age >= 60);
  
  if (!eligibleParents.length) return ''; // Hide completely if parents are under 60

  const services = [
    { id: 'nurse', name: 'Visiting Nurse', usd: 1500, desc: 'Medical and daily medication checks.' },
    { id: 'caregiver', name: 'Part-Time Caregiver', usd: 950, desc: 'Assistance with daily living and mobility.' }
  ];

  return SEC('Care for Ageing Parents', eligibleParents.map(m => {
    const activeCare = S.elderCare[m.id] || 'none';
    return `
      <div style="padding:8px 0;border-bottom:1px solid var(--line)">
        <b>${p17Relation(m, true)}</b> (Age ${m.age})
        <div class="muted">Active plan: ${activeCare}</div>
        ${services.map(s => {
          const cost = Math.round(p20LocalCost(s.usd) * 0.4);
          return `<button class="btn" onclick="p20HireCare('${m.id}','${s.id}',${cost})">Arrange ${s.name} ·${money(cost)}/yr</button>`;
        }).join('')}
        <button class="btn" onclick="p20StopCare('${m.id}')">Stop Paid Care</button>
      </div>
    `;
  }).join(''));
};

/* Relocate Home Help to Assets / Housing Tab */
const P22_viewAssetsBefore = typeof viewAssets === 'function' ? viewAssets : function(){ return ''; };
viewAssets = function() {
  let html = P22_viewAssetsBefore();
  if (S && S.age >= 18) {
    html += p20HomeHelpCard();
  }
  return html;
};

/* Move Everyday Needs & Goals out of Life tab for under 16s */
const P22_viewLifeBefore = viewLife;
viewLife = function() {
  let html = P22_viewLifeBefore();
  if (S && S.age < 16) {
    // Hide Everyday Needs widget completely for children
    html = html.replace(/<section class="card"><h3>Everyday needs & goals<\/h3>[\s\S]*?<\/section>/gi, '');
  }
  return html;
};

/* ---------------------------------------------------------------------
   7. CATEGORIZED TRAVEL & TRIPS SELECTOR
   --------------------------------------------------------------------- */
p12DestinationOptions = function() {
  return [
    { id: 'trip-home', name: 'Annual Family Visit (Home Country)', country: S ? S.home : 'egy', local: S && S.country === S.home },
    { id: 'trip-local-getaway', name: 'Local Weekend Getaway / Coastal Break', country: S ? S.country : 'egy', local: true },
    { id: 'trip-intl-holiday', name: 'International Holiday / Capital City Visit', country: S && S.country === 'egy' ? 'deu' : 'usa', local: false },
    { id: 'trip-custom', name: 'Custom Destination…', country: S ? S.country : 'egy', local: true, custom: true }
  ];
};

console.log('Lifeline Phase 22 Overhaul Module Loaded Successfully.');
