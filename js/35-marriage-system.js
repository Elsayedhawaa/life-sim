/* =====================================================================
   35. MARRIAGE, ENGAGEMENT, DIVORCE & SHARED FINANCE
   Egypt-focused realistic system:
   - Rich random candidates (age, job, income, net worth, dream, lifestyle)
   - Pool refreshes every year
   - Dating → Engagement → Engagement party → Wedding
   - Parents help with wedding/home based on family wealth
   - Buy home together (co-ownership) OR one side pays
   - After marriage: wife works or housewife, shares bills or refuses
   - Shared bank account option
   - Wife money requests (refuse → bond down)
   - Divorce (either side) → forced property sale, child support, custody lawsuit
   Load AFTER 34-housing-safety.js and BEFORE 99-boot.js
   ===================================================================== */

/* ---------- 1. STATE ---------- */
function p35Init(o) {
  if (!o) return;
  if (!o.marriage) {
    o.marriage = {
      sharedBank: false,
      sharedBal: 0,
      arrangement: 'split',           // 'split' | 'man-pays' | 'wife-pays' | 'traditional'
      wifeWorks: true,
      wifeContribution: 0,            // per year, internal units
      lastRequestYear: -1,
      pendingRequest: null
    };
  }
  if (typeof o.marriage.sharedBal !== 'number' || !isFinite(o.marriage.sharedBal)) o.marriage.sharedBal = 0;
  if (!Array.isArray(o.p35Candidates)) o.p35Candidates = [];
  if (typeof o.p35PoolYear !== 'number') o.p35PoolYear = -1;
  if (!o.p35EngParty) o.p35EngParty = null;
  if (!o.divorceCase) o.divorceCase = null;
  if (typeof o.p35AlimonyOwed !== 'number') o.p35AlimonyOwed = 0;
}

const P35_migrate = migrate;
migrate = function (o) { const r = P35_migrate(o); p35Init(r); return r; };
const P35_newGame = newGame;
newGame = function () { P35_newGame.apply(this, arguments); p35Init(S); };

/* ---------- 2. RICH CANDIDATE POOL ---------- */
const P35_JOBS = [
  { title: 'Teacher',              income: [8000, 18000],    tier: 1 },
  { title: 'Nurse',                income: [10000, 22000],   tier: 1 },
  { title: 'Pharmacist',           income: [14000, 30000],   tier: 1 },
  { title: 'Accountant',           income: [12000, 28000],   tier: 1 },
  { title: 'Graphic designer',     income: [14000, 32000],   tier: 1 },
  { title: 'Marketing specialist', income: [16000, 38000],   tier: 1 },
  { title: 'Bank employee',        income: [18000, 45000],   tier: 2 },
  { title: 'Engineer',             income: [18000, 42000],   tier: 2 },
  { title: 'Software developer',   income: [22000, 55000],   tier: 2 },
  { title: 'Doctor (resident)',    income: [22000, 48000],   tier: 2 },
  { title: 'Doctor (specialist)',  income: [40000, 95000],   tier: 2 },
  { title: 'Lawyer',               income: [20000, 60000],   tier: 2 },
  { title: 'Pharmacist owner',     income: [30000, 80000],   tier: 2 },
  { title: 'Business owner',       income: [45000, 150000],  tier: 3 },
  { title: 'Company executive',    income: [60000, 200000],  tier: 3 },
  { title: 'Housewife / not working', income: [0, 0],        tier: 1 },
  { title: 'Student',              income: [0, 0],           tier: 1 }
];

const P35_DREAMS = [
  { id: 'career',   label: 'Build a serious career' },
  { id: 'family',   label: 'Marry early and raise children' },
  { id: 'travel',   label: 'Travel and see the world' },
  { id: 'home',     label: 'Own a comfortable home' },
  { id: 'stability',label: 'A calm, stable life' },
  { id: 'luxury',   label: 'Live a luxury lifestyle' }
];

const P35_LIFESTYLES = [
  { id: 'frugal',     label: 'Frugal / traditional',    spendMult: 0.55, shareWill: 0.75 },
  { id: 'moderate',   label: 'Moderate / modern',       spendMult: 1.00, shareWill: 0.55 },
  { id: 'luxury',     label: 'Luxury / brand-conscious',spendMult: 2.20, shareWill: 0.20 },
  { id: 'traditional',label: 'Traditional / man leads', spendMult: 0.85, shareWill: 0.15 }
];

function p35Rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function p35Range(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

function p35GenCandidate(targetAge) {
  /* Age: within +/- 8 years, but always >= 18 */
  const age = Math.max(18, targetAge + (Math.floor(Math.random() * 17) - 8));
  const job = p35Rand(P35_JOBS);
  const lifestyle = p35Rand(P35_LIFESTYLES);
  const dream = p35Rand(P35_DREAMS);

  /* Yearly income in EGP, adjusted to current year price level */
  const baseIncome = p35Range(job.income[0], job.income[1]);
  const yearIdx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
  const incomeEGP = Math.round(baseIncome * yearIdx * (lifestyle.id === 'luxury' ? 1.15 : 1));
  const incomeInternal = incomeEGP / 52.7;

  /* Personal net worth (savings + own property) */
  const networthEGP = job.tier === 3
    ? p35Range(2000000, 12000000)
    : job.tier === 2 ? p35Range(150000, 800000)
    : p35Range(0, 180000);
  const networthInternal = Math.round(networthEGP * yearIdx / 52.7);

  /* Family wealth tier (0 modest, 1 comfortable, 2 wealthy) */
  const famWealth = Math.random() < 0.5 ? 0 : Math.random() < 0.75 ? 1 : 2;

  return {
    id: 'c' + Math.random().toString(36).slice(2, 9),
    name: (typeof localName === 'function') ? localName(S.country, S.like) : ('Woman' + p35Range(1, 999)),
    age,
    g: S.like || 'f',
    t: Math.floor(Math.random() * 3),
    trait: p35Rand(['Kind', 'Ambitious', 'Funny', 'Artistic', 'Adventurous', 'Bookish', 'Calm', 'Romantic', 'Strict']),
    likes: p35Rand(['jewelry', 'fashion', 'tech', 'sweets', 'trips']),
    tier: job.tier,
    jobTitle: job.title,
    income: incomeInternal,
    netWorth: networthInternal,
    dream: dream.id,
    dreamLabel: dream.label,
    lifestyle: lifestyle.id,
    lifestyleLabel: lifestyle.label,
    famWealth,
    shareWill: lifestyle.shareWill,
    willWorkAfterMarriage: job.income[0] > 0 && Math.random() < (lifestyle.id === 'traditional' ? 0.35 : 0.8),
    /* Fine-tuning: some candidates are generous, some are greedy */
    generosity: 0.2 + Math.random() * 0.8  /* 0 = greedy, 1 = generous */
  };
}

function p35RefreshPool(force) {
  if (!S) return;
  const thisYear = gameYear();
  if (!force && S.p35PoolYear === thisYear && S.p35Candidates && S.p35Candidates.length) return;
  S.p35PoolYear = thisYear;
  const count = 3 + Math.floor(Math.random() * 4); /* 3-6 candidates */
  S.p35Candidates = [];
  for (let i = 0; i < count; i++) S.p35Candidates.push(p35GenCandidate(S.age));
}

/* Override base pool */
genPool = function () { p35RefreshPool(true); return S.p35Candidates.slice(); };

const P35_newPeopleBefore = newPeople;
newPeople = function () {
  if (S.age < 16) return hint('Dating starts at 16.');
  S.p35PoolYear = -1;
  p35RefreshPool(true);
  fx({ social: 1 });
  log('You went out and met new people this year. New candidates appear for ' + gameYear() + '.');
  hint();
  render();
};

/* Override meetAsk to handle the richer candidate */
const P35_meetAskBefore = meetAsk;
meetAsk = function (id) {
  if (partner()) return hint('You are already with someone.');
  const c = (S.p35Candidates || []).find(function (x) { return x.id === id; });
  if (!c) return hint('That person is no longer available.');
  S.p35Candidates = S.p35Candidates.filter(function (x) { return x.id !== id; });

  const baseChance = 0.35 + (S.social || 50) / 200 + (S.happiness || 50) / 500 + (S.smarts || 50) / 800;
  /* Higher-tier / higher-net-worth candidates are pickier */
  const picky = 1 - Math.min(0.35, (c.tier * 0.08) + (c.netWorth > 5000 ? 0.08 : 0));
  const chance = Math.max(0.08, Math.min(0.92, baseChance * picky));

  if (Math.random() < chance) {
    const m = addMember('Partner', c.age, 40);
    m.name = c.name;
    m.g = c.g;
    m.t = c.t;
    m.stage = 'dating';
    m.mode = 'split';
    m.together = false;
    m.yrs = 0;
    m.likes = c.likes;
    m.trait = c.trait;
    m.tier = c.tier;
    /* New fields */
    m.jobTitle = c.jobTitle;
    m.income = c.income;
    m.netWorth = c.netWorth;
    m.dream = c.dream;
    m.dreamLabel = c.dreamLabel;
    m.lifestyle = c.lifestyle;
    m.lifestyleLabel = c.lifestyleLabel;
    m.famWealth = c.famWealth;
    m.shareWill = c.shareWill;
    m.willWorkAfterMarriage = c.willWorkAfterMarriage;
    m.generosity = c.generosity;
    m.weddingPlan = null;
    m.engPartyDone = false;
    m.divorceAskedYear = -1;

    fx({ happiness: 8, social: 4 });
    log(c.name + ' said yes. You are now dating.');
  } else {
    fx({ happiness: -4 });
    log(c.name + ' politely said no.');
  }
  hint();
  render();
};

/* ---------- 3. ENGAGEMENT PARTY ---------- */
const P35_ENG_OPTIONS = {
  venue:   [['Family home or rooftop', 500], ['Modest banquet hall', 8000], ['Hotel ballroom', 40000], ['Luxury ballroom / garden estate', 180000]],
  food:    [['Tea, sweets and light bites', 30], ['Full dinner buffet', 150], ['Premium dinner and open buffet', 400]],
  guests:  [['30 close guests', 30], ['80 guests', 80], ['150 guests', 150], ['300 guests', 300]],
  ring:    [['Simple band', 0], ['With small diamond accents', 3500], ['Full diamond set', 18000]],
  photo:   [['Phone photos', 0], ['Photographer (3 hrs)', 3000], ['Photo + video team', 12000]],
  music:   [['Playlist and speakers', 200], ['DJ', 3500], ['Live band', 15000]],
  decor:   [['Simple flowers', 800], ['Full decor', 5000], ['Luxury floral design', 25000]]
};

function p35EngState() {
  if (!S.p35EngParty) {
    S.p35EngParty = { venue: 1, food: 1, guests: 1, ring: 1, photo: 1, music: 1, decor: 1, payer: 'me' };
  }
  return S.p35EngParty;
}

function p35EngCost() {
  const e = p35EngState();
  const yearIdx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
  let total = 0;
  Object.keys(P35_ENG_OPTIONS).forEach(function (k) {
    const opt = P35_ENG_OPTIONS[k][e[k]];
    const val = opt[1];
    if (k === 'food') total += val * P35_ENG_OPTIONS.guests[e.guests][1] * yearIdx / 52.7;
    else total += val * yearIdx / 52.7;
  });
  return Math.round(total);
}

function p35EngShare() {
  const e = p35EngState();
  const m = partner();
  const total = p35EngCost();
  if (e.payer === 'me') return total;
  if (e.payer === 'split') return Math.round(total / 2);
  if (e.payer === 'her-family' && m) {
    const fam = [0.10, 0.35, 0.60][m.famWealth || 0];
    return Math.round(total * (1 - fam));
  }
  if (e.payer === 'both-families' && m) {
    const myFam = [0.10, 0.35, 0.55][S.famWealth || 0];
    const herFam = [0.10, 0.35, 0.55][m.famWealth || 0];
    const totalShare = Math.min(0.90, myFam + herFam);
    return Math.round(total * (1 - totalShare));
  }
  return total;
}

function p35EngSet(k, v) { p35EngState()[k] = k === 'payer' ? v : Number(v); render(); }

function p35HoldEngagementParty() {
  const m = partner();
  if (!m) return hint('You need a partner first.');
  if (m.stage !== 'engaged') return hint('You must propose first.');
  if (m.engPartyDone) return hint('The engagement party is already done.');

  const e = p35EngState();
  const myShare = p35EngShare();
  if (S.wealth < myShare) return hint('You need ' + money(myShare) + ' for your share.');

  S.wealth -= myShare;
  S.expenses = (S.expenses || 0) + myShare;
  S.bill = S.bill || {};
  S.bill.engagementParty = (S.bill.engagementParty || 0) + myShare;

  m.bond = clamp((m.bond || 50) + 12);
  m.engPartyDone = true;
  m.engPartySize = e.guests;
  fx({ happiness: 6, social: 5 });

  const total = p35EngCost();
  const payer = e.payer;
  log('Engagement party held. Total ' + money(total) + ', your share ' + money(myShare) + '. Payer: ' + payer + '.');
  realismNotice(
    'Engagement party completed',
    m.name + ' and you celebrated your engagement. Total cost ' + money(total) + '; your share ' + money(myShare) + '. ' +
    (payer === 'me' ? 'You paid for everything.' :
     payer === 'split' ? 'Costs were split with ' + m.name + '.' :
     payer === 'her-family' ? 'Her family contributed according to Egyptian tradition.' :
     'Both families helped pay for the celebration.')
  );
  hint();
  render();
}

/* ---------- 4. WEDDING + FAMILY NEGOTIATION ---------- */
/* Wrap the existing holdWedding so families can help with the cost */
const P35_holdWeddingBefore = holdWedding;
holdWedding = function () {
  const m = partner();
  if (!m) return hint('You need a partner first.');
  if (m.stage !== 'engaged') return hint('You must be engaged to marry.');
  if (!m.engPartyDone) return hint('Hold the engagement party before the wedding. See the Love tab.');

  /* Family contribution toward the wedding */
  const w = wedState();
  const totalCost = wedCost();
  const payer = w.payer;

  /* If both families contribute, adjust the money actually paid */
  let familyHelp = 0;
  if (payer === 'families') {
    const myFam = [0.10, 0.30, 0.50][S.famWealth || 0];
    const herFam = [0.10, 0.30, 0.50][m.famWealth || 0];
    familyHelp = Math.min(0.85, myFam + herFam);
    /* Refuse check */
    if (Math.random() < (1 - m.generosity) * 0.4) {
      familyHelp *= 0.4;
      log('Both families were reluctant to contribute much. You and ' + m.name + ' covered more of the wedding.');
    }
  }
  const myShare = Math.round(totalCost * (1 - familyHelp));
  const priorShare = wedShare();
  const finalShare = Math.min(priorShare, myShare);

  if (S.wealth < finalShare) return hint('You need ' + money(finalShare) + ' for your share.');

  /* Store final for reference */
  w._lastTotal = totalCost;
  w._lastMyShare = finalShare;
  w._lastFamilyHelp = Math.round(totalCost * familyHelp);
  w._lastPayer = payer;

  /* Temporarily reduce wealth less by overriding when base runs. Simpler: give the
     family help back to the player after the base deduction. */
  const beforeWealth = S.wealth;
  P35_holdWeddingBefore();
  const baseShare = wedShare();
  const helpBack = priorShare - finalShare;
  if (helpBack > 0) {
    S.wealth += helpBack;
    if (S.bill && S.bill.wedding) S.bill.wedding = Math.max(0, S.bill.wedding - helpBack);
  }

  const mm = partner();
  if (mm && mm.stage === 'married') {
    log('Wedding held. Total ' + money(totalCost) + ', families covered ' + money(w._lastFamilyHelp) + ', you paid ' + money(finalShare) + '.');
    realismNotice(
      'Wedding completed',
      'You married ' + mm.name + '. Your share was ' + money(finalShare) + ' of ' + money(totalCost) + '.' +
      (familyHelp > 0 ? ' Families contributed ' + money(w._lastFamilyHelp) + '.' : ' You and ' + mm.name + ' covered it yourselves.')
    );
    /* New: post-marriage setup */
    S.marriage.wifeWorks = !!mm.willWorkAfterMarriage;
    S.marriage.arrangement = 'split';
    S.marriage.wifeContribution = 0;
    S.marriage.lastRequestYear = -1;
  }
};

/* ---------- 5. SHARED PROPERTY (buy home together) ---------- */
function p35BuyHomeTogether(homeIdx, playerShare) {
  const h = S.ownedHomes[homeIdx];
  if (!h) return hint('Property not found.');
  const m = partner();
  if (!m || (m.stage !== 'engaged' && m.stage !== 'married')) return hint('You need an engaged or married partner.');
  if (playerShare < 0.1 || playerShare > 0.9) return hint('Player share must be between 10% and 90%.');

  const price = Math.max(0, Number(h.value) || 0);
  const playerOwes = Math.round(price * playerShare);
  const partnerOwes = price - playerOwes;

  /* Can she afford her share? */
  const herCash = Math.max(0, Number(m.netWorth) || 0);
  if (herCash < partnerOwes * 0.5) {
    return hint(m.name + ' cannot afford ' + money(partnerOwes) + '. She only has about ' + money(herCash) + '.');
  }

  /* Will she agree? Based on generosity */
  const agreeChance = 0.25 + (m.generosity || 0.5) * 0.7;
  if (Math.random() > agreeChance) {
    m.bond = clamp((m.bond || 50) - 5);
    log(m.name + ' refused to share the property purchase. She wants you to buy it alone.');
    realismNotice('She refused shared ownership', m.name + ' does not want to contribute to property. She expects you to buy it alone if you want to own a home.');
    render();
    return;
  }

  /* Player must have their share */
  if (S.wealth < playerOwes) return hint('You need ' + money(playerOwes) + ' for your share.');

  S.wealth -= playerOwes;
  h.coOwnedWith = m.id;
  h.coOwnedName = m.name;
  h.playerEquity = playerShare;
  h.partnerEquity = 1 - playerShare;
  m.netWorth = Math.max(0, (m.netWorth || 0) - partnerOwes);
  m.bond = clamp((m.bond || 50) + 8);

  log('You and ' + m.name + ' bought ' + h.name + ' together. You own ' + Math.round(playerShare * 100) + '%, she owns ' + Math.round((1 - playerShare) * 100) + '%.');
  realismNotice(
    'Shared property purchased',
    h.name + ' is now co-owned with ' + m.name + '. You contributed ' + money(playerOwes) + ' (' + Math.round(playerShare * 100) + '%), she contributed ' + money(partnerOwes) + '.'
  );
  render();
}

/* ---------- 6. POST-MARRIAGE ARRANGEMENT ---------- */
function p35SetArrangement(mode) {
  if (!S.marriage) p35Init(S);
  const m = partner();
  if (!m || m.stage !== 'married') return hint('You must be married.');
  S.marriage.arrangement = mode;
  log('Household arrangement set to: ' + mode + '.');
  render();
}

function p35OpenSharedAccount() {
  if (!S.marriage) p35Init(S);
  const m = partner();
  if (!m || m.stage !== 'married') return hint('You must be married.');
  if (S.marriage.sharedBank) return hint('You already have a shared account.');
  if (m.generosity < 0.3 && Math.random() < 0.5) {
    m.bond = clamp((m.bond || 50) - 5);
    log(m.name + ' refused to open a shared bank account. She said each person should keep their own money.');
    return render();
  }
  S.marriage.sharedBank = true;
  m.bond = clamp((m.bond || 50) + 4);
  log('You and ' + m.name + ' opened a shared bank account.');
  realismNotice('Shared bank account opened', 'You and ' + m.name + ' now share a household account. Deposits and withdrawals affect both of you.');
  render();
}

function p35DepositShared() {
  if (!S.marriage || !S.marriage.sharedBank) return hint('No shared account.');
  const amt = Number(prompt('Amount to deposit into the shared account:') || 0);
  if (!isFinite(amt) || amt <= 0) return hint('Invalid amount.');
  if (S.wealth < amt) return hint('Not enough cash.');
  S.wealth -= amt;
  S.marriage.sharedBal += amt;
  log('You deposited ' + money(amt) + ' into the shared account.');
  render();
}

function p35WithdrawShared() {
  if (!S.marriage || !S.marriage.sharedBank) return hint('No shared account.');
  const amt = Number(prompt('Amount to withdraw from the shared account:') || 0);
  if (!isFinite(amt) || amt <= 0) return hint('Invalid amount.');
  if (S.marriage.sharedBal < amt) return hint('Not enough in the shared account.');
  S.marriage.sharedBal -= amt;
  S.wealth += amt;
  log('You withdrew ' + money(amt) + ' from the shared account.');
  render();
}

/* ---------- 7. WIFE MONEY REQUESTS ---------- */
function p35QueueWifeRequest() {
  if (!S.marriage) p35Init(S);
  const m = partner();
  if (!m || m.stage !== 'married') return;
  if (S.marriage.lastRequestYear === gameYear()) return;
  if (S.marriage.pendingRequest) return;
  /* 45% chance per year, more likely if bond is low */
  const chance = 0.45 - (m.bond - 50) * 0.002;
  if (Math.random() > Math.max(0.15, chance)) return;

  const reasons = [
    { id: 'shopping',  label: 'personal shopping / clothes', min: 3000, max: 12000 },
    { id: 'medical',   label: 'medical appointment or treatment', min: 4000, max: 25000 },
    { id: 'family',    label: 'help for her parents', min: 3000, max: 20000 },
    { id: 'cosmetics', label: 'beauty / cosmetics routine', min: 1500, max: 8000 },
    { id: 'gift',      label: 'a gift for a family event', min: 2000, max: 10000 },
    { id: 'trip',      label: 'a trip with her friends', min: 5000, max: 25000 }
  ];
  const r = reasons[Math.floor(Math.random() * reasons.length)];
  const yearIdx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
  const egpAmount = Math.round((r.min + Math.random() * (r.max - r.min)) * yearIdx);
  const amount = Math.round(egpAmount / 52.7);

  S.marriage.pendingRequest = { reason: r.id, reasonLabel: r.label, amount: amount, year: gameYear() };
  S.marriage.lastRequestYear = gameYear();

  log(m.name + ' asked for ' + money(amount) + ' for ' + r.label + '.');
  realismNotice('Your wife asked for money', m.name + ' asked for ' + money(amount) + ' for ' + r.label + '. You can agree or refuse; refusing will strain the relationship.');
}

function p35RespondWifeRequest(yes) {
  if (!S.marriage || !S.marriage.pendingRequest) return hint('No pending request.');
  const r = S.marriage.pendingRequest;
  const m = partner();
  if (yes) {
    if (S.wealth < r.amount) return hint('Not enough cash.');
    S.wealth -= r.amount;
    S.expenses = (S.expenses || 0) + r.amount;
    S.bill = S.bill || {};
    S.bill.wifeSupport = (S.bill.wifeSupport || 0) + r.amount;
    if (m) m.bond = clamp((m.bond || 50) + 6);
    fx({ happiness: 2 });
    log('You gave ' + m.name + ' ' + money(r.amount) + ' for ' + r.reasonLabel + '.');
  } else {
    if (m) m.bond = clamp((m.bond || 50) - 9);
    fx({ happiness: -2 });
    log('You refused ' + m.name + '\'s request for ' + r.reasonLabel + '.');
  }
  S.marriage.pendingRequest = null;
  render();
}

/* ---------- 8. DIVORCE ---------- */
function p35WifeAsksDivorce() {
  const m = partner();
  if (!m || m.stage !== 'married') return false;
  if ((m.bond || 50) > 25) return false;
  if (m.divorceAskedYear === gameYear()) return false;
  m.divorceAskedYear = gameYear();
  const chance = (30 - (m.bond || 0)) * 0.035;
  if (Math.random() > chance) return false;

  log(m.name + ' is asking for a divorce. She says the marriage is not working.');
  realismNotice('Your wife is asking for a divorce', m.name + ' filed for divorce. Review the situation in the Love tab. You can accept, negotiate, or fight it in court.');
  S.divorceCase = { initiatedBy: 'wife', year: gameYear(), stage: 'filed', lawyerCost: 0 };
  return true;
}

function p35InitiateDivorce() {
  const m = partner();
  if (!m || m.stage !== 'married') return hint('You are not married.');
  if (S.divorceCase) return hint('A divorce case is already open.');
  if (!confirm('File for divorce from ' + m.name + '? This will be resolved this year.')) return;
  S.divorceCase = { initiatedBy: 'player', year: gameYear(), stage: 'filed', lawyerCost: 0 };
  log('You filed for divorce from ' + m.name + '.');
  render();
}

function p35ResolveDivorce() {
  const c = S.divorceCase;
  if (!c) return;
  const m = partner();
  if (!m) { S.divorceCase = null; return; }

  /* Lawyer cost */
  const yearIdx = (typeof p14EgyptPriceIndex === 'function') ? p14EgyptPriceIndex(gameYear()) : 1;
  const lawyerEGP = 25000 + Math.random() * 60000;
  const lawyerCost = Math.round(lawyerEGP * yearIdx / 52.7);
  S.wealth -= lawyerCost;
  S.expenses = (S.expenses || 0) + lawyerCost;
  S.bill = S.bill || {};
  S.bill.divorceLegal = (S.bill.divorceLegal || 0) + lawyerCost;
  c.lawyerCost = lawyerCost;

  /* Shared property forced sale */
  let propertyDividend = 0;
  if (Array.isArray(S.ownedHomes)) {
    const shared = S.ownedHomes.filter(function (h) { return h && h.coOwnedWith === m.id; });
    shared.forEach(function (h) {
      const grossValue = Math.max(0, Number(h.value) || 0);
      const mortgage = Math.max(0, Number(h.balance) || 0);
      const net = grossValue - mortgage;
      const playerCut = Math.round(net * (h.playerEquity || 0.5));
      const herCut = net - playerCut;
      /* Forced sale: both get their share after mortgage cleared */
      S.wealth += playerCut;
      m.netWorth = (m.netWorth || 0) + herCut;
      propertyDividend += playerCut;
      /* Remove the home from player's portfolio since it's sold */
      S.ownedHomes = S.ownedHomes.filter(function (x) { return x !== h; });
      if (S.housing === h.id) S.housing = (typeof parents === 'function' && parents().length) ? 'parents' : null;
    });
    if (shared.length) {
      log('Shared property was sold by court order. You received ' + money(propertyDividend) + '; ' + m.name + ' received her share.');
    }
  }

  /* Deferred dowry / مؤخر (Egyptian law) */
  const deferredEGP = 30000 + Math.random() * 120000;
  const deferred = Math.round(deferredEGP * yearIdx / 52.7);
  /* Wife gets it if the player initiated the divorce without her consent */
  if (c.initiatedBy === 'player' && (m.bond || 50) > 15) {
    S.wealth -= deferred;
    m.netWorth = (m.netWorth || 0) + deferred;
    log('Deferred dowry (مؤخر) paid to ' + m.name + ': ' + money(deferred) + '.');
  }

  /* Children support (نفقة) */
  const children = S.family.filter(function (x) { return x && x.role === 'Child' && x.alive !== false; });
  let childSupport = 0;
  if (children.length) {
    /* Standard Egyptian family court: ~30% of income per child */
    const incomeBasis = Math.max(0, Number(S.lastSalary) || Number(S.income) || 0);
    const monthly = Math.max(incomeBasis * 0.03, incomeBasis * 0.05 * children.length);
    childSupport = Math.round(monthly * 12);
    c.childSupport = childSupport;
    c.childrenCount = children.length;

    /* Custody lawsuit — player and wife both try */
    const playerWins = Math.random() < 0.35 + (S.wealth / Math.max(1, S.wealth + m.netWorth)) * 0.35;
    c.custodyWinner = playerWins ? 'player' : 'wife';

    if (c.custodyWinner === 'player') {
      log('You won custody of ' + children.length + ' child(ren). ' + m.name + ' must contribute support.');
    } else {
      log(m.name + ' won custody. You owe yearly support (نفقة) of ' + money(childSupport) + '.');
      S.p35AlimonyOwed = childSupport;
    }
  }

  /* Remove spouse from family, set to ex-partner or remove */
  S.family = S.family.filter(function (x) { return x !== m; });

  fx({ happiness: -12, social: -3 });
  log('Divorce finalized. Legal cost: ' + money(lawyerCost) + '.');
  realismNotice(
    'Divorce finalized',
    'You and ' + m.name + ' are divorced. Legal cost ' + money(lawyerCost) + '.' +
    (propertyDividend ? ' Property settlement: ' + money(propertyDividend) + ' received.' : '') +
    (childSupport ? (c.custodyWinner === 'player' ? ' You have custody.' : ' You owe yearly support of ' + money(childSupport) + '.') : '')
  );

  S.divorceCase = null;
  render();
}

/* ---------- 9. YEARLY TICK ---------- */
const P35_loveYearBefore = loveYear;
loveYear = function () {
  if (!S) return;
  p35Init(S);

  /* Refresh the candidate pool every year */
  if (S.p35PoolYear !== gameYear()) {
    p35RefreshPool(true);
  }

  P35_loveYearBefore();

  const m = partner();
  if (!m || m.stage !== 'married') return;

  /* Wife income */
  if (S.marriage.wifeWorks) {
    const inc = Math.max(0, Number(m.income) || 0);
    if (inc > 0) {
      /* She keeps some, contributes some based on arrangement */
      const contribution = S.marriage.arrangement === 'split'
        ? Math.round(inc * (0.5 * (m.shareWill || 0.5)))
        : S.marriage.arrangement === 'wife-pays' ? Math.round(inc * 0.7)
        : S.marriage.arrangement === 'man-pays' ? 0
        : Math.round(inc * 0.3); /* traditional */
      if (contribution > 0) {
        S.wealth += contribution;
        S.income = (S.income || 0) + contribution;
        S.marriage.wifeContribution = contribution;
        log(m.name + ' contributed ' + money(contribution) + ' to the household this year.');
      }
    }
  } else {
    /* Housewife — no income, but lower expenses since she manages the home */
    S.marriage.wifeContribution = 0;
  }

  /* Interest on shared account */
  if (S.marriage.sharedBank && S.marriage.sharedBal > 0) {
    const interest = Math.round(S.marriage.sharedBal * 0.05);
    S.marriage.sharedBal += interest;
    if (interest) log('Shared account earned ' + money(interest) + ' in interest.');
  }

  /* Wife money request */
  p35QueueWifeRequest();

  /* Low-bond divorce pressure */
  p35WifeAsksDivorce();

  /* Resolve pending divorce */
  if (S.divorceCase && S.divorceCase.stage === 'filed') {
    p35ResolveDivorce();
  }

  /* Pay child support from previous divorce */
  if (S.p35AlimonyOwed > 0) {
    if (S.wealth >= S.p35AlimonyOwed) {
      S.wealth -= S.p35AlimonyOwed;
      S.expenses = (S.expenses || 0) + S.p35AlimonyOwed;
      S.bill = S.bill || {};
      S.bill.childSupport = (S.bill.childSupport || 0) + S.p35AlimonyOwed;
      log('Paid child support (نفقة): ' + money(S.p35AlimonyOwed) + '.');
    } else {
      log('You could not pay the full child support this year. The amount carries over.');
    }
  }
};

/* ---------- 10. UI ---------- */
function p35DreamLabel(m) { return m.dreamLabel || 'A happy life'; }
function p35CandidateCard(c) {
  const incomeEGP = Math.round((c.income || 0) * 52.7);
  const nwEGP = Math.round((c.netWorth || 0) * 52.7);
  return '<div style="margin-top:10px;padding:12px;border:1px solid var(--line);border-radius:10px">' +
    '<b style="font-size:1.05rem">' + (typeof face === 'function' ? face(c.g, c.t, 25) + ' ' : '') + c.name + '</b>' +
    ' <span class="muted">· ' + c.age + ' years</span><br>' +
    '<span class="muted" style="font-size:.85rem">' + c.trait + ' · likes ' + c.likes + '</span>' +
    '<div class="row"><span>Work</span><b>' + c.jobTitle + '</b></div>' +
    '<div class="row"><span>Yearly income</span><b>' + (incomeEGP > 0 ? incomeEGP.toLocaleString() + ' EGP' : 'No income') + '</b></div>' +
    '<div class="row"><span>Personal net worth</span><b>' + (nwEGP > 0 ? nwEGP.toLocaleString() + ' EGP' : '~0') + '</b></div>' +
    '<div class="row"><span>Family</span><b>' + ['Modest', 'Comfortable', 'Wealthy'][c.famWealth] + '</b></div>' +
    '<div class="row"><span>Lifestyle</span><b>' + c.lifestyleLabel + '</b></div>' +
    '<div class="row"><span>Dream</span><b>' + c.dreamLabel + '</b></div>' +
    '<div class="row"><span>Will work after marriage</span><b>' + (c.willWorkAfterMarriage ? 'Yes' : 'Likely housewife') + '</b></div>' +
    '<button class="btn" onclick="meetAsk(\'' + c.id + '\')">Ask her out</button>' +
    '</div>';
}

function p35SharedPropertyPanel() {
  const m = partner();
  if (!m) return '';
  if (m.stage !== 'engaged' && m.stage !== 'married') return '';

  const candidates = S.ownedHomes.filter(function (h) { return h && !h.coOwnedWith; });
  if (!candidates.length) return '';

  let html = '<section class="card"><h3>🏠 Buy a home together with ' + m.name + '</h3>' +
    '<p class="muted">Egyptian couples often buy a home together and split the ownership. If she refuses to contribute, you may need to buy it alone.</p>';
  html += '<p class="muted" style="font-size:.85rem">Her available contribution: <b>' + Math.round((m.netWorth || 0) * 52.7).toLocaleString() + ' EGP</b></p>';
  candidates.slice(0, 5).forEach(function (h, i) {
    const idx = S.ownedHomes.indexOf(h);
    html += '<div style="margin-top:10px;padding:10px;border:1px solid var(--line);border-radius:8px">' +
      '<b>' + h.name + '</b> — ' + money(h.value) +
      '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">' +
      ['30', '50', '70'].map(function (pct) {
        return '<button class="btn" style="flex:1;min-width:100px;font-size:.8rem" onclick="p35BuyHomeTogether(' + idx + ',' + (pct / 100) + ')">You ' + pct + '% / Her ' + (100 - pct) + '%</button>';
      }).join('') +
      '</div></div>';
  });
  html += '</section>';
  return html;
}

function p35MarriagePanel() {
  const m = partner();
  if (!m || m.stage !== 'married') return '';
  const arr = S.marriage.arrangement;
  const arrLabel = arr === 'split' ? 'Split household costs'
    : arr === 'man-pays' ? 'You pay for everything'
    : arr === 'wife-pays' ? 'She pays most of the bills'
    : 'Traditional (mixed)';

  let html = '<section class="card"><h3>💍 Marriage — ' + m.name + '</h3>';
  html += '<div class="row"><span>Household arrangement</span><b>' + arrLabel + '</b></div>';
  html += '<div class="row"><span>She works</span><b>' + (S.marriage.wifeWorks ? 'Yes — ' + m.jobTitle : 'No — housewife') + '</b></div>';
  html += '<div class="row"><span>Her yearly income</span><b>' + Math.round((m.income || 0) * 52.7).toLocaleString() + ' EGP</b></div>';
  if (S.marriage.wifeContribution > 0) {
    html += '<div class="row"><span>She contributed this year</span><b>' + money(S.marriage.wifeContribution) + '</b></div>';
  }
  html += '<div class="row"><span>Shared bank account</span><b>' + (S.marriage.sharedBank ? money(S.marriage.sharedBal) : 'Not opened') + '</b></div>';

  html += '<div class="acts" style="margin-top:10px">' +
    '<button class="btn ' + (arr === 'split' ? 'sel' : '') + '" onclick="p35SetArrangement(\'split\')">Split bills 50/50<small>She pays half of shared costs.</small></button>' +
    '<button class="btn ' + (arr === 'man-pays' ? 'sel' : '') + '" onclick="p35SetArrangement(\'man-pays\')">You pay all bills<small>Traditional — she expects this.</small></button>' +
    '<button class="btn ' + (arr === 'wife-pays' ? 'sel' : '') + '" onclick="p35SetArrangement(\'wife-pays\')">She pays most<small>Only if she agrees and works.</small></button>' +
    '<button class="btn ' + (arr === 'traditional' ? 'sel' : '') + '" onclick="p35SetArrangement(\'traditional\')">Traditional mixed<small>You pay most, she helps.</small></button>' +
    '</div>';

  if (!S.marriage.sharedBank) {
    html += '<button class="btn" style="margin-top:8px" onclick="p35OpenSharedAccount()">Open a shared bank account</button>';
  } else {
    html += '<div class="acts" style="margin-top:8px">' +
      '<button class="btn" onclick="p35DepositShared()">Deposit to shared</button>' +
      '<button class="btn" onclick="p35WithdrawShared()">Withdraw from shared</button>' +
      '</div>';
  }

  if (S.marriage.pendingRequest) {
    const r = S.marriage.pendingRequest;
    html += '<div style="margin-top:14px;padding:12px;border:1px solid var(--amber);border-radius:10px">' +
      '<b>' + m.name + ' is asking for money</b>' +
      '<p class="muted" style="font-size:.85rem">Reason: ' + r.reasonLabel + '. Amount: <b>' + money(r.amount) + '</b>.</p>' +
      '<div class="acts">' +
      '<button class="btn" onclick="p35RespondWifeRequest(true)">Give ' + money(r.amount) + '</button>' +
      '<button class="btn" onclick="p35RespondWifeRequest(false)">Refuse</button>' +
      '</div></div>';
  }

  if (!S.divorceCase) {
    html += '<button class="btn" style="margin-top:14px;border-color:var(--rose)" onclick="p35InitiateDivorce()">File for divorce</button>';
  }
  html += '</section>';
  return html;
}

function p35DivorcePanel() {
  if (!S.divorceCase) return '';
  const m = partner();
  let html = '<section class="card" style="border-color:var(--rose)">';
  html += '<h3>⚖️ Divorce in progress</h3>';
  html += '<p class="muted">Your divorce case from ' + (m ? m.name : 'your spouse') + ' is being resolved. A lawyer, property settlement and possibly child support will be decided at year-end.</p>';
  html += '<button class="btn" style="border-color:var(--rose)" onclick="p35ResolveDivorce()">Resolve now</button>';
  html += '</section>';
  return html;
}

/* ---------- 11. OVERRIDE viewLove ---------- */
const P35_viewLoveBefore = viewLove;
viewLove = function () {
  p35Init(S);
  if (S.age < 16) return P35_viewLoveBefore();
  const m = partner();

  /* Regenerate pool if stale */
  if (!m && S.p35PoolYear !== gameYear()) p35RefreshPool(true);

  /* If not in a relationship, show the new rich candidate list */
  if (!m) {
    let html = '<section class="card"><h3>Love and dating</h3>' +
      '<p class="muted">' +
      (S.av && S.av.g !== 'n' ? 'Attracted to ' + (S.like === 'f' ? 'women' : 'men') + '. ' : '') +
      'You can meet 3-6 new candidates every year. The list refreshes on each birthday. Each woman has her own age, work, income, family wealth, lifestyle and dream.</p></section>';

    html += '<section class="card"><h3>People you could meet in ' + gameYear() + '</h3>';
    if (!S.p35Candidates || !S.p35Candidates.length) {
      html += '<p class="muted">Nobody available right now. Press the button below to look for new people.</p>';
    } else {
      S.p35Candidates.forEach(function (c) { html += p35CandidateCard(c); });
    }
    html += '<button class="btn" style="margin-top:12px" onclick="newPeople()">Go out and meet new people</button>';
    html += '</section>';
    return html;
  }

  /* In a relationship → show base + extras */
  let base = P35_viewLoveBefore();
  base += p35SharedPropertyPanel();

  /* Engagement party planner */
  if (m.stage === 'engaged' && !m.engPartyDone) {
    const e = p35EngState();
    const total = p35EngCost();
    let eng = '<section class="card"><h3>💐 Engagement party — ' + m.name + '</h3>' +
      '<p class="muted">In Egypt, the engagement party (حفل الخطوبة) is held separately from the wedding. Choose the venue, food, guests and extras. Families may help pay.</p>';
    Object.keys(P35_ENG_OPTIONS).forEach(function (k) {
      const label = { venue: 'Venue', food: 'Food per guest', guests: 'Number of guests', ring: 'Engagement ring upgrade', photo: 'Photography', music: 'Music', decor: 'Flowers & decor' }[k];
      eng += '<div class="row"><span>' + label + '</span><select onchange="p35EngSet(\'' + k + '\',this.value)" style="width:60%">';
      P35_ENG_OPTIONS[k].forEach(function (opt, i) {
        const p = k === 'food' ? opt[1] + ' EGP/guest' : k === 'guests' ? '' : opt[1] + ' EGP';
        eng += '<option value="' + i + '"' + (e[k] === i ? ' selected' : '') + '>' + opt[0] + (p ? ' · ' + p : '') + '</option>';
      });
      eng += '</select></div>';
    });
    eng += '<div class="row"><span>Who pays?</span><select onchange="p35EngSet(\'payer\',this.value)" style="width:60%">' +
      '<option value="me"' + (e.payer === 'me' ? ' selected' : '') + '>You pay for everything</option>' +
      '<option value="split"' + (e.payer === 'split' ? ' selected' : '') + '>Split with ' + m.name + '</option>' +
      '<option value="her-family"' + (e.payer === 'her-family' ? ' selected' : '') + '>Her family contributes (Egyptian tradition)</option>' +
      '<option value="both-families"' + (e.payer === 'both-families' ? ' selected' : '') + '>Both families help</option>' +
      '</select></div>';
    eng += '<div class="row"><span>Total cost</span><b>' + money(total) + '</b></div>';
    eng += '<div class="row"><span>Your share</span><b>' + money(p35EngShare()) + '</b></div>';
    eng += '<button class="btn" style="margin-top:10px" onclick="p35HoldEngagementParty()"' + (S.wealth < p35EngShare() ? ' disabled' : '') + '>Hold the engagement party</button>';
    eng += '</section>';
    base += eng;
  }

  base += p35MarriagePanel();
  base += p35DivorcePanel();
  return base;
};

/* ---------- 12. RUN ON LOAD ---------- */
p35Init(S);
p35RefreshPool(true);
