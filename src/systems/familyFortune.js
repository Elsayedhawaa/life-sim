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
import { recordJournal, walletMove } from '../core/schema.js';
import { eraLocalCost, usdRate, inflationRate, eraDepositRates } from '../data/economy.js';
import { formatMoney } from '../data/countries.js';

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
    lastYearSwing: 0
  };
  /* An existing life gets the one computed at-18 release, not backfilled years. */
  const age = S.player?.age ?? 0;
  if (age >= 18) {
    const full = Math.round(f.netWorthLocal * perChildTrustCapPct(S) * 0.9);
    f.trust.fundedLocal = full;
    f.trust.released.at21 = true; f.trust.released.at25 = true;
    releaseTrust(S, f, 'at18', 0.25);
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

function giftRoom(f) {
  return Math.max(0, f.yearlyInflowLocal * DIALS.annualGiftShareCap - f.yearGifts);
}

/* --- yearly tick (January) ---------------------------------------------- */
export function tickFamilyFortuneYearly(S) {
  const f = ensureFamilyFortune(S);
  if (!f) return;
  if (f.lastTickYear === S.year) return;
  const infl = inflationRate(S.country, S.year) / 100;
  const swingNW = (hash01(S, S.year * 3 + 1) - 0.45) * 0.14;      /* market swing: about -6% to +8% */
  f.netWorthLocal = Math.max(0, Math.round(f.netWorthLocal * (1 + infl + swingNW)));
  /* Company result: a business year moves the inflow around its inflation-adjusted base. */
  const swing = (hash01(S, S.year * 3 + 2) - 0.42) * 0.7;          /* about -29% to +41% */
  f.baseInflowLocal = Math.round(f.baseInflowLocal * (1 + infl));
  f.yearlyInflowLocal = Math.max(Math.round(f.baseInflowLocal * 0.3), Math.round(f.baseInflowLocal * (1 + swing)));
  const dep = eraDepositRates(S.country, S.year).savings || 0;
  f.fundLocal = Math.max(0, Math.round(f.fundLocal * (1 + dep) + f.yearlyInflowLocal * DIALS.fundRetention - 0));
  f.lastYearSwing = swing;
  f.yearGifts = 0;
  f.lastTickYear = S.year;
  const age = S.player?.age ?? 0;
  /* Trust funding each childhood year, within the per-child cap. */
  if (age < 18) {
    const cap = f.netWorthLocal * perChildTrustCapPct(S);
    f.trust.fundedLocal = Math.min(cap, f.trust.fundedLocal + f.netWorthLocal * DIALS.trustYearlyPct);
    f.trust.fundedLocal = Math.round(f.trust.fundedLocal);
  }
  if (f.company && age < 40) {
    if (swing > 0.2) recordJournal(S, `${f.company.name} had a record year. The family fund is fuller, which shows in what the family can give.`, 'money');
    else if (swing < -0.15) recordJournal(S, `${f.company.name} had a tight year. The family is holding back on gifts until it recovers.`, 'money');
  }
  /* Trust releases at 18 / 21 / 25 */
  for (const [releaseAge, share] of DIALS.trustRelease) {
    const key = 'at' + releaseAge;
    if (age >= releaseAge && !f.trust.released[key]) releaseTrust(S, f, key, share);
  }
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
  const room = giftRoom(f);
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
  return Math.round(base * d.pct);
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
  const room = giftRoom(f);
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
