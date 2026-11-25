/* ============================================================================
   World Life — Family fortune (v2.21)
   A rich family is a fortune, not a salary multiplier. Three tracked
   quantities per family (net worth, liquid fund, yearly inflow), a children's
   trust, and real cash that leaves the fund: allowance, asks, trust releases.
   Everything is derived from the live state and era-scaled through the same
   CPI / FX helpers the rest of the economy uses. The numbers are dial
   defaults (see DIALS), not constants of the game.
   Tiers: upper_middle, wealthy, very_wealthy. Every other tier is untouched.
   ========================================================================== */
import { recordJournal, walletMove, queueScene } from '../core/schema.js';
import { eraLocalCost, usdRate, inflationRate, eraDepositRates, convertCurrency } from '../data/economy.js';
import { estateChargePlan } from './companyEstate.js';
import { formatMoney, getCountry } from '../data/countries.js';
import { CARS_MEGA_CATALOG, CAR_COLORS } from '../data/megaCarsAndShop.js';
import { propertyMarketYear } from './propertyMarketRisk.js';
import { getHousingFor } from '../data/institutions.js';
import { finalizePropertyPurchase } from './economyEngine.js';
import { showroomCarQuote } from './completeLifeSystems.js';

export const FORTUNE_TIERS = ['upper_middle', 'wealthy', 'very_wealthy'];

/* Anchors are 2026 USD, scaled to the player's country and year. */
const ANCHORS = {
  upper_middle: { netWorth: 400e3, fund: 150e3, inflow: 180e3 },
  wealthy:      { netWorth: 12e6,  fund: 1.5e6,  inflow: 900e3 },
  very_wealthy: { netWorth: 1.2e9, fund: 40e6,   inflow: 30e6 }
};
const DIALS = {
  fundRetention: 0.6,
  annualGiftShareCap: 0.25,       /* gifts + granted asks per year, share of that year's inflow */
  allowancePctOfMonthlyInflow: { upper_middle: 0.045, wealthy: 0.075, very_wealthy: 0.0075 },
  askCeiling: {                   /* per ask */
    upper_middle: { of: 'monthlyInflow', pct: 0.015 },
    wealthy:      { of: 'fund', pct: 0.00375 },
    very_wealthy: { of: 'fund', pct: 0.02 }
  },
  askCooldownMonths: 3,
  /* Birthday car target price (2026 USD): upper_middle is a modest first car, wealthy a German-class car, very_wealthy a dream-garage car. */
  carTargetUsd: { upper_middle: 9000, wealthy: 65000, very_wealthy: 250000 },
  carGiftAge: 18,
  fundMaxShareOfNetWorth: 0.35, /* cash the family holds is part of its net worth; anything above this share is reinvested (already inside net worth) */
  /* Company link (wealthy, very_wealthy): the family company is worth this share of net worth; the player gets service shares from the children's pool. */
  companyShareOfNetWorth: { wealthy: 0.55, very_wealthy: 0.7 },
  sharesPerChildCapPct: 10, sharesGrantAge: 21, sharesPctRange: [0.5, 1.0], dividendYield: 0.03, dividendCapPctOfInflow: 0.10,
  /* First home (wealthy, very_wealthy): an estate asset, so it leaves net worth, not the cash fund. At most this share of net worth, aimed at this share of that ceiling. */
  homeGiftAge: 22, homeCapPctOfNetWorth: 0.08, homeAimShare: { wealthy: 0.6, very_wealthy: 1.0 },
  trustYearlyPct: 0.0025,         /* of net worth, each childhood year */
  trustPerChildCapPct: 0.05,
  trustAllChildrenCapPct: 0.15,
  trustRelease: [[18, 0.25], [21, 0.25], [25, 0.5]]
};

function hash01(S, salt) {
  let h = (Math.trunc(Number(S.seed) || 17) ^ Math.imul(salt | 0, 2654435761)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/* A 2026-USD anchor in this country's money, priced for `year`. */
export function fortuneLocal(S, usd2026, year = S.year) {
  const local2026 = usd2026 * usdRate(S.country, 2026);
  return eraLocalCost(local2026, S.country, year);
}

export function hasFortune(S) { return !!S && FORTUNE_TIERS.includes(S.familyTier); }

const SECTORS = ['trading and logistics', 'manufacturing', 'real estate and construction', 'retail and distribution', 'food and agriculture', 'shipping', 'financial services'];

function aliveSiblings(S) { return (S.relations?.siblingIds || []).filter(id => S.people?.[id]?.alive); }
function siblingCount(S) { return aliveSiblings(S).length; }

/* Estate model. netWorthLocal = company (whole, at 100%) + cash fund + other assets. Owners of the company are tracked separately and always sum to 100%. */
function sync(f) { f.netWorthLocal = Math.max(0, Math.round((f.companyLocal || 0) + (f.fundLocal || 0) + (f.otherLocal || 0))); return f; }
/* Cash leaves the estate (a gift, a fee, a dividend, an inheritance paid out). */
function spend(f, amount) { f.fundLocal = Math.max(0, f.fundLocal - amount); sync(f); }
/* Value earmarked or handed over comes from other assets first, then cash. */
function takeFromEstate(f, amount) { const o = Math.min(f.otherLocal, amount); f.otherLocal -= o; const rest = amount - o; if (rest > 0) f.fundLocal = Math.max(0, f.fundLocal - rest); sync(f); return amount; }
function ownSum(f) { return Math.round(((f.own.parents || 0) + (f.own.pool || 0) + (f.own.player || 0) + (f.own.heirs || 0) + Object.values(f.own.siblings || {}).reduce((a, b) => a + b, 0)) * 1e6) / 1e6; }

function perChildTrustCapPct(S) {
  const children = 1 + siblingCount(S);
  return Math.min(DIALS.trustPerChildCapPct, DIALS.trustAllChildrenCapPct / children);
}

/* A fortune saved before the estate split gets its parts derived once from the total, with owners summing to 100%. */
function upgradeEstate(S, f) {
  if (f.companyLocal != null && f.own) return f;
  const c = DIALS.companyShareOfNetWorth[f.tier] || 0;
  const nw = f.netWorthLocal || 0;
  f.companyLocal = Math.round(nw * c); f.otherLocal = Math.max(0, nw - f.companyLocal - (f.fundLocal || 0));
  const sibs = aliveSiblings(S).length, p = f.shares?.pct || 0;
  const own = { parents: 0, pool: 0, player: p, siblings: {}, heirs: 0 };
  if (f.company) { for (const id of aliveSiblings(S)) if (p) own.siblings[id] = p; own.pool = f.shares ? Math.max(0, 20 - p * (1 + sibs)) : 20; }
  const rest = Math.max(0, 100 - own.pool - p - Object.values(own.siblings).reduce((a, b) => a + b, 0));
  if (f.inherited) own.heirs = rest; else own.parents = rest;
  if (!f.company) { own.parents = f.inherited ? 0 : 100; own.heirs = f.inherited ? 100 : 0; own.pool = 0; own.player = 0; own.siblings = {}; }
  f.own = own; sync(f);
  return f;
}

/* Create the fortune the first time it is needed (new life or an existing save). */
export function ensureFamilyFortune(S) {
  if (!hasFortune(S)) return null;
  if (S.familyFortune && S.familyFortune.schemaVersion === 1) return upgradeEstate(S, S.familyFortune);
  const tier = S.familyTier, a = ANCHORS[tier], year = S.year;
  const jitter = 0.8 + hash01(S, 11) * 0.45;
  const dad = S.relations?.fatherId ? S.people?.[S.relations.fatherId] : null;
  const surname = (dad?.fullName || S.player?.fullName || 'Family').split(' ').slice(-1)[0];
  const sector = SECTORS[Math.floor(hash01(S, 5) * SECTORS.length)];
  const foreign = ['usa', 'gbr', 'deu', 'uae', 'sau', 'can', 'egy', 'tur'].filter(c => c !== S.country);
  const siteCount = tier === 'very_wealthy' ? 2 + Math.floor(hash01(S, 7) * 4) : tier === 'wealthy' ? 1 : 0;
  const sites = [{ country: S.country, shareOfProfit: 1 }];
  for (let i = 1; i < siteCount; i++) sites.push({ country: foreign[Math.floor(hash01(S, 20 + i) * foreign.length)], shareOfProfit: 0 });
  const w = 1 / sites.length; sites.forEach(s => { s.shareOfProfit = Math.round(w * 100) / 100; });
  const f = S.familyFortune = {
    schemaVersion: 1,
    tier,
    netWorthLocal: 0,
    fundLocal: Math.round(fortuneLocal(S, a.fund * jitter, year)),
    yearlyInflowLocal: Math.round(fortuneLocal(S, a.inflow * jitter, year)),
    baseInflowLocal: Math.round(fortuneLocal(S, a.inflow * jitter, year)),
    company: tier === 'upper_middle' ? null : { name: `${surname} ${tier === 'very_wealthy' ? 'Group' : 'Trading'}`, sector, sites, holdingGroup: tier === 'very_wealthy' },
    trust: { fundedLocal: 0, released: { at18: false, at21: false, at25: false } },
    childrenPoolPct: 20,
    own: { parents: tier === 'upper_middle' ? 100 : 80, pool: tier === 'upper_middle' ? 0 : 20, player: 0, siblings: {}, heirs: 0 },
    grants: [],
    yearGifts: 0,
    lastAskIndex: null,
    lastTickYear: year,
    lastYearSwing: 0,
    carGifted: false,
    homeGifted: false,
    shares: null,
    dividendsPaid: 0,
    inherited: false
  };
  { const nw = Math.round(fortuneLocal(S, a.netWorth * jitter, year)); const c = DIALS.companyShareOfNetWorth[tier] || 0; f.companyLocal = Math.round(nw * c); f.otherLocal = Math.max(0, nw - f.companyLocal - f.fundLocal); sync(f); }
  /* An existing life gets the one computed at-18 release, not backfilled years. */
  const age = S.player?.age ?? 0;
  if (age >= 18) {
    /* Pro-rated: the trust the family would have funded by 18, carved out of the estate once. Only the stages the player has already reached are paid. */
    const full = Math.round(f.netWorthLocal * perChildTrustCapPct(S) * 0.9);
    f.trust.fundedLocal = full;
    takeFromEstate(f, full);
    f.carGifted = true; f.homeGifted = true; f.inherited = (S.relations?.motherId ? !S.people?.[S.relations.motherId]?.alive : true) && (S.relations?.fatherId ? !S.people?.[S.relations.fatherId]?.alive : true); /* no retroactive gifts for an existing save */
    recordJournal(S, 'Your family fortune is now tracked in the game. Gifts are not backdated: no car, trust stage or allowance is added for years already lived, only the trust stages you have already reached are paid once.', 'money');
    for (const [releaseAge, share] of DIALS.trustRelease) {
      if (age >= releaseAge) releaseTrust(S, f, 'at' + releaseAge, share);
    }
  }
  return f;
}

function addGrant(f, S, kind, amountLocal, note) {
  f.grants.push({ year: S.year, kind, amountLocal: Math.round(amountLocal), note });
  if (f.grants.length > 120) f.grants.splice(0, f.grants.length - 120);
}

function releaseTrust(S, f, key, share) {
  if (f.trust.released[key]) return 0;
  f.trust.released[key] = true;
  if (f.trust.totalLocal == null) f.trust.totalLocal = f.trust.fundedLocal; /* shares apply to the amount funded by 18, not to what is left */
  const amount = Math.min(Math.round(f.trust.totalLocal * share), f.trust.fundedLocal);
  if (amount <= 0) return 0;
  f.trust.fundedLocal = Math.max(0, f.trust.fundedLocal - amount);
  walletMove(S, amount, 'Family trust release', 'family');
  addGrant(f, S, 'trust', amount, `${key.replace('at', 'At ')} release`);
  recordJournal(S, `A family trust set aside for you released ${formatMoney(amount, S.country)}. It was funded by the family over your childhood and is paid out in stages.`, 'money');
  return amount;
}

export function monthlyInflow(f) { return f.yearlyInflowLocal / 12; }

/* Gift totals are per calendar year, rolled by the year on the clock, so a charge made before the January tick lands in the right year. */
function giftRoom(f, S) {
  if (S && f.giftYear !== S.year) { f.yearGifts = 0; f.yearEducation = 0; f.yearUpkeep = 0; f.yearDividend = 0; f.giftYear = S.year; }
  return Math.max(0, f.yearlyInflowLocal * DIALS.annualGiftShareCap - f.yearGifts);
}

/* --- yearly tick (January) ---------------------------------------------- */
export function tickFamilyFortuneYearly(S) {
  const f = ensureFamilyFortune(S);
  if (!f) return;
  if (f.lastTickYear === S.year) return;
  const infl = inflationRate(S.country, S.year) / 100;
  const mkt = propertyMarketYear(S, S.country).realChange;          /* the same country-year housing shock the player's own property feels */
  const swingNW = (hash01(S, S.year * 3 + 1) - 0.45) * 0.07 + mkt * 0.6;
  /* Each part of the estate moves on its own: the company with the market and its own year, other assets with property, cash with deposit rates plus what the year's profit leaves behind. */
  const swing = (hash01(S, S.year * 3 + 2) - 0.42) * 0.5 + mkt * 1.5; /* company year: own result plus the shared economy */
  f.companyLocal = Math.max(0, Math.round((f.companyLocal || 0) * (1 + infl + swingNW)));
  f.otherLocal = Math.max(0, Math.round((f.otherLocal || 0) * (1 + infl + mkt)));
  f.baseInflowLocal = Math.round(f.baseInflowLocal * (1 + infl));
  f.yearlyInflowLocal = Math.max(Math.round(f.baseInflowLocal * 0.3), Math.round(f.baseInflowLocal * (1 + swing)));
  const dep = eraDepositRates(S.country, S.year).savings || 0;
  if (!f.inherited) f.fundLocal = Math.max(0, Math.round(f.fundLocal * (1 + dep) + f.yearlyInflowLocal * DIALS.fundRetention));
  /* Cash above the share the family keeps liquid is reinvested: it moves into other assets, so net worth does not change. */
  sync(f);
  { const keep = Math.round(f.netWorthLocal * DIALS.fundMaxShareOfNetWorth); if (f.fundLocal > keep) { f.otherLocal += f.fundLocal - keep; f.fundLocal = keep; } }
  sync(f);
  f.lastYearSwing = swing;
  if (f.giftYear !== S.year) { f.yearGifts = 0; f.yearEducation = 0; f.yearUpkeep = 0; f.yearDividend = 0; f.giftYear = S.year; } /* already rolled by an earlier charge this year */
  f.lastTickYear = S.year;
  const age = S.player?.age ?? 0;
  /* Trust funding each childhood year, within the per-child cap. */
  if (age < 18) {
    const cap = f.netWorthLocal * perChildTrustCapPct(S);
    const before = f.trust.fundedLocal;
    f.trust.fundedLocal = Math.round(Math.min(cap, before + f.netWorthLocal * DIALS.trustYearlyPct));
    takeFromEstate(f, f.trust.fundedLocal - before); /* trust money is earmarked outside the estate when it is set aside */
  }
  if (f.company && age < 40) {
    if (swing > 0.2) recordJournal(S, `${f.company.name} had a record year. The family fund is fuller, which shows in what the family can give.`, 'money');
    else if (swing < -0.15) recordJournal(S, `${f.company.name} had a tight year. The family is holding back on gifts until it recovers.`, 'money');
  }
  payDividends(S, swing);
  /* Trust releases at 18 / 21 / 25 */
  for (const [releaseAge, share] of DIALS.trustRelease) {
    const key = 'at' + releaseAge;
    if (age >= releaseAge && !f.trust.released[key]) releaseTrust(S, f, key, share);
  }
  giftBirthdayCar(S);
  offerFirstHome(S);
  grantServiceShares(S);
  settleSuccession(S);
}

/* The keys: a real owned car at the birthday, paid from the fund and counted in the annual gift share. */
export function giftBirthdayCar(S) {
  const f = ensureFamilyFortune(S);
  if (!f || f.carGifted) return null;
  const age = S.player?.age ?? 0;
  if (age < DIALS.carGiftAge || age > 25) return null;
  const pool = CARS_MEGA_CATALOG.filter(c => S.year >= c.yearFrom && S.year <= c.yearTo && !(f.tier !== 'very_wealthy' && c.priceUsd2026 > 120000));
  if (!pool.length) return null;
  const target = DIALS.carTargetUsd[f.tier];
  const ranked = pool.map(c => ({ c, d: Math.abs(Math.log(c.priceUsd2026 / target)) + hash01(S, c.id.length * 31 + c.priceUsd2026 % 97) * 0.05 })).sort((a, b) => a.d - b.d);
  const room = giftRoom(f, S);
  let pick = null, q = null;
  for (const { c } of ranked.slice(0, 40)) {
    const qq = showroomCarQuote(S, c.id, 'base');
    if (qq.ok && qq.fullPrice <= room && qq.fullPrice <= f.fundLocal) { pick = c; q = qq; break; }
  }
  if (!pick) return null; /* postponed: not enough room this year, tried again the next tick */
  f.carGifted = true;
  const ci = Math.floor(hash01(S, 41) * CAR_COLORS.length);
  f.carOffer = { catalogId: pick.id, fullPrice: q.fullPrice, monthlyUpkeep: q.monthlyUpkeep, trimLabel: q.trim.label, colorIdx: ci, age };
  queueScene(S, buildKeysScene(S), true);
  return f.carOffer;
}

/* --- company shares, dividends, succession ------------------------------ */
/* The company has its own valuation (f.companyLocal). Owners hold percentages that always sum to 100. */
function companyValue(f) { return f.companyLocal || 0; }
export function ownershipView(S) {
  const f = ensureFamilyFortune(S);
  if (!f?.own) return null;
  return { own: f.own, sum: ownSum(f), company: companyValue(f), stakeValue: pct => Math.round(companyValue(f) * (pct || 0) / 100) };
}
/* Service shares, yearly. Each living child who is of age and working that year earns 0.5-1% of the company from the children's pool, at most 10% per child. A child's own age counts, so later-born siblings start later. If the pool cannot cover a year, the shortfall is paid as a cash bonus. The player works when they hold a job; a sibling works by a fixed per-sibling-year draw. STAND-IN: this is not yet tied to a job inside the family company itself. */
const r6 = x => Math.round(x * 1e6) / 1e6;
export function grantServiceShares(S) {
  const f = ensureFamilyFortune(S);
  if (!f || !f.company || !f.own) return null;
  if (f.shareYear === S.year) return null;
  f.shareYear = S.year;
  const [lo, hi] = DIALS.sharesPctRange;
  const heirs = [];
  if ((S.player?.age ?? 0) >= DIALS.sharesGrantAge && S.career?.employed && S.career?.job) heirs.push({ id: 'player', salt: 61 });
  for (const id of aliveSiblings(S)) {
    const p = S.people[id];
    if ((p.age ?? 0) >= DIALS.sharesGrantAge && hash01(S, S.year * 13 + id.length * 7 + (p.age | 0) * 3 + 5) < 0.7) heirs.push({ id, salt: 71 });
  }
  /* Every qualifying child is treated the same way. All wants are worked out first, the pool is split in proportion if it cannot cover them, and each child's shortfall is paid as a cash bonus. */
  const rows = heirs.map(h => {
    const held = h.id === 'player' ? f.own.player : (f.own.siblings[h.id] || 0);
    const room = DIALS.sharesPerChildCapPct - held;
    const want = room > 0 ? Math.min(room, Math.round((lo + hash01(S, S.year * 17 + h.salt + h.id.length) * (hi - lo)) * 100) / 100) : 0;
    return { id: h.id, want, each: 0, short: 0 };
  }).filter(r => r.want > 0);
  const totalWant = rows.reduce((a, r) => a + r.want, 0);
  const pool = Math.floor(f.own.pool * 100) / 100;
  const scale = totalWant > pool ? pool / totalWant : 1;
  for (const r of rows) { r.each = Math.floor(r.want * scale * 100) / 100; r.short = Math.round((r.want - r.each) * 100) / 100; }
  let granted = null;
  for (const r of rows) {
    if (r.each > 0) {
      f.own.pool = r6(f.own.pool - r.each);
      if (r.id === 'player') f.own.player = r6(f.own.player + r.each); else f.own.siblings[r.id] = r6((f.own.siblings[r.id] || 0) + r.each);
    }
    if (r.id === 'player') {
      f.workYears = (f.workYears || 0) + 1;
      if (r.each > 0) { addGrant(f, S, 'shares', Math.round(companyValue(f) * r.each / 100), `${r.each}% of ${f.company.name}`); recordJournal(S, `A year of work earned you ${r.each}% of ${f.company.name}. The family gives service shares to children who work, up to ${DIALS.sharesPerChildCapPct}% each.`, 'family'); granted = f.own.player; }
    }
  }
  /* Cash bonuses for the shortfall: the same rule for every child, from the fund, scaled equally if the fund cannot cover them all. */
  const owed = rows.filter(r => r.short > 0).map(r => ({ ...r, cash: Math.round(r.short * companyValue(f) / 100) }));
  const totalOwed = owed.reduce((a, r) => a + r.cash, 0);
  if (totalOwed > 0 && f.fundLocal > 0 && !f.inherited) {
    const k = Math.min(1, Math.floor(f.fundLocal) / totalOwed);
    f.bonusesPaid = f.bonusesPaid || {};
    for (const r of owed) {
      const bonus = Math.floor(r.cash * k);
      if (bonus <= 0) continue;
      spend(f, bonus);
      if (r.id === 'player') { walletMove(S, bonus, `Cash bonus from ${f.company.name}`, 'family'); addGrant(f, S, 'bonus', bonus, 'the share pool was used up'); recordJournal(S, `The shares set aside for the children are used up, so ${f.company.name} paid you a cash bonus of ${formatMoney(bonus, S.country)} instead.`, 'money'); }
      else { const p = S.people[r.id]; p.career = p.career || {}; p.career.savingsLocal = (Number(p.career.savingsLocal) || 0) + Math.round(convertCurrency(bonus, S.country, p.residenceCountry || S.country, S.year)); }
      f.bonusesPaid[r.id] = (f.bonusesPaid[r.id] || 0) + bonus;
    }
  }
  if (granted != null) f.shares = { pct: f.own.player, since: f.shares?.since || S.year };
  else if (!f.shares && f.own.player > 0) f.shares = { pct: f.own.player, since: S.year };
  return f.shares;
}
/* Dividends: one profit stream. The company's yearly distribution is its value x yield, cut in a losing year, and never more than a set share of the year's modelled inflow (its actual profit). Every owner who holds shares gets their percentage of it: the player to their wallet, each living sibling to their savings. Parents' and pool shares are not paid out. While the parents are alive it comes out of the family fund (their cash); after the estate is settled it is the company's own profit. */
export function payDividends(S, swing) {
  const f = S.familyFortune;
  if (!f?.own || !f.company) return 0;
  const holders = [];
  if (f.own.player > 0) holders.push({ id: 'player', pct: f.own.player });
  for (const id of aliveSiblings(S)) if ((f.own.siblings[id] || 0) > 0) holders.push({ id, pct: f.own.siblings[id] });
  if (!holders.length) return 0;
  const good = swing >= 0 ? 1 : Math.max(0, 1 + swing * 2);
  const cap = Math.round(f.yearlyInflowLocal * DIALS.dividendCapPctOfInflow);
  let rows = holders.map(h => ({ ...h, amt: Math.round(companyValue(f) * h.pct / 100 * DIALS.dividendYield * good) }));
  let total = rows.reduce((a, r) => a + r.amt, 0);
  const limit = f.inherited ? cap : Math.min(cap, Math.round(f.fundLocal));
  if (total > limit) { const k = limit / total; rows = rows.map(r => ({ ...r, amt: Math.floor(r.amt * k) })); total = rows.reduce((a, r) => a + r.amt, 0); }
  if (total <= 0) return 0;
  if (!f.inherited) spend(f, total);
  f.dividendsOut = (f.dividendsOut || 0) + total;
  let mine = 0;
  for (const r of rows) {
    if (r.amt <= 0) continue;
    if (r.id === 'player') { mine = r.amt; walletMove(S, r.amt, `Dividend from ${f.company.name}`, 'family'); }
    else { const p = S.people[r.id]; p.career = p.career || {}; p.career.savingsLocal = (Number(p.career.savingsLocal) || 0) + Math.round(convertCurrency(r.amt, S.country, p.residenceCountry || S.country, S.year)); }
  }
  f.lastDividend = { total, rows: rows.map(r => ({ id: r.id, amt: r.amt })), limit, fromFund: !f.inherited };
  if (mine > 0) {
    f.dividendsPaid = (f.dividendsPaid || 0) + mine; f.yearDividend = mine;
    addGrant(f, S, 'dividend', mine, f.company.name);
    recordJournal(S, `${f.company.name} paid you a dividend of ${formatMoney(mine, S.country)}.`, 'money');
  }
  return mine;
}

/* Succession, once, when both parents are gone. Everything the parents held passes to the living children (you and your living siblings), equally:
   - the company stake moves as ownership, the company value is untouched;
   - the cash fund and the other assets (properties, investments) are valued, the game's estate tax rule is applied to the whole estate (the same rule the player's own estate uses; only some countries levy it), the tax is paid out of the cash and assets, and the rest is paid out equally. You get your part as cash; each sibling's part is added to their own savings.
   What is left in the family afterwards is the company, owned by the children. */
export function settleSuccession(S) {
  const f = S.familyFortune;
  if (!f || f.inherited) return null;
  const alive = id => !!id && !!S.people?.[id]?.alive;
  if (alive(S.relations?.motherId) || alive(S.relations?.fatherId)) return null;
  if (!S.relations?.motherId && !S.relations?.fatherId) return null;
  f.inherited = true;
  const sibs = aliveSiblings(S);
  const n = 1 + sibs.length;
  const before = { nw: f.netWorthLocal, company: f.companyLocal, other: f.otherLocal, fund: f.fundLocal, own: ownSum(f) };
  const passing = f.own.parents + f.own.heirs;
  const stakeEach = r6(passing / n);
  const stakeValueAll = Math.round(companyValue(f) * passing / 100);
  if (f.company) {
    f.own.parents = 0; f.own.heirs = 0;
    f.own.player = r6(f.own.player + stakeEach);
    for (const id of sibs) f.own.siblings[id] = r6((f.own.siblings[id] || 0) + stakeEach);
    f.own.player = r6(f.own.player + (100 - ownSum(f))); /* rounding remainder goes to you, never lost */
    /* what is left in the children's pool is shared equally too */
    if (f.own.pool > 0) { const each = r6(f.own.pool / n); f.own.pool = 0; f.own.player = r6(f.own.player + each); for (const id of sibs) f.own.siblings[id] = r6((f.own.siblings[id] || 0) + each); f.own.player = r6(f.own.player + (100 - ownSum(f))); }
    f.shares = { pct: f.own.player, since: f.shares?.since || S.year };
  }
  const cashAssets = Math.max(0, Math.round(f.fundLocal + f.otherLocal));
  const plan = estateChargePlan({ ...S, willPlan: { charityPct: 0 } }, cashAssets + stakeValueAll, []);
  const tax = Math.min(plan.tax || 0, cashAssets);
  const payable = cashAssets - tax;
  const each = Math.floor(payable / n);
  const out = each * n;
  f.fundLocal = 0; f.otherLocal = 0; sync(f);
  f.taxPaid = tax;
  const per = [];
  for (const id of sibs) { const p = S.people[id]; p.career = p.career || {}; const cur = p.residenceCountry || S.country; const amt = Math.round(convertCurrency(each, S.country, cur, S.year)); p.career.savingsLocal = (Number(p.career.savingsLocal) || 0) + amt; per.push({ id, amount: amt }); }
  if (each > 0) walletMove(S, each, 'Inheritance from your parents', 'family');
  const stakeValue = Math.round(companyValue(f) * stakeEach / 100);
  addGrant(f, S, 'inheritance', each + stakeValue, `split with ${sibs.length} sibling${sibs.length === 1 ? '' : 's'}`);
  f.lastSuccession = { before, after: { nw: f.netWorthLocal, company: f.companyLocal, own: ownSum(f) }, cashAssets, tax, payout: out, cashOut: out, toSiblings: per, n, stakeEach, remainder: payable - out };
  recordJournal(S, `Your parents' estate was settled between ${n === 1 ? 'you' : n + ' of you'}. Properties and investments were sold. Your part: ${formatMoney(each, S.country)} in cash${f.company ? ` and ${stakeEach}% of ${f.company.name}, worth ${formatMoney(stakeValue, S.country)}` : ''}.${tax > 0 ? ` Estate tax of ${formatMoney(tax, S.country)} was paid first (a simplified game rule).` : ''}`, 'family');
  return { share: each + stakeValue, cash: each, stakePct: stakeEach };
}

/* First home: offered at 22 to wealthy and very_wealthy families. The family hands over a finished asset from the estate. */
export function offerFirstHome(S) {
  const f = ensureFamilyFortune(S);
  if (!f || f.homeGifted || f.tier === 'upper_middle') return null;
  const age = S.player?.age ?? 0;
  if (age < DIALS.homeGiftAge || age > 30) return null;
  const ceiling = f.netWorthLocal * DIALS.homeCapPctOfNetWorth * DIALS.homeAimShare[f.tier];
  const list = getHousingFor(S.country, S.year);
  const priced = list.map(h => ({ h, price: Math.round(eraLocalCost(h.price2026, S.country, S.year)) })).filter(x => x.price > 0 && x.price <= ceiling).sort((a, b) => b.price - a.price);
  if (!priced.length) return null;
  const top = priced[0];
  f.homeGifted = true;
  f.homeOffer = { catalogId: top.h.id, price: top.price, age };
  queueScene(S, buildHomeScene(S), true);
  return f.homeOffer;
}
export function buildHomeScene(S) {
  const f = S.familyFortune, o = f?.homeOffer;
  const h = o && getHousingFor(S.country, S.year).find(x => x.id === o.catalogId);
  if (!h) return null;
  return {
    key: 'family_home', category: 'family', title: 'A home of your own',
    text: `Your family has bought you ${h.name} (${formatMoney(o.price, S.country)}) and is putting it in your name. It comes out of the family estate, free and clear. You can move in, or keep living where you are and rent it out.`,
    choices: [
      { label: 'Move in', effect: st => resolveHome(st, 'live') },
      { label: 'Keep it as a rental', effect: st => resolveHome(st, 'rent') }
    ]
  };
}
export function restoreHomeScene(S, saved) {
  if (saved && saved.key === 'family_seed' && S.familyFortune?.seedOffer) return buildSeedScene(S);
  if (saved && saved.key === 'family_deposit' && S.familyFortune?.depositOffer) return buildDepositScene(S);
  return saved && saved.key === 'family_home' && S.familyFortune?.homeOffer ? buildHomeScene(S) : null;
}

/* --- Your own door: a seed gift when the player starts their own company (wealthy tiers) ---
   One time, the family backs it with cash from the fund. Declining costs nothing and changes no warmth. */
function seedAmount(S, f) {
  const usd = { upper_middle: [5e3, 10e3], wealthy: [50e3, 100e3], very_wealthy: [1e6, 5e6] }[f.tier];
  const x = usd[0] + hash01(S, 77) * (usd[1] - usd[0]);
  return Math.round(eraLocalCost(x, S.country, S.year));
}
export function offerSeedGift(S) {
  const f = ensureFamilyFortune(S);
  if (!f || f.seedDone || f.seedOffer) return null;
  if ((S.player?.age ?? 0) < 19 || !(S.career?.businesses || []).some(b => b && !b.dead)) return null;
  if (S.activeScene || (S.sceneQueue || []).length) return null; /* wait for a quiet month */
  const room = Math.round(f.fundLocal * 0.5);
  const amount = Math.min(seedAmount(S, f), room, Math.round(giftRoom(f, S) + 0));
  if (amount <= 0) return null;
  f.seedOffer = { amount, year: S.year };
  queueScene(S, buildSeedScene(S), true);
  return f.seedOffer;
}
export function buildSeedScene(S) {
  const f = S.familyFortune, o = f?.seedOffer;
  if (!o) return null;
  return {
    key: 'family_seed', category: 'family', title: 'Your own door',
    text: `You have started a company of your own. Your family hears about it and offers to back you with ${formatMoney(o.amount, S.country)} in seed money, a one-time gift from the family fund. It is yours, with no strings. Taking your own path changes nothing between you and them.`,
    choices: [
      { label: `Accept ${formatMoney(o.amount, S.country)} as seed money`, effect: st => resolveSeed(st, true) },
      { label: 'Thank them and do it on your own', effect: st => resolveSeed(st, false) }
    ]
  };
}
export function resolveSeed(S, take) {
  const f = S.familyFortune, o = f?.seedOffer;
  if (!o) return null;
  f.seedOffer = null; f.seedDone = true;
  if (!take) { recordJournal(S, 'You thanked your family for the offer and are building your company on your own. They are proud, and the door stays open.', 'family'); return { ok: true, taken: false }; }
  const amt = Math.min(o.amount, Math.round(f.fundLocal));
  if (amt <= 0) return { ok: false };
  giftRoom(f, S); spend(f, amt); f.yearGifts += amt;
  walletMove(S, amt, 'Seed gift from your family', 'family');
  addGrant(f, S, 'seed', amt, 'seed money for your own company');
  recordJournal(S, `Your family put ${formatMoney(amt, S.country)} behind your own company. It is a gift, not a loan.`, 'family');
  return { ok: true, taken: true, amount: amt };
}

/* --- Upper middle: help with the deposit on a first home -----------------
   20-40% of the deposit-size price of an entry home, one time, between 24 and 30 and only while the player owns no property. */
export function offerDepositHelp(S) {
  const f = ensureFamilyFortune(S);
  if (!f || f.tier !== 'upper_middle' || f.depositDone || f.depositOffer) return null;
  const age = S.player?.age ?? 0;
  if (age < 24 || age > 30) return null;
  if ((S.housing?.properties || []).length) { f.depositDone = true; return null; }
  if (S.activeScene || (S.sceneQueue || []).length) return null;
  const list = getHousingFor(S.country, S.year).map(h => Math.round(eraLocalCost(h.price2026, S.country, S.year))).filter(x => x > 0).sort((a, b) => a - b);
  if (!list.length) return null;
  const entry = list[Math.floor(list.length * 0.25)];
  const pct = 0.2 + hash01(S, 83) * 0.2;
  const amount = Math.min(Math.round(entry * 0.2 * pct), Math.round(f.fundLocal * 0.25), Math.round(giftRoom(f, S)));
  if (amount <= 0) return null;
  f.depositOffer = { amount, entryPrice: entry, pct: Math.round(pct * 100), year: S.year };
  queueScene(S, buildDepositScene(S), true);
  return f.depositOffer;
}
export function buildDepositScene(S) {
  const f = S.familyFortune, o = f?.depositOffer;
  if (!o) return null;
  return {
    key: 'family_deposit', category: 'family', title: 'Help with a deposit',
    text: `Your parents know a first home is a big step. They offer ${formatMoney(o.amount, S.country)} toward the deposit, about ${o.pct}% of what a deposit would be on an entry-level home (around ${formatMoney(o.entryPrice, S.country)}). It is a gift from the family fund. You decide when and what to buy.`,
    choices: [
      { label: `Accept ${formatMoney(o.amount, S.country)} for a deposit`, effect: st => resolveDeposit(st, true) },
      { label: 'Not now, thank them', effect: st => resolveDeposit(st, false) }
    ]
  };
}
export function resolveDeposit(S, take) {
  const f = S.familyFortune, o = f?.depositOffer;
  if (!o) return null;
  f.depositOffer = null; f.depositDone = true;
  if (!take) { recordJournal(S, 'You thanked your parents and said you will save for the deposit yourself.', 'family'); return { ok: true, taken: false }; }
  const amt = Math.min(o.amount, Math.round(f.fundLocal));
  if (amt <= 0) return { ok: false };
  giftRoom(f, S); spend(f, amt); f.yearGifts += amt;
  walletMove(S, amt, 'Family help with a home deposit', 'family');
  addGrant(f, S, 'deposit', amt, 'toward a first home deposit');
  recordJournal(S, `Your parents gave you ${formatMoney(amt, S.country)} toward a home deposit.`, 'family');
  return { ok: true, taken: true, amount: amt };
}
export function resolveHome(S, how) {
  const f = S.familyFortune, o = f?.homeOffer;
  if (!o) return null;
  const h = getHousingFor(S.country, S.year).find(x => x.id === o.catalogId);
  f.homeOffer = null;
  if (!h) return null;
  takeFromEstate(f, o.price);
  const res = finalizePropertyPurchase(S, {
    catalogId: h.id, name: h.name, country: S.country, city: h.city, tier: h.tier, rooms: h.rooms,
    nativeValue: o.price, nativeMonthlyRent: Math.round(eraLocalCost(h.monthlyRent2026 || 0, S.country, S.year)),
    downInPlayerLocal: 0, happinessBoost: (h.happinessBoost || 4) + 4
  }, null, { moveIn: how === 'live', gift: true });
  if (!res.ok) return res;
  res.prop.gifted = true;
  addGrant(f, S, 'home', o.price, h.name);
  recordJournal(S, `Your family put ${h.name} (${formatMoney(o.price, S.country)}) in your name. ${how === 'live' ? 'You moved in.' : 'You are keeping it as a rental.'}`, 'family');
  return res;
}

/* The keys: one real choice. The offer lives in state, so a reload rebuilds the same decision. */
export function buildKeysScene(S) {
  const f = S.familyFortune, o = f?.carOffer;
  if (!o) return null;
  const pick = CARS_MEGA_CATALOG.find(c => c.id === o.catalogId);
  if (!pick) return null;
  const name = `${pick.brandName} ${pick.model}`;
  const covered = f.tier === 'very_wealthy';
  const choices = [{ label: `Take the ${name}`, effect: st => resolveKeys(st, 'car') }];
  if (!o.asked) choices.push({ label: 'Ask for a better car', effect: st => resolveKeys(st, 'ask') });
  return {
    key: 'family_keys', category: 'family', title: 'The keys',
    text: `For your ${o.age}th birthday your family has chosen a ${name} for you (${formatMoney(o.fullPrice, S.country)}). ${covered ? 'The family would also cover its running costs while you keep it.' : 'Running costs would be yours.'} ${o.asked ? 'You already asked once, so this is the car on offer.' : `You can take it, or ask for a better one. They may agree or say no, and if they say no the ${name} stays on offer.`}`,
    choices
  };
}
export function restoreKeysScene(S, saved) {
  return saved && saved.key === 'family_keys' && S.familyFortune?.carOffer ? buildKeysScene(S) : null;
}

/* Asking for more: a pricier car, granted or refused by what the family can spare and how close you are. One ask, no warmth cost either way. */
function parentWarmth(S) {
  let best = 0;
  for (const id of [S.relations?.fatherId, S.relations?.motherId]) {
    const p = id && S.people?.[id];
    if (p && p.alive && p.rel) best = Math.max(best, ((p.rel.affection || 0) + (p.rel.trust || 0)) / 200);
  }
  return Math.min(1, Math.max(0, best));
}
function betterCarQuote(S, f, o) {
  const pool = CARS_MEGA_CATALOG.filter(c => S.year >= c.yearFrom && S.year <= c.yearTo && !(f.tier !== 'very_wealthy' && c.priceUsd2026 > 160000));
  const cur = CARS_MEGA_CATALOG.find(c => c.id === o.catalogId);
  const target = (cur?.priceUsd2026 || DIALS.carTargetUsd[f.tier]) * 1.8;
  const ranked = pool.filter(c => c.priceUsd2026 > (cur?.priceUsd2026 || 0) * 1.3).map(c => ({ c, d: Math.abs(Math.log(c.priceUsd2026 / target)) })).sort((a, b) => a.d - b.d);
  for (const { c } of ranked.slice(0, 30)) {
    const q = showroomCarQuote(S, c.id, 'base');
    if (q.ok) return { car: c, q };
  }
  return null;
}
export function resolveKeys(S, how) {
  const f = S.familyFortune, o = f?.carOffer;
  if (!o) return null;
  let chosen = CARS_MEGA_CATALOG.find(c => c.id === o.catalogId);
  let price = o.fullPrice, upkeep = o.monthlyUpkeep, trim = o.trimLabel;
  if (how === 'ask' && !o.asked) {
    const better = betterCarQuote(S, f, o);
    const room = Math.min(giftRoom(f, S), f.fundLocal);
    const warmth = parentWarmth(S);
    const afford = better && better.q.fullPrice <= room;
    const prob = afford ? Math.min(0.85, 0.25 + 0.6 * warmth) : 0;
    const agreed = !!better && hash01(S, 77) < prob;
    if (agreed) {
      chosen = better.car; price = better.q.fullPrice; upkeep = better.q.monthlyUpkeep; trim = better.q.trim.label;
      recordJournal(S, `You asked your family for something better than the car they picked. They agreed: a ${better.car.brandName} ${better.car.model}.`, 'family');
    } else {
      recordJournal(S, `You asked your family for something better than the car they picked. ${!better || !afford ? 'They said it was too much this year' : 'They said no'}, and the first car stays on offer. Asking did not change how they feel about you.`, 'family');
      f.carOffer = { ...o, asked: true };
      queueScene(S, buildKeysScene(S), true); /* the original offer comes back, one ask used */
      return { how, agreed: false };
    }
  }
  f.carOffer = null;
  price = Math.min(price, Math.round(f.fundLocal));
  spend(f, price); f.yearGifts += price;
  const color = CAR_COLORS[o.colorIdx % CAR_COLORS.length] || { name: 'Midnight Blue', hex: '#1D3557' };
  const covered = f.tier === 'very_wealthy';
  const owned = {
    id: 'car_gift_' + S.year, catalogId: chosen.id, name: `${chosen.brandName} ${chosen.model}`, tier: chosen.tier, class: chosen.class, body: chosen.body,
    colorHex: color.hex || '#1D3557', colorName: color.label || color.name || 'Metallic', trimLabel: trim, mods: [],
    boughtYear: S.year, valueLocal: Math.round(price * 0.88), monthlyUpkeep: upkeep, condition: 100,
    gifted: true, familyCoversUpkeep: covered
  };
  S.cars.push(owned);
  addGrant(f, S, 'car', price, owned.name);
  recordJournal(S, `Your family gave you the keys to a ${owned.colorName} ${owned.name} (${formatMoney(price, S.country)}). ${covered ? 'The family also covers its running costs while you keep it.' : 'Running costs are yours.'}`, 'family');
  return { how, owned, agreed: how === 'ask' };
}

/* The three releases are checked every year; this also covers a birthday that lands mid-year. */
export function tickFamilyFortuneMonthly(S) {
  const f = ensureFamilyFortune(S);
  if (!f) return;
  offerSeedGift(S); offerDepositHelp(S);
  const age = S.player?.age ?? 0;
  for (const [releaseAge, share] of DIALS.trustRelease) {
    const key = 'at' + releaseAge;
    if (age >= releaseAge && !f.trust.released[key]) releaseTrust(S, f, key, share);
  }
  giftBirthdayCar(S);
  offerFirstHome(S);
  grantServiceShares(S);
  settleSuccession(S);
}

/* --- funded education ---------------------------------------------------- */
/* Admitted study (home, abroad or private) is paid from the fund and counts toward the annual gift share. Admission itself is never bought. */
export function fortuneEducationRoom(S) {
  const f = S.familyFortune?.schemaVersion === 1 ? S.familyFortune : null; /* never creates the fortune: the monthly tick does that, so a read can't pay out a trust */
  if (!f) return 0;
  return Math.max(0, Math.min(f.fundLocal, giftRoom(f, S)));
}
export function fortuneChargeEducation(S, amount) {
  const f = S.familyFortune?.schemaVersion === 1 ? S.familyFortune : null;
  if (!f || !(amount > 0) || fortuneEducationRoom(S) + 0.01 < amount) return false;
  spend(f, amount); f.yearGifts += amount; f.yearEducation = (f.yearEducation || 0) + amount;
  addGrant(f, S, 'education', amount, 'school or university fees');
  return true;
}

/* Running costs of a gifted car at very_wealthy are paid out of the fund each month. If the fund is short, the player pays. */
export function familyPaysCarUpkeep(S, amount) {
  const f = S.familyFortune?.schemaVersion === 1 ? S.familyFortune : null;
  if (!f || !(amount > 0) || f.fundLocal < amount) return false;
  spend(f, amount);
  f.yearUpkeep = (f.yearUpkeep || 0) + amount;
  return true;
}

/* --- allowance ----------------------------------------------------------- */
export function familyAllowanceMonthly(S) {
  const f = ensureFamilyFortune(S);
  if (!f) return null;
  const age = S.player?.age ?? 0;
  if (age < 6 || age >= 18) return 0;
  const dad = S.relations?.fatherId ? S.people?.[S.relations.fatherId] : null;
  const mom = S.relations?.motherId ? S.people?.[S.relations.motherId] : null;
  if (!((dad && dad.alive) || (mom && mom.alive))) return 0;
  const ramp = age >= 13 ? 1 : 0.4;
  return Math.max(0, Math.round(monthlyInflow(f) * DIALS.allowancePctOfMonthlyInflow[f.tier] * ramp));
}

/* Pay a year of allowance out of the fund. Returns the amount paid. */
export function payFamilyAllowanceYear(S) {
  const f = ensureFamilyFortune(S);
  if (!f) return null;
  const monthly = familyAllowanceMonthly(S);
  if (!(monthly > 0)) return 0;
  const room = giftRoom(f, S);
  const annual = Math.min(monthly * 12, f.fundLocal, room);
  if (annual <= 0) return 0;
  spend(f, annual); f.yearGifts += annual;
  walletMove(S, Math.round(annual), `Allowance from your parents (${formatMoney(monthly, S.country)}/month x 12)`, 'allowance');
  addGrant(f, S, 'allowance', annual, 'yearly allowance');
  return Math.round(annual);
}

/* --- asking a parent ----------------------------------------------------- */
export function isFortuneParent(S, p) {
  return !!p && hasFortune(S) && (p.id === S.relations?.fatherId || p.id === S.relations?.motherId);
}

export function askCeiling(S) {
  const f = ensureFamilyFortune(S);
  if (!f) return 0;
  const d = DIALS.askCeiling[f.tier];
  const base = d.of === 'fund' ? f.fundLocal : monthlyInflow(f);
  let v = Math.round(base * d.pct);
  /* Reconciled with main: upper_middle never gets less than the pre-wealth rule (1.5 x standard rent). */
  if (f.tier === 'upper_middle') {
    const c = getCountry(S.country);
    const rent = c?.monthlyBasket2026?.rentStandard;
    if (rent) v = Math.max(v, Math.round(eraLocalCost(rent * 1.5, S.country, S.year)));
  }
  return v;
}

/* What the ask screen shows before the player commits. */
export function askPreview(S, p) {
  const f = ensureFamilyFortune(S);
  if (!f) return null;
  const ceil = askCeiling(S);
  const idx = S.year * 12 + S.month;
  const cool = f.lastAskIndex != null && idx - f.lastAskIndex < DIALS.askCooldownMonths;
  return { low: Math.round(ceil * 0.5), high: ceil, cooldown: cool, monthsLeft: cool ? DIALS.askCooldownMonths - (idx - f.lastAskIndex) : 0 };
}

export function askFortuneParent(S, p) {
  const f = ensureFamilyFortune(S);
  if (!f || !isFortuneParent(S, p)) return null;
  if (S.player.age < 18) return { ok: false, msg: 'Your household already covers your childhood needs.' };
  const prev = askPreview(S, p);
  if (prev.cooldown) {
    return { ok: false, msg: `You asked ${p.firstName} recently. Wait about ${prev.monthsLeft} more month${prev.monthsLeft === 1 ? '' : 's'} before asking again.` };
  }
  const rel = p.rel || {}, tr = p.traits || {};
  const willingness = (rel.affection || 0) * 0.45 + (rel.trust || 0) * 0.35 + (tr.warmth || 0) * 0.25 - (rel.resentment || 0) * 0.6 - (tr.materialism || 0) * 0.2;
  const idx = S.year * 12 + S.month;
  f.lastAskIndex = idx; /* a heard ask starts the cooldown, granted or not */
  if (willingness < 45) {
    recordJournal(S, `You asked ${p.fullName} for money and it was not the right moment. Asking did not change how they feel about you.`, 'relationship');
    return { ok: false, msg: `${p.firstName} said no this time. It did not cost you anything with them.` };
  }
  const ceil = askCeiling(S);
  const frac = Math.max(0, Math.min(1, (willingness - 45) / 55));
  let amount = Math.round(ceil * (0.5 + 0.5 * frac));
  const room = giftRoom(f, S);
  if (amount > f.fundLocal) amount = Math.round(f.fundLocal);
  if (amount > room) amount = Math.round(room);
  if (amount <= 0) {
    recordJournal(S, `${p.fullName} could not help this time: the family fund is already committed for the year.`, 'relationship');
    return { ok: false, msg: `${p.firstName} cannot help right now: the family fund is committed for the year.` };
  }
  spend(f, amount); f.yearGifts += amount;
  walletMove(S, amount, `Help from ${p.fullName}`, 'family');
  addGrant(f, S, 'ask', amount, `asked ${p.firstName}`);
  recordJournal(S, `${p.fullName} gave you ${formatMoney(amount, S.country)} from the family fund.`, 'relationship');
  return { ok: true, msg: `${p.firstName} gave you ${formatMoney(amount, S.country)}.` };
}

/* --- ledger view model --------------------------------------------------- */
export function familyLedgerView(S) {
  const f = ensureFamilyFortune(S);
  if (!f) return null;
  const pf = Math.max(0.0001, eraLocalCost(1000, S.country, S.year) / 1000);
  const real = (n) => Math.round(n / pf); /* in 2026 money */
  return { f, real, allowance: familyAllowanceMonthly(S), ask: askPreview(S, null), askCeiling: askCeiling(S) };
}

export { DIALS as FORTUNE_DIALS };
