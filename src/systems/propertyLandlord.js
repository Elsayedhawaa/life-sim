/* ============================================================================
   World Life 2.0 — Being a Landlord, Played (v2.15 Worker 1)
   Property used to be a ledger line with furnishing. Now a rented-out
   home has a NAMED TENANT — a real person record with a job from the
   game's employer pool and a reliability figure — who pays the rent
   (or doesn't), a deposit that is held and settled against real
   damage, a lease that ends and must be renewed, a condition that
   falls when nobody maintains the place, and a market that rises and
   falls with the era.

   STATE (all on prop.landlord, so old saves migrate by normalising):
     tenant: null | { personId, name, jobTitle, employer,
       monthlyIncomeLocal, reliability 0-100, relationship 0-100,
       monthsHere, lateMonths, arrearsLocal, jobLost, graceMonthsLeft,
       eviction: null | { monthsLeft, costLocal, court } }
     deposit: { months, amountLocal, held, returnedLocal, keptLocal }
     depositSettlement: null | { items, totalLocal, remainderLocal,
       depositLocal, tenantName, status }
     lease: { termMonths, monthsLeft, count, renewalOffered }
     damage: [{ id, key, label, costLocal, condHit, tenantCaused,
       status: 'open'|'fixed'|'cheap-fixed'|'ignored', year, month }]
     voidMonths, monthsSinceMaintenance
     pendingMoves: [{ amount, label, bucket }] — money the monthly
       tick discovered (a deposit arriving, a deposit returned after
       an eviction) that the settlement posts through its own
       addIncome / housing bucket, so the month still reconciles.
   MARKET (S.propertyMarket[countryId]): { state, rentIndex,
     priceIndex, history: [{ year, month, state, rentIndex,
     priceIndex }] }. Driven by the era cycle; Worker 4's world
   events can push it further through applyWorldEventMarketShock,
   which reads S.worldEvents.marketShock when present.

   MONEY RULES (one rule, no silent money):
   - Rent is posted by the settlement (economyEngine §8) from what
     landlordRentForMonth returns — the label names the tenant.
   - The tick NEVER moves cash itself. It records pendingMoves and
     the settlement posts them. Player actions (eviction filing,
     repairs, deposit choices) move cash at once, with their own
     ledger lines, because they happen outside the settlement.
   - Every price comes from the game's own costs: repair prices are
     a share of the property's value (the same value-based pricing
     the renovation uses), court fees are a multiple of the rent,
     empty-property bills are the country's own basket utilities.
   ========================================================================== */

import { rand, randInt, clamp } from '../core/rng.js';
import { nextId, createPerson, recordJournal, walletMove, queueScene, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraLocalCost, eraSalary, convertCurrency } from '../data/economy.js';
import { EMPLOYERS } from '../data/institutions.js';
import {
  evictionLawFor, DAMAGE_TYPES, MARKET_STATES, MARKET_CYCLE_LENGTH, TENANT_JOB_TITLES
} from '../data/propertyLandlordData.js';

/* ------------------------------------------------------------------ *
   Normalisation — old saves and Worker 1's businesses work without
   a migration step.
   ------------------------------------------------------------------ */
export function normalizeLandlordState(S, prop) {
  if (!prop || typeof prop !== 'object') return null;
  if (!prop.landlord || typeof prop.landlord !== 'object') prop.landlord = {};
  const L = prop.landlord;
  if (!('tenant' in L)) L.tenant = null;
  if (!L.deposit || typeof L.deposit !== 'object') {
    L.deposit = { months: 0, amountLocal: 0, held: false, returnedLocal: 0, keptLocal: 0 };
  }
  if (!L.lease || typeof L.lease !== 'object') {
    L.lease = { termMonths: 12, monthsLeft: 12, count: 0, renewalOffered: false };
  }
  if (!Array.isArray(L.damage)) L.damage = [];
  if (!Array.isArray(L.pendingMoves)) L.pendingMoves = [];
  if (typeof L.voidMonths !== 'number') L.voidMonths = 0;
  if (typeof L.monthsSinceMaintenance !== 'number') L.monthsSinceMaintenance = 0;
  if (typeof L.baseValueLocal !== 'number') L.baseValueLocal = Number(prop.valueLocal) || 0;
  if (!('depositSettlement' in L)) L.depositSettlement = null;
  if (typeof prop.conditionPct !== 'number') prop.conditionPct = 100;
  return L;
}

/* ------------------------------------------------------------------ *
   The market — the country's own cycle, driven by the era.
   ------------------------------------------------------------------ */
function countryCycleOffset(countryId) {
  let h = 0;
  for (const ch of String(countryId || 'egy')) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return h;
}

export function computeMarketState(S, countryId) {
  const pos = (Number(S.year || 2026) + countryCycleOffset(countryId)) % MARKET_CYCLE_LENGTH;
  const key = pos <= 1 ? 'rising' : pos <= 4 ? 'stable' : 'falling';
  const base = MARKET_STATES[key];
  let rentIndex = base.rentIndex;
  let priceIndex = base.priceIndex;
  let shockLabel = null;
  /* v2.15 W4 hook: a world event can push the market further. The
     module is read through S.worldEvents when it exists — no import,
     so this file works before W4 lands and after. */
  const shock = S.worldEvents && S.worldEvents.marketShock;
  if (shock && typeof shock === 'object' && (!shock.country || shock.country === countryId)
    && (!shock.untilYear || Number(S.year) <= Number(shock.untilYear))) {
    rentIndex = Math.round(rentIndex * (Number(shock.rentMult) || 1) * 100) / 100;
    priceIndex = Math.round(priceIndex * (Number(shock.priceMult) || 1) * 100) / 100;
    shockLabel = shock.label || 'A world event is moving this market';
  }
  return { state: key, label: base.label, line: base.line, rentIndex, priceIndex, shockLabel };
}

/* Worker 4's entry point: record a world-event market shock. */
export function applyWorldEventMarketShock(S, shock) {
  if (!S.worldEvents || typeof S.worldEvents !== 'object') S.worldEvents = {};
  S.worldEvents.marketShock = { ...(shock || {}) };
  return S.worldEvents.marketShock;
}

export function ensurePropertyMarket(S) {
  if (!S.propertyMarket || typeof S.propertyMarket !== 'object') S.propertyMarket = {};
  return S.propertyMarket;
}

export function marketStateFor(S, countryId) {
  ensurePropertyMarket(S);
  const rec = S.propertyMarket[countryId];
  if (rec && rec.state) {
    return {
      state: rec.state, label: rec.label || MARKET_STATES[rec.state]?.label || rec.state,
      line: rec.line || '', rentIndex: rec.rentIndex ?? 1, priceIndex: rec.priceIndex ?? 1,
      history: Array.isArray(rec.history) ? rec.history : []
    };
  }
  const st = computeMarketState(S, countryId);
  return { ...st, history: [] };
}

/* Once a month, per country the player owns in: record the state. */
export function tickPropertyMarketMonth(S) {
  ensurePropertyMarket(S);
  const key = `${S.year}-${S.month}`;
  if (S.propertyMarket._lastTickKey === key) return;
  S.propertyMarket._lastTickKey = key;
  const countries = new Set([S.country]);
  for (const p of (S.housing?.properties || [])) if (p.country) countries.add(p.country);
  for (const cid of countries) {
    const st = computeMarketState(S, cid);
    const rec = S.propertyMarket[cid] || (S.propertyMarket[cid] = { history: [] });
    rec.state = st.state;
    rec.label = st.label;
    rec.line = st.line;
    rec.rentIndex = st.rentIndex;
    rec.priceIndex = st.priceIndex;
    rec.sinceYear = S.year;
    rec.sinceMonth = S.month;
    rec.shockLabel = st.shockLabel;
    if (!Array.isArray(rec.history)) rec.history = [];
    const last = rec.history[rec.history.length - 1];
    if (!last || last.year !== S.year || last.month !== S.month) {
      rec.history.push({ year: S.year, month: S.month, state: st.state, rentIndex: st.rentIndex, priceIndex: st.priceIndex });
      if (rec.history.length > 120) rec.history = rec.history.slice(-120);
    }
  }
}

/* ------------------------------------------------------------------ *
   Rent — condition and market move it, measurably.
   factor(90) = 1.00, factor(40) = 0.75: the same home at condition 40
   earns a quarter less rent than at condition 90.
   ------------------------------------------------------------------ */
export function conditionRentFactor(conditionPct) {
  return 0.55 + 0.5 * (clamp(Number(conditionPct) || 0, 0, 100) / 100);
}

export function effectiveMonthlyRentNative(S, prop) {
  const L = normalizeLandlordState(S, prop);
  const market = marketStateFor(S, prop.country || S.country);
  const base = Number(prop.nativeMonthlyRent) || 0;
  const modeMult = prop.tenantMode === 'short_term' ? 1.36 : 1;
  return Math.round(base * conditionRentFactor(prop.conditionPct) * market.rentIndex * modeMult);
}

export function effectiveMonthlyRentLocal(S, prop) {
  const native = effectiveMonthlyRentNative(S, prop);
  return Math.round(convertCurrency(native, prop.country || S.country, S.country, S.year));
}

/* The empty-property bills: the country's own basket utilities, so a
   void month still costs real money. */
export function voidMonthCostLocal(S, prop) {
  const cObj = getCountry(prop.country || S.country);
  const native = eraLocalCost(cObj.monthlyBasket2026.utilities || 0, prop.country || S.country, S.year);
  return Math.round(convertCurrency(native, prop.country || S.country, S.country, S.year));
}

/* ------------------------------------------------------------------ *
   Tenants — real person records, from the employer pool.
   ------------------------------------------------------------------ */
export function tenantEmployersFor(countryId) {
  const byCountry = EMPLOYERS[countryId] || {};
  const names = [];
  for (const sector of Object.values(byCountry)) {
    if (Array.isArray(sector)) for (const n of sector) if (n) names.push(n);
  }
  return names;
}

/* Find a tenant for a rented-out property. The deposit is posted by
   the caller: through pendingMoves when the monthly tick finds the
   tenant (the settlement posts it, so the month still reconciles),
   or at once when the player lists the property themselves. */
export function findTenant(S, prop, opts = {}) {
  ensureExtendedState(S);
  const L = normalizeLandlordState(S, prop);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  if (L.tenant) return { ok: false, msg: `${prop.name} already has a tenant (${L.tenant.name}).` };
  if (prop.tenantMode === 'short_term') {
    return { ok: false, msg: 'Holiday lets take short stays, not a named long-term tenant — switch to a long-term lease first.' };
  }
  const countryId = prop.country || S.country;
  const employers = tenantEmployersFor(countryId);
  if (!employers.length) return { ok: false, msg: `No employers on record in ${getCountry(countryId).name} to find a tenant from.` };
  const employer = employers[Math.floor(rand(S) * employers.length)];
  const jobTitle = TENANT_JOB_TITLES[Math.floor(rand(S) * TENANT_JOB_TITLES.length)];
  const cObj = getCountry(countryId);
  const midNative = eraSalary((cObj.annualSalaryTiers2026.mid || 60000) / 12, countryId, S.year);
  const rentNative = effectiveMonthlyRentNative(S, prop);
  /* A tenant must be able to afford the rent: at least 1.6× the rent. */
  const incomeNative = Math.max(
    Math.round(midNative * (0.7 + rand(S) * 0.6)),
    Math.round(rentNative * 1.6)
  );
  const incomeLocal = Math.round(convertCurrency(incomeNative, countryId, S.country, S.year));
  const reliability = randInt(S, 35, 95);
  const person = createPerson(S, {
    role: 'tenant',
    relationLabel: 'Tenant',
    nationality: countryId,
    residenceCountry: countryId,
    city: prop.city || S.city,
    age: randInt(S, 24, 55),
    jobTitle,
    employer,
    monthlyIncomeLocal: incomeLocal,
    affection: randInt(S, 55, 80),
    respect: randInt(S, 55, 80),
    trust: randInt(S, 55, 80)
  });
  person.traits.reliability = reliability;
  if (!S.people) S.people = {};
  S.people[person.id] = person;

  const law = evictionLawFor(countryId);
  const depositMonths = law.depositMonths;
  const depositNative = Math.round(rentNative * depositMonths);
  const depositLocal = Math.round(convertCurrency(depositNative, countryId, S.country, S.year));
  L.tenant = {
    personId: person.id,
    name: person.fullName,
    jobTitle,
    employer,
    monthlyIncomeLocal: incomeLocal,
    reliability,
    relationship: randInt(S, 55, 80),
    monthsHere: 0,
    lateMonths: 0,
    arrearsLocal: 0,
    arrearsNoted: false,
    jobLost: false,
    graceMonthsLeft: 0,
    eviction: null
  };
  L.deposit = { months: depositMonths, amountLocal: depositLocal, held: true, returnedLocal: 0, keptLocal: 0 };
  L.lease = { termMonths: 12, monthsLeft: 12, count: (L.lease?.count || 0) + 1, renewalOffered: false };
  L.voidMonths = 0;
  const depositLabel = `Deposit from ${person.fullName} — ${prop.name} (${depositMonths} months' rent, held)`;
  if (opts.postNow) {
    walletMove(S, depositLocal, depositLabel, 'housing');
  } else {
    L.pendingMoves.push({ amount: depositLocal, label: depositLabel, bucket: 'income' });
  }
  recordJournal(S, `${person.fullName} moved into ${prop.name} as your tenant — ${jobTitle} at ${employer}, earning ${formatMoney(incomeLocal, S.country)}/month. They paid ${formatMoney(depositLocal, S.country)} deposit (${depositMonths} months' rent) and the lease runs 12 months at ${formatMoney(effectiveMonthlyRentLocal(S, prop), S.country)}/month.`, 'money');
  return {
    ok: true,
    msg: `${person.fullName} moved in — ${jobTitle} at ${employer}. Deposit ${formatMoney(depositLocal, S.country)} held.`,
    tenant: L.tenant, depositLocal
  };
}

/* ------------------------------------------------------------------ *
   The monthly landlord tick — called from the settlement's §8 loop
   for EVERY property (so condition and market value move even while
   a home sits empty), but tenant rolls only run on rented-out
   long-term homes. NEVER moves cash: money goes through
   pendingMoves, which the settlement posts.
   ------------------------------------------------------------------ */
export function tickLandlordMonth(S, prop) {
  if (!prop || typeof prop !== 'object') return;
  const L = normalizeLandlordState(S, prop);
  tickPropertyMarketMonth(S);

  /* Condition falls when nobody maintains the place: faster while
     rented out, slower while empty or lived in. */
  const decay = prop.rentedOut ? 0.6 : 0.3;
  prop.conditionPct = Math.max(25, Math.round(((prop.conditionPct ?? 100) - decay) * 10) / 10);
  L.monthsSinceMaintenance += 1;

  /* The market moves the value: the converted native value times
     this month's price index. */
  const market = marketStateFor(S, prop.country || S.country);
  prop.valueLocal = Math.round(
    convertCurrency(prop.nativeValue || 0, prop.country || S.country, S.country, S.year) * market.priceIndex
  );

  if (!prop.rentedOut || prop.id === S.housing?.currentHomeId || prop.tenantMode === 'short_term') return;

  /* --- Void: no tenant, no rent, still bills. Search each month. --- */
  if (!L.tenant) {
    L.voidMonths += 1;
    if (rand(S) < 0.55) findTenant(S, prop);
    return;
  }
  const t = L.tenant;
  t.monthsHere += 1;
  if (L.lease.monthsLeft > 0) L.lease.monthsLeft -= 1;

  /* --- A cheap fix can break again. --- */
  for (const d of L.damage) {
    if (d.status === 'cheap-fixed' && rand(S) < 0.5) {
      d.status = 'open';
      d.costLocal = Math.round(d.costLocal * 0.9);
      recordJournal(S, `The cheap fix on ${d.label.toLowerCase()} at ${prop.name} has failed — it needs doing properly this time (${formatMoney(d.costLocal, S.country)}).`, 'housing');
    }
  }

  /* --- Eviction countdown (started by the player, at a real cost). --- */
  if (t.eviction) {
    t.eviction.monthsLeft -= 1;
    if (t.eviction.monthsLeft <= 0) {
      const arrears = t.arrearsLocal || 0;
      const covered = Math.min(arrears, L.deposit.held ? L.deposit.amountLocal : 0);
      const remainder = Math.max(0, (L.deposit.held ? L.deposit.amountLocal : 0) - covered);
      if (remainder > 0) {
        L.pendingMoves.push({
          amount: -remainder,
          label: `Deposit returned to ${t.name} after eviction from ${prop.name} (deposit covered ${formatMoney(covered, S.country)} of ${formatMoney(arrears, S.country)} arrears)`,
          bucket: 'housing'
        });
      }
      L.deposit.held = false;
      L.deposit.returnedLocal = remainder;
      L.deposit.keptLocal = covered;
      recordJournal(S, `The court evicted ${t.name} from ${prop.name} after ${t.eviction.months} months. The deposit covered ${formatMoney(covered, S.country)} of ${formatMoney(arrears, S.country)} owed in rent; the rest is gone. The flat is empty — find a new tenant.`, 'money');
      L.tenant = null;
      L.voidMonths = 0;
      L.lease = { termMonths: 12, monthsLeft: 12, count: L.lease.count, renewalOffered: false };
    }
    return; // an evicted tenant pays nothing while the case runs
  }

  /* --- Job loss: the tenant stops being able to pay. --- */
  if (!t.jobLost && rand(S) < 0.015) {
    t.jobLost = true;
    t.graceMonthsLeft = 0;
    const person = S.people?.[t.personId];
    if (person) person.career.monthlyIncomeLocal = 0;
    recordJournal(S, `${t.name}, your tenant at ${prop.name}, lost their job at ${t.employer}. They cannot pay the full rent now — give them time to find work, or start an eviction.`, 'money');
    queueScene(S, {
      key: `tenant_job_${prop.id}_${S.year}_${S.month}`,
      category: 'money',
      title: `Your tenant lost their job — ${prop.name}`,
      text: `${t.name} (${t.jobTitle} at ${t.employer}) lost their job and cannot pay the ${formatMoney(effectiveMonthlyRentLocal(S, prop), S.country)} monthly rent in full. They owe nothing yet, but next month's rent will fall short. Giving them time costs you the shortfall each month; eviction costs ${formatMoney(Math.round(effectiveMonthlyRentLocal(S, prop) * evictionLawFor(prop.country || S.country).costRentMonths), S.country)} in court costs and takes ${evictionLawFor(prop.country || S.country).noticeMonths + evictionLawFor(prop.country || S.country).courtMonths} months, during which they pay nothing.`,
      choices: [
        { label: 'Give them 3 months to find work (they pay what they can; you cover the shortfall)', effect: () => giveTenantTime(S, prop.id) },
        { label: `Start eviction (${formatMoney(Math.round(effectiveMonthlyRentLocal(S, prop) * evictionLawFor(prop.country || S.country).costRentMonths), S.country)}, ${evictionLawFor(prop.country || S.country).noticeMonths + evictionLawFor(prop.country || S.country).courtMonths} months, no rent while it runs)`, effect: () => startEviction(S, prop.id) }
      ]
    });
  }

  /* --- Grace: a tenant given time may find new work. --- */
  if (t.jobLost && t.graceMonthsLeft > 0) {
    t.graceMonthsLeft -= 1;
    if (rand(S) < 0.35) {
      const employers = tenantEmployersFor(prop.country || S.country);
      const newEmployer = employers.length ? employers[Math.floor(rand(S) * employers.length)] : t.employer;
      const cObj = getCountry(prop.country || S.country);
      const midNative = eraSalary((cObj.annualSalaryTiers2026.mid || 60000) / 12, prop.country || S.country, S.year);
      const incomeNative = Math.max(
        Math.round(midNative * (0.8 + rand(S) * 0.3)),
        Math.round(effectiveMonthlyRentNative(S, prop) * 1.6)
      );
      t.jobLost = false;
      t.graceMonthsLeft = 0;
      t.employer = newEmployer;
      t.monthlyIncomeLocal = Math.round(convertCurrency(incomeNative, prop.country || S.country, S.country, S.year));
      const person = S.people?.[t.personId];
      if (person) {
        person.career.employer = newEmployer;
        person.career.monthlyIncomeLocal = t.monthlyIncomeLocal;
      }
      t.relationship = clamp(t.relationship + 8);
      recordJournal(S, `${t.name} found a new job at ${newEmployer} and is paying the rent on ${prop.name} in full again. Giving them time paid off.`, 'money');
    } else if (t.graceMonthsLeft === 0) {
      recordJournal(S, `${t.name} still has no job after the 3 months you gave them at ${prop.name}. The arrears stand at ${formatMoney(t.arrearsLocal, S.country)} — give them more time, or start an eviction.`, 'money');
    }
  }

  /* --- Lease end: the player chooses, the tenant answers. --- */
  if (L.lease.monthsLeft <= 0 && !L.lease.renewalOffered) {
    L.lease.renewalOffered = true;
    const rentLocal = effectiveMonthlyRentLocal(S, prop);
    const raiseLocal = Math.round(rentLocal * 1.05);
    queueScene(S, {
      key: `lease_renew_${prop.id}_${L.lease.count}`,
      category: 'money',
      title: `Lease ending — ${prop.name}`,
      text: `${t.name}'s 12-month lease on ${prop.name} is up. The rent is ${formatMoney(rentLocal, S.country)}/month and ${t.name} has been there ${t.monthsHere} months. Renew at the same rent, raise it 5% to ${formatMoney(raiseLocal, S.country)} (they may accept, ask to meet you halfway, or leave), or sell the flat with ${t.name} still in it (a buyer pays about 10% less for a tenanted flat).`,
      choices: [
        { label: `Renew at the same rent (${formatMoney(rentLocal, S.country)}/month)`, effect: () => renewLease(S, prop.id, 'same') },
        { label: `Raise the rent 5% to ${formatMoney(raiseLocal, S.country)}/month (they may refuse)`, effect: () => renewLease(S, prop.id, 'raise', 5) },
        { label: 'Sell the flat with the tenant in place (about 10% less)', effect: () => renewLease(S, prop.id, 'sell') }
      ]
    });
  }

  /* --- Damage: something breaks. --- */
  const damageChance = (prop.conditionPct ?? 100) < 60 ? 0.04 : 0.02;
  if (rand(S) < damageChance) {
    const spec = DAMAGE_TYPES[Math.floor(rand(S) * DAMAGE_TYPES.length)];
    const costLocal = damageCostLocal(S, prop, spec);
    const dmg = {
      id: nextId(S, 'dmg'),
      key: spec.key,
      label: spec.label,
      costLocal,
      condHit: spec.condHit,
      tenantCaused: spec.tenantCaused,
      status: 'open',
      year: S.year,
      month: S.month
    };
    L.damage.push(dmg);
    prop.conditionPct = Math.max(25, (prop.conditionPct ?? 100) - spec.condHit);
    recordJournal(S, `Something broke at ${prop.name}: ${spec.label.toLowerCase()}. A proper fix costs ${formatMoney(costLocal, S.country)} — fix it now, fix it cheaply and risk it breaking again, or ignore it and risk losing ${t.name}.`, 'housing');
    queueScene(S, {
      key: `damage_${prop.id}_${dmg.id}`,
      category: 'money',
      title: `Something broke — ${prop.name}`,
      text: `${spec.label} at ${prop.name}. A proper fix costs ${formatMoney(costLocal, S.country)}. A cheap fix costs ${formatMoney(Math.round(costLocal * 0.4), S.country)} but may break again. Ignoring it drops the condition and ${t.name} will not stay in a flat that is falling apart.`,
      choices: [
        { label: `Fix it properly now (${formatMoney(costLocal, S.country)})`, effect: () => fixDamage(S, prop.id, dmg.id, 'full') },
        { label: `Fix it cheaply (${formatMoney(Math.round(costLocal * 0.4), S.country)} — may break again)`, effect: () => fixDamage(S, prop.id, dmg.id, 'cheap') },
        { label: 'Ignore it for now (condition falls, tenant unhappy)', effect: () => fixDamage(S, prop.id, dmg.id, 'ignore') }
      ]
    });
  }
}

/* A repair price from the game's own costs: a share of the property's
   value (the same value-based pricing the renovation uses), floored
   at twice the country's monthly basket utilities. */
export function damageCostLocal(S, prop, spec) {
  const cObj = getCountry(prop.country || S.country);
  const floorNative = eraLocalCost((cObj.monthlyBasket2026.utilities || 0) * 2, prop.country || S.country, S.year);
  const floorLocal = Math.round(convertCurrency(floorNative, prop.country || S.country, S.country, S.year));
  return Math.max(floorLocal, Math.round((Number(prop.valueLocal) || 0) * spec.pctOfValue));
}

/* ------------------------------------------------------------------ *
   Rent for this month — the settlement calls this once per property.
   Returns null when the old rent line should run (short-term lets,
   or a home with no landlord state yet). The label names the tenant:
   rent is paid by a person, not by the void.
   ------------------------------------------------------------------ */
export function landlordRentForMonth(S, prop) {
  if (!prop || !prop.rentedOut || prop.id === S.housing?.currentHomeId) return null;
  if (prop.tenantMode === 'short_term') return null;
  const L = normalizeLandlordState(S, prop);
  const pending = L.pendingMoves.splice(0, L.pendingMoves.length);
  const result = { amount: 0, label: null, voidCost: 0, pending, tenantName: null, late: false, partial: false };

  if (!L.tenant) {
    /* Void: no rent, and the empty flat still costs its bills. */
    result.voidCost = voidMonthCostLocal(S, prop);
    return result;
  }
  const t = L.tenant;
  result.tenantName = t.name;
  /* The 0.88 is the same agency/management cut the old rent line
     applied — the rent that lands is net of it. */
  const rentLocal = Math.round(effectiveMonthlyRentLocal(S, prop) * 0.88);
  if (t.eviction) {
    /* An evicted tenant pays nothing while the case runs. */
    return result;
  }
  if (t.jobLost) {
    const paid = t.reliability >= 60 ? Math.round(rentLocal * 0.4) : 0;
    const shortfall = rentLocal - paid;
    t.arrearsLocal = Math.round((t.arrearsLocal || 0) + shortfall);
    t.relationship = clamp(t.relationship - 2);
    if (paid > 0) {
      result.amount = paid;
      result.partial = true;
      result.label = `Rent from ${prop.name} — paid by ${t.name} (partial: out of work, ${formatMoney(paid, S.country)} of ${formatMoney(rentLocal, S.country)})`;
    }
    if (!t.arrearsNoted && t.arrearsLocal >= rentLocal) {
      t.arrearsNoted = true;
      recordJournal(S, `${t.name} now owes ${formatMoney(t.arrearsLocal, S.country)} in unpaid rent on ${prop.name}.`, 'money');
    }
    return result;
  }
  /* A reliable tenant pays on time; an unreliable one is late. */
  const lateChance = ((100 - t.reliability) / 100) * 0.6;
  if (rand(S) < lateChance) {
    t.lateMonths += 1;
    t.arrearsLocal = Math.round((t.arrearsLocal || 0) + rentLocal);
    t.relationship = clamp(t.relationship - 4);
    recordJournal(S, `${t.name} is late with the rent on ${prop.name} this month — ${formatMoney(t.arrearsLocal, S.country)} now owed.`, 'money');
    return result;
  }
  let paid = rentLocal;
  if ((t.arrearsLocal || 0) > 0 && t.reliability > 70) {
    const catchUp = Math.min(t.arrearsLocal, Math.round(rentLocal * 0.5));
    paid += catchUp;
    t.arrearsLocal = Math.round(t.arrearsLocal - catchUp);
    if (t.arrearsLocal <= 0) t.arrearsNoted = false;
    recordJournal(S, `${t.name} paid the rent on ${prop.name} and caught up ${formatMoney(catchUp, S.country)} of the arrears.`, 'money');
  }
  t.relationship = clamp(t.relationship + 1);
  result.amount = paid;
  result.label = `Rent from ${prop.name} — paid by ${t.name}`;
  return result;
}

/* ------------------------------------------------------------------ *
   The tenant lost their job — the player's decision.
   ------------------------------------------------------------------ */
export function giveTenantTime(S, propId) {
  ensureExtendedState(S);
  const prop = (S.housing?.properties || []).find(p => p.id === propId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const L = normalizeLandlordState(S, prop);
  if (!L.tenant) return { ok: false, msg: 'There is no tenant at this property.' };
  if (!L.tenant.jobLost) return { ok: false, msg: `${L.tenant.name} has a job — there is nothing to give them time for.` };
  L.tenant.graceMonthsLeft = 3;
  L.tenant.relationship = clamp(L.tenant.relationship + 10);
  recordJournal(S, `You gave ${L.tenant.name} 3 months to find new work at ${prop.name}. They will pay what they can meanwhile, and the shortfall comes out of your pocket.`, 'money');
  return { ok: true, msg: `${L.tenant.name} has 3 months to find work. They pay what they can; you cover the rest.` };
}

export function startEviction(S, propId) {
  ensureExtendedState(S);
  const prop = (S.housing?.properties || []).find(p => p.id === propId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const L = normalizeLandlordState(S, prop);
  if (!L.tenant) return { ok: false, msg: 'There is no tenant at this property.' };
  if (L.tenant.eviction) return { ok: false, msg: `Eviction of ${L.tenant.name} is already running at ${prop.name}.` };
  const law = evictionLawFor(prop.country || S.country);
  const months = law.noticeMonths + law.courtMonths;
  const rentLocal = effectiveMonthlyRentLocal(S, prop);
  const cost = Math.round(rentLocal * law.costRentMonths);
  if ((Number(S.money?.cash) || 0) < cost) {
    return { ok: false, msg: `Evicting ${L.tenant.name} costs ${formatMoney(cost, S.country)} in court costs at ${law.court} — not enough cash.` };
  }
  walletMove(S, -cost, `Eviction filing — ${L.tenant.name} at ${prop.name} (${law.court}, ${months} months)`, 'housing');
  L.tenant.eviction = { monthsLeft: months, months, costLocal: cost, court: law.court };
  L.tenant.relationship = clamp(L.tenant.relationship - 20);
  recordJournal(S, `You started eviction proceedings against ${L.tenant.name} at ${law.court}. It will take ${months} months and cost ${formatMoney(cost, S.country)}. They pay no rent while the case runs.`, 'money');
  return { ok: true, msg: `Eviction started — ${months} months at ${law.court}, ${formatMoney(cost, S.country)} paid. No rent while it runs.` };
}

/* ------------------------------------------------------------------ *
   Ending a tenancy and settling the deposit against real damage.
   ------------------------------------------------------------------ */
export function endTenancy(S, prop, reason = 'left') {
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const L = normalizeLandlordState(S, prop);
  if (!L.tenant) return { ok: false, msg: 'There is no tenant at this property.' };
  const t = L.tenant;
  const name = t.name;
  const deductions = (L.damage || [])
    .filter(d => d.tenantCaused && (d.status === 'open' || d.status === 'ignored'))
    .map(d => ({ label: d.label, costLocal: d.costLocal }));
  const total = deductions.reduce((a, d) => a + d.costLocal, 0);
  const depositLocal = L.deposit.held ? L.deposit.amountLocal : 0;
  const remainder = Math.max(0, depositLocal - total);
  L.damage = (L.damage || []).filter(d => !(d.tenantCaused && (d.status === 'open' || d.status === 'ignored')));
  L.tenant = null;
  L.voidMonths = 0;
  L.lease = { termMonths: 12, monthsLeft: 12, count: L.lease.count, renewalOffered: false };

  if (total <= 0) {
    if (depositLocal > 0) {
      walletMove(S, -depositLocal, `Deposit returned to ${name} — ${prop.name} left in good order`, 'housing');
      L.deposit.held = false;
      L.deposit.returnedLocal = depositLocal;
    }
    recordJournal(S, `${name} left ${prop.name} (${reason}). The flat was in good order, so the full ${formatMoney(depositLocal, S.country)} deposit went back.`, 'money');
    return { ok: true, msg: `${name} left. No damage — the full deposit was returned.`, deductions: [], totalLocal: 0, remainderLocal: depositLocal };
  }
  /* Real damage: the player decides — keep it, return it, or go to court. */
  L.depositSettlement = {
    tenantName: name,
    reason,
    items: deductions,
    totalLocal: total,
    remainderLocal: remainder,
    depositLocal,
    status: 'pending'
  };
  recordJournal(S, `${name} left ${prop.name} (${reason}). Damage found: ${deductions.map(d => `${d.label.toLowerCase()} (${formatMoney(d.costLocal, S.country)})`).join(', ')} — ${formatMoney(total, S.country)} against a ${formatMoney(depositLocal, S.country)} deposit. Decide what to do with it.`, 'money');
  queueScene(S, {
    key: `deposit_${prop.id}_${S.year}_${S.month}`,
    category: 'money',
    title: `Deposit dispute — ${prop.name}`,
    text: `${name} left ${prop.name}. The damage list is: ${deductions.map(d => `${d.label} — ${formatMoney(d.costLocal, S.country)}`).join('; ')}. Total ${formatMoney(total, S.country)} against a ${formatMoney(depositLocal, S.country)} deposit. Keep the deposit for the damage (return ${formatMoney(remainder, S.country)}), return the whole deposit, or take it to ${evictionLawFor(prop.country || S.country).court} — the court decides on the evidence, and the filing costs ${formatMoney(Math.max(500, Math.round(effectiveMonthlyRentLocal(S, prop) * 0.3)), S.country)}.`,
    choices: [
      { label: `Keep ${formatMoney(total, S.country)} for the damage, return ${formatMoney(remainder, S.country)}`, effect: () => settleDeposit(S, prop.id, 'keep') },
      { label: `Return the full ${formatMoney(depositLocal, S.country)} deposit`, effect: () => settleDeposit(S, prop.id, 'return') },
      { label: `Take it to ${evictionLawFor(prop.country || S.country).court} (filing ${formatMoney(Math.max(500, Math.round(effectiveMonthlyRentLocal(S, prop) * 0.3)), S.country)})`, effect: () => settleDeposit(S, prop.id, 'court') }
    ]
  });
  return { ok: true, msg: `${name} left. Damage of ${formatMoney(total, S.country)} — decide what happens to the deposit.`, deductions, totalLocal: total, remainderLocal: remainder };
}

export function settleDeposit(S, propId, choice) {
  ensureExtendedState(S);
  const prop = (S.housing?.properties || []).find(p => p.id === propId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const L = normalizeLandlordState(S, prop);
  const st = L.depositSettlement;
  if (!st || st.status !== 'pending') return { ok: false, msg: 'There is no deposit dispute waiting at this property.' };
  const law = evictionLawFor(prop.country || S.country);
  if (choice === 'keep') {
    if (st.remainderLocal > 0) {
      walletMove(S, -st.remainderLocal, `Deposit returned to ${st.tenantName} after deductions — ${prop.name}`, 'housing');
    }
    L.deposit.held = false;
    L.deposit.keptLocal = st.totalLocal;
    L.deposit.returnedLocal = st.remainderLocal;
    st.status = 'kept';
    recordJournal(S, `You kept ${formatMoney(st.totalLocal, S.country)} of ${st.tenantName}'s deposit for the damage at ${prop.name} and returned ${formatMoney(st.remainderLocal, S.country)}.`, 'money');
    return { ok: true, msg: `Kept ${formatMoney(st.totalLocal, S.country)} for the damage, returned ${formatMoney(st.remainderLocal, S.country)}.` };
  }
  if (choice === 'return') {
    if (st.depositLocal > 0) {
      walletMove(S, -st.depositLocal, `Deposit returned in full to ${st.tenantName} — ${prop.name}`, 'housing');
    }
    L.deposit.held = false;
    L.deposit.returnedLocal = st.depositLocal;
    L.deposit.keptLocal = 0;
    st.status = 'returned';
    recordJournal(S, `You returned ${st.tenantName}'s full ${formatMoney(st.depositLocal, S.country)} deposit for ${prop.name}, damage and all.`, 'money');
    return { ok: true, msg: `Returned the full ${formatMoney(st.depositLocal, S.country)} deposit.` };
  }
  if (choice === 'court') {
    const fee = Math.max(500, Math.round(effectiveMonthlyRentLocal(S, prop) * 0.3));
    if ((Number(S.money?.cash) || 0) < fee) {
      return { ok: false, msg: `Taking this to ${law.court} costs ${formatMoney(fee, S.country)} to file — not enough cash.` };
    }
    walletMove(S, -fee, `Small-claims filing — deposit dispute over ${prop.name} (${law.court})`, 'housing');
    /* Documented damage wins most of the time; an undocumented claim loses. */
    const win = rand(S) < 0.8;
    if (win) {
      walletMove(S, fee, `Court awarded the deposit deductions and your filing fee back — ${prop.name} (${law.court})`, 'housing');
      if (st.remainderLocal > 0) {
        walletMove(S, -st.remainderLocal, `Deposit returned to ${st.tenantName} after the court award — ${prop.name}`, 'housing');
      }
      L.deposit.held = false;
      L.deposit.keptLocal = st.totalLocal;
      L.deposit.returnedLocal = st.remainderLocal;
      st.status = 'court-win';
      recordJournal(S, `${law.court} ruled for you: you kept ${formatMoney(st.totalLocal, S.country)} of ${st.tenantName}'s deposit for the damage at ${prop.name}, and the court gave your ${formatMoney(fee, S.country)} filing fee back.`, 'money');
      return { ok: true, msg: `The court ruled for you — kept ${formatMoney(st.totalLocal, S.country)}, fee returned.` };
    }
    if (st.depositLocal > 0) {
      walletMove(S, -st.depositLocal, `Court ordered the full deposit returned to ${st.tenantName} — ${prop.name}`, 'housing');
    }
    L.deposit.held = false;
    L.deposit.returnedLocal = st.depositLocal;
    L.deposit.keptLocal = 0;
    st.status = 'court-lost';
    recordJournal(S, `${law.court} ruled against you: the full ${formatMoney(st.depositLocal, S.country)} deposit went back to ${st.tenantName}, and the ${formatMoney(fee, S.country)} filing fee is lost.`, 'money');
    return { ok: true, msg: `The court ruled against you — full deposit returned, fee lost.` };
  }
  return { ok: false, msg: 'Choose what to do with the deposit: keep it, return it, or go to court.' };
}

/* ------------------------------------------------------------------ *
   Damage — fix it now, fix it cheaply, or ignore it.
   ------------------------------------------------------------------ */
export function fixDamage(S, propId, damageId, mode) {
  ensureExtendedState(S);
  const prop = (S.housing?.properties || []).find(p => p.id === propId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const L = normalizeLandlordState(S, prop);
  const d = (L.damage || []).find(x => x.id === damageId);
  if (!d) return { ok: false, msg: 'That damage is no longer on the list.' };
  if (d.status !== 'open') return { ok: false, msg: `That damage is already ${d.status === 'ignored' ? 'being ignored' : 'fixed'}.` };
  const t = L.tenant;
  if (mode === 'full') {
    if ((Number(S.money?.cash) || 0) < d.costLocal) {
      return { ok: false, msg: `A proper fix costs ${formatMoney(d.costLocal, S.country)} — not enough cash.` };
    }
    walletMove(S, -d.costLocal, `Repair: ${d.label} at ${prop.name}`, 'housing');
    d.status = 'fixed';
    prop.conditionPct = clamp((prop.conditionPct ?? 100) + 2, 0, 100);
    if (t) t.relationship = clamp(t.relationship + 3);
    recordJournal(S, `Fixed ${d.label.toLowerCase()} at ${prop.name} properly (${formatMoney(d.costLocal, S.country)}).`, 'housing');
    return { ok: true, msg: `Fixed properly for ${formatMoney(d.costLocal, S.country)}.` };
  }
  if (mode === 'cheap') {
    const cheapCost = Math.round(d.costLocal * 0.4);
    if ((Number(S.money?.cash) || 0) < cheapCost) {
      return { ok: false, msg: `Even a cheap fix costs ${formatMoney(cheapCost, S.country)} — not enough cash.` };
    }
    walletMove(S, -cheapCost, `Cheap repair: ${d.label} at ${prop.name}`, 'housing');
    d.status = 'cheap-fixed';
    prop.conditionPct = clamp((prop.conditionPct ?? 100) + 1, 0, 100);
    recordJournal(S, `Patched ${d.label.toLowerCase()} at ${prop.name} cheaply (${formatMoney(cheapCost, S.country)}). It may break again.`, 'housing');
    return { ok: true, msg: `Patched cheaply for ${formatMoney(cheapCost, S.country)} — it may break again.` };
  }
  /* ignore */
  d.status = 'ignored';
  prop.conditionPct = Math.max(25, (prop.conditionPct ?? 100) - 4);
  if (t) {
    t.relationship = clamp(t.relationship - 12);
    recordJournal(S, `You left ${d.label.toLowerCase()} at ${prop.name} unfixed. ${t.name} is not happy living with it.`, 'housing');
    if (t.relationship < 15) {
      recordJournal(S, `${t.name} has had enough of the broken ${d.label.toLowerCase()} at ${prop.name} and is moving out.`, 'money');
      endTenancy(S, prop, 'left over unfixed damage');
      return { ok: true, msg: `Ignored it — and ${t.name} moved out over it.` };
    }
  }
  return { ok: true, msg: 'Left unfixed — the condition falls and the tenant notices.' };
}

/* ------------------------------------------------------------------ *
   Lease renewal — the player chooses, the tenant answers.
   ------------------------------------------------------------------ */
export function renewLease(S, propId, choice, raisePct = 5) {
  ensureExtendedState(S);
  const prop = (S.housing?.properties || []).find(p => p.id === propId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const L = normalizeLandlordState(S, prop);
  if (!L.tenant) return { ok: false, msg: 'There is no tenant to renew with at this property.' };
  const t = L.tenant;
  const market = marketStateFor(S, prop.country || S.country);
  if (choice === 'same') {
    L.lease.monthsLeft = 12;
    L.lease.renewalOffered = false;
    t.relationship = clamp(t.relationship + 5);
    recordJournal(S, `${t.name} renewed the lease on ${prop.name} for another 12 months at the same ${formatMoney(effectiveMonthlyRentLocal(S, prop), S.country)}/month.`, 'money');
    return { ok: true, outcome: 'renewed', msg: `Lease renewed at the same rent for 12 months.` };
  }
  if (choice === 'raise') {
    const pct = clamp(Number(raisePct) || 5, 1, 20);
    const marketAdj = market.state === 'rising' ? 0.10 : market.state === 'falling' ? -0.15 : 0;
    const acceptProb = clamp(0.55 + t.relationship / 200 - pct / 20 + marketAdj, 0.05, 0.95);
    const roll = rand(S);
    if (roll < acceptProb) {
      prop.nativeMonthlyRent = Math.round((Number(prop.nativeMonthlyRent) || 0) * (1 + pct / 100));
      L.lease.monthsLeft = 12;
      L.lease.renewalOffered = false;
      t.relationship = clamp(t.relationship - 5);
      recordJournal(S, `${t.name} accepted a ${pct}% rent rise on ${prop.name} — now ${formatMoney(effectiveMonthlyRentLocal(S, prop), S.country)}/month for another 12 months.`, 'money');
      return { ok: true, outcome: 'accepted', pct, msg: `${t.name} accepted the ${pct}% rise — ${formatMoney(effectiveMonthlyRentLocal(S, prop), S.country)}/month.` };
    }
    if (rand(S) < 0.5) {
      const halfPct = Math.max(1, Math.round(pct / 2));
      prop.nativeMonthlyRent = Math.round((Number(prop.nativeMonthlyRent) || 0) * (1 + halfPct / 100));
      L.lease.monthsLeft = 12;
      L.lease.renewalOffered = false;
      t.relationship = clamp(t.relationship - 3);
      recordJournal(S, `${t.name} pushed back on the ${pct}% rise at ${prop.name} and you met halfway at ${halfPct}% — now ${formatMoney(effectiveMonthlyRentLocal(S, prop), S.country)}/month.`, 'money');
      return { ok: true, outcome: 'negotiated', pct: halfPct, msg: `${t.name} negotiated you down to ${halfPct}% — ${formatMoney(effectiveMonthlyRentLocal(S, prop), S.country)}/month.` };
    }
    const name = t.name;
    t.relationship = clamp(t.relationship - 15);
    endTenancy(S, prop, `left over a ${pct}% rent rise`);
    return { ok: true, outcome: 'left', pct, msg: `${name} refused the ${pct}% rise and moved out.` };
  }
  if (choice === 'sell') {
    return sellWithTenant(S, prop);
  }
  return { ok: false, msg: 'Choose: renew, raise the rent, or sell with the tenant in place.' };
}

/* Sell with the tenant in place: about 10% less, the buyer takes the
   tenant over, the deposit is settled (damage kept, rest returned). */
/* ------------------------------------------------------------------ *
   Deposit settlement on a sale — one source of truth, used by both the
   landlord "Sell with tenant in place" action and the plain Sell button
   (completeLifeSystems sellOwnedProperty). A sale ends the tenancy, so
   the deposit is settled the same way in both places: documented
   tenant-caused damage is kept, the rest goes back to the tenant.
   Returns { kept, returned, tenantName } — all 0/null when there is no
   held deposit. (Coordinator merge fix, v2.15: before this, the plain
   Sell button sold a tenanted property without settling the deposit,
   so the deposit stayed in the player's cash.)
   ------------------------------------------------------------------ */
export function settleDepositOnSale(S, prop, saleNote) {
  if (!prop) return { kept: 0, returned: 0, tenantName: null };
  const L = normalizeLandlordState(S, prop);
  const t = L.tenant;
  const name = t ? t.name : null;
  let kept = 0;
  let returned = 0;
  if (t && L.deposit.held) {
    const deductions = (L.damage || [])
      .filter(d => d.tenantCaused && (d.status === 'open' || d.status === 'ignored'))
      .reduce((a, d) => a + d.costLocal, 0);
    kept = Math.min(deductions, L.deposit.amountLocal);
    returned = Math.max(0, L.deposit.amountLocal - kept);
    if (returned > 0) walletMove(S, -returned, `Deposit returned to ${name} — ${prop.name} ${saleNote}`, 'housing');
    L.deposit.held = false;
    L.deposit.keptLocal = kept;
    L.deposit.returnedLocal = returned;
  }
  return { kept, returned, tenantName: name };
}

export function sellWithTenant(S, prop) {
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const L = normalizeLandlordState(S, prop);
  const t = L.tenant;
  const name = t ? t.name : null;
  const conditionPct = prop.conditionPct ?? 100;
  const condFactor = 0.72 + (conditionPct / 100) * 0.28;
  const grossSale = Math.round((Number(prop.valueLocal) || 0) * condFactor * 0.9);
  const closingFee = Math.round(grossSale * 0.025);
  const debtPayoff = Math.max(0, Math.round(prop.installmentRemaining || 0));
  const netProceeds = grossSale - closingFee - debtPayoff;
  if (netProceeds < 0 && (Number(S.money?.cash) || 0) + netProceeds < 0) {
    return { ok: false, msg: 'What is still owed on this property is more than a tenanted sale would bring in.' };
  }
  /* Settle the deposit first: damage kept, the rest back to the tenant. */
  settleDepositOnSale(S, prop, 'sold with tenant in place');
  S.housing.properties = (S.housing.properties || []).filter(x => x.id !== prop.id);
  walletMove(S, netProceeds, `Sold ${prop.name} with ${name ? `${name} in place` : 'tenant in place'} (10% tenanted discount)`, 'housing');
  recordJournal(S, `Sold ${prop.name} with ${name ? `${name} still living there` : 'the tenant still living there'} for ${formatMoney(netProceeds, S.country)} after fees — about 10% less than an empty sale, and the new owner takes over the tenancy.`, 'money');
  return { ok: true, outcome: 'sold', msg: `Sold with the tenant in place for ${formatMoney(netProceeds, S.country)} after fees.`, netProceeds };
}

/* ------------------------------------------------------------------ *
   Maintenance — a real action with a real price, from the same
   value-based pricing as the renovation (a patch, not a full
   restoration: +10 condition for 0.8% of value).
   ------------------------------------------------------------------ */
export function maintainProperty(S, propId) {
  ensureExtendedState(S);
  const prop = (S.housing?.properties || []).find(p => p.id === propId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const L = normalizeLandlordState(S, prop);
  const conditionPct = prop.conditionPct ?? 100;
  if (conditionPct >= 98) return { ok: false, msg: `${prop.name} is in good shape — nothing to maintain yet.` };
  const cost = Math.max(250, Math.round((Number(prop.valueLocal) || 0) * 0.008));
  if ((Number(S.money?.cash) || 0) < cost) {
    return { ok: false, msg: `Maintenance on ${prop.name} costs ${formatMoney(cost, S.country)} (wear and tear, condition +10) — not enough cash.` };
  }
  walletMove(S, -cost, `Maintenance — ${prop.name} (wear and tear, condition +10)`, 'housing');
  prop.conditionPct = clamp(conditionPct + 10, 0, 100);
  L.monthsSinceMaintenance = 0;
  recordJournal(S, `Paid ${formatMoney(cost, S.country)} for maintenance on ${prop.name} — fresh paint, small fixes, condition back to ${Math.round(prop.conditionPct)}%.`, 'housing');
  return { ok: true, msg: `Maintenance done for ${formatMoney(cost, S.country)} — condition ${Math.round(prop.conditionPct)}%.` };
}

/* One property's landlord summary for the UI (pure read). */
export function landlordSummary(S, prop) {
  const L = normalizeLandlordState(S, prop);
  const market = marketStateFor(S, prop.country || S.country);
  const t = L.tenant;
  return {
    tenant: t,
    deposit: L.deposit,
    depositSettlement: L.depositSettlement,
    lease: L.lease,
    damage: (L.damage || []).filter(d => d.status === 'open' || d.status === 'cheap-fixed'),
    voidMonths: L.voidMonths,
    conditionPct: prop.conditionPct ?? 100,
    rentLocal: effectiveMonthlyRentLocal(S, prop),
    market,
    law: evictionLawFor(prop.country || S.country)
  };
}
