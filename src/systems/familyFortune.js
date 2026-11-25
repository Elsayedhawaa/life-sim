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
import { eraLocalCost, usdRate, inflationRate, eraDepositRates } from '../data/economy.js';
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
  sharesGrantAge: 21, sharesPctRange: [0.5, 1.0], dividendYield: 0.03, dividendCapPctOfInflow: 0.10,
  /* Succession: when both parents are gone the estate outside the company pool is split equally among the children (you and your siblings). */
  estateOutsidePoolShare: 0.8, estateCashShareOfFund: 0.5,
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

function siblingCount(S) { return (S.relations?.siblingIds || []).filter(id => S.people?.[id]).length; }

function perChildTrustCapPct(S) {
  const children = 1 + siblingCount(S);
  return Math.min(DIALS.trustPerChildCapPct, DIALS.trustAllChildrenCapPct / children);
}

/* Create the fortune the first time it is needed (new life or an existing save). */
export function ensureFamilyFortune(S) {
  if (!hasFortune(S)) return null;
  if (S.familyFortune && S.familyFortune.schemaVersion === 1) return S.familyFortune;
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
    netWorthLocal: Math.round(fortuneLocal(S, a.netWorth * jitter, year)),
    fundLocal: Math.round(fortuneLocal(S, a.fund * jitter, year)),
    yearlyInflowLocal: Math.round(fortuneLocal(S, a.inflow * jitter, year)),
    baseInflowLocal: Math.round(fortuneLocal(S, a.inflow * jitter, year)),
    company: tier === 'upper_middle' ? null : { name: `${surname} ${tier === 'very_wealthy' ? 'Group' : 'Trading'}`, sector, sites, holdingGroup: tier === 'very_wealthy' },
    trust: { fundedLocal: 0, released: { at18: false, at21: false, at25: false } },
    childrenPoolPct: 20,
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
  /* An existing life gets the one computed at-18 release, not backfilled years. */
  const age = S.player?.age ?? 0;
  if (age >= 18) {
    /* Pro-rated: the trust the family would have funded by 18, carved out of the estate once. Only the stages the player has already reached are paid. */
    const full = Math.round(f.netWorthLocal * perChildTrustCapPct(S) * 0.9);
    f.trust.fundedLocal = full;
    f.netWorthLocal = Math.max(0, f.netWorthLocal - full);
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
  f.netWorthLocal = Math.max(0, Math.round(f.netWorthLocal * (1 + infl + swingNW)));
  /* Company result: a business year moves the inflow around its inflation-adjusted base. */
  const swing = (hash01(S, S.year * 3 + 2) - 0.42) * 0.5 + mkt * 1.5; /* company year: own result plus the shared economy */
  f.baseInflowLocal = Math.round(f.baseInflowLocal * (1 + infl));
  f.yearlyInflowLocal = Math.max(Math.round(f.baseInflowLocal * 0.3), Math.round(f.baseInflowLocal * (1 + swing)));
  const dep = eraDepositRates(S.country, S.year).savings || 0;
  f.fundLocal = Math.max(0, Math.round(f.fundLocal * (1 + dep) + f.yearlyInflowLocal * DIALS.fundRetention - 0));
  f.fundLocal = Math.min(f.fundLocal, Math.round(f.netWorthLocal * DIALS.fundMaxShareOfNetWorth));
  f.lastYearSwing = swing;
  if (f.giftYear !== S.year) { f.yearGifts = 0; f.yearEducation = 0; f.yearUpkeep = 0; f.yearDividend = 0; f.giftYear = S.year; } /* already rolled by an earlier charge this year */
  f.lastTickYear = S.year;
  const age = S.player?.age ?? 0;
  /* Trust funding each childhood year, within the per-child cap. */
  if (age < 18) {
    const cap = f.netWorthLocal * perChildTrustCapPct(S);
    const before = f.trust.fundedLocal;
    f.trust.fundedLocal = Math.round(Math.min(cap, before + f.netWorthLocal * DIALS.trustYearlyPct));
    f.netWorthLocal = Math.max(0, f.netWorthLocal - (f.trust.fundedLocal - before)); /* trust money leaves the estate when it is set aside */
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
function companyValue(f) { return f.netWorthLocal * (DIALS.companyShareOfNetWorth[f.tier] || 0); }
export function grantServiceShares(S) {
  const f = ensureFamilyFortune(S);
  if (!f || !f.company || f.shares) return null;
  const age = S.player?.age ?? 0;
  if (age < DIALS.sharesGrantAge) return null;
  const [lo, hi] = DIALS.sharesPctRange;
  const sibs = (S.relations?.siblingIds || []).filter(id => S.people?.[id]).length;
  const poolEach = f.childrenPoolPct / (1 + sibs); /* what each child could hold from the pool */
  const pct = Math.min(poolEach, Math.round((lo + hash01(S, 61) * (hi - lo)) * 100) / 100);
  f.shares = { pct, since: S.year };
  addGrant(f, S, 'shares', Math.round(companyValue(f) * pct / 100), `${pct}% of ${f.company.name}`);
  recordJournal(S, `Your family gave you ${pct}% of ${f.company.name} as service shares. They pay a dividend while the company has good years, and they are yours to keep.`, 'family');
  return f.shares;
}
export function payDividends(S, swing) {
  const f = S.familyFortune;
  if (!f?.shares || !f.company) return 0;
  const stake = companyValue(f) * f.shares.pct / 100;
  const good = swing >= 0 ? 1 : Math.max(0, 1 + swing * 2); /* a losing company year cuts the dividend */
  let amt = Math.round(stake * DIALS.dividendYield * good);
  amt = Math.min(amt, Math.round(f.yearlyInflowLocal * DIALS.dividendCapPctOfInflow), Math.round(f.fundLocal));
  if (amt <= 0) return 0;
  f.fundLocal -= amt; f.dividendsPaid = (f.dividendsPaid || 0) + amt; f.yearDividend = amt;
  walletMove(S, amt, `Dividend from ${f.company.name}`, 'family');
  addGrant(f, S, 'dividend', amt, f.company.name);
  recordJournal(S, `${f.company.name} paid you a dividend of ${formatMoney(amt, S.country)}.`, 'money');
  return amt;
}
export function settleSuccession(S) {
  const f = S.familyFortune;
  if (!f || f.inherited) return null;
  const alive = id => !!id && !!S.people?.[id]?.alive;
  if (alive(S.relations?.motherId) || alive(S.relations?.fatherId)) return null;
  if (!S.relations?.motherId && !S.relations?.fatherId) return null;
  f.inherited = true;
  const sibs = (S.relations?.siblingIds || []).filter(id => S.people?.[id]).length;
  const share = Math.round(f.netWorthLocal * DIALS.estateOutsidePoolShare / (1 + sibs));
  const cash = Math.min(share, Math.round(f.fundLocal * DIALS.estateCashShareOfFund / (1 + sibs)));
  const stakeValue = share - cash;
  f.netWorthLocal = Math.max(0, f.netWorthLocal - share);
  f.fundLocal = Math.max(0, f.fundLocal - cash);
  if (cash > 0) walletMove(S, cash, 'Inheritance from your parents', 'family');
  let note = '';
  if (f.company && f.shares && companyValue(f) > 0 && stakeValue > 0) {
    const add = Math.round(stakeValue / Math.max(1, companyValue(f) + stakeValue) * 10000) / 100;
    f.shares.pct = Math.round((f.shares.pct + add) * 100) / 100;
    note = ` The rest of your part comes as ${add}% more of ${f.company.name}.`;
  }
  addGrant(f, S, 'inheritance', share, `split with ${sibs} sibling${sibs === 1 ? '' : 's'}`);
  recordJournal(S, `Your parents' estate was settled: your equal part is ${formatMoney(share, S.country)}${sibs ? `, shared out with ${sibs} sibling${sibs === 1 ? '' : 's'}` : ''}. ${formatMoney(cash, S.country)} came as cash.${note}`, 'family');
  return { share, cash };
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
  return saved && saved.key === 'family_home' && S.familyFortune?.homeOffer ? buildHomeScene(S) : null;
}
export function resolveHome(S, how) {
  const f = S.familyFortune, o = f?.homeOffer;
  if (!o) return null;
  const h = getHousingFor(S.country, S.year).find(x => x.id === o.catalogId);
  f.homeOffer = null;
  if (!h) return null;
  f.netWorthLocal = Math.max(0, f.netWorthLocal - o.price);
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
  f.fundLocal -= price; f.yearGifts += price;
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
  f.fundLocal -= amount; f.yearGifts += amount; f.yearEducation = (f.yearEducation || 0) + amount;
  addGrant(f, S, 'education', amount, 'school or university fees');
  return true;
}

/* Running costs of a gifted car at very_wealthy are paid out of the fund each month. If the fund is short, the player pays. */
export function familyPaysCarUpkeep(S, amount) {
  const f = S.familyFortune?.schemaVersion === 1 ? S.familyFortune : null;
  if (!f || !(amount > 0) || f.fundLocal < amount) return false;
  f.fundLocal -= amount;
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
  f.fundLocal -= annual; f.yearGifts += annual;
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
  f.fundLocal -= amount; f.yearGifts += amount;
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
