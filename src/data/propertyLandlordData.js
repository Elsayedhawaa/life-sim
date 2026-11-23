/* ============================================================================
   World Life 2.0 — Landlord data (v2.15 Worker 1)
   The country's own rules for being a landlord: how long an eviction
   takes, what it costs, how big a deposit is, and where a deposit
   dispute goes. Figures are modelled from each country's real law
   (notice periods, court routes, deposit caps) — the shape is real,
   the exact months are the game's model of it, and the UI always says
   the cost and the time BEFORE the player commits.
   ========================================================================== */

/* Eviction + deposit law, one row per country.
   noticeMonths: how much notice a tenant gets before court action.
   courtMonths: how long the court / tribunal stage takes once filed.
   costRentMonths: the court + filing cost, as a multiple of one month's rent.
   court: the real venue that hears it.
   depositMonths: the deposit the tenant pays (1–2 months' rent, the real rule).
   depositNote: where the deposit sits / what protects it. */
export const EVICTION_LAW = {
  egy: { noticeMonths: 1, courtMonths: 9, costRentMonths: 2.0, court: 'the Civil Court', depositMonths: 2, depositNote: 'Held by you as landlord; there is no deposit-protection scheme, so a dispute is decided by the court on the evidence.' },
  sau: { noticeMonths: 1, courtMonths: 3, costRentMonths: 1.0, court: 'the Rental Disputes Committee (Ejar)', depositMonths: 1, depositNote: 'Held by you as landlord under the Ejar contract; the committee decides disputes fast.' },
  uae: { noticeMonths: 3, courtMonths: 4, costRentMonths: 1.5, court: 'the Rental Dispute Settlement Centre (RDC)', depositMonths: 1, depositNote: 'Held by you as landlord; the RDC in Dubai (or the Rent Committee elsewhere) decides disputes.' },
  gbr: { noticeMonths: 2, courtMonths: 4, costRentMonths: 1.5, court: 'the County Court', depositMonths: 1, depositNote: 'Protected in a government-backed deposit scheme (DPS, TDS or mydeposits) — the scheme, not you, holds it.' },
  usa: { noticeMonths: 1, courtMonths: 2, costRentMonths: 1.0, court: 'the local Housing Court', depositMonths: 1, depositNote: 'Held by you as landlord; most states cap it at 1–2 months and require it back within 30 days of the tenant leaving.' },
  deu: { noticeMonths: 3, courtMonths: 6, costRentMonths: 2.0, court: 'the local court (Amtsgericht)', depositMonths: 2, depositNote: 'The Kaution is capped by law at 3 months’ cold rent; this game uses 2. It must sit in a separate account.' },
  can: { noticeMonths: 2, courtMonths: 3, costRentMonths: 1.0, court: 'the provincial Landlord and Tenant Board / tribunal', depositMonths: 1, depositNote: 'Held by you as landlord; in several provinces a deposit is really a last month’s rent, not a damage deposit.' },
  aus: { noticeMonths: 2, courtMonths: 2, costRentMonths: 1.0, court: 'the state Civil and Administrative Tribunal (NCAT / VCAT)', depositMonths: 1, depositNote: 'Lodged with the state bond authority — the tribunal decides any claim against it.' },
  nld: { noticeMonths: 3, courtMonths: 5, costRentMonths: 1.5, court: 'the cantonal court (kantonrechter)', depositMonths: 2, depositNote: 'Held by you as landlord; Dutch law caps it at 3 months’ rent and the judge decides disputes.' },
  fra: { noticeMonths: 3, courtMonths: 6, costRentMonths: 1.5, court: 'the local court (tribunal d’instance)', depositMonths: 1, depositNote: 'Capped by law at 1 month’s rent (2 if furnished). The deposit must be returned within 1–2 months of the tenant leaving.' },
  jpn: { noticeMonths: 6, courtMonths: 4, costRentMonths: 1.5, court: 'the summary court', depositMonths: 2, depositNote: 'The shikikin deposit is held by you; the guarantor company, not the court, usually settles disputes first.' },
  ita: { noticeMonths: 6, courtMonths: 8, costRentMonths: 2.0, court: 'the civil court (Tribunale)', depositMonths: 2, depositNote: 'Held by you as landlord; Italian courts are slow, so a dispute can take the better part of a year.' },
  sgp: { noticeMonths: 1, courtMonths: 2, costRentMonths: 1.0, court: 'the Small Claims Tribunal', depositMonths: 2, depositNote: 'Held by you as landlord; the Small Claims Tribunal hears deposit disputes up to S$20,000.' },
  bra: { noticeMonths: 1, courtMonths: 6, costRentMonths: 1.5, court: 'the civil court (Juizado Especial Cível)', depositMonths: 2, depositNote: 'Held by you as landlord; the caução is usually 1–3 months’ rent under the Tenancy Act.' },
  ind: { noticeMonths: 1, courtMonths: 8, costRentMonths: 1.0, court: 'the Rent Control Tribunal / civil court', depositMonths: 2, depositNote: 'Held by you as landlord; Indian courts are slow, so an eviction can drag on for years in practice.' },
  che: { noticeMonths: 3, courtMonths: 5, costRentMonths: 1.5, court: 'the cantonal conciliation authority, then the court', depositMonths: 2, depositNote: 'The deposit must sit in a blocked bank account in the tenant’s name; the bank only releases it with both signatures or a court order.' },
  swe: { noticeMonths: 3, courtMonths: 4, costRentMonths: 1.0, court: 'the Rent Tribunal (Hyresnämnden)', depositMonths: 1, depositNote: 'Deposits are uncommon in Sweden — the tribunal, not a deposit, is what protects you.' },
  tur: { noticeMonths: 1, courtMonths: 6, costRentMonths: 1.5, court: 'the civil court of peace (Sulh Hukuk)', depositMonths: 2, depositNote: 'Held by you as landlord; the deposit is usually 1–3 months’ rent and disputes go to the Sulh Hukuk court.' }
};

/* Fallback for any country without a row above (never blank law). */
export const DEFAULT_EVICTION_LAW = {
  noticeMonths: 2, courtMonths: 4, costRentMonths: 1.5,
  court: 'the local housing court', depositMonths: 1,
  depositNote: 'Held by you as landlord; the local court decides any dispute.'
};

export function evictionLawFor(countryId) {
  return EVICTION_LAW[countryId] || DEFAULT_EVICTION_LAW;
}

/* ------------------------------------------------------------------ *
   Damage — what can break, and what it costs to fix.
   pctOfValue: the repair price as a share of the property's value —
   the same value-based pricing the game's renovation uses, so a
   boiler in a villa costs more than a boiler in a studio, and no
   price is an invented flat fee. tenantCaused: the tenant pays for
   it out of the deposit at the end of the tenancy.
   ------------------------------------------------------------------ */
export const DAMAGE_TYPES = [
  { key: 'boiler', label: 'Boiler / water heater failed', pctOfValue: 0.025, condHit: 6, tenantCaused: false },
  { key: 'roof', label: 'Roof leak — water coming through the ceiling', pctOfValue: 0.018, condHit: 8, tenantCaused: false },
  { key: 'plumbing', label: 'Burst pipe / plumbing leak', pctOfValue: 0.012, condHit: 5, tenantCaused: false },
  { key: 'appliance', label: 'Fridge / cooker broke down', pctOfValue: 0.008, condHit: 3, tenantCaused: false },
  { key: 'wall', label: 'Tenant damaged a wall and the door frames', pctOfValue: 0.006, condHit: 4, tenantCaused: true },
  { key: 'window', label: 'Broken window', pctOfValue: 0.004, condHit: 2, tenantCaused: true }
];

/* ------------------------------------------------------------------ *
   The market cycle — the country's own rhythm, driven by the era.
   A 7-year cycle: 2 rising years, 3 stable, 2 falling. The position
   in the cycle depends on the year and the country, so Egypt in 2008
   is not in the same market as Britain in 2008. World events (Worker
   4's module) can push the index further through S.worldEvents — see
   applyWorldEventMarketShock in propertyLandlord.js.
   ------------------------------------------------------------------ */
export const MARKET_CYCLE_LENGTH = 7;
export const MARKET_STATES = {
  rising: { label: 'Rising', rentIndex: 1.10, priceIndex: 1.12, line: 'Prices and rents are climbing — a good time to own, a hard time to buy.' },
  stable: { label: 'Stable', rentIndex: 1.00, priceIndex: 1.00, line: 'Prices and rents are holding steady.' },
  falling: { label: 'Falling', rentIndex: 0.90, priceIndex: 0.88, line: 'Prices and rents are falling — buyers get a bargain, landlords earn less.' }
};

/* Tenant job titles — ordinary jobs a tenant plausibly holds. The
   employer always comes from the game's real employer pool. */
export const TENANT_JOB_TITLES = [
  'Teacher', 'Nurse', 'Accountant', 'Engineer', 'Shop Assistant',
  'Driver', 'Office Manager', 'Chef', 'Sales Assistant', 'Technician',
  'Bank Clerk', 'Pharmacist', 'Electrician', 'Receptionist', 'Warehouse Worker'
];
