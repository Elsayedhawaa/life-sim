/* ============================================================================
   World Life 2.0 — v2.15 Worker 4: Era World Events (system)
   The world economy is no longer static. Era-locked world events (the
   table in src/data/worldEvents.js) fire when the calendar reaches them,
   move house prices, interest rates, salaries and business revenue in the
   countries they hit, and tell the player in a news scene — never a silent
   number change.

   HOW IT WIRES IN (each anchor is marked /* v2.15 W4 *\/ where it lands):
   - gameLoop advanceSingleTurn calls tickWorldEvents(S) every turn, so an
     event fires the month its date range starts.
   - economyEngine settleHouseholdMonth reads worldEventEffects(S) for the
     salary multiplier, the business revenue factor (passed into
     computeBusinessMonthFull as an input) and the rate shift on savings.
   - economyEngine buyProperty prices a house through worldHousePrice and
     prices a bank mortgage at the real era rate (monthlyMortgagePayment);
     takePersonalLoan / buyBankCertificate add the event rate shift.
   - businessMonthly computeBusinessMonthFull takes an optional
     opts.worldRevenueMult — the one multiplier input, nothing more.

   STATE (all on S.worldEvents, created lazily so old saves just work):
   fired: { eventId: { year, month } } — an event fires once per life.
   history: [{ eventId, name, start/end, firedYear/Month, housePrice,
     businessRevenue, salary, rateShift }] — the record Worker 1's
   property market states read through getMarketState().

   EXPORT FOR WORKER 1 (property market states):
   getMarketState(S, countryId) -> { state: 'Stable' | 'Rising' |
   'Falling', housePriceMult, businessRevenueMult, salaryMult, rateShift,
   policyRate, mortgageRate, savingsRate, activeEvents: [{ id, name,
   startYear, endYear, housePrice, businessRevenue, salary, rateShift }],
   history: [...] } — the market state is the property market's state
   right now, from the events active this month; history is every world
   event this life has lived through.
   ========================================================================== */

import { eraLocalCost } from '../data/economy.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { queueScene, recordJournal, ensureExtendedState } from '../core/schema.js';
import { WORLD_EVENTS, POLICY_RATE_ANCHORS } from '../data/worldEvents.js';

export { WORLD_EVENTS };

/* --------------------------------------------------------------------------
   Rates: the country's real central-bank rate for the era, interpolated
   linearly between the table's anchors. A mortgage costs the policy rate
   + 2 points, a personal loan + 5.5 points, savings pay 60% of the
   policy rate (banks always pay less than the central bank charges).
   -------------------------------------------------------------------------- */

export function eraPolicyRate(countryId, year) {
  const anchors = POLICY_RATE_ANCHORS[countryId] || POLICY_RATE_ANCHORS.usa;
  const y = Math.floor(Number(year) || 2026);
  if (y <= anchors[0][0]) return anchors[0][1];
  const last = anchors[anchors.length - 1];
  if (y >= last[0]) return last[1];
  for (let i = 1; i < anchors.length; i++) {
    if (y <= anchors[i][0]) {
      const [y0, r0] = anchors[i - 1];
      const [y1, r1] = anchors[i];
      return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
    }
  }
  return last[1];
}

export function eraLoanRates(countryId, year) {
  const policy = eraPolicyRate(countryId, year);
  return {
    policyRate: Number(policy.toFixed(4)),
    mortgageRate: Number(Math.max(0.005, policy + 0.02).toFixed(4)),
    personalLoanRate: Number(Math.max(0.01, policy + 0.055).toFixed(4)),
    savingsRate: Number(Math.max(0.001, policy * 0.6).toFixed(4)),
  };
}

/* Standard amortisation: the monthly payment on a loan of `principal`
   over `years` at `annualRate`. A 0% rate pays the principal straight. */
export function monthlyMortgagePayment(principal, years, annualRate) {
  const p = Math.max(0, Math.round(Number(principal) || 0));
  const months = Math.max(1, Math.round((Number(years) || 1) * 12));
  if (p <= 0) return 0;
  const r = (Number(annualRate) || 0) / 12;
  if (r <= 0) return Math.round(p / months);
  return Math.round((p * r) / (1 - Math.pow(1 + r, -months)));
}

/* --------------------------------------------------------------------------
   State + effects
   -------------------------------------------------------------------------- */

export function ensureWorldState(S) {
  if (!S) return null;
  ensureExtendedState(S);
  if (!S.worldEvents || typeof S.worldEvents !== 'object') {
    S.worldEvents = { fired: {}, history: [] };
  }
  if (!S.worldEvents.fired) S.worldEvents.fired = {};
  if (!Array.isArray(S.worldEvents.history)) S.worldEvents.history = [];
  return S.worldEvents;
}

/* The effect of one event on one country, or null when it does not touch
   that country. A per-country block wins; otherwise the `all` block. */
export function eventAffectsCountry(ev, countryId) {
  if (!ev || !ev.effects) return null;
  if (ev.effects.countries && ev.effects.countries[countryId]) {
    return ev.effects.countries[countryId];
  }
  if (ev.effects.all) return ev.effects.all;
  return null;
}

function monthIndex(year, month) {
  return Math.floor(Number(year) || 0) * 12 + Math.floor(Number(month) || 1);
}

export function eventIsActive(ev, year, month) {
  const now = monthIndex(year, month);
  return now >= monthIndex(ev.startYear, ev.startMonth) && now <= monthIndex(ev.endYear, ev.endMonth);
}

/* Every event active right now for this country, with its effect. */
export function activeWorldEvents(S, countryId, year, month) {
  const cid = countryId || (S && S.country);
  const y = year !== undefined ? year : (S && S.year);
  const m = month !== undefined ? month : (S && S.month) || 1;
  const out = [];
  for (const ev of WORLD_EVENTS) {
    if (!eventIsActive(ev, y, m)) continue;
    const effect = eventAffectsCountry(ev, cid);
    if (effect) out.push({ event: ev, effect });
  }
  return out;
}

/* The combined effect of everything active right now for this country:
   multipliers multiply, rate shifts add. With nothing active every
   multiplier is 1 and the shift is 0 — the game is untouched. */
export function worldEventEffects(S, countryId) {
  const active = activeWorldEvents(S, countryId);
  let housePrice = 1;
  let businessRevenue = 1;
  let salary = 1;
  let rateShift = 0;
  const activeNames = [];
  for (const { event, effect } of active) {
    if (effect.house !== undefined) housePrice *= effect.house;
    if (effect.business !== undefined) businessRevenue *= effect.business;
    if (effect.salary !== undefined) salary *= effect.salary;
    if (effect.rate !== undefined) rateShift += effect.rate;
    activeNames.push(event.name);
  }
  return { housePrice, businessRevenue, salary, rateShift, activeNames };
}

/* Just the rate shift, for the savings / loan / certificate wires. */
export function worldRateShift(S, countryId) {
  return worldEventEffects(S, countryId).rateShift;
}

/* A house priced from its 2026 catalogue price, moved by the world:
   the 2008 crisis really does make the same house cheaper. */
export function worldHousePrice(S, countryId, price2026) {
  const cid = countryId || (S && S.country);
  const base = eraLocalCost(price2026, cid, S ? S.year : 2026);
  const mult = worldEventEffects(S, cid).housePrice;
  return Math.round(base * mult);
}

/* --------------------------------------------------------------------------
   The market-state getter (Worker 1 reads this for property market
   states). The state is the property market's state right now: Rising
   when events have pushed house prices 3% or more above their era
   price, Falling when they have pushed them 3% or more below, Stable
   in between. History is every world event this life has lived through.
   -------------------------------------------------------------------------- */

export function getMarketState(S, countryId) {
  const cid = countryId || (S && S.country);
  ensureWorldState(S);
  const eff = worldEventEffects(S, cid);
  const rates = eraLoanRates(cid, S ? S.year : 2026);
  const state = eff.housePrice >= 1.03 ? 'Rising' : eff.housePrice <= 0.97 ? 'Falling' : 'Stable';
  const activeEvents = activeWorldEvents(S, cid).map(({ event, effect }) => ({
    id: event.id,
    name: event.name,
    startYear: event.startYear,
    startMonth: event.startMonth,
    endYear: event.endYear,
    endMonth: event.endMonth,
    housePrice: effect.house !== undefined ? effect.house : 1,
    businessRevenue: effect.business !== undefined ? effect.business : 1,
    salary: effect.salary !== undefined ? effect.salary : 1,
    rateShift: effect.rate !== undefined ? effect.rate : 0,
  }));
  return {
    state,
    housePriceMult: Number(eff.housePrice.toFixed(4)),
    businessRevenueMult: Number(eff.businessRevenue.toFixed(4)),
    salaryMult: Number(eff.salary.toFixed(4)),
    rateShift: Number(eff.rateShift.toFixed(4)),
    policyRate: rates.policyRate,
    mortgageRate: rates.mortgageRate,
    savingsRate: rates.savingsRate,
    activeEvents,
    history: (S.worldEvents.history || []).map((h) => ({ ...h })),
  };
}

/* --------------------------------------------------------------------------
   The news scene: the player reads about the event, with its name and
   what it means for them in their country — never a silent number change.
   -------------------------------------------------------------------------- */

export function buildWorldEventScene(S, ev, effect) {
  const cObj = getCountry(S.country);
  const bits = [];
  const house = effect.house !== undefined ? effect.house : 1;
  const business = effect.business !== undefined ? effect.business : 1;
  const salary = effect.salary !== undefined ? effect.salary : 1;
  const rate = effect.rate !== undefined ? effect.rate : 0;
  if (house < 1) bits.push(`house prices in ${cObj.name} fall about ${Math.round((1 - house) * 100)}%`);
  if (house > 1) bits.push(`house prices in ${cObj.name} rise about ${Math.round((house - 1) * 100)}%`);
  if (business < 1) bits.push(`businesses earn about ${Math.round((1 - business) * 100)}% less`);
  if (business > 1) bits.push(`businesses earn about ${Math.round((business - 1) * 100)}% more`);
  if (salary < 1) bits.push(`pay is squeezed by about ${Math.round((1 - salary) * 100)}%`);
  if (salary > 1) bits.push(`pay rises by about ${Math.round((salary - 1) * 100)}%`);
  if (rate < 0) bits.push(`interest rates fall by ${Math.abs(Math.round(rate * 100))} points, so borrowing gets cheaper`);
  if (rate > 0) bits.push(`interest rates rise by ${Math.round(rate * 100)} points, so borrowing gets dearer`);
  const meansLine = bits.length
    ? `For you, in ${cObj.name}, that means ${bits.join(', ')}.`
    : `For you, in ${cObj.name}, daily life carries on much as before.`;
  return {
    key: `world_${ev.id}`,
    worldEffectSnapshot:{...effect},
    baseId: `world_${ev.id}`,
    maxPerLife: 1,
    category: 'world',
    title: ev.name,
    text: `${ev.headline} ${ev.whatItMeans} ${meansLine}`,
    choices: [
      {
        label: 'Carry on — I will ride this out',
        effect: (st) => {
          recordJournal(st, `You read the news about ${ev.name} and decided to ride it out without changing your plans.`, 'world');
        },
      },
      {
        label: 'Tighten the belt while this lasts',
        effect: (st) => {
          st.player.vitals.happiness = Math.max(0, Math.min(100, (st.player.vitals.happiness || 50) - 3));
          recordJournal(st, `With ${ev.name} in the news, you cut back spending and braced for tight months.`, 'world');
        },
      },
    ],
  };
}

/* --------------------------------------------------------------------------
   The monthly tick (called from gameLoop advanceSingleTurn). Fires every
   event whose date range covers this month and touches the player's
   country, once per life. Deterministic: no random roll, only the date.
   A child under 14 still lives through the event (prices move) but is
   not handed the news scene.
   -------------------------------------------------------------------------- */

export function tickWorldEvents(S) {
  if (!S) return [];
  ensureWorldState(S);
  const now = monthIndex(S.year, S.month || 1);
  const firedNow = [];
  for (const ev of WORLD_EVENTS) {
    if (now < monthIndex(ev.startYear, ev.startMonth)) continue;
    if (now > monthIndex(ev.endYear, ev.endMonth)) continue;
    if (S.worldEvents.fired[ev.id]) continue;
    const effect = eventAffectsCountry(ev, S.country);
    if (!effect) continue;
    S.worldEvents.fired[ev.id] = { year: S.year, month: S.month || 1 };
    S.worldEvents.history.push({
      eventId: ev.id,
      name: ev.name,
      startYear: ev.startYear,
      startMonth: ev.startMonth,
      endYear: ev.endYear,
      endMonth: ev.endMonth,
      firedYear: S.year,
      firedMonth: S.month || 1,
      housePrice: effect.house !== undefined ? effect.house : 1,
      businessRevenue: effect.business !== undefined ? effect.business : 1,
      salary: effect.salary !== undefined ? effect.salary : 1,
      rateShift: effect.rate !== undefined ? effect.rate : 0,
    });
    recordJournal(S, `${S.year} — ${ev.name}: ${ev.headline}`, 'world');
    if (S.player && S.player.age >= 14) {
      const scene = buildWorldEventScene(S, ev, effect);
      if (queueScene(S, scene)) firedNow.push(ev.id);
    }
  }
  /* Bridge to Worker 1's property market states: their
     computeMarketState reads S.worldEvents.marketShock, so keep that one
     live record in step with the events active right now (combined
     multipliers, expiring at the last active event's end year). When
     nothing is active the record is cleared, so their cycle stands alone. */
  const live = activeWorldEvents(S, S.country);
  if (live.length) {
    const eff = worldEventEffects(S, S.country);
    S.worldEvents.marketShock = {
      country: S.country,
      priceMult: Number(eff.housePrice.toFixed(4)),
      rentMult: Number(eff.housePrice.toFixed(4)),
      label: live.map(({ event }) => event.name).join(', '),
      untilYear: Math.max(...live.map(({ event }) => event.endYear)),
    };
  } else if (S.worldEvents.marketShock) {
    delete S.worldEvents.marketShock;
  }
  return firedNow;
}

/* Plain-words one-liner for the UI panel: what the world is doing to the
   player's money right now. */
export function worldSummaryLine(S, countryId) {
  const cid = countryId || (S && S.country);
  const st = getMarketState(S, cid);
  const cObj = getCountry(cid);
  const ratePct = (st.policyRate * 100).toFixed(1);
  if (!st.activeEvents.length) {
    return `The world is quiet for ${cObj.name} right now — the property market is ${st.state}, and the central bank rate is ${ratePct}%.`;
  }
  const names = st.activeEvents.map((e) => e.name).join(', ');
  return `${names} — the property market in ${cObj.name} is ${st.state}, and the central bank rate is ${ratePct}%.`;
}

export function formatWorldRate(rate) {
  return `${(Number(rate) * 100).toFixed(1)}%`;
}

export function restoreWorldNewsScene(S,saved){const id=(saved?.key||'').replace(/^world_/,'');const ev=WORLD_EVENTS.find(x=>x.id===id);if(!ev)return null;const effect=saved.worldEffectSnapshot||eventAffectsCountry(ev,S.country);if(!effect)return null;return buildWorldEventScene(S,ev,effect);}
