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
import { getHousingFor, getCarsForYear } from '../data/institutions.js';
import { finalizePropertyPurchase } from './economyEngine.js';
import { showroomCarQuote } from './completeLifeSystems.js';
import { hireIntoJob } from './careerEducationEngine.js';
import { syncSiblingCompanies } from './siblingCompanies.js';

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
function ownSum(f) { return Math.round(((f.own.outside || 0) + (f.own.parents || 0) + (f.own.pool || 0) + (f.own.player || 0) + (f.own.heirs || 0) + Object.values(f.own.siblings || {}).reduce((a, b) => a + b, 0)) * 1e6) / 1e6; }

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
  f.yearlyInflowLocal = f.company?.sold ? 0 : Math.max(Math.round(f.baseInflowLocal * 0.3), Math.round(f.baseInflowLocal * (1 + swing)));
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
  /* Record year / tight year: a real state that changes what the family gives, with the reason shown in the ledger. */
  f.yearState = null;
  if (f.company && !f.inherited && age >= 0) {
    if (swing > 0.2) {
      const roll = hash01(S, S.year * 5 + 9);
      const kind = roll < 0.4 ? 'allowance' : roll < 0.75 ? 'gift' : 'property';
      f.yearState = { year: S.year, kind: 'record', outcome: kind };
      recordJournal(S, `${f.company.name} had a record year. The fund is fuller.`, 'money');
      if (kind === 'gift' && age >= 18) {
        const amt = Math.min(Math.round(f.fundLocal * 0.004), Math.round(giftRoom(f, S)));
        if (amt > 0) { spend(f, amt); f.yearGifts += amt; walletMove(S, amt, 'Record-year gift from your family', 'family'); addGrant(f, S, 'gift', amt, `${f.company.name} record year`); recordJournal(S, `Because of the record year your family sent you a one-time gift of ${formatMoney(amt, S.country)}.`, 'money'); }
        else f.yearState.outcome = 'allowance';
      } else if (kind === 'gift') f.yearState.outcome = 'allowance';
      if (kind === 'property') {
        const buy = Math.round(f.fundLocal * 0.08); f.fundLocal -= buy; f.otherLocal += buy; sync(f);
        recordJournal(S, `The family put ${formatMoney(buy, S.country)} of the record-year profit into property. It stays in the family estate.`, 'money');
      }
      if (f.yearState.outcome === 'allowance') recordJournal(S, 'Because of the record year the family allowance is higher this year.', 'money');
    } else if (swing < -0.15) {
      f.yearState = { year: S.year, kind: 'tight' };
      recordJournal(S, `${f.company.name} had a tight year. This year the allowance is cut, asks are capped at half the usual amount and planned gifts wait until it recovers.`, 'money');
    }
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
  if (!f || f.carGifted || isTightYear(f, S)) return null; /* planned gifts wait out a tight year */
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
/* Summer stints are real time: in June, July and August the stint takes the free time, a small bounded happiness cost each month (-1, at most -3 a summer), the price of the early stake. */
export function stintSummerCost(S, f) {
  const w = f?.work, age = S.player?.age ?? 0;
  if (!w || !w.stint || age < 16 || age >= DIALS.sharesGrantAge || ![6, 7, 8].includes(S.month)) return 0;
  const key = S.year * 12 + S.month;
  if (w.costAbs === key) return 0;
  w.costAbs = key;
  if (S.player?.vitals) S.player.vitals.happiness = Math.max(0, Math.min(100, S.player.vitals.happiness - 1));
  if (S.month === 6) recordJournal(S, `Your summer at ${f.company.name} begins. It takes your free time until the end of August.`, 'family');
  return 1;
}
export function checkWorkQuit(S, f) {
  const w = f?.work;
  if (!w || !w.fullSince) return;
  const atCompany = !!(S.career?.employed && S.career?.job?.employer === f.company?.name);
  if (atCompany) return;
  /* Accrued service is owed and vests once, now, for the months actually worked up to the month before leaving. No future grants. */
  const nowAbs = S.year * 12 + (S.month || 1);
  const from = Math.max(w.hiredAbs ?? nowAbs, (w.vestedThroughAbs ?? ((w.hiredAbs ?? nowAbs) - 1)) + 1);
  const months = Math.max(0, nowAbs - 1 - from + 1);
  let vested = 0;
  if (months > 0 && f.own && !f.inherited && (S.player?.age ?? 0) >= DIALS.sharesGrantAge) {
    const [lo, hi] = DIALS.sharesPctRange;
    const held = f.own.player;
    const want = Math.min(Math.max(0, DIALS.sharesPerChildCapPct - held), Math.round((lo + hash01(S, S.year * 19 + 3) * (hi - lo)) * (months / 12) * 100) / 100);
    const each = Math.min(want, Math.floor(f.own.pool * 100) / 100);
    if (each > 0) { f.own.pool = r6(f.own.pool - each); f.own.player = r6(f.own.player + each); addGrant(f, S, 'shares', Math.round(companyValue(f) * each / 100), `${each}% of ${f.company.name}, service up to leaving`); vested = each; f.shares = { pct: f.own.player, since: f.shares?.since || S.year }; }
    const short = Math.round((want - each) * 100) / 100;
    if (short > 0 && f.fundLocal > 0) { const bonus = Math.min(Math.round(short * companyValue(f) / 100), Math.round(f.fundLocal)); if (bonus > 0) { spend(f, bonus); walletMove(S, bonus, `Cash bonus from ${f.company.name}`, 'family'); addGrant(f, S, 'bonus', bonus, 'the share pool was used up'); } }
  }
  w.vestedThroughAbs = nowAbs - 1;
  w.fullSince = null; w.hiredAbs = null; w.quitYear = S.year; w.askedFull = Math.min(w.askedFull || 0, 1); w.lastAskYear = S.year;
  recordJournal(S, `You left ${f.company.name}.${vested > 0 ? ` The service you had completed was vested once: ${vested}% of the company.` : ''} Service shares stop from here, and the door stays open: your family may offer a place again.`, 'family');
}
const r6 = x => Math.round(x * 1e6) / 1e6;
export function grantServiceShares(S) {
  const f = ensureFamilyFortune(S);
  if (!f || !f.company || !f.own) return null;
  if (f.inherited) return null; /* the pool was shared out at succession: no grant path, so no work year is counted */
  if (f.shareYear === S.year) return null;
  f.shareYear = S.year;
  const [lo, hi] = DIALS.sharesPctRange;
  const heirs = [];
  /* The player earns shares only for real work in the family company: a full-time post there (hired through "A place at the table"), or, before 21, summer stints (half rate). */
  /* Service years are paid for completed work: the grant for year Y covers the months actually worked in year Y-1, so a late-year hire gets a prorated slice, not a full year. Quitting ends the work and re-opens the door. */
  { const w = f.work || (f.work = { stint: false, fullSince: null, askedStint: false, askedFull: 0 }), age = S.player?.age ?? 0;
    const atCompany = !!(S.career?.employed && S.career?.job?.employer === f.company.name);
    checkWorkQuit(S, f);
    const lastYearStart = (S.year - 1) * 12 + 1, lastYearEnd = (S.year - 1) * 12 + 12;
    if (age >= DIALS.sharesGrantAge && w.fullSince && atCompany && w.hiredAbs != null) {
      /* months of completed service not yet vested, up to the end of last year */
      const from = Math.max(w.hiredAbs, (w.vestedThroughAbs ?? (w.hiredAbs - 1)) + 1);
      const n = Math.max(0, lastYearEnd - from + 1);
      if (n > 0) heirs.push({ id: 'player', salt: 61, rate: n / 12, months: n, vestMonths: n });
    } else if (age >= 16 && age < DIALS.sharesGrantAge && w.stint && w.stintAbs != null && w.stintAbs <= lastYearStart + 5 && (w.stintVestedYear ?? 0) < S.year - 1) {
      /* the summer of last year was worked and is complete: brief event 2, small early shares at half rate */
      heirs.push({ id: 'player', salt: 61, rate: 0.5, months: 12, stintSummer: S.year - 1 });
    } }
  for (const id of aliveSiblings(S)) {
    const p = S.people[id];
    if ((p.age ?? 0) >= DIALS.sharesGrantAge && hash01(S, S.year * 13 + id.length * 7 + (p.age | 0) * 3 + 5) < 0.7) heirs.push({ id, salt: 71 });
  }
  /* Every qualifying child is treated the same way. All wants are worked out first, the pool is split in proportion if it cannot cover them, and each child's shortfall is paid as a cash bonus. */
  const rows = heirs.map(h => {
    const held = h.id === 'player' ? f.own.player : (f.own.siblings[h.id] || 0);
    const room = DIALS.sharesPerChildCapPct - held;
    const want = room > 0 ? Math.min(room, Math.round((lo + hash01(S, S.year * 17 + h.salt + h.id.length) * (hi - lo)) * 100) / 100) : 0;
    return { id: h.id, want: Math.round(want * (h.rate || 1) * 100) / 100, each: 0, short: 0 };
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
      const hr = heirs.find(h => h.id === 'player');
      if (hr?.vestMonths) f.work.vestedThroughAbs = Math.max(f.work.vestedThroughAbs ?? 0, (S.year - 1) * 12 + 12);
      if (hr?.stintSummer) f.work.stintVestedYear = hr.stintSummer;
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
  for (const id of Object.keys(f.own.siblings || {})) if ((f.own.siblings[id] || 0) > 0 && S.people?.[id]?.alive) holders.push({ id, pct: f.own.siblings[id] });
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
  if (f.company && sibs.length && !f.successionTalkDone) { f.successionTalk = { year: S.year }; redistributeDeadStakes(S, f); deliverSuccessionTalk(S, f); }
  return { share: each + stakeValue, cash: each, stakePct: stakeEach };
}

/* First home: offered at 22 to wealthy and very_wealthy families. The family hands over a finished asset from the estate. */
export function offerFirstHome(S) {
  const f = ensureFamilyFortune(S);
  if (!f || f.homeGifted || f.tier === 'upper_middle' || isTightYear(f, S)) return null;
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
  if (saved && saved.key === 'family_place' && S.familyFortune?.placeOffer) return buildPlaceScene(S);
  if (saved && saved.key === 'family_seed' && S.familyFortune?.seedOffer) return buildSeedScene(S);
  if (saved && saved.key === 'family_intro' && S.familyFortune?.introOffer) return buildIntroScene(S);
  if (saved && saved.key === 'family_wedding' && S.familyFortune?.weddingOffer) return buildWeddingScene(S);
  if (saved && saved.key === 'family_deposit' && S.familyFortune?.depositOffer) return buildDepositScene(S);
  if (saved && saved.key === 'family_bigask' && S.familyFortune?.bigAskOffer) return buildBigAskScene(S);
  if (saved && saved.key === 'family_venture' && S.familyFortune?.ventureOffer) return buildVentureScene(S);
  if (saved && saved.key === 'family_succession' && S.familyFortune?.successionTalk) return buildSuccessionScene(S);
  if (saved && saved.key === 'family_intern' && S.familyFortune?.internOffer) return buildInternScene(S);
  if (saved && saved.key === 'family_intern_offer' && S.familyFortune?.internConvert) return buildInternConvertScene(S);
  return saved && saved.key === 'family_home' && S.familyFortune?.homeOffer ? buildHomeScene(S) : null;
}

/* --- A place at the table: the family company as real work --------------
   16-20: spend summers there (a small early stake, less free time). 21+: a full-time post in the family company when the player has no job. Shares only follow actual work there. Declining costs nothing and the door stays open. */
function companyPost(S, f) {
  const usd = f.tier === 'very_wealthy' ? 110e3 : 65e3;
  const gross = Math.round(eraLocalCost(usd, S.country, S.year) / 12);
  return { employer: f.company.name, title: f.tier === 'very_wealthy' ? 'Associate, Group Strategy' : 'Management Trainee', track: 'business', level: 1, monthlyGross: gross, id: 'family_company_post' };
}
export function offerPlaceAtTable(S) {
  const f = ensureFamilyFortune(S);
  if (!f || !f.company || f.inherited || f.placeOffer) return null;
  if (S.activeScene || (S.sceneQueue || []).length) return null;
  f.work = f.work || { stint: false, fullSince: null, askedStint: false, askedFull: 0 };
  const age = S.player?.age ?? 0;
  let kind = null;
  if (age >= 16 && age < 21 && !f.work.askedStint) kind = 'stint';
  else if (age >= 21 && age <= 35 && !f.work.fullSince && f.work.askedFull < 2 && !(S.career?.employed && S.career?.job) && !S.education?.university && (f.work.lastAskYear == null || S.year - f.work.lastAskYear >= 4)) kind = 'full';
  if (!kind) return null;
  f.placeOffer = { kind, year: S.year };
  queueScene(S, buildPlaceScene(S), true);
  return f.placeOffer;
}
export function buildPlaceScene(S) {
  const f = S.familyFortune, o = f?.placeOffer;
  if (!o) return null;
  const co = f.company.name;
  if (o.kind === 'stint') return {
    key: 'family_place', category: 'family', title: 'A place at the table',
    text: `Your parents invite you to spend your summers learning ${co}: the warehouse, the books, the people. It means less free time, and you would earn a small early stake in the company for the work. You can say no without any cost. The door stays open.`,
    choices: [
      { label: 'Spend the summers at the company', effect: st => resolvePlace(st, true) },
      { label: 'Not now', effect: st => resolvePlace(st, false) }
    ]
  };
  const post = companyPost(S, f);
  return {
    key: 'family_place', category: 'family', title: 'A place at the table',
    text: `Your family offers you a real job at ${co}: ${post.title}, ${formatMoney(post.monthlyGross, S.country)} a month gross. You would earn service shares for every year you work there. It is your choice, and saying no costs nothing between you.`,
    choices: [
      { label: `Join ${co} as ${post.title}`, effect: st => resolvePlace(st, true) },
      { label: 'Keep building my own path', effect: st => resolvePlace(st, false) }
    ]
  };
}
export function resolvePlace(S, yes) {
  const f = S.familyFortune, o = f?.placeOffer;
  if (!o) return null;
  f.placeOffer = null; f.work = f.work || { stint: false, fullSince: null, askedStint: false, askedFull: 0 };
  if (o.kind === 'stint') {
    f.work.askedStint = true; f.work.stint = !!yes; if (yes) f.work.stintAbs = S.year * 12 + (S.month || 1);
    recordJournal(S, yes ? `You will spend your summers at ${f.company.name}. Each completed summer earns a small early stake. There is less free time.` : `You told your parents not now. The door at ${f.company.name} stays open.`, 'family');
    return { ok: true, taken: !!yes };
  }
  f.work.askedFull += 1; f.work.lastAskYear = S.year;
  if (!yes) { recordJournal(S, `You chose your own path. The door at ${f.company.name} stays open.`, 'family'); return { ok: true, taken: false }; }
  if (S.career?.employed && S.career?.job) { recordJournal(S, 'You took another job first, so the family post is not taken. The door stays open.', 'family'); return { ok: false, taken: false }; }
  hireIntoJob(S, companyPost(S, f), { partTimeOnly: false }, {});
  f.work.fullSince = S.year; f.work.hiredAbs = S.year * 12 + (S.month || 1); f.work.stint = false;
  recordJournal(S, `You joined ${f.company.name} full time. Each completed year you work there earns service shares, prorated by the months worked.`, 'career');
  return { ok: true, taken: true };
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
  if (!f || isTightYear(f, S) || f.seedDone || f.seedOffer || (f.seedRetryYear && S.year < f.seedRetryYear)) return null;
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
  f.seedOffer = null;
  if (!take) { f.seedDone = true; recordJournal(S, 'You thanked your family for the offer and are building your company on your own. They are proud, and the door stays open.', 'family'); return { ok: true, taken: false }; }
  /* Re-check both limits at the moment of acceptance: the fund and this year's gift room, so pending choices cannot stack past the cap. */
  const amt = Math.min(o.amount, Math.round(f.fundLocal), Math.round(giftRoom(f, S)));
  if (amt <= 0) { f.seedRetryYear = S.year + 1; recordJournal(S, 'Your family wanted to back your company, but they cannot give it this year: the fund is committed to other gifts or is too low. Nothing was paid. They will raise it again later.', 'family'); return { ok: false, taken: false, reason: 'no room' }; }
  if (amt < o.amount) recordJournal(S, `The family can give only part of what it offered this year: ${formatMoney(amt, S.country)} instead of ${formatMoney(o.amount, S.country)}.`, 'family');
  f.seedDone = true;
  spend(f, amt); f.yearGifts += amt;
  walletMove(S, amt, 'Seed gift from your family', 'family');
  addGrant(f, S, 'seed', amt, 'seed money for your own company');
  recordJournal(S, `Your family put ${formatMoney(amt, S.country)} behind your own company. It is a gift, not a loan.`, 'family');
  return { ok: true, taken: true, amount: amt };
}

/* --- Upper middle: help with the deposit on a first home -----------------
   20-40% of the deposit-size price of an entry home, one time, between 24 and 30 and only while the player owns no property. */
export function offerDepositHelp(S) {
  const f = ensureFamilyFortune(S);
  if (!f || isTightYear(f, S) || f.tier !== 'upper_middle' || f.depositDone || f.depositOffer || (f.depositRetryYear && S.year < f.depositRetryYear)) return null;
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
  f.depositOffer = { amount, entryPrice: entry, pct: Math.round(amount / (entry * 0.2) * 100), year: S.year }; /* shown share is the real amount over the real deposit, even when the fund caps it */
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
  f.depositOffer = null;
  if (!take) { f.depositDone = true; recordJournal(S, 'You thanked your parents and said you will save for the deposit yourself.', 'family'); return { ok: true, taken: false }; }
  const amt = Math.min(o.amount, Math.round(f.fundLocal), Math.round(giftRoom(f, S)));
  if (amt <= 0) { f.depositRetryYear = S.year + 1; recordJournal(S, 'Your parents wanted to help with a deposit, but they cannot this year: the family money is committed to other gifts or is too low. Nothing was paid. They will offer again if they can.', 'family'); return { ok: false, taken: false, reason: 'no room' }; }
  if (amt < o.amount) recordJournal(S, `Your parents can give only part of what they offered this year: ${formatMoney(amt, S.country)} instead of ${formatMoney(o.amount, S.country)}.`, 'family');
  f.depositDone = true;
  spend(f, amt); f.yearGifts += amt;
  walletMove(S, amt, 'Family help with a home deposit', 'family');
  addGrant(f, S, 'deposit', amt, 'toward a first home deposit');
  recordJournal(S, `Your parents gave you ${formatMoney(amt, S.country)} toward a home deposit.`, 'family');
  return { ok: true, taken: true, amount: amt };
}

/* --- The big ask (rare, adult): startup capital or a house -------------------
   Rare, tied to the player's real situation (no property -> a house; no company -> startup money). The answer is a real yes, part or no from the
   actual fund, this year's gift room, the tight-year state and the parent's real feelings, and the reason is shown. Asking never costs warmth. */
function bigAskParent(S) {
  const ids = [S.relations?.motherId, S.relations?.fatherId].filter(Boolean);
  return ids.map(id => S.people?.[id]).find(x => x && x.alive) || null;
}
function bigAskWant(S, f, kind) {
  if (kind === 'house') {
    const list = getHousingFor(S.country, S.year).map(h => Math.round(eraLocalCost(h.price2026, S.country, S.year))).filter(x => x > 0).sort((a, b) => a - b);
    if (!list.length) return 0;
    return Math.round(list[Math.floor(list.length * 0.4)] * 0.5);
  }
  const usd = { upper_middle: 25e3, wealthy: 250e3, very_wealthy: 5e6 }[f.tier] || 0;
  return Math.round(eraLocalCost(usd, S.country, S.year));
}
export function offerBigAsk(S) {
  const f = ensureFamilyFortune(S);
  if (!f || f.bigAskOffer) return null;
  const age = S.player?.age ?? 0;
  if (age < 24 || age > 45 || !bigAskParent(S)) return null;
  if (f.bigAskYear != null && S.year - f.bigAskYear < 4) return null;
  if (S.activeScene || (S.sceneQueue || []).length) return null;
  const hasProp = (S.housing?.properties || []).length > 0;
  const hasCo = (S.career?.businesses || []).some(b => b && !b.dead);
  const kind = !hasProp ? 'house' : (!hasCo ? 'startup' : null);
  if (!kind) return null;
  if (hash01(S, 191 + (S.month || 1)) > 0.03) return null; /* rare: about one month in thirty */
  const want = bigAskWant(S, f, kind);
  if (want <= 0) return null;
  f.bigAskOffer = { kind, want, year: S.year };
  queueScene(S, buildBigAskScene(S), true);
  return f.bigAskOffer;
}
export function buildBigAskScene(S) {
  const f = S.familyFortune, o = f?.bigAskOffer;
  if (!o) return null;
  const par = bigAskParent(S);
  const what = o.kind === 'house' ? `a house of your own. About ${formatMoney(o.want, S.country)} would make a real difference` : `a business of your own. About ${formatMoney(o.want, S.country)} would get it started`;
  return {
    key: 'family_bigask', category: 'family', title: 'A big question',
    text: `You have been thinking about ${what}. ${par ? par.firstName : 'Your parent'} would be the one to ask. It is a real question: the answer depends on what the family can spare this year and how ${par ? par.firstName : 'they'} feel${par ? 's' : ''} about it. Asking will not change how they see you.`,
    choices: [
      { label: `Ask for about ${formatMoney(o.want, S.country)}`, effect: st => resolveBigAsk(st, true) },
      { label: 'Not now', effect: st => resolveBigAsk(st, false) }
    ]
  };
}
export function resolveBigAsk(S, ask) {
  const f = S.familyFortune, o = f?.bigAskOffer;
  if (!o) return null;
  f.bigAskOffer = null;
  f.bigAskYear = S.year;
  if (!ask) { recordJournal(S, 'You decided not to bring it up with your family yet.', 'family'); return { ok: true, asked: false }; }
  const p = bigAskParent(S);
  const why = (msg) => { recordJournal(S, msg, 'family'); return { ok: false, asked: true, msg }; };
  if (!p) return why('There was no one to ask any more.');
  if (isTightYear(f, S)) return why(`${p.firstName} said it is a tight year for the family company and they cannot take on something this big now. Asking cost you nothing with them.`);
  const rel = p.rel || {}, tr = p.traits || {};
  const will = (rel.affection || 0) * 0.45 + (rel.trust || 0) * 0.35 + (tr.warmth || 0) * 0.25 - (rel.resentment || 0) * 0.6 - (tr.materialism || 0) * 0.2;
  if (will < 50) return why(`${p.firstName} listened and said no this time. It was about the request, not about you. Asking did not change how they feel.`);
  const share = Math.round(f.fundLocal * 0.2); /* no single ask takes more than a fifth of the fund */
  const room = Math.round(giftRoom(f, S));
  const amt = Math.min(o.want, share, room, Math.round(f.fundLocal));
  if (amt <= 0) return why(`${p.firstName} would like to help, but the family fund is committed to other gifts this year. Nothing was paid.`);
  spend(f, amt); f.yearGifts += amt;
  walletMove(S, amt, `Help from ${p.fullName} for ${o.kind === 'house' ? 'a house' : 'a business'}`, 'family');
  addGrant(f, S, 'bigask', amt, o.kind === 'house' ? 'toward a house' : 'startup capital');
  const full = amt >= o.want;
  const msg = full ? `${p.firstName} said yes and gave you ${formatMoney(amt, S.country)}.` : `${p.firstName} could give ${formatMoney(amt, S.country)} of the ${formatMoney(o.want, S.country)} you asked for. That is what the fund can spare without leaving the family short.`;
  recordJournal(S, msg, 'family');
  return { ok: true, asked: true, amount: amt, full, msg };
}

/* --- The sibling venture (18+): a brother or sister invites you to co-invest ------------
   Your own money goes in and is locked for three years. The outcome is shared and not promised (half back up to double, fixed when it matures).
   Working it together makes you closer either way. Passing changes nothing. */
const VENTURE_MONTHS = 36;
function ventureStake(S, f) {
  const cash = Number(S.money?.cash) || 0;
  const cap = Math.round(eraLocalCost({ upper_middle: 8e3, wealthy: 40e3, very_wealthy: 250e3 }[f.tier] || 0, S.country, S.year));
  return Math.min(Math.round(cash * 0.15), cap);
}
export function offerSiblingVenture(S) {
  const f = ensureFamilyFortune(S);
  if (!f || f.ventureOffer || f.venture) return null;
  const age = S.player?.age ?? 0;
  if (age < 20 || age > 45) return null;
  if (f.ventureYear != null && S.year - f.ventureYear < 4) return null;
  if (S.activeScene || (S.sceneQueue || []).length) return null;
  const sibs = aliveSiblings(S).filter(id => { const q = S.people[id]; return (q.birthYear != null ? S.year - q.birthYear : (q.age ?? 99)) >= 18; });
  if (!sibs.length || hash01(S, 233 + (S.month || 1)) > 0.03) return null;
  const sib = S.people[sibs[Math.floor(hash01(S, 239) * sibs.length)]];
  const stake = ventureStake(S, f);
  if (stake <= 0 || (Number(S.money?.cash) || 0) < stake * 3) return null; /* only offered when you can afford to lock it away */
  f.ventureOffer = { sibId: sib.id, stake, year: S.year };
  queueScene(S, buildVentureScene(S), true);
  return f.ventureOffer;
}
export function buildVentureScene(S) {
  const f = S.familyFortune, o = f?.ventureOffer;
  const sib = o && S.people?.[o.sibId];
  if (!sib) return null;
  return {
    key: 'family_venture', category: 'family', title: `${sib.firstName}'s venture`,
    text: `${sib.firstName} is putting a venture together and asks you to put in ${formatMoney(o.stake, S.country)} of your own money. It would be locked for three years and the result is shared: you could get back as little as half or as much as double. Either way you would have worked on something together. If you pass, nothing changes between you.`,
    choices: [
      { label: `Put in ${formatMoney(o.stake, S.country)}`, effect: st => resolveVenture(st, true) },
      { label: 'Pass, wish them well', effect: st => resolveVenture(st, false) }
    ]
  };
}
export function resolveVenture(S, join) {
  const f = S.familyFortune, o = f?.ventureOffer;
  if (!o) return null;
  f.ventureOffer = null; f.ventureYear = S.year;
  const sib = S.people?.[o.sibId];
  if (!join || !sib) { recordJournal(S, `You passed on ${sib ? sib.firstName + "'s" : 'the'} venture. They understood.`, 'family'); return { ok: true, joined: false }; }
  if ((Number(S.money?.cash) || 0) < o.stake) { recordJournal(S, `You could not put in the money for ${sib.firstName}'s venture after all. Nothing was paid.`, 'family'); return { ok: false, joined: false, reason: 'no cash' }; }
  walletMove(S, -o.stake, `Co-invested in ${sib.fullName}'s venture`, 'family');
  f.venture = { sibId: o.sibId, stake: o.stake, dueAbs: S.year * 12 + (S.month || 1) + VENTURE_MONTHS };
  recordJournal(S, `You put ${formatMoney(o.stake, S.country)} into ${sib.fullName}'s venture. It is locked for three years.`, 'family');
  return { ok: true, joined: true };
}
export function checkVentureMaturity(S, f) {
  const v = f?.venture;
  if (!v || S.year * 12 + (S.month || 1) < v.dueAbs) return null;
  f.venture = null;
  const sib = S.people?.[v.sibId];
  const mult = Math.round((0.5 + hash01(S, 241 + v.dueAbs) * 1.5) * 100) / 100;
  const back = Math.round(v.stake * mult);
  walletMove(S, back, `Return from ${sib ? sib.fullName : 'the'} venture`, 'family');
  if (sib) { sib.rel = sib.rel || {}; sib.rel.affection = Math.min(100, (sib.rel.affection || 0) + 4); sib.rel.trust = Math.min(100, (sib.rel.trust || 0) + 3); }
  recordJournal(S, `${sib ? sib.firstName + "'s" : 'The'} venture ran its three years. You got back ${formatMoney(back, S.country)} of the ${formatMoney(v.stake, S.country)} you put in (${mult < 1 ? 'a loss' : 'a gain'}). Working on it together brought you closer.`, 'family');
  return { back, mult };
}

/* --- The succession talk: after the estate is settled the company belongs to the children in equal parts. What happens next is a real family conversation.
   Keep it together (nothing changes), buy your siblings out to lead it (each sibling must agree; you pay their stake in cash), or propose selling it and splitting
   the proceeds (every sibling must agree; a sale costs 4%). A sibling who says no is not angry: they simply decline, but being pressed costs a little warmth. */
const SALE_COST = 0.04;
/* The talk is delivered in the first quiet month: a busy scene at settlement only delays it, never loses it. */
function talkInPlay(S) { const k = x => x && x.key === 'family_succession'; return k(S.activeScene) || (S.sceneQueue || []).some(k); }
export function deliverSuccessionTalk(S, f) {
  if (!f?.successionTalk || !f.company || f.company.sold || talkInPlay(S)) return null;
  if (S.activeScene || (S.sceneQueue || []).length) return null;
  redistributeDeadStakes(S, f);
  if (!talkSibs(S, f).length) { f.successionTalk = null; f.successionTalkDone = true; return null; } /* nobody left to talk to */
  queueScene(S, buildSuccessionScene(S), true);
  return true;
}
/* A holder who has died (a sibling) is settled once, in the monthly tick or whenever the talk is built, using the game's NPC heir rule (companyEstate.inheritNpcCompanies):
   their living children (people whose parentIds include them) inherit the stake in equal parts and hold it as owners (dividends, buyout and sale all reach them). With no living child it passes to the other living owners in equal parts, as civil probate does for siblings. Idempotent: a settled holder has 0%. */
export function deadHolderPct(S, f) {
  return r6(Object.keys(f?.own?.siblings || {}).filter(id => !S.people?.[id]?.alive).reduce((a, id) => a + (f.own.siblings[id] || 0), 0));
}
export function redistributeDeadStakes(S, f) {
  if (!f?.own || !f.company || f.company.sold) return 0;
  let moved = 0;
  for (const id of Object.keys(f.own.siblings)) {
    const pct = f.own.siblings[id] || 0;
    if (pct <= 0 || S.people?.[id]?.alive) continue;
    const heirs = Object.values(S.people || {}).filter(q => q && q.alive && (q.parentIds || []).includes(id)).map(q => q.id);
    f.own.siblings[id] = 0;
    if (heirs.length) {
      const each = r6(pct / heirs.length);
      for (const h of heirs) f.own.siblings[h] = r6((f.own.siblings[h] || 0) + each);
      f.own.siblings[heirs[0]] = r6(f.own.siblings[heirs[0]] + (pct - each * heirs.length));
      recordJournal(S, `The ${pct}% of ${f.company.name} held by ${S.people[id]?.firstName || 'a sibling'} who has died passed to ${heirs.length === 1 ? 'their child' : 'their children'}.`, 'family');
    } else {
      const living = Object.keys(f.own.siblings).filter(k => S.people?.[k]?.alive);
      const each = r6(pct / (1 + living.length));
      f.own.player = r6(f.own.player + each + (pct - each * (1 + living.length)));
      for (const l of living) f.own.siblings[l] = r6(f.own.siblings[l] + each);
      recordJournal(S, `${S.people[id]?.firstName || 'A sibling'} left no children, so their ${pct}% of ${f.company.name} passed in equal parts to you and the other living owners.`, 'family');
    }
    moved += pct;
  }
  if (moved > 0) f.shares = { pct: f.own.player, since: f.shares?.since || S.year };
  return moved;
}
function sibWilling(p) { const r = p.rel || {}; return (r.affection || 0) * 0.5 + (r.trust || 0) * 0.4 - (r.resentment || 0) * 0.6 >= 40; }
function talkSibs(S, f) { return Object.keys(f.own.siblings || {}).filter(id => (f.own.siblings[id] || 0) > 0 && S.people?.[id]?.alive); }
function equalParts(S, f) { const v = [f.own.player, ...talkSibs(S, f).map(id => f.own.siblings[id])]; return deadHolderPct(S, f) === 0 && Math.max(...v) - Math.min(...v) < 0.01; }
export function buyoutCost(S) {
  const f = S.familyFortune; if (!f?.own) return 0;
  return Math.round(talkSibs(S, f).reduce((a, id) => a + companyValue(f) * f.own.siblings[id] / 100, 0));
}
export function buildSuccessionScene(S) {
  const f = S.familyFortune;
  if (!f?.successionTalk || !f.company) return null;
  redistributeDeadStakes(S, f);
  const n = talkSibs(S, f).length;
  return {
    key: 'family_succession', category: 'family', title: `The future of ${f.company.name}`,
    text: `With your parents gone, ${f.company.name} belongs to you and ${n === 1 ? 'your sibling' : 'your ' + n + ' siblings'}${equalParts(S, f) ? ' in equal parts' : `: you hold ${f.own.player}% and your siblings hold ${r6(talkSibs(S, f).reduce((a, id) => a + f.own.siblings[id], 0))}% between them${deadHolderPct(S, f) > 0 ? `, and ${deadHolderPct(S, f)}% stays with the family of a sibling who has died` : ''}`}. You sit down together to decide what comes next. Keeping it as it is changes nothing. Leading it alone means buying them out, about ${formatMoney(buyoutCost(S), S.country)} in cash if everyone agrees. Selling it and splitting the money costs ${Math.round(SALE_COST * 100)}% in fees and needs every one of you to agree.`,
    choices: [
      { label: 'Keep it together as it is', effect: st => resolveSuccessionTalk(st, 'keep') },
      { label: `Offer to buy your siblings out (${formatMoney(buyoutCost(S), S.country)})`, effect: st => resolveSuccessionTalk(st, 'lead') },
      { label: 'Propose selling it and splitting the money', effect: st => resolveSuccessionTalk(st, 'sell') }
    ]
  };
}
export function resolveSuccessionTalk(S, how) {
  const f = S.familyFortune;
  if (!f?.successionTalk) return null;
  redistributeDeadStakes(S, f);
  f.successionTalk = null; f.successionTalkDone = true;
  const name = f.company?.name || 'the company';
  const sibIds = talkSibs(S, f);
  const press = (ids) => { for (const id of ids) { const q = S.people[id]; q.rel = q.rel || {}; q.rel.affection = Math.max(0, (q.rel.affection || 0) - 4); } };
  if (how === 'keep' || !sibIds.length) { recordJournal(S, equalParts(S, f) ? `You agreed with your siblings to keep ${name} together, in equal parts.` : `You agreed with your siblings to keep ${name} together as it is: you hold ${f.own.player}%.`, 'family'); return { ok: true, how: 'keep' }; }
  const no = sibIds.filter(id => !sibWilling(S.people[id]));
  if (how === 'lead') {
    const yes = sibIds.filter(id => !no.includes(id));
    let bought = 0, paid = 0, stopped = false;
    for (const id of yes) {
      const pct = f.own.siblings[id]; const cost = Math.round(companyValue(f) * pct / 100);
      if ((Number(S.money.cash) || 0) < cost) { stopped = true; continue; }
      walletMove(S, -cost, `Bought out ${S.people[id].fullName}'s share of ${name}`, 'family');
      const q = S.people[id]; q.career = q.career || {}; q.career.savingsLocal = (Number(q.career.savingsLocal) || 0) + Math.round(convertCurrency(cost, S.country, q.residenceCountry || S.country, S.year));
      f.own.player = r6(f.own.player + pct); f.own.siblings[id] = 0; bought++; paid += cost;
    }
    f.shares = { pct: f.own.player, since: f.shares?.since || S.year };
    press(no);
    const ctl = f.own.player > 50;
    recordJournal(S, `${bought ? `You bought out ${bought} sibling${bought > 1 ? 's' : ''} for ${formatMoney(paid, S.country)}. You now hold ${f.own.player}% of ${name}${ctl ? ' and lead it' : ', not enough for control'}.` : `Nobody sold you their share of ${name}.`}${no.length ? ` ${no.length} turned you down and it cost a little warmth.` : ''}${stopped ? ' You could not afford every share.' : ''}`, 'family');
    return { ok: true, how: 'lead', bought, paid, control: ctl };
  }
  /* sell: everyone must agree */
  if (no.length) { press(no); recordJournal(S, `You proposed selling ${name}. ${no.length === 1 ? 'One of your siblings' : 'Some of your siblings'} would not agree, so it stays in the family. It cost a little warmth.`, 'family'); return { ok: true, how: 'sell', sold: false }; }
  const value = companyValue(f), net = Math.round(value * (1 - SALE_COST));
  let mine = 0;
  for (const id of sibIds) { const q = S.people[id]; const amt = Math.round(net * f.own.siblings[id] / 100); q.career = q.career || {}; q.career.savingsLocal = (Number(q.career.savingsLocal) || 0) + Math.round(convertCurrency(amt, S.country, q.residenceCountry || S.country, S.year)); f.own.siblings[id] = 0; }
  let stray = 0; /* safety: any holder left who is not alive (settlement normally clears them) goes to you, never deleted */
  for (const id of Object.keys(f.own.siblings || {})) { if (sibIds.includes(id)) continue; stray += f.own.siblings[id] || 0; f.own.siblings[id] = 0; }
  f.own.player = r6((f.own.player || 0) + stray);
  mine = Math.round(net * f.own.player / 100);
  f.own.player = 0; f.own.pool = 0; f.own.parents = 0; f.own.heirs = 0; f.own.outside = 0; f.companyLocal = 0; f.company.sold = true; f.company.soldYear = S.year; f.yearlyInflowLocal = 0; f.baseInflowLocal = 0; f.yearDividend = 0; f.yearState = null; f.shares = { pct: 0, since: S.year }; sync(f); syncSiblingStanding(S, f);
  if (mine > 0) walletMove(S, mine, `Your share of the sale of ${name}`, 'family');
  if (S.career?.employed && S.career?.job?.employer === name) { S.career.job = null; S.career.employed = false; }
  addGrant(f, S, 'sale', mine, `sale of ${name}`);
  recordJournal(S, `${name} was sold. After ${Math.round(SALE_COST * 100)}% in fees your part was ${formatMoney(mine, S.country)}. The company, and any job there, is gone.`, 'family');
  return { ok: true, how: 'sell', sold: true, mine };
}


/* --- Introductions (event 10, own-way path): the family opens a door to a first real customer ---------------
   Once you own a product or service company with an active line, a family friend at a partner firm becomes a customer: a real signed order in your own contract book
   (same shape, deposit and penalty as any customer contract, at the line's normal price). The family adds no money and no discount. Declining costs nothing. */
function introTarget(S) {
  for (const b of (S.career?.businesses || [])) {
    if (!b || b.dead || !b.enterprise || !b.catalog || b.inputs?.metered) continue;
    const item = (b.catalog.items || []).find(i => i.active); if (item) return { b, item };
  }
  return null;
}
export function offerIntroduction(S) {
  const f = ensureFamilyFortune(S);
  if (!f || f.introDone || f.introOffer || f.seedOffer || isTightYear(f, S)) return null;
  if ((S.player?.age ?? 0) < 19 || S.activeScene || (S.sceneQueue || []).length) return null;
  const t = introTarget(S); if (!t) return null;
  const { b, item } = t;
  const qty = Math.max(1, Math.floor(b.enterprise.capacity * 0.25 / Math.max(0.01, item.load)));
  f.introOffer = { bizId: b.id, itemId: item.id, customer: PARTNERS[Math.floor(hash01(S, 412) * PARTNERS.length)], qty, year: S.year };
  queueScene(S, buildIntroScene(S), true);
  return f.introOffer;
}
export function buildIntroScene(S) {
  const f = S.familyFortune, o = f?.introOffer; if (!o) return null;
  const b = (S.career.businesses || []).find(x => x && x.id === o.bizId); const item = b?.catalog?.items?.find(i => i.id === o.itemId);
  if (!b || !item) return null;
  const total = o.qty * item.price;
  return {
    key: 'family_intro', category: 'family', title: 'A door opens',
    text: `A friend of your family at ${o.customer} hears about ${b.name} and offers to be your first customer: ${o.qty} x ${item.name} at your normal price, ${formatMoney(total, b.figuresCurrency || b.country || S.country)} in all. They pay a 30% deposit up front. It is a normal customer contract, with a deadline and a penalty if you cannot deliver. Your family adds nothing but the introduction.`,
    choices: [
      { label: 'Take the order', effect: st => resolveIntroduction(st, true) },
      { label: 'Thank them and find customers yourself', effect: st => resolveIntroduction(st, false) }
    ]
  };
}
export function resolveIntroduction(S, yes) {
  const f = S.familyFortune, o = f?.introOffer; if (!o) return null;
  const b = (S.career.businesses || []).find(x => x && x.id === o.bizId); const item = b?.catalog?.items?.find(i => i.id === o.itemId);
  f.introOffer = null; f.introDone = true;
  if (!yes || !b || !item) { recordJournal(S, 'You thanked your family friend and chose to find customers yourself.', 'family'); return { ok: true, taken: false }; }
  b.contracts ??= { orders: [], serial: 0, lastMonth: null };
  const c = b.contracts, now = S.year * 12 + S.month, quantity = o.qty, price = item.price, total = quantity * price, deposit = Math.floor(total * 0.3);
  c.serial++;
  c.orders.push({ id: b.id + '_contract_' + c.serial, customer: o.customer, itemId: item.id, name: item.name, quantity, price, total, deposit, escrow: deposit, accepted: now, due: now + Math.max(2, (item.cycle || 1) + 1), load: item.load, months: Math.max(1, item.cycle || 1), progress: 0, materialReady: false, status: 'backlog', penalty: Math.ceil(total * 0.1), introduced: true });
  recordJournal(S, `${o.customer} signed a contract with ${b.name} for ${quantity} x ${item.name}, through your family.`, 'business');
  return { ok: true, taken: true, orderId: b.id + '_contract_' + c.serial };
}

/* --- A hand with the wedding (wealth event: the wedding ask) -------------------------------------------
   When you are engaged and a parent is alive, the family offers to cover a share of the wedding venue from the family fund: 25% (upper middle),
   50% (wealthy) or 75% (very wealthy). These shares are a game balance choice. The pledge is paid when the wedding is actually held, on the venue you
   really chose, from the fund, inside the annual gift cap (a partial payment is explained). It is tied to the person you are engaged to. Declining costs nothing. */
const WEDDING_SHARE = { upper_middle: 0.25, wealthy: 0.5, very_wealthy: 0.75 };
export function offerWeddingHelp(S) {
  const f = ensureFamilyFortune(S);
  const eng = S.marriage?.engagement;
  if (f) { /* a pledge or offer tied to someone you are no longer engaged to (broken off, or they died) lapses, so a new engagement can be offered help */
    const stale = x => x && (!eng || eng.partnerId !== x.partnerId || !S.people?.[x.partnerId]?.alive);
    if (stale(f.weddingPledge)) f.weddingPledge = null;
    if (stale(f.weddingOffer)) { f.weddingOffer = null; if (S.activeScene?.key === 'family_wedding') S.activeScene = null; S.sceneQueue = (S.sceneQueue || []).filter(x => x?.key !== 'family_wedding'); }
  }
  if (!f || !eng || f.weddingOffer || f.weddingPledge || isTightYear(f, S) || (f.weddingDoneFor && f.weddingDoneFor === eng.partnerId)) return null;
  if (S.activeScene || (S.sceneQueue || []).length) return null;
  const parentAlive = [S.relations?.fatherId, S.relations?.motherId].some(id => id && S.people?.[id]?.alive);
  const partner = S.people?.[eng.partnerId]; if (!parentAlive || !partner || !partner.alive) return null;
  if (f.fundLocal <= 0) return null;
  f.weddingOffer = { partnerId: eng.partnerId, share: WEDDING_SHARE[f.tier] || 0.25, year: S.year };
  queueScene(S, buildWeddingScene(S), true);
  return f.weddingOffer;
}
export function buildWeddingScene(S) {
  const f = S.familyFortune, o = f?.weddingOffer; if (!o) return null;
  const partner = S.people?.[o.partnerId]; if (!partner) return null;
  return {
    key: 'family_wedding', category: 'family', title: 'A hand with the wedding',
    text: `Your family is glad about you and ${partner.firstName}. They offer to cover ${Math.round(o.share * 100)}% of the wedding venue from the family fund, paid on the day you hold it, for the venue you choose. It counts toward what the family can give you this year, so if the fund is stretched they may only manage part. You pay the rest, as with any wedding.`,
    choices: [
      { label: 'Accept their help with the venue', effect: st => resolveWeddingHelp(st, true) },
      { label: 'Thank them, we will pay for it ourselves', effect: st => resolveWeddingHelp(st, false) }
    ]
  };
}
export function resolveWeddingHelp(S, yes) {
  const f = S.familyFortune, o = f?.weddingOffer; if (!o) return null;
  f.weddingOffer = null;
  if (!yes) { f.weddingDoneFor = o.partnerId; recordJournal(S, 'You thanked your family and said you would pay for the wedding yourselves.', 'family'); return { ok: true, taken: false }; }
  f.weddingPledge = { partnerId: o.partnerId, share: o.share };
  recordJournal(S, `Your family will cover ${Math.round(o.share * 100)}% of the wedding venue.`, 'family');
  return { ok: true, taken: true };
}
/* What the family would pay right now for this venue, without paying it: the same cap and fund checks as the payment. */
export function weddingHelpQuote(S, venueCost, partnerId) {
  const f = S.familyFortune, pl = f?.weddingPledge; if (!pl || pl.partnerId !== partnerId) return 0;
  return Math.max(0, Math.min(Math.round(venueCost * pl.share), Math.round(f.fundLocal), Math.round(giftRoom(f, S))));
}
/* Called by the wedding itself, before the venue is charged, so the family portion settles directly. Returns what the family really paid. */
export function payWeddingHelp(S, venueCost, partnerId) {
  const f = S.familyFortune, pl = f?.weddingPledge; if (!pl) return 0;
  f.weddingPledge = null;
  if (pl.partnerId !== partnerId) return 0;
  f.weddingDoneFor = partnerId;
  const want = Math.round(venueCost * pl.share), amt = Math.max(0, Math.min(want, Math.round(f.fundLocal), Math.round(giftRoom(f, S))));
  if (amt <= 0) { recordJournal(S, 'Your family wanted to help with the wedding, but the family money was committed this year. Nothing was paid.', 'family'); return 0; }
  spend(f, amt); f.yearGifts += amt;
  walletMove(S, amt, 'Family help with the wedding venue', 'family');
  addGrant(f, S, 'wedding', amt, 'toward the wedding venue');
  recordJournal(S, amt < want ? `Your family paid ${formatMoney(amt, S.country)} toward the wedding venue, less than the ${formatMoney(want, S.country)} they promised, because the family money was stretched.` : `Your family paid ${formatMoney(amt, S.country)} toward the wedding venue.`, 'family');
  return amt;
}

/* --- Rich siblings as people (not just a bank balance) ------------------------------------------------------
   Whether an adult sibling works in the family company is decided once, at about the same 70% rate as the service-share draw. A sibling who has a job
   and is in that group is moved into the family company ONCE: their employer becomes the company and their own title, pay and history are kept. After that the
   ordinary NPC career machinery owns them: a lost job ends the post (title "Seeking Work", no pay, no employer, and they are not re-stamped), a promotion
   changes the title as it always does, and retirement is left alone. Nothing here restores a title or pay. Siblings who only hold shares keep their real
   occupation; their shareholding is shown on its own line. No money is created or moved. */
export function siblingWorksInCompany(S, id) {
  const p = S.people?.[id]; if (!p) return false;
  p.career = p.career || {};
  if (typeof p.career.familyWorks !== 'boolean') p.career.familyWorks = hash01(S, id.length * 31 + (p.birthYear | 0) * 3 + 5) < 0.7; /* decided once, so a title never flips year to year */
  return p.career.familyWorks;
}
export function syncSiblingStanding(S, f) {
  if (!f || !f.company) return 0;
  let n = 0;
  const live = !f.company.sold, co = f.company.name;
  for (const id of aliveSiblings(S)) {
    const p = S.people[id]; if (!p || (p.age ?? 0) < 22) continue;
    p.career = p.career || {};
    const c = p.career, income = Number(c.monthlyIncomeLocal) || 0;
    /* titles stamped by the first version of this feature are put back to the plain starting role, once */
    if (!c.familyMigrated && (c.familyPostSince || c.familyStanding === 'holder' || c.familyStanding === 'investor' || c.familyStanding === 'post')) {
      c.familyMigrated = true; c.familyStanding = undefined; c.familyPostSince = undefined; if (c.employer === co) c.employer = null;
      if (c.title !== 'Retired') c.title = income > 0 ? 'Operations Coordinator' : 'Seeking Work';
      n++;
    }
    if (c.title === 'Retired') continue;
    if (c.familyStanding === 'works' && !live) { /* the company was sold: the sale rule says any job there is gone, for a sibling as for you. Pay stops with it; nothing is invented in its place and the NPC career machinery takes over from Seeking Work. */
      c.familyStanding = 'left'; if (c.employer === co) c.employer = null; c.monthlyIncomeLocal = 0; c.title = 'Seeking Work'; n++;
      recordJournal(S, `${p.firstName || 'Your sibling'} lost the job at ${co} when it was sold and is looking for work.`, 'family');
      continue;
    }
    if (c.familyStanding === 'works') {
      if (income <= 0 || c.title === 'Seeking Work' || c.title === 'Unemployed') { c.familyStanding = 'left'; if (c.employer === co) c.employer = null; n++; }
      continue;
    }
    if (c.familyStanding === 'left') continue;
    if (live && income > 0 && c.title !== 'Seeking Work' && c.title !== 'Unemployed' && siblingWorksInCompany(S, id)) { c.familyStanding = 'works'; c.employer = co; c.familyPostSince = S.year; c.familyMigrated = true; n++; }
  }
  return n;
}
/* Sibling homes and cars (rich siblings as people). They are bought from the sibling's own savings, and upgraded only to something more than twice the price of what they hold (the old one is taken back at its recorded value), in the currency they live in:
   the price leaves their savings and becomes an asset of the same value, so nothing is created. A home is the dearest property in their country
   that costs at most a quarter of their savings, only when savings are at least four times its price; a car is the dearest that costs at most 3% of savings.
   If the sibling dies, the assets go back into their savings at the same value before the existing estate handling runs, so nothing is stranded or lost. */
const assetIn = (a, R, year) => a ? Math.round(convertCurrency(a.price, a.country || R, R, year)) : 0; /* an asset keeps the currency it was bought in; it is valued in the sibling's current currency */
export function syncSiblingAssets(S) {
  const f = S.familyFortune; if (!f || !hasFortune(S)) return 0;
  let n = 0;
  for (const id of S.relations?.siblingIds || []) {
    const p = S.people?.[id]; if (!p) continue;
    p.career = p.career || {}; const a = p.assets;
    if (!p.alive) { if (a && (a.home || a.car)) { const R0 = p.residenceCountry || S.country; p.career.savingsLocal = (Number(p.career.savingsLocal) || 0) + assetIn(a.home, R0, S.year) + assetIn(a.car, R0, S.year); p.assets = {}; n++; } continue; }
    if ((p.age ?? 0) < 26) continue;
    const R = p.residenceCountry || S.country, sav = Number(p.career.savingsLocal) || 0;
    p.assets = p.assets || {};
    if (sav > 0) {
      const curH = assetIn(p.assets.home, R, S.year), sa = sav + curH; /* upgrading sells the old one at its recorded value, so nothing is created */
      const up = getHousingFor(R, S.year).map(h => ({ h, price: Math.round(eraLocalCost(h.price2026, R, S.year)) })).filter(x => x.price > curH * 2 && x.price > 0 && x.price <= sa * 0.25 && sa >= x.price * 4).sort((x, y) => y.price - x.price);
      if (up.length) { const t = up[0]; p.career.savingsLocal = sa - t.price; p.assets.home = { id: t.h.id, kind: t.h.kind, tier: t.h.tier, price: t.price, country: R, year: S.year }; n++; }
    }
    const sav2 = Number(p.career.savingsLocal) || 0;
    if (sav2 > 0) {
      const cars = getCarsForYear(S.year).map(c => ({ c, price: Math.round(convertCurrency(eraLocalCost(c.priceUsd2026, 'usa', S.year), 'usa', R, S.year)) })).filter(x => x.price > assetIn(p.assets.car, R, S.year) * 2 && x.price > 0 && x.price <= (sav2 + assetIn(p.assets.car, R, S.year)) * 0.03).sort((x, y) => y.price - x.price);
      if (cars.length) { const t = cars[0]; p.career.savingsLocal = sav2 + assetIn(p.assets.car, R, S.year) - t.price; p.assets.car = { id: t.c.id, name: t.c.name, price: t.price, country: R, year: S.year }; n++; }
    }
  }
  return n;
}
export function siblingAssetsLine(S, id) {
  const p = S.people?.[id]; const a = p?.assets; if (!p?.alive || !a || (!a.home && !a.car)) return '';
  const R = p.residenceCountry || S.country; const bits = [];
  if (a.home) { const d = `${a.home.tier ? a.home.tier + ' ' : ''}${String(a.home.kind || 'home').replace(/_/g, ' ')}`; bits.push(`${/^[aeiou]/i.test(d) ? 'an' : 'a'} ${d} worth ${formatMoney(a.home.price, a.home.country || R)}`); }
  if (a.car) bits.push(`drives a ${a.car.name}`);
  return `Owns ${bits.join(' and ')}.`;
}

export function siblingEmployerLine(S, id) {
  const c = S.people?.[id]?.career; return c && c.familyStanding === 'works' && c.employer ? ` at ${c.employer}` : '';
}
export function siblingStakeLine(S, id) {
  const f = S.familyFortune; const pct = f?.own?.siblings?.[id] || 0;
  if (!f?.company || f.company.sold || pct <= 0) return '';
  return `Owns ${Math.round(pct * 100) / 100}% of ${f.company.name}, about ${formatMoney(Math.round(companyValue(f) * pct / 100), S.country)} of its value.`;
}

/* --- The connected internship (17-23): a paid summer at a partner company -------------------
   The family's connections open a three-month paid internship at a partner firm (a real employer record, paid monthly through the summer,
   less free time). At the end you earn a reference (a few interview points) and, if you are free to work, may convert it into a first job there. Declining costs nothing. */
const PARTNERS = ['Halden & Rowe Partners', 'Northgate Capital', 'Meridian Group', 'Alder Freight', 'Corvale Holdings', 'Tolland Advisory'];
const INTERN_MONTHS = 3;
function internPay(S, f) { return Math.round(eraLocalCost(f.tier === 'very_wealthy' ? 3000 : 1800, S.country, S.year)); }
export function offerConnectedInternship(S) {
  const f = ensureFamilyFortune(S);
  if (!f || f.internDone || f.internOffer || f.intern || S.month !== 6) return null;
  const age = S.player?.age ?? 0;
  if (age < 17 || age > 23 || S.country !== S.homeCountry) return null;
  if (S.activeScene || (S.sceneQueue || []).length) return null;
  if (f.work?.stint && f.work.stintAbs != null) return null; /* already spending summers at the family company */
  if (S.career?.employed && S.career?.job) return null; /* a summer internship is for someone not already in full work */
  f.internOffer = { employer: PARTNERS[Math.floor(hash01(S, 311) * PARTNERS.length)], pay: internPay(S, f), year: S.year };
  queueScene(S, buildInternScene(S), true);
  return f.internOffer;
}
export function buildInternScene(S) {
  const f = S.familyFortune, o = f?.internOffer;
  if (!o) return null;
  return {
    key: 'family_intern', category: 'family', title: 'A connected internship',
    text: `A friend of the family runs ${o.employer}. Through that connection you are offered a paid summer internship there: ${formatMoney(o.pay, S.country)} a month for ${INTERN_MONTHS} months. It takes your summer, so there is less free time. At the end you leave with a reference, and a job offer if you are free to take one.`,
    choices: [
      { label: `Take the internship at ${o.employer}`, effect: st => resolveIntern(st, true) },
      { label: 'Thank them, not this summer', effect: st => resolveIntern(st, false) }
    ]
  };
}
export function resolveIntern(S, yes) {
  const f = S.familyFortune, o = f?.internOffer;
  if (!o) return null;
  f.internOffer = null;
  if (!yes) { f.internDone = true; recordJournal(S, `You thanked the family friend at ${o.employer} and skipped the internship.`, 'family'); return { ok: true, taken: false }; }
  f.intern = { employer: o.employer, pay: o.pay, startAbs: S.year * 12 + (S.month || 1), months: 0, paid: 0 };
  recordJournal(S, `You started a summer internship at ${o.employer}, paid ${formatMoney(o.pay, S.country)} a month.`, 'career');
  return { ok: true, taken: true };
}
export function tickConnectedInternship(S, f) {
  const it = f?.intern;
  if (!it) return null;
  const now = S.year * 12 + (S.month || 1);
  if (now <= it.startAbs + it.months) return null; /* one month's work each tick, never twice in a month */
  it.months++;
  walletMove(S, it.pay, `${it.employer} internship pay`, 'career'); it.paid += it.pay;
  S.player.vitals.happiness = Math.max(0, S.player.vitals.happiness - 1);
  if (it.months < INTERN_MONTHS) return null;
  f.intern = null; f.internDone = true; f.reference = { employer: it.employer, year: S.year };
  const free = !(S.career?.employed && S.career?.job) && !S.education?.university && (S.player?.age ?? 0) >= 19;
  recordJournal(S, `You finished your summer at ${it.employer}, earned ${formatMoney(it.paid, S.country)} and a reference from them.`, 'career');
  if (free) { f.internConvert = { employer: it.employer, year: S.year }; queueScene(S, buildInternConvertScene(S), true); }
  return { done: true, convert: free };
}
export function buildInternConvertScene(S) {
  const f = S.familyFortune, o = f?.internConvert;
  if (!o) return null;
  return {
    key: 'family_intern_offer', category: 'career', title: `${o.employer} wants you`,
    text: `Your internship at ${o.employer} went well and they offer you a first job there as an analyst. Or you can walk away with your reference and look elsewhere.`,
    choices: [
      { label: `Take the job at ${o.employer}`, effect: st => resolveInternConvert(st, true) },
      { label: 'Keep the reference and look elsewhere', effect: st => resolveInternConvert(st, false) }
    ]
  };
}
export function resolveInternConvert(S, yes) {
  const f = S.familyFortune, o = f?.internConvert;
  if (!o) return null;
  f.internConvert = null;
  if (!yes) { recordJournal(S, `You kept the reference from ${o.employer} and went looking elsewhere.`, 'career'); return { ok: true, taken: false }; }
  if (S.career?.employed && S.career?.job) { recordJournal(S, `You already have a job, so the offer from ${o.employer} could not be taken.`, 'career'); return { ok: false, taken: false }; }
  const usd = f.tier === 'very_wealthy' ? 80e3 : 55e3;
  hireIntoJob(S, { employer: o.employer, title: 'Analyst', track: 'business', level: 1, monthlyGross: Math.round(eraLocalCost(usd, S.country, S.year) / 12), id: 'family_intern_convert' }, { partTimeOnly: false }, {});
  recordJournal(S, `You joined ${o.employer} as an analyst.`, 'career');
  return { ok: true, taken: true };
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
  checkWorkQuit(S, f); syncSiblingStanding(S, f); syncSiblingAssets(S); syncSiblingCompanies(S); stintSummerCost(S, f); offerPlaceAtTable(S); offerSeedGift(S); offerIntroduction(S); offerWeddingHelp(S); offerDepositHelp(S); offerBigAsk(S); offerSiblingVenture(S); checkVentureMaturity(S, f); offerConnectedInternship(S); tickConnectedInternship(S, f); deliverSuccessionTalk(S, f);
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
  let monthly = familyAllowanceMonthly(S);
  const ys = f.yearState && f.yearState.year === S.year ? f.yearState : null;
  if (ys?.kind === 'record' && ys.outcome === 'allowance') monthly = Math.round(monthly * 1.25);
  if (ys?.kind === 'tight') monthly = Math.round(monthly * 0.6);
  if (!(monthly > 0)) return 0;
  const room = giftRoom(f, S);
  const annual = Math.min(monthly * 12, f.fundLocal, room);
  if (annual <= 0) return 0;
  spend(f, annual); f.yearGifts += annual;
  walletMove(S, Math.round(annual), `Allowance from your parents (${formatMoney(monthly, S.country)}/month × 12)`, 'allowance');
  addGrant(f, S, 'allowance', annual, 'yearly allowance');
  return Math.round(annual);
}

/* --- asking a parent ----------------------------------------------------- */
export function isFortuneParent(S, p) {
  return !!p && hasFortune(S) && (p.id === S.relations?.fatherId || p.id === S.relations?.motherId);
}

export function isTightYear(f, S) { return !!(f && f.yearState && f.yearState.kind === 'tight' && f.yearState.year === S.year); }
export function askCeiling(S) {
  const f = ensureFamilyFortune(S);
  if (!f) return 0;
  const d = DIALS.askCeiling[f.tier];
  const base = d.of === 'fund' ? f.fundLocal : monthlyInflow(f);
  let v = Math.round(base * d.pct);
  if (isTightYear(f, S)) v = Math.round(v * 0.5); /* big asks are turned down in a tight year */
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

/* When the player dies, their stake in the family company is sold for real cash, so the estate holds cash that someone actually paid:
   1. each living sibling may buy an equal part of it at full value, as far as their own savings go (their savings fall by exactly what they pay);
   2. whatever they cannot pay for goes to outside investors at full value, and leaves the family.
   The company itself is untouched; ownership moves. Net worth is unchanged: the stake became cash. */
export function liquidateFamilyStakeOnDeath(S) {
  const f = S.familyFortune;
  if (!f?.own || !f.company || f.company.sold) return 0;
  const p = Number(f.own.player) || 0;
  if (p <= 0) return 0;
  const value = companyValue(f), living = aliveSiblings(S);
  let cash = 0, left = p, siblingPaid = 0, outsideCash = 0;
  const part = living.length ? r6(p / living.length) : 0;
  for (const id of living) {
    const cost = Math.round(value * part / 100); if (cost <= 0) continue;
    const q = S.people[id]; q.career = q.career || {};
    const cur = q.residenceCountry || S.country;
    const savOwn = Number(q.career.savingsLocal) || 0;
    const sav = convertCurrency(savOwn, cur, S.country, S.year); /* their savings in the player's currency, to compare with the price */
    const frac = Math.max(0, Math.min(1, sav / cost));
    if (frac <= 0) continue;
    const pct = r6(part * frac), pay = Math.round(cost * frac);
    q.career.savingsLocal = Math.max(0, Math.round(savOwn - convertCurrency(pay, S.country, cur, S.year))); /* debited in their own currency */
    f.own.siblings[id] = r6((f.own.siblings[id] || 0) + pct); left = r6(left - pct); cash += pay; siblingPaid += pay;
  }
  if (left > 0) { const gross = Math.round(value * left / 100), net = gross; f.own.outside = r6((f.own.outside || 0) + left); cash += net; outsideCash = net; }
  f.own.player = 0; f.shares = { pct: 0, since: S.year }; sync(f);
  if (cash > 0) walletMove(S, cash, `Your stake in ${f.company.name} was sold (${formatMoney(siblingPaid, S.country)} from your siblings, ${formatMoney(outsideCash, S.country)} from outside investors)`, 'family');
  recordJournal(S, `Your stake in ${f.company.name} was sold for ${formatMoney(cash, S.country)}: your siblings bought what their savings allowed and outside investors bought the rest at full value.`, 'family');
  return cash;
}
