import {closePlayerLease} from './playerTenancy.js';
import{careerHours}from'./careerSchedule.js';
import{recordCivilLoss,fileCivilClaim,tickCivilClaims}from './civilClaims.js';
import{personMind}from './personMind.js';
import {chargeFamilyEducation as chargeLivingParents,familyCoversUniversity as familyCoversTuition} from './educationFunding.js';
import {hasCurrentLanguage} from '../data/languageQualifications.js';
import {propertyAreas,pricedPropertyArea,outdoorAnnualBudget} from '../data/propertyAreas.js';
/* ============================================================================
   World Life Complete Edition — Deep Systems & Causal Chain Wiring
   Connects 100% of v1 + 50% Web Expansion into live monthly simulation:
   - Compounds, Unit Shapes, Finishing Tiers, Room-by-Room Furnishing (Gehaz!),
     Upgrades, Household Staff, Land Purchase & Month-by-Month Construction
   - Bait Al-Watan (USD Expat), Sakan CBE 3%/8%, Saudi Sakani 150k SAR,
     Saudi 4M SAR Premium Residency & UAE 2M AED Golden Visa triggers
   - 1,111 Cars (Colors, Trims, Mods, Driving Licence), 1,293 Shop Items + BNPL
   - 8-Tier Credit Cards, Global/Regional Stocks/ETFs/Sukuk, Zakat & Hawala
   - International Licensing Boards (PLAB, USMLE, Approbation, SCFHS, DHA, SCE),
     Germany Chancenkarte (6-pt), UK £41,700 rule, UAE Nafis Top-Up
   - Surgeries (incl. LASIK), IVF/ICSI Fertility, 102 Vacations + Nusuk Hajj/Umrah,
     Habits/Activities, Civil Lawsuits & Criminal Courts
   ========================================================================== */

import { rand, randInt, chance, clamp, pick } from '../core/rng.js';
import { nextId, recordJournal, walletMove, moveBalance, ensureExtendedState, computeNetWorthLocal, queueScene } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraLocalCost, eraSalary, convertCurrency, goldPricePerGram, inflationRate, vacationEntitlementDays,computeMonthlyNetPay } from '../data/economy.js';
import {
  PROPERTY_UNITS,
  FINISHING_TIERS,
  COMPOUNDS_BY_COUNTRY,
  NEIGHBORHOODS_BY_COUNTRY,
  LAND_PLOTS,
  PAYMENT_PLANS,
  HOME_UPGRADES,
  ROOM_FURNITURE_CATALOG,
  HOUSEHOLD_STAFF_CATALOG,
  PROPERTY_DEV_SPECS
} from '../data/megaRealEstate.js';
import {
  CAR_TRIMS,
  CAR_COLORS,
  CAR_MODS,
  CARS_MEGA_CATALOG,
  SHOP_MEGA_CATALOG,
  BNPL_PROVIDERS
} from '../data/megaCarsAndShop.js';
import {
  V1_CREDIT_CARDS,
  GLOBAL_MARKET_ASSETS,
  REMITTANCE_CHANNELS
} from '../data/megaFinanceAndMarkets.js';
import {
  PROFESSIONAL_LICENSES,
  LANGUAGE_EXAMS,
  ALL_SURGERIES,
  V1_FERTILITY_TREATMENTS,
  ALL_VACATIONS,
  V1_ACTIVITIES,
  CIVIL_LAWSUITS,
  V1_CRIMES,
  V1_PARTTIME_JOBS,
  V1_CASH_JOBS
} from '../data/megaCareerEduMedical.js';
import { getEmployersFor } from '../data/institutions.js';
import { hasCertifiedEnglish, canLegallyWorkInCurrentCountry, syncHealthCover } from './careerEducationEngine.js';
import { runBusinessOp } from './businessEngine.js';
import { emitFact, rememberDeed } from './soulEngine.js';
/* v2.15 (coordinator merge fix): the plain Sell button must settle a
   tenant's deposit the same way "Sell with tenant in place" does. */
import { settleDepositOnSale } from './propertyLandlord.js';
import { FURNISHABLE_KEYS } from '../ui/planRoomLookup.js';
import { executeCountryRelocation, checkCanCrossBorder, transitionResidency, grantGameGraduatePermit, needsTouristVisaFor, hasValidPassport } from './visaMigrationEngine.js';
import { finalizePropertyPurchase, finalizeCarPurchase, hasValidResidenceForBanking, purchase } from './economyEngine.js';
import { startPregnancy } from './marriageFamilyEngine.js';

/* ============================================================================
   1. DEEP REAL ESTATE: COMPOUNDS, UNIT SHAPES, FINISHING, ROOMS, STAFF & LAND
   ========================================================================== */

export function buyCompoundOrDistrictUnit(S, opts = {}) {
  ensureExtendedState(S);
  if (S.player.age < 18) return { ok: false, msg: 'Must be 18+ to sign property contracts.' };

  const targetCountry = opts.country || S.country;
  const compounds = COMPOUNDS_BY_COUNTRY[targetCountry] || [];
  const districts = NEIGHBORHOODS_BY_COUNTRY[targetCountry] || [];
  const dev = compounds.find(c => c.id === opts.devId) || districts.find(d => d.id === opts.devId) || compounds[0];
  if (!dev) return { ok: false, msg: 'Development not found.' };

  /* Enforce Special National Program Eligibility Rules! */
  if (dev.program === 'expat_only' && !(S.homeCountry === 'egy' && S.country !== 'egy')) {
    return { ok: false, msg: 'Bait Al-Watan (USD) allocations require living & earning abroad as an Egyptian expat!' };
  }
  if (dev.program === 'citizen_subsidy' && !S.legal.citizenships.includes(targetCountry)) {
    return { ok: false, msg: `${dev.name} is a subsidized housing initiative reserved for ${getCountry(targetCountry).adjective} citizens.` };
  }
  if (targetCountry === 'sau' && dev.program === 'citizen_subsidy' && S.player.age < 20) {
    return { ok: false, msg: 'Sakani REDF eligibility starts at age 20 for Saudi citizens.' };
  }

  /* A missing or stale unit id must never buy a different property. */
  const unit = PROPERTY_UNITS.find(u => u.id === opts.unitId);
  if (!unit) return { ok: false, msg: 'That property type is not on the market any more. Nothing was bought and nothing was charged.' };
  if(unit.countries&&!unit.countries.includes(targetCountry))return {ok:false,msg:'That property style is not offered in this country.'};
  const finish = FINISHING_TIERS.find(f => f.id === opts.finishId) || FINISHING_TIERS[2];
  const plan = PAYMENT_PLANS.find(p => p.id === opts.planId) || PAYMENT_PLANS[0];

  const basePpmLocal = eraLocalCost(dev.ppm2026, targetCountry, S.year);
  let rawNativePrice = Math.round(basePpmLocal * pricedPropertyArea(unit) * unit.priceMult * finish.costMult * (plan.totalMarkup || 1.0));

  /* Saudi Sakani 150,000 SAR Non-Refundable State Grant for First Home! */
  let stateGrantNote = '';
  if (targetCountry === 'sau' && S.legal.citizenships.includes('sau') && S.housing.properties.length === 0 && S.player.age >= 20 && S.year >= 2017) {
    const grantSar = eraLocalCost(150000, 'sau', S.year);
    rawNativePrice = Math.max(Math.round(rawNativePrice * 0.4), rawNativePrice - grantSar);
    stateGrantNote = ` (Sakani 150k SAR state grant applied!)`;
  } else if (targetCountry === 'uae' && S.legal.citizenships.includes('uae') && S.housing.properties.length === 0 && S.player.age >= 21) {
    const grantAed = eraLocalCost(350000, 'uae', S.year);
    rawNativePrice = Math.max(Math.round(rawNativePrice * 0.35), rawNativePrice - grantAed);
    stateGrantNote = ` (Sheikh Zayed Housing grant applied!)`;
  }

  const downPct = plan.years > 0 ? Math.max(0.05, Number(plan.downPct ?? 0.10)) : 1.0;
  const nativeDown = Math.round(rawNativePrice * downPct);
  const downInPlayer = Math.round(convertCurrency(nativeDown, targetCountry, S.country, S.year));

  const months = (plan.years || 0) * 12;
  const nativeRem = months > 0 ? (rawNativePrice - nativeDown) : 0;
  const nativeMonthlyInst = months > 0 ? Math.round(nativeRem / months) : 0;
  const nativeRent = Math.round((rawNativePrice * (dev.rentalYieldPct || 0.065) * finish.rentMult) / 12);

  // Pricing and state grants stay here; the purchase itself goes through the
  // ONE property-buy core (D1) — same ledger, same instalment chain, same
  // move-in rules as buyProperty. (Instalment plans are now blocked during
  // active bankruptcy, as with every other contract.)
  const res = finalizePropertyPurchase(S, {
    catalogId: dev.id,
    unitId: unit.id,
    styleId: unit.styleId || null,
    hasGarden: unit.hasGarden === true || /garden/i.test(unit.name),
    hasPool: unit.hasPool === true || /private.pool/i.test(unit.name),
    name: `${dev.name} — ${unit.name}`,
    country: targetCountry,
    city: dev.city || getCountry(targetCountry).cities[0],
    tier: dev.tier,
    rooms: unit.rooms,
    areaM2: unit.area,
    ...propertyAreas(unit),
    outdoorAnnualNative:outdoorAnnualBudget(unit,basePpmLocal),
    shape: unit.shape || 'apartment',
    finishing: finish.id,
    nativeValue: rawNativePrice,
    nativeMonthlyRent: nativeRent,
    downInPlayerLocal: downInPlayer,
    happinessBoost: Math.max(2, finish.hap + 4)
  }, months > 0 ? { months, nativeRemaining: nativeRem, nativeMonthlyInst, planKind: plan.label } : null,
  { moveIn: finish.canLive && opts.moveIn !== false });
  if (!res.ok) return res;
  const prop = res.prop;

  /* Check Automatic Investor Golden Visa / Saudi 4M SAR Premium Residency Triggers! */
  checkRealEstateResidencyUnlocks(S, prop);

  recordJournal(
    S,
    `Acquired ${prop.name} (${unit.area} m², ${finish.label})${stateGrantNote} under ${plan.label}.`,
    'milestone'
  );
  return { ok: true, msg: `Acquired ${prop.name}!`, prop };
}

function checkRealEstateResidencyUnlocks(S, prop) {
  /* Saudi Arabia 4,000,000 SAR Mortgage-Free Residential Property -> Real Estate Owner Premium Residency! */
  if (
    prop.country === 'sau' &&
    S.year >= 2024 &&
    !S.legal.citizenships.includes('sau') &&
    prop.monthsLeft === 0 &&
    prop.nativeValue >= 4000000
  ) {
    if (S.country === 'sau') {
      transitionResidency(S, 'golden_visa', { permitName: 'Saudi Real-Estate Premium Residency (Iqama Mumayaza)', expiresYear: null, force: true });
    }
    recordJournal(S, `Owning an unencumbered 4M+ SAR home qualified you for Saudi Premium Residency (Iqama Mumayaza) — full self-sponsorship without a Kafeel!`, 'visa');
  }

  /* UAE 2,000,000 AED Property Value -> 10-Year UAE Golden Visa! */
  if (
    prop.country === 'uae' &&
    S.year >= 2019 &&
    !S.legal.citizenships.includes('uae') &&
    prop.nativeValue >= 2000000
  ) {
    if (S.country === 'uae') {
      transitionResidency(S, 'golden_visa', { permitName: '10-Year UAE Real-Estate Golden Visa', expiresYear: S.year + 10, force: true });
    }
    recordJournal(S, `Crossing 2,000,000 AED in UAE real estate unlocked the 10-Year UAE Golden Visa!`, 'visa');
  }
}

export function upgradePropertyFinishing(S, propId, targetFinishId) {
  const prop = S.housing.properties.find(p => p.id === propId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  const curIdx = FINISHING_TIERS.findIndex(f => f.id === prop.finishing);
  const nextIdx = FINISHING_TIERS.findIndex(f => f.id === targetFinishId);
  if (nextIdx <= curIdx) return { ok: false, msg: 'Select a higher finishing tier.' };

  const curF = FINISHING_TIERS[Math.max(0, curIdx)];
  const nextF = FINISHING_TIERS[nextIdx];
  const diffMult = Math.max(0.08, nextF.costMult - curF.costMult);
  const costPlayer = Math.round(prop.valueLocal * diffMult * 0.65);

  if (S.money.cash < costPlayer) return { ok: false, msg: `Need ${formatMoney(costPlayer, S.country)} for ${nextF.label} finishing works.` };
  { const paid = purchase(S, costPlayer, `Upgraded ${prop.name} to ${nextF.label}`, 'cash', { category: 'housing' }); if (!paid.ok) return paid; }

  prop.finishing = nextF.id;
  prop.nativeValue = Math.round(prop.nativeValue * (1 + diffMult * 0.85));
  prop.valueLocal = Math.round(convertCurrency(prop.nativeValue, prop.country, S.country, S.year));
  prop.nativeMonthlyRent = Math.round(prop.nativeValue * 0.068 * nextF.rentMult / 12);

  if (nextF.canLive && S.housing.mode !== 'owned' && prop.country === S.country) {
    closePlayerLease(S);
    S.housing.mode = 'owned';
    S.housing.currentHomeId = prop.id;
    S.housing.currentHomeName = prop.name;
    S.housing.currentShape = prop.shape;
    S.housing.monthlyRent = 0;
  }

  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 5);
  recordJournal(S, `Completed ${nextF.label} interior finishing on ${prop.name} — ready for living or premium tenants!`, 'milestone');
  return { ok: true, msg: `Finished to ${nextF.label}!` };
}

/* ============================================================================
   v2.4 FURNISHING — 11 STYLES, PRICED PER ROOM, PER m², PER YEAR
   ----------------------------------------------------------------------------
   Elsayed's rule (2026-11-19): a room costs more by the room, by the square
   metre, and by the year. The flat $780 / $1,850 / $4,200 for every room is
   gone. The price is three things at once:

   1. PER ROOM: the catalogue's real per-room prices (ROOM_FURNITURE_CATALOG
      in megaRealEstate.js, 2026 numbers for egy/usa/sau). A kitchen costs
      more than an office; a living room more than a bathroom.
   2. PER m²: scale by the room's real size from the plan. The reference
      size for each kind is the MEDIAN m² of rooms of that kind across all
      plans in A101_SCHEMATICS (visualEngine3d.js):
        living 57 · kitchen 25 · bedroom 40 · bathroom 18 · kids 32 · office 28
      (medians: living 24,42,44,46,52,62,68,74,88,96 → 57; kitchen
      9,18,20,20,24,26,30,32,36,58 → 25; bedroom 16,22,28,36,40,42,44,64,110
      → 40; bathroom 6,9,10,10,10,10,15,18,18,18,18,24,26,28,38,42,52 → 18;
      kids 18,24,24,32,32,38,46,48,120 → 32; office
      18,19,22,22,28,28,34,38,58,64,78 → 28.)
      Price = catalogue cost × (room_m² / reference_m² for that kind). The
      room's own m² is the FIRST room of that kind on its home's plan (plan
      order); a home shape with no room of that kind falls back to the
      reference median, so the scale is 1. A bigger room of the same kind
      costs more.
   3. PER YEAR, approximately: catalogue costs are 2026 numbers, run through
      the game's own year index (eraLocalCost / priceFactor in economy.js).
      A room furnished in 1970 costs 1970 money; one in 2025 costs 2025
      money. Order: m² scaling first, then the year adjustment, then
      eraLocalCost's own rounding. "Approximately" is Elsayed's word — no
      invented historical furniture prices. Prices are floored at 1 unit of
      local currency: the game's index makes a 1970 Turkish price round to
      0, and a price of 0 is not a real price.

   STYLES (11, Elsayed's list plus four in the same spirit): the 4 catalogue
   tiers anchor 4 styles at 1.0× — Budget tier → budget, Premium → modern,
   Luxury → luxury, Ultra → ultra. The other 7 derive from the nearest
   catalogue tier with a stated multiplier:
     minimalism 1.30× Premium · scandinavian 1.10× Budget · bohemian 1.10× Budget
     industrial 1.05× Premium · classic 1.10× Premium · vintage 1.15× Premium
     antique 1.35× Luxury (above Luxury, as Elsayed put it).
   Minimalism is NOT the cheap one: it is designer minimalism — a single
   Vitra or Cassina chair can cost more than a whole budget set — so it
   anchors to Premium at 1.30×, above Modern and Vintage, below Luxury.
   Budget is the cheapest style of all 11.
   Happiness is the anchor tier's moodBonus plus the style's moodDelta;
   home value is the anchor tier's valueAdd stretched by the multiplier
   (1 + (valueAdd − 1) × mult, no valueAdd on the Budget anchor → 1.0);
   upkeep is the anchor tier's maintenancePerYear, scaled the same way —
   and where the catalogue gives NO maintenance figure for a room
   (bedroom, kids, office have none), upkeep is 2% of the furnishing price
   per year.

   COUNTRIES WITHOUT CATALOGUE PRICES (only egy/usa/sau have them): the
   other 15 countries derive from the USD cost — local2026 =
   convertCurrency(usdCost, 'usa', country, 2026) — then the same m² scale
   and eraLocalCost year adjustment. Every one of the 18 countries gets a
   price; there is no missing-price error. Prices are charged in the
   player's own currency (S.country), the same money the Gehaz credit and
   the wedding charges use.

   WIRING: valueAdd has a clean place — the home's value, the same way a
   remodel lifts it (+4.5%). maintenancePerYear has NO clean place yet:
   the monthly tick charges staff, pets and rent, but nothing charges
   furnishing upkeep, so the yearly upkeep is stored on the home record
   (prop.furnishingUpkeepPerYear, and per room in
   prop.furnishingUpkeepByRoom) and shown in the choices — no new billing
   system was invented here.
   ========================================================================== */

/* Reference room size (m²) per kind — median across all A101 plans. */
export const FURNISHING_REFERENCE_M2 = { living: 57, kitchen: 25, bedroom: 40, bathroom: 18, kids: 32, office: 28 };

/* Room m² by home shape — first room of each kind on that shape's plan,
   read from A101_SCHEMATICS. Shapes with no room of a kind fall back to
   the reference median above (scale 1). */
const FURNISH_ROOM_M2_BY_SHAPE = {
  studio:     { living: 24, kitchen: 9,  bedroom: 16,  bathroom: 9 },
  apartment:  { living: 46, kitchen: 20, bedroom: 28,  bathroom: 10, kids: 18, office: 19 },
  duplex:     { living: 62, kitchen: 30, bedroom: 42,  bathroom: 10, kids: 32, office: 28 },
  penthouse:  { living: 68, kitchen: 32, bedroom: 44,  bathroom: 18, kids: 24 },
  townhouse:  { living: 44, kitchen: 24, bedroom: 36,  bathroom: 6,  kids: 38, office: 18 },
  twin_house: { living: 52, kitchen: 26, bedroom: 40,  bathroom: 10, kids: 48, office: 22 },
  villa:      { living: 74, kitchen: 36, bedroom: 64,  bathroom: 24, kids: 46, office: 38 },
  chalet:     { living: 42, kitchen: 18, bedroom: 22,  bathroom: 10, kids: 24 },
  mansion:    { living: 96, kitchen: 58, bedroom: 110, bathroom: 38, kids: 120, office: 78 },
  commercial: { living: 88, kitchen: 20, bathroom: 18, kids: 32, office: 34 }
};

export const FURNISHING_STYLE_KEYS = ['budget', 'modern', 'luxury', 'vintage', 'antique', 'ultra', 'minimalism', 'classic', 'scandinavian', 'industrial', 'bohemian'];

/* Styles the furniture drawings are made for per room: the living room has
   all 11; every other room has a standard drawing and a luxury drawing. */
const FURNISHING_LUX_DRAWING_STYLES = new Set(['luxury', 'antique', 'ultra']);

export const FURNISHING_STYLES = {
  budget: {
    name: 'Budget', anchorTier: 0, mult: 1.0, moodDelta: 0,
    description: 'Clean, practical furniture that does the job without fuss: flat-pack pieces, sturdy fabrics and everything you need, nothing you do not.',
    materials: ['Laminate and MDF', 'Polyester fabric', 'Powder-coated steel'],
    colours: ['White', 'Light grey', 'Beige'],
    brands: ['IKEA', 'Home Centre', 'Al Araby'],
    eraNote: 'Fits any era — the sensible choice in every decade.',
    pieces: {
      living: ['Three-seat fabric sofa + two armchairs', 'Flat-pack TV stand with 55-inch TV', 'Coffee table, rug and floor lamp'],
      kitchen: ['Ready-made wall and base cabinets', 'Four-burner cooker, fridge and sink', 'Laminate worktop and basic tiling'],
      bedroom: ['Double bed frame with mattress', 'Two-door wardrobe and bedside tables', 'Bedding set and blackout curtains'],
      bathroom: ['Pedestal basin and WC', 'Shower over the bath, mirror cabinet', 'Towel rail, bath mat and fittings'],
      kids: ['Single bed with storage drawers', 'Small desk, chair and bookshelf', 'Toy chest and colourful rug'],
      office: ['Simple desk and office chair', 'Bookshelf and filing cabinet', 'Desk lamp and pinboard']
    }
  },
  modern: {
    name: 'Modern', anchorTier: 1, mult: 1.0, moodDelta: 0,
    description: 'Smooth lines, smart appliances and calm neutral colours: handleless cabinets, a big screen, and furniture that looks new for years.',
    materials: ['Quartz and stone', 'Solid wood', 'Brushed metal and glass'],
    colours: ['Warm white', 'Charcoal', 'Natural oak'],
    brands: ['Ethan Allen', 'Pottery Barn', 'Crate & Barrel'],
    eraNote: 'Suits homes from the 1980s onward; looks out of place before then.',
    pieces: {
      living: ['Low-profile sectional sofa in neutral fabric', 'Wall-mounted 75-inch OLED TV on a media console', 'Marble-top coffee table, wool rug, floor lamp'],
      kitchen: ['Handleless cabinets with quartz worktops', 'Smart fridge, induction hob and built-in oven', 'Island breakfast bar with two stools'],
      bedroom: ['Upholstered king bed with storage base', 'Walk-in wardrobe rails and chest of drawers', 'Linen bedding, reading lights, blackout blinds'],
      bathroom: ['Wall-hung vanity with stone top', 'Walk-in rain shower with glass screen', 'Heated towel rail, large mirror, LED lighting'],
      kids: ['Bunk or single bed with desk underneath', 'Study desk, ergonomic chair, shelving', 'Soft rug, toy storage and reading nook'],
      office: ['Electric sit-stand desk', 'Ergonomic chair and monitor arm', 'Storage credenza and acoustic panels']
    }
  },
  luxury: {
    name: 'Luxury', anchorTier: 2, mult: 1.0, moodDelta: 0,
    description: 'Italian designer pieces, rare stone and the best fabrics: a home that feels like a five-star hotel the moment you walk in.',
    materials: ['Italian leather and bouclé', 'Marble and rare stone', 'Silk and Egyptian cotton'],
    colours: ['Ivory', 'Champagne gold', 'Deep emerald'],
    brands: ['Minotti', 'B&B Italia', 'Poltrona Frau'],
    eraNote: 'Suits grand homes in any recent era; rare before the 1970s.',
    pieces: {
      living: ['Italian designer sofa set in leather and bouclé', '85-inch 8K TV with soundbar and media wall', 'Custom marble coffee table, silk rug, designer lamps'],
      kitchen: ['Custom lacquered cabinets with marble island', 'Professional range, wine fridge and coffee station', 'Stone worktops, brass fittings, pendant lights'],
      bedroom: ['Handcrafted king bed with Egyptian cotton bedding', 'Dressing room with mirrored wardrobes', 'Velvet armchair, silk curtains, art above the bed'],
      bathroom: ['Freestanding stone bath and double vanity', 'Rain shower with body jets and steam', 'Heated floors, backlit mirror, scented towels'],
      kids: ['Designer themed bedroom set with study area', 'Custom wardrobe and reading corner', 'Quality rug, blackout curtains, wall art'],
      office: ['Solid walnut executive desk', 'Leather executive chair and bookcase wall', 'Designer lamp, art, and brass accessories']
    }
  },
  vintage: {
    name: 'Vintage', anchorTier: 1, mult: 1.15, moodDelta: 1,
    description: 'Loved pieces from the 1960s to the 1980s, restored and put back to work: warm wood, brass, patterned rugs and a record player on the sideboard.',
    materials: ['Restored teak and oak', 'Brass and enamel', 'Wool and patterned cotton'],
    colours: ['Mustard', 'Avocado green', 'Warm walnut'],
    brands: ['Vintage markets', 'Restoration workshops', 'Etsy'],
    eraNote: 'Suits older homes best — 1960s to 1980s pieces in a home of that time.',
    pieces: {
      living: ['Restored 1960s–70s sofa and armchairs', 'Wooden sideboard, record player and vinyl shelf', 'Patterned rug, brass lamp, framed prints'],
      kitchen: ['Retro-style fridge and enamel cooker', 'Wooden cabinets with brass handles', 'Checkered tiles, open shelves, hanging pans'],
      bedroom: ['Carved wooden bed with vintage headboard', 'Antique dressing table and mirror', 'Quilted bedspread, lace curtains, brass lamp'],
      bathroom: ['Claw-foot style bath and pedestal basin', 'Brass taps and vintage mirror', 'Patterned floor tiles and linen towels'],
      kids: ['Wooden single bed with vintage bedding', 'Small writing desk and globe', 'Storybook shelf and rag rug'],
      office: ['Oak writing desk with leather top', 'Leather chair and brass banker’s lamp', 'Wooden filing cabinet and framed maps']
    }
  },
  antique: {
    name: 'Antique', anchorTier: 2, mult: 1.35, moodDelta: 2,
    description: 'Genuine period pieces — hand-carved wood, gilded frames, Persian carpets and crystal: the most expensive way to furnish a room, and the one that holds its value.',
    materials: ['Hand-carved mahogany and walnut', 'Gilt and ormolu', 'Persian wool and silk'],
    colours: ['Burgundy', 'Antique gold', 'Dark walnut'],
    brands: ['Christie’s', 'Sotheby’s', 'Heritage auction houses'],
    eraNote: 'Suits period and heritage homes; antiques in a brand-new flat are a deliberate, expensive choice.',
    pieces: {
      living: ['Hand-carved period sofa and gilded armchairs', 'Marble-top console, crystal chandelier', 'Persian carpet, oil paintings, ormolu clock'],
      kitchen: ['Hand-built hardwood cabinets with marble tops', 'Classic range cooker and copper pots', 'Stone sink, brass taps, larder cupboard'],
      bedroom: ['Four-poster bed with carved headboard', 'Antique armoire and dressing table', 'Silk bedding, heavy drapes, gilt mirror'],
      bathroom: ['Marble bath with brass and porcelain fittings', 'Carved vanity with marble top', 'Gilt mirror, crystal sconces, linen towels'],
      kids: ['Carved wooden bed with canopy', 'Antique desk and globe', 'Hand-knotted rug and storybook shelf'],
      office: ['Mahogany partners desk with leather inlay', 'Leather club chair and library ladder', 'Brass lamps, globe, and framed engravings']
    }
  },
  ultra: {
    name: 'Ultra', anchorTier: 3, mult: 1.0, moodDelta: 0,
    description: 'Commissioned, one-of-a-kind pieces by world-renowned designers: museum-grade furniture made for this home and no other.',
    materials: ['Commissioned rare woods and stone', 'Bronze and hand-blown glass', 'Hand-knotted silk'],
    colours: ['Black and gold', 'Ivory', 'Midnight blue'],
    brands: ['Bespoke', 'Fendi Casa', 'Versace Home'],
    eraNote: 'Suits any era if the money is there — commissioned pieces are timeless by design.',
    pieces: {
      living: ['Commissioned designer sofa set, one of a kind', 'Museum-grade media wall with 85-inch 8K display', 'Bespoke marble and bronze tables, hand-knotted silk rug'],
      kitchen: ['Commissioned kitchen by a named designer', 'Professional chef suite with teppanyaki and wine wall', 'Rare stone worktops, custom brass, smart everything'],
      bedroom: ['Bespoke bed with Savoir mattress and Frette linen', 'Dressing suite with safe and jewellery drawers', 'Silk drapes, commissioned art, private balcony seating'],
      bathroom: ['Marble spa suite with hammam shower', 'Double vanity in rare stone with Dornbracht fittings', 'Heated floors, chromotherapy lighting, fresh flowers'],
      kids: ['Bespoke themed suite with study and play zones', 'Custom wardrobes and reading loft', 'Hand-knotted rug, blackout drapes, art wall'],
      office: ['Commissioned desk in rare wood and stone', 'Designer chair and full library wall', 'Art collection, bar cabinet, acoustic treatment']
    }
  },
  minimalism: {
    name: 'Minimalism', anchorTier: 1, mult: 1.3, moodDelta: 0,
    description: 'Less, but better — and better costs more: one good designer chair can cost more than a whole budget set. A Vitra or Cassina piece, white walls and empty space on purpose. Calm, bright, and expensive in its restraint.',
    materials: ['Designer moulded plywood and leather', 'Brushed steel and glass', 'White bouclé and linen'],
    colours: ['White', 'Off-white', 'Pale grey'],
    brands: ['Vitra', 'Cassina', 'B&B Italia', 'Arper', 'HAY'],
    eraNote: 'Designer minimalism from the 1990s onward; almost unknown before then, and the designer pieces are what make it dear.',
    pieces: {
      living: ['Designer sofa with a Vitra Eames lounge chair', 'Single floating shelf with a 65-inch TV on a bare wall', 'One Cassina coffee table, one rug, one designer floor lamp — nothing else'],
      kitchen: ['Flat-front designer cabinets in matte white', 'Integrated fridge, induction hob, hidden storage', 'Stone worktop, no handles, no clutter'],
      bedroom: ['Low designer platform bed with white linen', 'Single wardrobe wall and one bedside table', 'Blackout blinds, no ornaments, calm light'],
      bathroom: ['Floating designer vanity and wall-hung WC', 'Frameless glass shower, one mirror', 'White tiles, one plant, folded towels'],
      kids: ['Low designer bed with white bedding and one shelf', 'Small desk and Arper chair, toy box with lid', 'Plain rug, one poster, tidy storage'],
      office: ['Designer desk and Vitra chair', 'One shelf and a laptop stand', 'Desk lamp and a single plant']
    }
  },
  classic: {
    name: 'Classic', anchorTier: 1, mult: 1.1, moodDelta: 1,
    description: 'Traditional pieces that never go out of fashion: Chesterfield sofas, shaker cabinets, brass lamps and wool rugs — warm and proper.',
    materials: ['Solid oak and mahogany', 'Brass and leather', 'Wool and cotton'],
    colours: ['Cream', 'Sage green', 'Navy'],
    brands: ['Ethan Allen', 'Restoration Hardware', 'Laura Ashley'],
    eraNote: 'Fits any era — traditional pieces never really go out of fashion.',
    pieces: {
      living: ['Chesterfield-style sofa and wingback chairs', 'Wooden coffee table and bookcase wall', 'Wool rug, table lamps, framed landscapes'],
      kitchen: ['Shaker-style cabinets in cream or sage', 'Range cooker, Belfast sink, wooden worktops', 'Glass-front dresser and pendant lights'],
      bedroom: ['Traditional wooden bed with padded headboard', 'Chest of drawers and dressing table', 'Cotton bedding, lined curtains, bedside lamps'],
      bathroom: ['Traditional vanity with marble top', 'Roll-top style bath or large shower', 'Brass fittings, framed mirror, fluffy towels'],
      kids: ['Wooden bed with classic bedding', 'Desk, bookshelf and toy chest', 'Striped rug and framed prints'],
      office: ['Wooden desk with drawers and leather chair', 'Bookcase and filing cabinet', 'Brass lamp and framed certificates']
    }
  },
  scandinavian: {
    name: 'Scandinavian', anchorTier: 0, mult: 1.1, moodDelta: 1,
    description: 'Light wood, white walls and soft textiles from the Nordic countries: bright, cosy and practical, with a plant in every corner.',
    materials: ['Light oak and birch', 'Linen and wool', 'Ceramic and glass'],
    colours: ['White', 'Pale wood', 'Soft grey-blue'],
    brands: ['IKEA', 'HAY', 'Ferm Living'],
    eraNote: 'Suits homes from the 1970s onward; the light-wood look spread worldwide after 2000.',
    pieces: {
      living: ['Light oak sofa with linen covers', 'White media bench with a 65-inch TV', 'Sheepskin throws, pale rug, paper lanterns'],
      kitchen: ['Pale wood cabinets with white worktops', 'Compact induction hob, fridge and dishwasher', 'Open birch shelves and ceramic jars'],
      bedroom: ['Light wood bed with white and grey linen', 'Simple wardrobe and bedside tables', 'Wool throw, linen curtains, soft light'],
      bathroom: ['Light wood vanity and white tiles', 'Walk-in shower with pale stone', 'Woven baskets, green plant, cotton towels'],
      kids: ['Pine bed with white bedding', 'Small desk, chair and open toy shelves', 'Sheepskin rug and paper star lamp'],
      office: ['Birch desk and moulded chair', 'Wall shelves and a laptop riser', 'Desk plant and daylight lamp']
    }
  },
  industrial: {
    name: 'Industrial', anchorTier: 1, mult: 1.05, moodDelta: 0,
    description: 'Steel, reclaimed wood and exposed bulbs: the converted-loft look — tough materials, dark colours and furniture built to last.',
    materials: ['Black steel and iron', 'Reclaimed wood', 'Concrete and leather'],
    colours: ['Charcoal', 'Rust', 'Raw steel'],
    brands: ['Industrial salvage yards', 'CB2', 'West Elm'],
    eraNote: 'Suits converted lofts and modern homes from the 1990s onward.',
    pieces: {
      living: ['Leather and steel sofa with metal frames', 'Reclaimed wood media unit with a 75-inch TV', 'Exposed bulb lighting, metal shelves, dark rug'],
      kitchen: ['Steel and dark wood cabinets', 'Professional-style gas hob and large fridge', 'Concrete worktops, open steel shelving'],
      bedroom: ['Iron-frame bed with dark wood headboard', 'Metal lockers as wardrobe and bedside tables', 'Dark linen, Edison bulbs, brick or concrete wall'],
      bathroom: ['Concrete vanity with black steel fittings', 'Walk-in shower with black framed glass', 'Exposed pipes, dark tiles, metal mirror'],
      kids: ['Metal-frame bed with storage boxes', 'Steel desk and chair, open shelving', 'Dark rug and vintage-style posters'],
      office: ['Steel and reclaimed wood desk', 'Leather and metal chair, metal shelving', 'Edison desk lamp and wall clock']
    }
  },
  bohemian: {
    name: 'Bohemian', anchorTier: 0, mult: 1.1, moodDelta: 1,
    description: 'Layered rugs, rattan, plants and colour everywhere: a relaxed, travelled home where every cushion and hanging has a story.',
    materials: ['Rattan and wicker', 'Kilim wool and cotton', 'Macramé and ceramic'],
    colours: ['Terracotta', 'Turquoise', 'Mustard'],
    brands: ['Anthropologie', 'World Market', 'Local artisans'],
    eraNote: 'Fits any era — layered textiles and plants suit a 1970s home as well as a new one.',
    pieces: {
      living: ['Low rattan sofas with layered cushions', 'Patterned kilim rugs and macramé wall hangings', 'Plants, floor cushions, lanterns and books'],
      kitchen: ['Open wooden shelves with jars and ceramics', 'Colourful tiles and a freestanding dresser', 'Hanging herbs, woven baskets, patterned textiles'],
      bedroom: ['Rattan bed frame with layered throws', 'Macramé hanging and fairy lights', 'Patterned bedding, plants, woven rug'],
      bathroom: ['Wooden vanity with vessel basin', 'Patterned tiles and woven baskets', 'Plants, candles, colourful towels'],
      kids: ['Floor mattress or low bed with bright bedding', 'Reading tent and floor cushions', 'Toy baskets, wall hangings, fairy lights'],
      office: ['Rattan desk and woven chair', 'Open shelves with plants and books', 'Macramé, lanterns and a patterned rug']
    }
  }
};

/* Old quality words still map to a style, so old saves and old buttons
   keep working: standard → budget, mid/premium → modern, luxury → luxury,
   ultra → ultra. */
const FURNISHING_QUALITY_ALIASES = { standard: 'budget', mid: 'modern', premium: 'modern', luxury: 'luxury', ultra: 'ultra' };

export function furnishingStyleKey(quality) {
  const q = String(quality || '').toLowerCase();
  if (FURNISHING_STYLES[q]) return q;
  return FURNISHING_QUALITY_ALIASES[q] || 'budget';
}

/* One shared helper for the six property actions (v2.4 item C): when the
   named home is not found, refuse and name it — never silently act on the
   first owned home. Returns { ok, prop } or { ok:false, msg }. */
function ownedPropertyOrRefusal(S, propId, noHomeMsg) {
  const list = (S.housing && S.housing.properties) || [];
  if (!list.length) return { ok: false, msg: noHomeMsg };
  const prop = list.find(p => p.id === propId);
  if (!prop) return { ok: false, msg: `No home with id "${String(propId)}" was found — nothing was changed.` };
  return { ok: true, prop };
}

/* Single source of truth for furnishing prices: furnishingOptions (the UI)
   and furnishPropertyRoom (the charge) both read this. Returns null when
   the room kind has no catalogue entry. */
function furnishingStylePrice(S, prop, roomKey, styleKey) {
  /* Only the six rooms that exist on the home plans can be furnished —
     the catalogue also lists dining, art, flooring and the like, but no
     plan has a room of those kinds, so there is nothing to furnish. */
  if (!FURNISHABLE_KEYS.includes(roomKey)) return null;
  const style = FURNISHING_STYLES[styleKey] || FURNISHING_STYLES.budget;
  const roomCat = ROOM_FURNITURE_CATALOG[roomKey];
  const tiers = Array.isArray(roomCat?.tiers) ? roomCat.tiers : [];
  const tier = tiers[Math.min(style.anchorTier, Math.max(0, tiers.length - 1))];
  if (!tier) return null;
  const country = S.country;
  const shape = (prop && prop.shape) || 'apartment';
  const roomM2 = (FURNISH_ROOM_M2_BY_SHAPE[shape] && FURNISH_ROOM_M2_BY_SHAPE[shape][roomKey]) || FURNISHING_REFERENCE_M2[roomKey];
  const refM2 = FURNISHING_REFERENCE_M2[roomKey];
  const scale = roomM2 / refM2;
  const usdCost = Number(tier.cost?.usa) || 0;
  const base2026 = tier.cost && tier.cost[country] != null
    ? Number(tier.cost[country])
    : convertCurrency(usdCost, 'usa', country, 2026);
  const priceLocal = Math.max(1, eraLocalCost(base2026 * style.mult * scale, country, S.year));
  const anchorValueAdd = Number(tier.valueAdd) || 1;
  const valueAdd = Math.round((1 + (anchorValueAdd - 1) * style.mult) * 10000) / 10000;
  let maintenancePerYear;
  const maint = tier.maintenancePerYear;
  if (maint) {
    const baseMaint2026 = maint[country] != null
      ? Number(maint[country])
      : convertCurrency(Number(maint.usa) || 0, 'usa', country, 2026);
    maintenancePerYear = Math.max(0, eraLocalCost(baseMaint2026 * style.mult * scale, country, S.year));
  } else {
    maintenancePerYear = Math.max(1, Math.round(priceLocal * 0.02));
  }
  const brands = [...new Set([...(style.brands || []), ...((tier.brands) || [])])].slice(0, 5);
  const drawing = roomKey === 'living'
    ? (styleKey === 'budget' ? 'assets/furniture/furn_living.jpg'
      : styleKey === 'luxury' ? 'assets/furniture/furn_living_lux.jpg'
      : `assets/furniture/furn_living_${styleKey}.jpg`)
    : FURNISHING_LUX_DRAWING_STYLES.has(styleKey)
      ? `assets/furniture/furn_${roomKey}_lux.jpg`
      : `assets/furniture/furn_${roomKey}.jpg`;
  return {
    key: styleKey, styleName: style.name, tierName: tier.name,
    description: style.description,
    pieces: (style.pieces && style.pieces[roomKey]) || [],
    materials: style.materials || [], colours: style.colours || [], brands,
    priceLocal, roomM2, referenceM2: refM2,
    moodBonus: Math.max(0, (Number(tier.moodBonus) || 0) + style.moodDelta),
    valueAdd, maintenancePerYear, eraNote: style.eraNote, drawing
  };
}

/* The 11 furnishing choices for one room of one home — the UI renders
   these and charges exactly the price shown here. */
export function furnishingOptions(S, prop, roomKey) {
  if (!ROOM_FURNITURE_CATALOG[roomKey]) return [];
  return FURNISHING_STYLE_KEYS
    .map(k => furnishingStylePrice(S, prop, roomKey, k))
    .filter(Boolean);
}

/* Furnish a specific room -> Updates 3D Floorplan Blueprint AND builds Gehaz / Qa'ima value! */
export function furnishPropertyRoom(S, propId, roomKey, quality = 'standard') {
  ensureExtendedState(S);
  const found = ownedPropertyOrRefusal(S, propId, 'Own a home first to furnish rooms permanently.');
  if (!found.ok) return found;
  const prop = found.prop;

  const styleKey = furnishingStyleKey(quality);
  const priced = furnishingStylePrice(S, prop, roomKey, styleKey);
  if (!priced) return { ok: false, msg: `${roomKey} cannot be furnished.` };

  const costLocal = priced.priceLocal;
  if (S.money.cash < costLocal) return { ok: false, msg: `Need ${formatMoney(costLocal, S.country)} to furnish ${roomKey}.` };

  { const paid = purchase(S, costLocal, `Furnished ${roomKey} in ${prop.name} (${priced.styleName}, ${priced.roomM2} m²)`, 'cash', { category: 'housing' }); if (!paid.ok) return paid; }
  if (!prop.furnishedRooms) prop.furnishedRooms = {};
  prop.furnishedRooms[roomKey] = priced.styleName.slice(0, 18);
  prop.gehazInvestedLocal = (prop.gehazInvestedLocal || 0) + costLocal;
  S.housing.gehazInvestedLocal = (S.housing.gehazInvestedLocal || 0) + costLocal;
  if (priced.valueAdd > 1) {
    prop.nativeValue = Math.round((prop.nativeValue || prop.valueLocal || 0) * priced.valueAdd);
    prop.valueLocal = Math.round(convertCurrency(prop.nativeValue, prop.country, S.country, S.year));
  }
  if (!prop.furnishingUpkeepByRoom) prop.furnishingUpkeepByRoom = {};
  prop.furnishingUpkeepByRoom[roomKey] = priced.maintenancePerYear;
  prop.furnishingUpkeepPerYear = Object.values(prop.furnishingUpkeepByRoom).reduce((a, b) => a + (Number(b) || 0), 0);
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + priced.moodBonus);

  recordJournal(S, `Furnished the ${roomKey} in ${prop.name} in ${priced.styleName} style (${priced.roomM2} m², ${formatMoney(costLocal, S.country)}) — visible right on your home blueprint!`, 'life');
  return { ok: true, msg: `Furnished ${roomKey} (${priced.styleName})!`, priceLocal: costLocal, style: styleKey, roomM2: priced.roomM2 };
}

export function installPropertyUpgrade(S, propId, upgKey) {
  const found = ownedPropertyOrRefusal(S, propId, 'Own a property first.');
  if (!found.ok) return found;
  const prop = found.prop;
  if (!prop.upgrades) prop.upgrades = [];
  if (prop.upgrades.includes(upgKey)) return { ok: false, msg: 'Upgrade already installed.' };

  const UPGRADE_COSTS_USD = {
    solar: { label: 'Rooftop Solar & Battery Array (−40% utility bill)', usd: 5800, hap: 4 },
    pool: { label: 'Private Heated Swimming Pool', usd: 14500, hap: 8 },
    smart_security: { label: 'Smart Automation & CCTV Perimeter', usd: 2600, hap: 3 },
    home_gym: { label: 'Private Home Fitness Studio (+health)', usd: 3400, hap: 4 },
    generator: { label: 'Silent Backup Power Inverter/Generator', usd: 2200, hap: 3 }
  };
  const spec = UPGRADE_COSTS_USD[upgKey];
  if(!spec)return {ok:false,msg:'Unknown property upgrade.'};
  const areas=propertyAreas(prop);
  if(upgKey==='pool'){
    if(prop.hasPool||areas.poolM2>0)return {ok:false,msg:'This home already has a private pool.'};
    if(['apartment','studio','penthouse','duplex','family_duplex'].includes(prop.shape))return {ok:false,msg:'Pool construction requires a ground-level private-house plot, not an apartment unit.'};
    if(areas.gardenM2<30)return {ok:false,msg:'Pool construction needs30m²of private garden:24m²water plus6m²clearance.'};
  }
  const cost = Math.round(convertCurrency(spec.usd, 'usa', S.country, S.year));
  if (S.money.cash < cost) return { ok: false, msg: `Need ${formatMoney(cost, S.country)}.` };

  { const paid = purchase(S, cost, `Installed ${spec.label} at ${prop.name}`, 'cash', { category: 'housing' }); if (!paid.ok) return paid; }
  const poolPpm=(prop.nativeValue||1)/Math.max(1,pricedPropertyArea(prop));
  const poolBudgetBefore=outdoorAnnualBudget(prop,poolPpm);
  prop.upgrades.push(upgKey);
  if(upgKey==='pool'){
    Object.assign(prop,areas,{hasPool:true,gardenM2:areas.gardenM2-24,poolM2:24});
    prop.outdoorAnnualNative=Math.max(0,(prop.outdoorAnnualNative||0)+outdoorAnnualBudget(prop,poolPpm)-poolBudgetBefore);
  }

  prop.nativeValue = Math.round(prop.nativeValue + convertCurrency(cost * 0.8, S.country, prop.country, S.year));
  prop.valueLocal = Math.round(convertCurrency(prop.nativeValue, prop.country, S.country, S.year));
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + spec.hap);
  recordJournal(S, `Installed ${spec.label} at ${prop.name}!`, 'life');
  return { ok: true, msg: `Installed ${spec.label}!` };
}

export function householdStaffQuote(S,roleKey){
 roleKey=roleKey==='chauffeur'?'driver':roleKey;const cat=HOUSEHOLD_STAFF_CATALOG[roleKey==='driver'?'chauffeur':roleKey];if(!cat)return{ok:false,msg:'Unknown household role.'};
 const baseUsd=roleKey==='driver'?420:roleKey==='nanny'?480:roleKey==='chef'?650:280;
 const monthlyLocal=eraLocalCost(Math.round(convertCurrency(baseUsd,'usa',S.country,2026)),S.country,S.year);
 return{ok:true,roleKey,label:cat.variants?.[0]?.name||cat.label,monthlyLocal};
}
export function hireHouseholdStaff(S,roles){
 ensureExtendedState(S);const unique=[...new Set(roles.map(role=>role==='chauffeur'?'driver':role))];if(!unique.length)return{ok:false};
 const quotes=unique.filter(role=>!S.housing.staff.some(x=>x.roleKey===role)).map(role=>householdStaffQuote(S,role));
 if(quotes.some(q=>!q.ok))return{ok:false,msg:'Unknown household role.'};
 const total=quotes.reduce((sum,q)=>sum+q.monthlyLocal,0);
 if(S.money.cash<total)return{ok:false,msg:'Not enough cash to cover one month of the added wages.'};
 for(const q of quotes)S.housing.staff.push({id:nextId(S,'stf'),roleKey:q.roleKey,name:q.label,monthlyCostLocal:q.monthlyLocal});
 if(quotes.length){S.player.vitals.stress=clamp(S.player.vitals.stress-6);recordJournal(S,'Hired household help. Wages join the monthly household bill; dismiss roles under Real Estate > Staff.','life');}
 return{ok:true,totalMonthlyAdded:total,msg:quotes.length?'Household roles hired; monthly wages start at next settlement.':'Already hired.'};
}
export function toggleHouseholdStaff(S,roleKey){
 ensureExtendedState(S);roleKey=roleKey==='chauffeur'?'driver':roleKey;if(!householdStaffQuote(S,roleKey).ok)return{ok:false,msg:'Unknown household role.'};
 const idx=S.housing.staff.findIndex(x=>x.roleKey===roleKey);
 if(idx>=0){const[removed]=S.housing.staff.splice(idx,1);recordJournal(S,'Ended household employment for '+removed.name+'.','money');return{ok:true,msg:'Household role dismissed.'};}
 return hireHouseholdStaff(S,[roleKey]);
}

/* Buy Land Plot & Custom-Build Your Own Villa / Apartment Block Month-by-Month! */
export function purchaseLandPlot(S, landId) {
  ensureExtendedState(S);
  if(S.player.age<18)return {ok:false,msg:'Land ownership purchases unlock at age18.'};
  const plot = LAND_PLOTS.find(l => l.id === landId);
  if (!plot) return { ok: false, msg: 'Land plot unavailable.' };

  const area = plot.minArea || 400;
  const nativeCost = eraLocalCost(plot.ppm2026 * area, plot.country, S.year);
  const costInPlayer = Math.round(convertCurrency(nativeCost, plot.country, S.country, S.year));
  if (S.money.cash < costInPlayer) return { ok: false, msg: `Need ${formatMoney(costInPlayer, S.country)} to buy ${plot.name} (${area} m²).` };

  { const paid = purchase(S, costInPlayer, `Purchased ${area} m² land plot: ${plot.name}`, 'cash', { category: 'housing' }); if (!paid.ok) return paid; }
  const rec = {
    id: nextId(S, 'lnd'),
    catalogId: plot.id,
    name: `${plot.name} (${area} m²)`,
    country: plot.country,
    city: plot.city || getCountry(plot.country).cities[0],
    areaM2: area,
    nativeValue: nativeCost,
    valueLocal: costInPlayer,
    buildProject: null
  };
  S.housing.lands.push(rec);
  recordJournal(S, `Bought freehold land deed: ${rec.name} for ${formatMoney(costInPlayer, S.country)}. Ready to commission construction!`, 'milestone');
  return { ok: true, msg: `Purchased ${rec.name}!` };
}

export function startCustomConstructionOnLand(S, ownedLandId, projectTypeId = 'villa', finishId = 'super_lux') {
  ensureExtendedState(S);
  const land = S.housing.lands.find(l => l.id === ownedLandId);
  if (!land) return { ok: false, msg: 'Land plot not found.' };
  if (land.buildProject) return { ok: false, msg: 'Construction is already underway on this plot.' };

  const pTypes = PROPERTY_DEV_SPECS?.PROJECT_TYPES || [];
  const pSpec = pTypes.find(t => t.id === projectTypeId) || { id: 'villa', label: 'Custom Standalone Villa', buildMonths: 10, maxFloors: 2 };
  const finish = FINISHING_TIERS.find(f => f.id === finishId) || FINISHING_TIERS[3];

  const buildUsdPerM2 = projectTypeId === 'villa' ? 780 : projectTypeId === 'building' ? 950 : 650;
  const builtArea = Math.round(land.areaM2 * 0.65 * (projectTypeId === 'building' ? 3 : 1.5));
  const buildCostPlayer = Math.round(convertCurrency(builtArea * buildUsdPerM2 * finish.costMult, 'usa', S.country, S.year));

  if (S.money.cash < Math.round(buildCostPlayer * 0.35)) {
    return { ok: false, msg: `Need 35% contractor mobilization (${formatMoney(Math.round(buildCostPlayer * 0.35), S.country)}) to break ground.` };
  }

  const upfront = Math.round(buildCostPlayer * 0.35);
  const totalMos = Math.max(6, Number(pSpec.buildMonths || 10));
  const monthlyDraw = Math.ceil((buildCostPlayer - upfront) / totalMos);

  { const paid = purchase(S, upfront, `Broke ground on ${pSpec.label} at ${land.name}`, 'cash', { category: 'housing' }); if (!paid.ok) return paid; }
  land.buildProject = {
    typeId: pSpec.id,
    label: pSpec.label,
    shape: projectTypeId === 'building' ? 'apartment' : 'villa',
    finishId: finish.id,
    builtArea,
    monthsLeft: totalMos,
    totalMonths: totalMos,
    monthlyDrawPlayer: monthlyDraw,
    remainingDrawPlayer:buildCostPlayer-upfront,
    totalInvestedNative: Math.round(convertCurrency(buildCostPlayer, S.country, land.country, S.year)),
    progressPct: 8
  };

  recordJournal(S, `Tower cranes and excavation started on ${land.name}: building a ${builtArea} m² ${pSpec.label} (${totalMos} months).`, 'milestone');
  return { ok: true, msg: `Construction started (${totalMos} months)!` };
}

/* ============================================================================
   2. DRIVING LICENCE, 1,111-CAR SHOWROOM (COLORS/TRIMS/MODS) & 1,293 SHOP MALL
   ========================================================================== */

export function obtainOrRenewDrivingLicence(S) {
  ensureExtendedState(S);
  if (S.player.age < 18) return { ok: false, msg: 'Minimum driving licence age is 18.' };
  const fee = Math.round(convertCurrency(160, 'usa', S.country, S.year));
  if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} for traffic department test & licence.` };

  walletMove(S, -fee, 'Driving licence exam & issuance', 'lifestyle');
  if (!S.drivingLicence.valid && !chance(S, 0.86)) {
    recordJournal(S, `Clipped a cone during parallel parking at the traffic test — retake next month.`, 'life');
    return { ok: false, msg: 'Failed road test parallel-parking check — try again!' };
  }

  S.drivingLicence.valid = true;
  S.drivingLicence.issuedYear = S.year;
  S.drivingLicence.expiresYear = S.year + 10;
  recordJournal(S, `Issued 10-year driving licence valid through ${S.year + 10}.`, 'life');
  return { ok: true, msg: `Driving licence valid through ${S.year + 10}!` };
}

export function showroomCarQuote(S,carId,trimId='base'){
 const car=CARS_MEGA_CATALOG.find(c=>c.id===carId),trim=CAR_TRIMS.find(t=>t.id===trimId);
 if(!car||!trim||S.year<car.yearFrom||S.year>car.yearTo)return{ok:false,msg:'Vehicle/trim unavailable in this year.'};
 const dutyMult=S.country==='egy'&&!car.ev&&['lux','exec','sport','hyper'].includes(car.class)?1.75:1;
 const fullPrice=Math.round(convertCurrency(car.priceUsd2026*trim.mult*dutyMult,'usa',S.country,S.year)),down=Math.round(fullPrice*.25),principal=fullPrice-down,balance=Math.round(principal*1.24);
 const monthlyUpkeep=Math.max(15,Math.round(convertCurrency(75+car.priceUsd2026*.003,'usa',S.country,S.year)));
 return{ok:true,car,trim,fullPrice,down,balance,monthlyPayment:Math.round(principal*1.24/48),monthlyUpkeep};
}
export function buyShowroomCar(S,carId,trimId='base',colorIdx=0,useAutoLoan=false){
 ensureExtendedState(S);if(S.player.age<18)return{ok:false,msg:'Must be18+ to register a vehicle.'};
 const q=showroomCarQuote(S,carId,trimId);if(!q.ok)return q;
 const{car,trim,fullPrice,monthlyUpkeep}=q;
 const colorObj=CAR_COLORS[colorIdx%CAR_COLORS.length]||{name:'Midnight Blue',hex:'#1D3557'};
  // Trim, colour and duty stay here; payment, loan and the car record go
  // through the ONE car-buy core (D2) — the loan is now the honest
  // flat-markup record (1.24x, effective APR 12.9%) with the repossession
  // chain, not the old 11% label.
  const res = finalizeCarPurchase(S, {
    catalogId: car.id,
    name: `${car.brandName} ${car.model} (${trim.label})`,
    tier: car.tier,
    class: car.class,
    body: car.body,
    colorHex: colorObj.hex || '#1D3557',
    colorName: colorObj.label || colorObj.name || 'Metallic',
    trimLabel: trim.label,
    fullPrice,
    monthlyUpkeep,
    happinessBoost: car.hap + trim.hap + 2
  }, { useAutoLoan });
  if (!res.ok) return res;
  recordJournal(S, `Drove out of the showroom in a ${res.car.colorName} ${res.car.name} (${formatMoney(fullPrice, S.country)}).`, 'lifestyle');
  return { ok: true, msg: `Bought ${res.car.colorName} ${res.car.name}!`, car: res.car };
}

/* Buy from 1,293-Item Shopping Catalog via Cash, Credit Card, or Regional BNPL (ValU / Tabby / Tamara)! */
export function purchaseShopCatalogItem(S, itemId, payMethod = 'cash', opts = {}) {
  ensureExtendedState(S);
  const item = SHOP_MEGA_CATALOG.find(i => i.id === itemId);
  if (!item) return { ok: false, msg: 'Item not found.' };
  if(!['cash','card','bnpl'].includes(payMethod))return {ok:false,msg:'Choose cash, card or BNPL.'};
  if(payMethod!=='cash'&&S.player.age<18)return {ok:false,msg:'Credit purchases require an adult.'};

  const priceLocal = Math.max(5, Math.round(convertCurrency(item.priceUsd2026, 'usa', S.country, S.year)));

  if (payMethod === 'cash') {
    const paid = purchase(S, priceLocal, `Bought ${item.brand} ${item.name}`, 'cash', { category: 'lifestyle' });
    if (!paid.ok) return paid;
  } else if (payMethod === 'card') {
    /* v2.12 W6: opts.cardId pays with ONE named card (Cards tab); opts.perk
       applies that card's once-a-year perk discount and names the saving. */
    const card = opts.cardId
      ? S.creditCards.find(c => c.id === opts.cardId)
      : S.creditCards.find(c => (c.limit - c.balance) >= priceLocal);
    if (!card) return { ok: false, msg: opts.cardId ? 'That card is no longer in your wallet.' : 'No active credit card has enough available limit!' };
    let charge = priceLocal;
    let saving = 0;
    let perkPct = 0;
    if (opts.perk) {
      if (card.perkUsedYear === S.year) return { ok: false, msg: `You already used the ${card.name} perk this year — it refreshes next year.` };
      perkPct = CARD_PERK_DISCOUNT_PCT[card.tier] ?? 5;
      saving = Math.round(priceLocal * perkPct / 100);
      charge = priceLocal - saving;
    }
    if ((card.limit - card.balance) < charge) return { ok: false, msg: `${card.name} has only ${formatMoney(card.limit - card.balance, S.country)} of limit left — need ${formatMoney(charge, S.country)}.` };
    const paid = purchase(S, charge, `Bought ${item.brand} ${item.name}${opts.perk ? ` (${card.name} perk −${perkPct}%)` : ''}`, 'card', { card, category: 'lifestyle' });
    if (!paid.ok) return paid;
    if (opts.perk) card.perkUsedYear = S.year;
    /* The perk saving is real money back on the card: the charge above is
       already discounted, so record the saving explicitly for the verify. */
    if (opts.perk) recordJournal(S, `${card.name} perk saved ${formatMoney(saving, S.country)} on ${item.brand} ${item.name}.`, 'money');
  } else if (payMethod === 'bnpl') {
    const bnpl = BNPL_PROVIDERS[S.country] || BNPL_PROVIDERS.default;
    if (S.year < bnpl.availableFrom) return { ok: false, msg: `${bnpl.name} did not exist in ${S.year}!` };
    if (S.bnplPlans.length >= 5) return { ok: false, msg: 'Too many active BNPL installment plans — pay existing splits down first!' };
    const paid = purchase(S, priceLocal, `${item.brand} ${item.name}`, 'bnpl', { bnpl: { providerName: bnpl.name, markup: bnpl.markup, months: bnpl.months }, category: 'lifestyle' });
    if (!paid.ok) return paid;
  }

  S.inventory.unshift({
    id: nextId(S, 'inv'),
    catalogId: item.id,
    name: `${item.brand} ${item.name}`,
    category: item.category,
    boughtYear: S.year,
    valueLocal: item.appreciates ? priceLocal : Math.round(priceLocal * 0.6),
    appreciates: !!item.appreciates
  });
  // Owned assets are never silently deleted when the inventory grows.

  S.player.vitals.happiness = clamp(S.player.vitals.happiness + Math.min(8, item.hap));
  if (item.looks > 0) S.player.vitals.looks = clamp(S.player.vitals.looks + item.looks);
  if (item.priceUsd2026 >= 4500) emitFact(S, 'LUXURY_PURCHASE', { itemName: `${item.brand} ${item.name}` });

  /* v2.12 W6: buying a wished item clears it from the wishlist. */
  S.shopWishlist = (S.shopWishlist || []).filter(w => w.catalogId !== item.id);
  const perkCard = opts.perk ? S.creditCards.find(c => c.id === opts.cardId) : null;
  const perkSaving = perkCard ? Math.round(priceLocal * (CARD_PERK_DISCOUNT_PCT[perkCard.tier] ?? 5) / 100) : 0;

  recordJournal(S, `Purchased ${item.brand} ${item.name} (${formatMoney(priceLocal, S.country)} via ${payMethod.toUpperCase()}${perkSaving > 0 ? `, perk saved ${formatMoney(perkSaving, S.country)}` : ''}).`, 'lifestyle');
  return { ok: true, msg: perkSaving > 0 ? `Bought ${item.brand} ${item.name} with the ${perkCard.name} perk — saved ${formatMoney(perkSaving, S.country)}!` : `Bought ${item.brand} ${item.name}!` };
}

export function resellInventoryItem(S, invId) {
  ensureExtendedState(S);
  const idx = S.inventory.findIndex(x => x.id === invId);
  if (idx < 0) return { ok: false, msg: 'Item not found.' };
  const [it] = S.inventory.splice(idx, 1);
  walletMove(S, it.valueLocal, `Sold ${it.name}`, 'investment');
  recordJournal(S, `Sold your ${it.name} for ${formatMoney(it.valueLocal, S.country)}.`, 'money');
  return { ok: true, msg: `Sold for ${formatMoney(it.valueLocal, S.country)}!` };
}

/* ============================================================================
   v2.12 W6 — SHOP VERBS 2 & 3: Compare, Save for later, Ask about it.
   Every verb does something: Compare stores the side-by-side record and
   opens it as a scene; Save writes the wishlist (with an affordability
   reminder when the player can already afford it); Ask opens a scene with
   the shopkeeper's real verdict against the category's median price.
   ========================================================================== */

export function shopItemPriceLocal(S, item) {
  return Math.max(5, Math.round(convertCurrency(item.priceUsd2026, 'usa', S.country, S.year)));
}

export function saveShopItemForLater(S, itemId) {
  ensureExtendedState(S);
  const item = SHOP_MEGA_CATALOG.find(i => i.id === itemId);
  if (!item) return { ok: false, msg: 'Item not found.' };
  if ((S.shopWishlist || []).some(w => w.catalogId === item.id)) {
    return { ok: false, msg: `${item.brand} ${item.name} is already on your wishlist.` };
  }
  if ((S.shopWishlist || []).length >= 20) return { ok: false, msg: 'Your wishlist is full (20 items) — buy or remove one first.' };
  const priceLocal = shopItemPriceLocal(S, item);
  S.shopWishlist.push({ id: nextId(S, 'wish'), catalogId: item.id, name: `${item.brand} ${item.name}`, priceLocal, addedYear: S.year });
  recordJournal(S, `Saved ${item.brand} ${item.name} (${formatMoney(priceLocal, S.country)}) for later.`, 'lifestyle');
  /* The reminder: the wishlist section in the Shop render repeats it, and
     the save itself says so when the player can already afford it. */
  if (S.money.cash >= priceLocal) return { ok: true, msg: `Saved for later — and good news, you can already afford it (${formatMoney(priceLocal, S.country)} in cash).` };
  return { ok: true, msg: `Saved ${item.brand} ${item.name} for later — you need ${formatMoney(priceLocal - S.money.cash, S.country)} more to afford it.` };
}

export function removeShopWishlist(S, itemId) {
  ensureExtendedState(S);
  const before = (S.shopWishlist || []).length;
  S.shopWishlist = (S.shopWishlist || []).filter(w => w.catalogId !== itemId);
  if (S.shopWishlist.length === before) return { ok: false, msg: 'That item is not on your wishlist.' };
  return { ok: true, msg: 'Removed from your wishlist.' };
}

function shopCompareLine(S, entry) {
  if (entry.kind === 'owned') {
    return `${entry.name} (yours) — resale ${formatMoney(entry.priceLocal, S.country)}${entry.appreciates ? ' · ★ appreciating asset' : ''}`;
  }
  return `${entry.name} — ${formatMoney(entry.priceLocal, S.country)} · quality +${entry.quality} (mood + looks)`;
}

export function compareShopItems(S, itemId, otherRef) {
  ensureExtendedState(S);
  const item = SHOP_MEGA_CATALOG.find(i => i.id === itemId);
  if (!item) return { ok: false, msg: 'Item not found.' };
  let other = null;
  if (otherRef && String(otherRef).startsWith('inv:')) {
    const inv = (S.inventory || []).find(x => x.id === String(otherRef).slice(4));
    if (inv) other = { kind: 'owned', name: inv.name, priceLocal: inv.valueLocal, quality: 0, durabilityMonths: 0, appreciates: !!inv.appreciates };
  } else if (otherRef) {
    const o = SHOP_MEGA_CATALOG.find(i => i.id === otherRef);
    if (o) other = { kind: 'shop', name: `${o.brand} ${o.name}`, priceLocal: shopItemPriceLocal(S, o), quality: (o.hap || 0) + (o.looks || 0), durabilityMonths: o.durabilityMonths || 0 };
  }
  if (!other) {
    /* No explicit other: the next item in the same category, else the
       cheapest other item in the shop. Never compares an item with itself. */
    const sameCat = SHOP_MEGA_CATALOG.filter(i => i.category === item.category && i.id !== item.id && i.yearFrom <= S.year && i.yearTo >= S.year);
    const pick2 = sameCat[0] || SHOP_MEGA_CATALOG.find(i => i.id !== item.id);
    if (!pick2) return { ok: false, msg: 'Nothing to compare it with.' };
    other = { kind: 'shop', name: `${pick2.brand} ${pick2.name}`, priceLocal: shopItemPriceLocal(S, pick2), quality: (pick2.hap || 0) + (pick2.looks || 0), durabilityMonths: pick2.durabilityMonths || 0 };
  }
  const a = { kind: 'shop', name: `${item.brand} ${item.name}`, priceLocal: shopItemPriceLocal(S, item), quality: (item.hap || 0) + (item.looks || 0), durabilityMonths: item.durabilityMonths || 0 };
  S.shopLastCompare = { a, b: other, cheaperId: a.priceLocal <= other.priceLocal ? item.id : (otherRef || null), year: S.year };
  const cheaperName = a.priceLocal <= other.priceLocal ? a.name : other.name;
  queueScene(S, {
    key: `shop_compare_${item.id}_${S.year}_${S.month}_${S.turn}`,
    baseId: 'shop_compare',
    maxPerLife: 99,
    category: 'lifestyle',
    title: `Compare: ${a.name} vs ${other.name}`,
    text: `Side by side:\n• ${shopCompareLine(S, a)}\n• ${shopCompareLine(S, other)}\n${cheaperName} is the cheaper of the two${a.quality !== other.quality ? `, and ${a.quality >= other.quality ? a.name : other.name} gives the better mood-and-looks lift (+${Math.max(a.quality, other.quality)} vs +${Math.min(a.quality, other.quality)})` : ''}.`,
    choices: [{ label: 'Done comparing', effect: () => {} }]
  });
  return { ok: true, msg: `Compared ${a.name} with ${other.name} — ${cheaperName} is cheaper.` };
}

export function askShopkeeperAboutItem(S, itemId) {
  ensureExtendedState(S);
  const item = SHOP_MEGA_CATALOG.find(i => i.id === itemId);
  if (!item) return { ok: false, msg: 'Item not found.' };
  const priceLocal = shopItemPriceLocal(S, item);
  const sameCat = SHOP_MEGA_CATALOG
    .filter(i => i.category === item.category && i.yearFrom <= S.year && i.yearTo >= S.year)
    .map(i => i.priceUsd2026).sort((x, y) => x - y);
  const medianUsd = sameCat.length ? sameCat[Math.floor(sameCat.length / 2)] : item.priceUsd2026;
  const medianLocal = Math.max(5, Math.round(convertCurrency(medianUsd, 'usa', S.country, S.year)));
  const verdict=item.priceUsd2026<medianUsd?'below the catalog category median':item.priceUsd2026>medianUsd?'above the catalog category median':'at the catalog category median';
  const quality = (item.hap || 0) + (item.looks || 0);
  queueScene(S, {
    key: `shop_ask_${item.id}_${S.year}_${S.month}_${S.turn}`,
    baseId: 'shop_ask',
    maxPerLife: 99,
    category: 'lifestyle',
    title: `Ask about the ${item.brand} ${item.name}`,
    text: `${formatMoney(priceLocal,S.country)} · +${item.hap||0} Mood${item.looks?` · +${item.looks} Looks`:''}\nCategory median: ${formatMoney(medianLocal,S.country)} · ${verdict}.${item.appreciates?' Collectible value can change.':''}`,

    choices: [{ label: 'Thanks — I will think about it', effect: () => {} }]
  });
  recordJournal(S, `Asked the shopkeeper about the ${item.brand} ${item.name} — ${verdict}.`, 'lifestyle');
  return { ok: true, msg: `The shopkeeper says it is ${verdict}.` };
}

/* ============================================================================
   3. 3D CREDIT CARDS, STOCK/ETF/SUKUK MARKETS, HAWALA & ANNUAL ZAKAT (2.5%)
   ========================================================================== */

export function openCreditCard(S, cardId) {
  ensureExtendedState(S);
  if (S.player.age < 21) return { ok: false, msg: 'Minimum age 21 for credit cards.' };
  if (!hasValidResidenceForBanking(S)) return { ok: false, msg: 'New credit cards require a valid residence status — regularise your visa first.' };
  const cardsHere = V1_CREDIT_CARDS[S.country] || V1_CREDIT_CARDS.usa || [];
  const spec = cardsHere.find(c => c.id === cardId) || cardsHere[0];
  if (!spec) return { ok: false, msg: 'Card product unavailable.' };
  if (S.creditCards.some(c => c.catalogId === spec.id)) return { ok: false, msg: 'You already hold this card.' };
  if (S.money.creditScore < (spec.reqScore || 580)) {
    return { ok: false, msg: `Requires ${spec.reqScore} credit score (yours: ${S.money.creditScore}).` };
  }

  const limitLocal = eraLocalCost(spec.maxLimit ? Math.round((spec.minLimit + spec.maxLimit) / 2) : 25000, S.country, S.year);
  S.creditCards.push({
    id: nextId(S, 'cc'),
    catalogId: spec.id,
    name: spec.name,
    tier: spec.tier || 'classic',
    limit: limitLocal,
    balance: 0,
    apr: spec.apr || 0.24,
    cashbackRate: spec.cashbackRate || 0.01
  });
  recordJournal(S, `Approved for ${spec.name} (${spec.tier.toUpperCase()}) with a ${formatMoney(limitLocal, S.country)} limit.`, 'money');
  return { ok: true, msg: `Approved for ${spec.name}!` };
}

export function payCreditCard(S, ccId, full = true) {
  const cc = S.creditCards.find(c => c.id === ccId);
  if (!cc || cc.balance <= 0) return { ok: false, msg: 'Card balance is already 0.' };
  const target = full ? cc.balance : Math.min(cc.balance,Math.max(10, Math.round(cc.balance * 0.10)));
  const pay = Math.min(S.money.cash, target);
  if (pay <= 0) return { ok: false, msg: 'Insufficient cash to pay statement.' };

  walletMove(S, -pay, `Credit card payment: ${cc.name}`, 'bank');
  cc.balance = Math.max(0, Math.round(cc.balance - pay));
  if (cc.balance === 0) S.money.creditScore = clamp(S.money.creditScore + 8, 300, 850);
  return { ok: true, msg: `Paid ${formatMoney(pay, S.country)} toward ${cc.name}.` };
}

/* ============================================================================
   v2.12 W6 — CARD VERBS: Pay with this card, Check limit / benefit,
   Use the perk. Pay routes through the bank ledger (purchase() names the
   card on the ledger line); the perk is a once-a-year discount on a real
   purchase, with the saving shown; the limit check opens a scene with the
   card's real limit, rate and perks from its own record.
   ========================================================================== */

export const CARD_PERK_DISCOUNT_PCT = { classic: 5, gold: 8, platinum: 10, infinite: 12, islamic: 5 };

export function cardLimitBenefit(S, ccId) {
  ensureExtendedState(S);
  const cc = S.creditCards.find(c => c.id === ccId);
  if (!cc) return { ok: false, msg: 'Card not found in your wallet.' };
  const catalog = V1_CREDIT_CARDS[S.country] || V1_CREDIT_CARDS.usa || [];
  const spec = catalog.find(c => c.id === cc.catalogId);
  const perks = (spec && spec.perks && spec.perks.length ? spec.perks : [`${((cc.cashbackRate || 0.01) * 100).toFixed(1)}% cashback on purchases`]).join(' · ');
  const available = Math.max(0, cc.limit - cc.balance);
  queueScene(S, {
    key: `card_limit_${cc.id}_${S.year}_${S.month}_${S.turn}`,
    baseId: 'card_limit',
    maxPerLife: 99,
    category: 'money',
    title: `${cc.name} — limit & benefits`,
    text: `${cc.name} (${(cc.tier || 'classic').toUpperCase()}): limit ${formatMoney(cc.limit, S.country)}, balance ${formatMoney(cc.balance, S.country)}, so ${formatMoney(available, S.country)} is still available to spend. APR ${Math.round((cc.apr || 0.24) * 100)}% a year, cashback ${((cc.cashbackRate || 0.01) * 100).toFixed(1)}%. Perks: ${perks}.${cc.perkUsedYear === S.year ? ' You already used this year’s perk discount.' : ' This year’s perk discount is still unused — use it on a wishlist item from this screen.'}`,
    choices: [{ label: 'Done', effect: () => {} }]
  });
  return { ok: true, msg: `${cc.name}: ${formatMoney(available, S.country)} available of a ${formatMoney(cc.limit, S.country)} limit.` };
}

export function payWithCard(S, ccId, itemId) {
  ensureExtendedState(S);
  const cc = S.creditCards.find(c => c.id === ccId);
  if (!cc) return { ok: false, msg: 'Card not found in your wallet.' };
  const item = SHOP_MEGA_CATALOG.find(i => i.id === itemId);
  if (!item) return { ok: false, msg: 'Item not found — save it for later in the Shop first.' };
  const r = purchaseShopCatalogItem(S, itemId, 'card', { cardId: ccId });
  if (!r.ok) return r;
  return { ok: true, msg: `Paid for ${item.brand} ${item.name} with ${cc.name} — see the ledger line naming the card.` };
}

export function useCardPerk(S, ccId, itemId) {
  ensureExtendedState(S);
  const cc = S.creditCards.find(c => c.id === ccId);
  if (!cc) return { ok: false, msg: 'Card not found in your wallet.' };
  const item = SHOP_MEGA_CATALOG.find(i => i.id === itemId);
  if (!item) return { ok: false, msg: 'Item not found — save it for later in the Shop first.' };
  return purchaseShopCatalogItem(S, itemId, 'card', { cardId: ccId, perk: true });
}

export function investInMarketAsset(S, assetId, amountLocal) {
  ensureExtendedState(S);
  const asset = GLOBAL_MARKET_ASSETS.find(a => a.id === assetId);
  if (!asset) return { ok: false, msg: 'Market instrument not found.' };
  if (S.year < asset.availableFrom) return { ok: false, msg: `${asset.name} launched in ${asset.availableFrom}.` };

  const amt = Math.floor(Number(amountLocal) || 0);
  if (amt <= 0 || S.money.cash < amt) return { ok: false, msg: 'Insufficient cash.' };

  { const paid = purchase(S, amt, `Invested in ${asset.name}`, 'cash', { category: 'investment' }); if (!paid.ok) return paid; }
  const existing = S.investments.find(i => i.assetId === asset.id);
  if (existing) {
    existing.valueLocal += amt;
    existing.costBasisLocal += amt;
  } else {
    S.investments.push({
      assetId: asset.id,
      name: asset.name,
      kind: asset.kind,
      shariaCompliant: asset.shariaCompliant,
      valueLocal: amt,
      costBasisLocal: amt
    });
  }
  recordJournal(S, `Invested ${formatMoney(amt, S.country)} into ${asset.name}.`, 'money');
  return { ok: true, msg: `Invested ${formatMoney(amt, S.country)} in ${asset.name}!` };
}

export function liquidateMarketAsset(S, assetId) {
  ensureExtendedState(S);
  const idx = S.investments.findIndex(i => i.assetId === assetId);
  if (idx < 0) return { ok: false, msg: 'Holding not found.' };
  const [pos] = S.investments.splice(idx, 1);
  const proceeds = Math.max(0, Math.round(pos.valueLocal));
  walletMove(S, proceeds, `Sold position in ${pos.name}`, 'investment');
  recordJournal(S, `Closed ${pos.name} position for ${formatMoney(proceeds, S.country)} (cost basis ${formatMoney(pos.costBasisLocal, S.country)}).`, 'money');
  return { ok: true, msg: `Sold ${pos.name} for ${formatMoney(proceeds, S.country)}!` };
}

export function remittanceQuote(S,channelId,amountLocal){
  const ch=REMITTANCE_CHANNELS.find(c=>c.id===channelId),amount=Number(amountLocal);
  if(!ch||S.year<ch.availableFrom||!Number.isSafeInteger(amount)||amount<=0||S.money.cash<amount)return{ok:false,msg:'Transfer unavailable or insufficient cash.'};
  const recipient=[S.people[S.relations.motherId],S.people[S.relations.fatherId]].find(p=>p?.alive);
  if(!recipient)return{ok:false,msg:'No living parent to receive the transfer.'};
  const recipientCountry=recipient.residenceCountry||S.country,fee=amount*ch.feePct;
  const received=Math.round(convertCurrency((amount-fee)*(1+ch.fxBonusPct),S.country,recipientCountry,S.year));
  return{ok:true,amount,fee,received,recipientId:recipient.id,recipientName:recipient.firstName,recipientCountry,channelId:ch.id};
}
export function sendInternationalRemittance(S,channelId,amountLocal){
  const q=remittanceQuote(S,channelId,amountLocal);if(!q.ok)return q;
  const ch=REMITTANCE_CHANNELS.find(c=>c.id===channelId),recipient=S.people[q.recipientId];
  walletMove(S,-q.amount,'Remittance via '+ch.label,'family');
  S.money.remittanceHistory??=[];
  const receipt={...q,year:S.year,month:S.month,status:'delivered'};
  if(ch.scamRisk>0&&chance(S,ch.scamRisk)){
    receipt.status='lost';receipt.received=0;S.money.remittanceHistory.push(receipt);
    recordCivilLoss(S,'broker_fraud',q.amount,'remittance',{traceable:true,defendantName:ch.label});
    recordJournal(S,'The informal broker lost this transfer. No recipient balance was credited.','money');
    return{ok:false,msg:'Broker disappeared with the transfer.'};
  }
  recipient.career??={};recipient.career.savingsLocal=(Number(recipient.career.savingsLocal)||0)+q.received;
  S.money.remittedHomeEgpTotal=(Number(S.money.remittedHomeEgpTotal)||0)+Math.round(convertCurrency(q.amount,S.country,'egy',S.year));
  S.money.remittanceHistory.push(receipt);
  rememberDeed(S,recipient,'helped_money','Received a family transfer.',{affection:10,respect:10,resentment:-12});
  recordJournal(S,`Sent ${formatMoney(q.received,q.recipientCountry)} to ${q.recipientName} via ${ch.label}.`,'family');
  return{ok:true,msg:'Transfer delivered.',receipt};
}

/* Authentic 2.5% Annual Zakat above 85g Gold Nisab */
export function computeZakatDueLocal(S) {
  const nisabLocal = goldPricePerGram(S.country, S.year, 24) * 85;
  const zakatable = Math.max(0, S.money.cash) + Math.max(0, S.money.savings) +
    (S.money.goldGrams21k * goldPricePerGram(S.country, S.year, 21)) +
    (S.investments || []).reduce((sum, i) => sum + (Number(i.valueLocal) || 0), 0);
  if (zakatable < nisabLocal) return { eligible: false, nisabLocal: Math.round(nisabLocal), due: 0 };
  return { eligible: true, nisabLocal: Math.round(nisabLocal), due: Math.round(zakatable * 0.025) };
}

export function payAnnualZakat(S) {
  ensureExtendedState(S);
  if (S.credentials.zakatLastYearPaid === S.year) return { ok: false, msg: `Already fulfilled annual Zakat for ${S.year}.` };
  const z = computeZakatDueLocal(S);
  if (!z.eligible || z.due <= 0) return { ok: false, msg: `Zakatable liquid wealth is below the 85g Gold Nisab (${formatMoney(z.nisabLocal, S.country)}).` };
  if (S.money.cash < z.due) return { ok: false, msg: `Need ${formatMoney(z.due, S.country)} liquid cash (withdraw savings if needed).` };

  walletMove(S, -z.due, `Paid 2.5% Annual Zakat Al-Mal (${S.year})`, 'family');
  S.credentials.zakatLastYearPaid = S.year;
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 8);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 10);
  recordJournal(S, `Calculated and distributed ${formatMoney(z.due, S.country)} in 2.5% Zakat Al-Mal to families in need.`, 'milestone');
  return { ok: true, msg: `Fulfilled Zakat (${formatMoney(z.due, S.country)})!` };
}

/* ============================================================================
   4. INTERNATIONAL LICENSING BOARDS, CHANCENKARTE (6-PT), PART-TIME & CASH JOBS
   ========================================================================== */

export function sitExamOrLicensingBoard(S, kind, examId) {
  ensureExtendedState(S);
  if(!['language','board'].includes(kind))return {ok:false,msg:'Exam type unavailable.'};
  if(S.player.age<17)return {ok:false,msg:'Exams open at age17in this game.'};
  const examPeriod=S.year*12+S.month;
  const examKey=`${kind}_${examId}`;
  if(S.credentials.examAttempts?.[examKey]===examPeriod)return {ok:false,msg:'Already sat this exam this game month.'};
  if (kind === 'language') {
    const ex = LANGUAGE_EXAMS.find(l => l.id === examId);
    if (!ex) return { ok: false, msg: 'Exam not found.' };
    const fee = Math.round(convertCurrency(ex.feeUsd, 'usa', S.country, S.year));
    if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} exam fee.` };
    S.credentials.examAttempts={...S.credentials.examAttempts,[examKey]:examPeriod};
    walletMove(S, -fee, `Sat ${ex.label}`, 'career');

    const passed = S.player.vitals.smarts >= ex.minSmartsForBand7 || chance(S, 0.72);
    if (!passed) {
      recordJournal(S, `Fell half a band short on ${ex.label} — study harder and retake.`, 'career');
      return { ok: false, msg: `Missed target score on ${ex.label}.` };
    }
    S.credentials.languageCerts = S.credentials.languageCerts.filter(c => c.id !== ex.id);
    S.credentials.languageCerts.push({ id: ex.id, label: ex.label, lang: ex.lang, expiresYear: S.year + ex.validityYears });
    if (!S.education.languages.includes(ex.lang)) S.education.languages.push(ex.lang);
    recordJournal(S, `Passed ${ex.label} with top marks (${ex.lang} certified)!`, 'milestone');
    return { ok: true, msg: `Certified in ${ex.lang}!` };
  }

  /* Professional Board License (PLAB, USMLE, Approbation, SCFHS, DHA, SCE, CFA, Bar) */
  const lic = PROFESSIONAL_LICENSES.find(l => l.id === examId);
  if (!lic) return { ok: false, msg: 'Board not found.' };
  if (S.credentials.licenses.includes(lic.id)) return { ok: false, msg: 'Already licensed!' };
  if (lic.reqDegree && !S.education.degrees.includes(lic.reqDegree)) {
    return { ok: false, msg: `Requires a completed ${lic.reqDegree.toUpperCase()} degree.` };
  }
  if (lic.reqLang && !hasCurrentLanguage(S,new RegExp(lic.reqLang.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')))) {
    return { ok: false, msg: `Requires ${lic.reqLang} language certification first!` };
  }

  /* Real UAE DHA Tier-1 Exemption if doctor already passed UK GMC/PLAB or US USMLE! */
  const tier1Exempt = lic.id === 'lic_uae_dha' && (S.credentials.licenses.includes('lic_uk_plab') || S.credentials.licenses.includes('lic_us_usmle'));
  const fee = Math.round(convertCurrency(lic.feeUsd, 'usa', S.country, S.year));
  if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} for board & DataFlow fees.` };

  S.credentials.examAttempts={...S.credentials.examAttempts,[examKey]:examPeriod};
  walletMove(S, -fee, `${lic.label} registration & exam`, 'career');
  const passProb = tier1Exempt ? 1.0 : Math.min(0.95, lic.passBase + (S.player.vitals.smarts - lic.minSmarts) * 0.01);
  if (!chance(S, passProb)) {
    S.player.vitals.stress = clamp(S.player.vitals.stress + 8);
    recordJournal(S, `Did not clear ${lic.label} on this sitting (${formatMoney(fee, S.country)} spent).`, 'career');
    return { ok: false, msg: `Did not pass ${lic.label} this sitting.` };
  }

  S.credentials.licenses.push(lic.id);
  if (S.career.job && S.career.job.track === lic.reqDegree) {
    S.career.job.monthlyGross = Math.round(S.career.job.monthlyGross * 1.18);
  }
  recordJournal(
    S,
    `Passed ${lic.label}${tier1Exempt ? ' via Tier-1 UK/US Board Exemption' : ''}! International specialist practice unlocked.`,
    'milestone'
  );
  return { ok: true, msg: `Earned ${lic.label}!` };
}

/* Germany Chancenkarte (Opportunity Card — Official 6-Point System from 2024+!) */
export function computeChancenkartePoints(S) {
  let pts = 0;
  if (S.education.degrees.length > 0) pts += 4; // Recognized/partial degree
  if (['cs', 'engineering', 'medicine', 'pharmacy'].some(d => S.education.degrees.includes(d))) pts += 1; // Shortage bottleneck sector
  if ((S.career.yearsExperience || 0) >= 5) pts += 3;
  else if ((S.career.yearsExperience || 0) >= 2) pts += 2;
  if (S.education.languages.includes('German B2')) pts += 3;
  if (S.education.languages.includes('English (C1)')) pts += 1;
  if (S.player.age < 35) pts += 2;
  else if (S.player.age <= 40) pts += 1;
  return pts;
}

export function applyGermanChancenkarte(S) {
  ensureExtendedState(S);
  if (S.year < 2024) return { ok: false, msg: 'Germany introduced the Chancenkarte (Opportunity Card) in June 2024.' };
  const border = checkCanCrossBorder(S);
  if (!border.ok) return { ok: false, msg: border.reason };
  if (S.country === 'deu') return { ok: false, msg: 'Already living in Germany.' };

  const pts = computeChancenkartePoints(S);
  if (pts < 6) {
    return { ok: false, msg: `Chancenkarte requires >= 6 points (yours: ${pts} pts). Earn a degree, 2+ yrs exp, IELTS C1, or Goethe B2!` };
  }

  const blockedEur = eraLocalCost(12324, 'deu', S.year); // 1,027 EUR/mo blocked proof
  const neededLocal = Math.round(convertCurrency(blockedEur + 900, 'deu', S.country, S.year));
  if (S.money.cash < neededLocal) {
    return { ok: false, msg: `Need ${formatMoney(neededLocal, S.country)} for Sperrkonto living proof + flight.` };
  }

  walletMove(S, -neededLocal, 'German Chancenkarte Sperrkonto & Flight', 'visa');
  /* v2.11 W4: if the player owns a business, the move pauses here for the
     keep/sell/close decision — the blocked account and journal below run
     only once the move completes (inline now, or from the 'chancenkarte'
     continuation in finishPendingRelocation). */
  const moved = executeCountryRelocation(S, 'deu', {
    kind: 'post_study_work',
    permitName: `German Chancenkarte (${pts} pts · 12-Month Job Search)`,
    sponsorName: null,
    expiresYear: S.year + 1,
    expiresMonth: S.month,
    familySponsored: false
  }, false, { after: { kind: 'chancenkarte', blockedEur, pts } });
  if (moved && moved.deferred) {
    return { ok: true, deferred: true, msg: `Chancenkarte approved (${pts} points)! Decide what happens to your business before you move to Germany.` };
  }

  S.legal.blockedAccount = {
    kind: 'Chancenkarte Sperrkonto',
    country: 'deu',
    balanceLocal: blockedEur,
    balanceInPlayerLocal: blockedEur,
    monthlyReleaseLocal: Math.round(blockedEur / 12)
  };
  recordJournal(S, `Approved for Germany’s Chancenkarte (${pts} points)! Arrived in Berlin with 12 months to interview for EU Blue Card roles.`, 'visa');
  return { ok: true, msg: `Moved to Germany on Chancenkarte (${pts} pts)!` };
}

/* ============================================================================
   5. SURGERIES (LASIK!), IVF/ICSI, 102 VACATIONS + NUSUK HAJJ/UMRAH, LAWSUITS & CRIME
   ========================================================================== */

export function surgeryEligibility(S,surg){
 if(surg.id==='ivf_icsi_cycle')return {ok:false,reason:'Use the fertility clinic for conception treatment.'};
 if(S.medical.surgeryRecoveryUntil>S.year*12+S.month)return {ok:false,reason:'Finish recovery from the previous surgery first.'};
 if((surg.cosmetic||!surg.cures?.length)&&S.player.age<18)return {ok:false,reason:'Elective appearance surgery is adult-only in this game.'};
 if(surg.cures?.length&&!S.medical.conditions.some(c=>surg.cures.includes(c.id)))return {ok:false,reason:'No matching active condition for this procedure.'};
 if(S.medical.surgeryYears?.[surg.id]===S.year)return {ok:false,reason:'This procedure was already performed this year.'};
 return {ok:true};
}

export function fertilityCostLocal(S,ft){return Math.round(convertCurrency((ft.costEGP||0)/55.83,'usa',S.country,S.year));}

export function undergoSurgeryOrFertility(S, kind, id) {
  ensureExtendedState(S);
  if (kind === 'surgery') {
    const surg = ALL_SURGERIES.find(s => s.id === id);
    if (!surg) return { ok: false, msg: 'Procedure not found.' };
    const eligible=surgeryEligibility(S,surg);if(!eligible.ok)return {ok:false,msg:eligible.reason};
    const cost = eraLocalCost(Math.round(convertCurrency((surg.baseCostEGP || 35000) / 55.83, 'usa', S.country, 2026)), S.country, S.year);
    if (S.money.cash < cost) return { ok: false, msg: `Need ${formatMoney(cost, S.country)} for ${surg.label}.` };

    walletMove(S, -cost, `Surgical procedure: ${surg.label}`, 'medical');
    S.medical.surgeryYears||={};S.medical.surgeryYears[surg.id]=S.year;
    S.medical.surgeryRecoveryUntil=S.year*12+S.month+Math.ceil(surg.recoveryMonths||0);
    if (surg.cures?.length) {
      if(surg.partial){for(const c of S.medical.conditions.filter(c=>surg.cures.includes(c.id))){c.managed=true;c.treatmentStatus='treated';c.yearsTreated=0;}}
      else S.medical.conditions=S.medical.conditions.filter(c=>!surg.cures.includes(c.id));
    }
    if (surg.looksBoost||surg.cosmetic) S.player.vitals.looks = clamp(S.player.vitals.looks + (surg.looksBoost||5));
    S.player.vitals.health = clamp(S.player.vitals.health + (surg.healthBoost || 6));
    recordJournal(S, `Underwent ${surg.label} (${formatMoney(cost, S.country)}) — ${surg.partial?'condition managed, not a guaranteed cure':'procedure completed'}. Recovery: ${surg.recoveryMonths||0} game months.`, 'health');
    return { ok: true, msg: `Completed ${surg.label}. ${surg.partial?'Condition remains under ongoing care. ':''}Recovery: ${surg.recoveryMonths||0} game months.` };
  }

  if(kind!=='ivf')return {ok:false,msg:'Unknown medical treatment.'};
  if(S.player.age<18)return {ok:false,msg:'Fertility treatment is available to adults.'};
  if(S.marriage.pregnancy)return {ok:false,msg:'Already expecting. No further fertility cycle is needed.'};
  const partner=(S.relations.spouseIds||[]).map(pid=>S.people[pid]).find(p=>p?.alive&&p.residenceCountry===S.country&&p.gender!==S.player.gender);
  if(!partner)return {ok:false,msg:'This fertility route requires a living co-resident spouse of the opposite sex. Donor and surrogate routes are not modeled.'};
  if(!personMind(S,partner).wantsChildren)return{ok:false,msg:partner.firstName+' does not want children.'};
  const maternalAge=S.player.gender==='f'?S.player.age:partner.age;
  if(maternalAge>=46)return {ok:false,msg:'This game models own-egg fertility cycles only below age46. Donor-egg routes are not modeled.'};
  if(S.medical.lastFertilityCycleYear===S.year&&S.medical.lastFertilityCycleMonth===S.month)return {ok:false,msg:'Wait until next month before another fertility cycle.'};
  if(id!=='ivf'&&!V1_FERTILITY_TREATMENTS.some(f=>f.id===id))return {ok:false,msg:'Unknown fertility treatment.'};
  /* IVF / ICSI Fertility Treatment */
  const ft = V1_FERTILITY_TREATMENTS.find(f => f.id === (id==='ivf'?'ivf_cycle':id));
  if (S.relations.spouseIds.length === 0) return { ok: false, msg: 'Requires a married spouse.' };
  const cost = fertilityCostLocal(S,ft);
  if (S.money.cash < cost) return { ok: false, msg: `Need ${formatMoney(cost, S.country)} for IVF/ICSI cycle.` };

  S.medical.lastFertilityCycleYear=S.year;S.medical.lastFertilityCycleMonth=S.month;
  walletMove(S, -cost, `Fertility clinic cycle: ${ft?.label || 'IVF / ICSI'}`, 'medical');
  S.medical.fertilityScore = clamp(S.medical.fertilityScore + (ft.successPct>0?28:0), 10, 98);
  if (!S.marriage.pregnancy && ft.successPct>0 && chance(S, ft.successPct)) {
    const spId = partner.id;
    startPregnancy(S, S.player.gender === 'f' ? 'player' : spId, { dueMonths: 9 });
    recordJournal(S, `Joyful news from the fertility clinic — the IVF/ICSI embryo transfer succeeded! Baby due in 9 months!`, 'milestone');
    return { ok: true, msg: 'IVF Succeeded — Expecting in 9 months!' };
  }
  recordJournal(S, ft.successPct>0?`Completed ${ft.label}; no pregnancy this cycle.`:`Completed ${ft.label}; assessment only, no procedure performed.`, 'health');
  return { ok: true, msg: ft.successPct>0?'Fertility cycle completed. No pregnancy this cycle.':'Fertility consultation completed. No procedure was performed.' };
}

/* Consular tourist visas live in visaMigrationEngine.js (D7 — one visa
   store, expired by the visa tick); re-exported here so main.js and the
   tests, which import them from this file, keep working unchanged. */
export { CONSULAR_TOURIST_VISAS, needsTouristVisaFor, applyConsularTouristVisa } from './visaMigrationEngine.js';

/* ============================================================================
   v2.12 W6 — TRAVEL VERBS 2 & 3: Plan it, Compare destinations.
   A plan is ONE record per journey (papers, money, dates) on S.tripPlans;
   planning creates it, taking the trip executes it (status planned -> taken).
   Compare stores the side-by-side record and opens it as a scene.
   ========================================================================== */

/* The same price takeVacationOrPilgrimage charges, so a plan's money line
   is the money the trip actually costs — never a second formula. */
export function tripCostLocal(S, dest) {
  if (dest.pilgrimage === 'hajj') {
    return S.country === 'sau'
      ? eraLocalCost(dest.domesticSar || 9500, 'sau', S.year)
      : Math.round(convertCurrency(dest.packageUsd || 8900, 'usa', S.country, S.year));
  }
  if (dest.pilgrimage === 'umrah') {
    return S.country === 'sau'
      ? eraLocalCost(1400, 'sau', S.year)
      : Math.round(convertCurrency(dest.packageUsd || 1250, 'usa', S.country, S.year));
  }
  const isStaffTravel = S.career?.employed && S.career?.job && (S.career.job.track === 'aviation' || /pilot/i.test(S.career.job.title || ''));
  const flightUsd = isStaffTravel ? Math.round((dest.baseFlightUSD || 350) * 0.1) : (dest.baseFlightUSD || 350);
  const usdTrip = flightUsd + (dest.days_typical || 5) * (dest.tier === 'luxury' || dest.tier === 'ultra' ? 320 : 140);
  return Math.round(convertCurrency(usdTrip, 'usa', S.country, S.year));
}

export function tripLeaveImpact(S,dest) {
  const job=S.career?.employed&&S.career.job;
  if(!job)return {unpaidDays:0,lostPay:0};
  const annual=job.leave?.year===S.year?job.leave.annualDays:vacationEntitlementDays(S.country,Math.floor((job.monthsInRole||0)/12));
  const used=job.leave?.year===S.year?(job.leave.usedDays||0):0;
  const unpaidDays=Math.max(0,(dest.days_typical||5)-Math.max(0,annual-used));
  return {unpaidDays,lostPay:Math.round(computeMonthlyNetPay(job.monthlyGross,S.country,S.year,true).net/30*unpaidDays)};
}

export function tripExecutionQuote(S,dest){
 const now=S.year*12+S.month,days=dest.days_typical||5;
 const calendarDays=new Date(Date.UTC(S.year,S.month,0)).getUTCDate();
 const used=S.travelCalendar?.at===now?S.travelCalendar.daysUsed:0;
 const plan=(S.tripPlans||[]).find(p=>p.destId===dest.id&&p.status==='planned');
 const early=plan&&now<plan.departYear*12+plan.departMonth;
 const total=tripCostLocal(S,dest)+tripLeaveImpact(S,dest).lostPay;
 const reason=early?'Planned departure is '+plan.departYear+'/'+plan.departMonth+'.':used+days>calendarDays?'Not enough travel days left this month.':S.money.cash<total?'Need '+formatMoney(total,S.country)+' cash including unpaid leave.':null;
 return{ok:!reason,reason,total,days,daysLeft:Math.max(0,calendarDays-used),at:now};
}

export function planTrip(S, destId) {
  ensureExtendedState(S);
  const dest = ALL_VACATIONS.find(v => v.id === destId);
  if (!dest) return { ok: false, msg: 'Destination not found.' };
  if (dest.pilgrimage === 'hajj' && S.credentials.hajjCompleted) return { ok: false, msg: 'You have already fulfilled your obligatory Hajj — there is nothing left to plan.' };
  if ((S.tripPlans || []).some(p => p.destId === destId && p.status === 'planned')) return { ok: false, msg: `You already have a plan for ${dest.name} — take that trip instead of planning it twice.` };
  if (S.player.age < 18) return { ok: false, msg: 'Trips are planned from age 18 — minors travel with family.' };

  const cost = tripCostLocal(S, dest);
  const days = dest.days_typical || 5;
  const visa = dest.country === S.country ? null : needsTouristVisaFor(S, dest.country);
  const papers = [];
  if (dest.country === S.country) {
    papers.push('National ID — a domestic trip, no passport needed.');
  } else {
    papers.push(hasValidPassport(S) ? 'Valid passport — yours is in date.' : 'Valid passport — yours is EXPIRED. Renew it on the Passport & World screen first.');
    if (visa) {
      const feeLocal = Math.round(convertCurrency(visa.feeUsd, 'usa', S.country, S.year));
      papers.push(`Tourist visa: ${visa.regionLabel} — ${formatMoney(feeLocal, S.country)} embassy fee. Apply at Passport → Consular Visa Desk.`);
    } else {
      papers.push('No tourist visa needed for your passport on this route.');
    }
  }
  if (dest.pilgrimage === 'hajj') papers.push('Nusuk Hajj package — booked through the official Nusuk platform.');
  if (dest.pilgrimage === 'umrah') papers.push('Nusuk Umrah package — booked through the official Nusuk platform.');
  papers.push(`Money: ${formatMoney(cost, S.country)} travel cost, unpaid leave extra${S.money.cash >= cost ? ' — you can afford it now.' : ` — you still need ${formatMoney(cost - S.money.cash, S.country)}.`}`);
  if (S.career?.employed && S.career?.job) {
    const job = S.career.job;
    const yearsService = Math.floor((job.monthsInRole || 0) / 12);
    const annualDays = job.leave?.year===S.year?job.leave.annualDays:vacationEntitlementDays(S.country, yearsService);
    const used = (job.leave && job.leave.year === S.year) ? (job.leave.usedDays || 0) : 0;
    const left = Math.max(0, annualDays - used);
    papers.push(`${days} days of leave — you have ${left} paid days left this year${left < days ? `, so ${days - left} day(s) would be unpaid (${formatMoney(tripLeaveImpact(S,dest).lostPay,S.country)} lost pay)` : ''}.`);
  } else {
    papers.push(`${days} days — no job leave to use, you travel on your own time.`);
  }

  let departMonth = S.month + 1;
  let departYear = S.year;
  if (departMonth > 12) { departMonth = 1; departYear += 1; }
  const plan = {
    id: nextId(S, 'tpl'), destId: dest.id, name: dest.name, country: dest.country,
    costLocal: cost, days, departYear, departMonth, papers,
    visaNeeded: !!visa, visaLabel: visa ? visa.regionLabel : null,
    status: 'planned', createdYear: S.year
  };
  S.tripPlans.push(plan);
  recordJournal(S, `Planned a ${days}-day trip to ${dest.name} (${formatMoney(cost, S.country)}, departing ${departYear}/${departMonth}).`, 'lifestyle');
  return { ok: true, msg: `Trip planned: ${dest.name}, ${days} days, ${formatMoney(cost, S.country)}, departing ${departYear}/${departMonth}.` };
}

export function compareTrips(S, destId, otherId) {
  ensureExtendedState(S);
  const dest = ALL_VACATIONS.find(v => v.id === destId);
  if (!dest) return { ok: false, msg: 'Destination not found.' };
  let other = otherId ? ALL_VACATIONS.find(v => v.id === otherId) : null;
  if (!other || other.id === dest.id) {
    /* Next leisure destination after this one — a real second place, never
       the same row twice. */
    const leisure = ALL_VACATIONS.filter(v => !v.pilgrimage);
    const idx = leisure.findIndex(v => v.id === dest.id);
    other = leisure[(idx + 1) % leisure.length] || leisure[0];
    if (!other || other.id === dest.id) return { ok: false, msg: 'Nothing to compare it with.' };
  }
  const line = (d) => {
    const visa = d.country === S.country ? null : needsTouristVisaFor(S, d.country);
    return { id: d.id, name: d.name, country: d.country, costLocal: tripCostLocal(S, d), days: d.days_typical || 5, visaNeeded: !!visa, visaLabel: visa ? visa.regionLabel : null };
  };
  const a = line(dest);
  const b = line(other);
  S.tripLastCompare = { a, b, cheaperId: a.costLocal <= b.costLocal ? a.id : b.id, year: S.year };
  const cheaper = a.costLocal <= b.costLocal ? a : b;
  const side = (x) => `• ${x.name} — ${formatMoney(x.costLocal, S.country)} · ${x.days} days · ${x.visaNeeded ? `visa needed: ${x.visaLabel}` : 'no visa needed'}`;
  queueScene(S, {
    key: `trip_compare_${dest.id}_${S.year}_${S.month}_${S.turn}`,
    baseId: 'trip_compare',
    maxPerLife: 99,
    category: 'lifestyle',
    title: `Compare: ${a.name} vs ${b.name}`,
    text: `Side by side:\n${side(a)}\n${side(b)}\n${cheaper.name} is the cheaper trip${a.days !== b.days ? `, and ${a.days < b.days ? a.name : b.name} is the shorter one (${Math.min(a.days, b.days)} days vs ${Math.max(a.days, b.days)})` : ''}.`,
    choices: [{ label: 'Done comparing', effect: () => {} }]
  });
  return { ok: true, msg: `Compared ${a.name} with ${b.name} — ${cheaper.name} is cheaper.` };
}

export function takeVacationOrPilgrimage(S, destId) {
  ensureExtendedState(S);
  const dest = ALL_VACATIONS.find(v => v.id === destId);
  if (!dest) return { ok: false, msg: 'Destination not found.' };
  if(S.player.age<18)return {ok:false,msg:'Independent trips start at age 18. Minors travel with family.'};

  if (dest.country !== S.country) {
    const border = checkCanCrossBorder(S);
    if (!border.ok) return { ok: false, msg: border.reason };
    if (!dest.pilgrimage) {
      const missingVisa = needsTouristVisaFor(S, dest.country);
      if (missingVisa) {
        return {
          ok: false,
          msg: `Passport requires a valid ${missingVisa.regionLabel} foil first! Apply under Passport → Consular Visa Desk.`
        };
      }
    }
  }

  let totalCostLocal = 0;
  let staffTravelApplied = false;
  if (dest.pilgrimage === 'hajj') {
    if (S.credentials.hajjCompleted) return { ok: false, msg: 'You have already fulfilled your obligatory Nusuk Hajj!' };
    if (S.country === 'sau') {
      totalCostLocal = eraLocalCost(dest.domesticSar || 9500, 'sau', S.year);
    } else {
      totalCostLocal = Math.round(convertCurrency(dest.packageUsd || 8900, 'usa', S.country, S.year));
    }
  } else if (dest.pilgrimage === 'umrah') {
    totalCostLocal = S.country === 'sau'
      ? eraLocalCost(1400, 'sau', S.year)
      : Math.round(convertCurrency(dest.packageUsd || 1250, 'usa', S.country, S.year));
  } else {
    /* v2.8 — staff travel (W1 §2e): an employed pilot / aviation worker
       flies standby at 10% of the fare — the flight part of the trip only,
       never the hotel. Pilgrimage packages are not airline tickets, so
       Hajj/Umrah never get the discount. */
    const isStaffTravel = S.career?.employed && S.career?.job && (S.career.job.track === 'aviation' || /pilot/i.test(S.career.job.title || ''));
    const flightUsd = isStaffTravel ? Math.round((dest.baseFlightUSD || 350) * 0.1) : (dest.baseFlightUSD || 350);
    const usdTrip = flightUsd + (dest.days_typical || 5) * (dest.tier === 'luxury' || dest.tier === 'ultra' ? 320 : 140);
    totalCostLocal = Math.round(convertCurrency(usdTrip, 'usa', S.country, S.year));
    staffTravelApplied = isStaffTravel;
  }

  if (S.money.cash < totalCostLocal) return { ok: false, msg: `Need ${formatMoney(totalCostLocal, S.country)} for ${dest.name}.` };
  const execution=tripExecutionQuote(S,dest);if(!execution.ok)return{ok:false,msg:execution.reason};
  S.travelCalendar={at:execution.at,daysUsed:(S.travelCalendar?.at===execution.at?S.travelCalendar.daysUsed:0)+execution.days};
  walletMove(S, -totalCostLocal, `Trip: ${dest.name}`, 'lifestyle');

  /* v2.12 W6: taking a planned trip executes the plan — one plan per journey. */
  const plan = (S.tripPlans || []).find(p => p.destId === dest.id && p.status === 'planned');
  if (plan) { plan.status = 'taken'; plan.takenYear = S.year; plan.takenMonth=S.month; }

  /* v2.8 — the trip spends the ONE leave balance (job.leave, owned by
     getJobContract in careerEducationEngine). The days come out of the same
     annual allowance the contract card shows. */
  let leaveNote = '';
  if (S.career?.employed && S.career?.job) {
    const job = S.career.job;
    const yearsService = Math.floor((job.monthsInRole || 0) / 12);
    if (!job.leave || job.leave.year !== S.year) job.leave = { annualDays: vacationEntitlementDays(S.country, yearsService), usedDays: 0, year: S.year, extraDays: 0 };
    const tripDays = dest.days_typical || 5;
    const {unpaidDays:newUnpaid,lostPay}=tripLeaveImpact(S,dest);
    job.leave.usedDays += tripDays;
    if(lostPay>0)walletMove(S,-lostPay,`Unpaid vacation days (${newUnpaid})`,'career');
    const left = Math.max(0, job.leave.annualDays - job.leave.usedDays);
    leaveNote = job.leave.usedDays > job.leave.annualDays
      ? ` This used ${tripDays} days of leave — ${newUnpaid} unpaid day(s), reducing pay by ${formatMoney(lostPay,S.country)}.`
      : ` This used ${tripDays} days of your paid leave (${left} left this year).`;
  }
  const staffNote = staffTravelApplied ? ' Staff travel covered 90% of the flight.' : '';

  if (dest.pilgrimage === 'hajj') {
    S.credentials.hajjCompleted = true;
    S.player.vitals.happiness = clamp(S.player.vitals.happiness + 22);
    S.player.vitals.stress = clamp(S.player.vitals.stress - 35);
    for (const pid of [S.relations.fatherId, S.relations.motherId, ...S.relations.spouseIds]) {
      const p = pid && S.people[pid];
      if (p && p.alive) rememberDeed(S, p, 'proud_moment', 'Completed the sacred Hajj pilgrimage.', { affection: 12, respect: 16 });
    }
    recordJournal(S, `Stood on the plains of Arafat and completed the sacred Hajj pilgrimage via Nusuk (${formatMoney(totalCostLocal, S.country)}) — returning home renewed in spirit.`, 'milestone');
    return { ok: true, msg: `Hajj Mabroor! Lifelong spiritual milestone fulfilled!${leaveNote}` };
  }

  if (dest.pilgrimage === 'umrah') {
    S.credentials.umrahCount = (S.credentials.umrahCount || 0) + 1;
    S.player.vitals.happiness = clamp(S.player.vitals.happiness + 14);
    S.player.vitals.stress = clamp(S.player.vitals.stress - 22);
    recordJournal(S, `Performed Umrah in Makkah and visited Al-Masjid An-Nabawi in Madinah (${formatMoney(totalCostLocal, S.country)}).`, 'milestone');
    return { ok: true, msg: `Umrah Mabroor!${leaveNote}` };
  }

  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 12);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 18);
  recordJournal(S, `Enjoyed a ${dest.days_typical || 5}-day getaway to ${dest.name} (${formatMoney(totalCostLocal, S.country)}).${staffNote}${leaveNote}`, 'lifestyle');
  return { ok: true, msg: `Great trip to ${dest.name}!${staffNote}${leaveNote}` };
}

/* Activity prices are 2026 EGP amounts, not USD. Use the same price
   for the button and the actual charge; a zero price stays free. */
export function activityCostLocal(S, actOrId) {
  const act = typeof actOrId === 'string' ? V1_ACTIVITIES.find(a => a.id === actOrId) : actOrId;
  if (!act) return 0;
  const egp = eraLocalCost(Math.max(0, Number(act.costEgp) || 0), 'egy', S.year);
  return Math.round(convertCurrency(egp, 'egy', S.country, S.year));
}

/* Habit cadence (game design, not a real-world rule). A habit declares how
   often it can count: once per calendar month ("month") or once per year
   ("year"). Adult turns are months, so "month" means once per month. A
   childhood turn is a whole year, so a "month" habit counts once per
   childhood turn (one use per real period, no hidden multiplier). Each
   habit also has a minAge. State lives in S.habitUse, part of the save. */
export const CHILD_YEAR_SESSIONS = 1;
export function activityAvailability(S, actOrId) {
  const act = typeof actOrId === 'string' ? V1_ACTIVITIES.find(a => a.id === actOrId) : actOrId;
  if (!act) return { ok: false, reason: 'Unknown activity.' };
  if (act.minAge && (S.player?.age ?? 0) < act.minAge) return { ok: false, reason: `Needs age ${act.minAge}.`, locked: 'age' };
  const use = S.habitUse?.[act.id];
  if (!use) return { ok: true };
  const yearly = act.repeat === 'year';
  const childYear = S.pacing === 'yearly' && !yearly;
  if (yearly) {
    return use.year === S.year ? { ok: false, reason: 'Done this year. Available again next year.' } : { ok: true };
  }
  if (childYear) {
    return use.year === S.year && (use.count || 1) >= CHILD_YEAR_SESSIONS
      ? { ok: false, reason: 'Done this year. Available again next year.' } : { ok: true };
  }
  return use.year === S.year && use.month === S.month ? { ok: false, reason: 'Done this month. Available again next month.' } : { ok: true };
}

export function doDailyActivity(S, actId) {
  const act = V1_ACTIVITIES.find(a => a.id === actId);
  if (!act) return { ok: false, msg: 'Unknown activity.' };
  const gate = activityAvailability(S, act);
  if (!gate.ok) return { ok: false, msg: `${act.label || act.name}: ${gate.reason}` };
  const cost = activityCostLocal(S, act);
  if(S.player.age<18&&cost>0&&!chargeLivingParents(S,cost))return {ok:false,msg:'Your living parents cannot cover this activity from their savings. Try a free activity.'};
  if (S.player.age >= 18 && cost > 0) {
    if (S.money.cash < cost) return { ok: false, msg: `Need ${formatMoney(cost, S.country)}.` };
    walletMove(S, -cost, `Activity: ${act.label || act.name}`, 'lifestyle');
  }

  /* Apply the activity's OWN effects, so each habit honestly does what its
     label says: reading and courses raise Smarts, gym/run/swim raise Health
     and Looks, meditation cuts stress, and so on. Before this fix every
     button applied the same hardcoded +Health/+Happiness, which is why
     Read a book gave Smarts +0. `deltas` records what actually moved
     (after clamping) so the UI can show exact numbers and flash the bars. */
  const fx = act.effects || { health: act.health ?? 3, happiness: act.hap ?? 4, stress: -5, looks: 1 };
  const deltas = [];
  const applyVital = (key, label, amount) => {
    const v = Math.round(Number(amount) || 0);
    if (!v) return;
    const before = Number(S.player.vitals[key]) || 0;
    S.player.vitals[key] = clamp(before + v);
    const real = S.player.vitals[key] - before;
    if (real !== 0) deltas.push({ key, label, delta: real });
  };
  applyVital('health', 'Health', fx.health);
  applyVital('happiness', 'Happiness', fx.happiness);
  applyVital('smarts', 'Smarts', fx.smarts);
  applyVital('looks', 'Looks', (fx.looks || 0) + (act.effects ? (act.looks || 0) : 0));
  if (fx.stress) {
    const before = Number(S.player.vitals.stress) || 0;
    S.player.vitals.stress = clamp(before + Math.round(fx.stress));
    const real = S.player.vitals.stress - before;
    if (real !== 0) deltas.push({ key: 'stress', label: 'Peace of Mind', delta: -real });
  }
  if (fx.social) {
    if (!S.skills) S.skills = {};
    const before = Number(S.skills.charisma) || 45;
    S.skills.charisma = clamp(before + Math.round(fx.social));
    const real = S.skills.charisma - before;
    if (real !== 0) deltas.push({ key: 'charisma', label: 'Charisma', delta: real });
  }

  /* v2.6: gym / run / swim genuinely raise fitness — the aging model slows
     the yearly health decline for fit players, so this is the "hit the gym"
     path. (The wellness weekly focus already adds fitness monthly.) */
  if (['gym', 'jog', 'swim'].includes(actId)) {
    const gain = actId === 'gym' ? 4 : 3;
    const beforeFit = Number(S.skills.fitness) || 50;
    S.skills.fitness = clamp(beforeFit + gain);
    const realFit = S.skills.fitness - beforeFit;
    if (realFit !== 0) deltas.push({ key: 'fitness', label: 'Fitness', delta: realFit });
    if (!S.medical) S.medical = {};
    S.medical.lastExerciseYear = S.year;
  }

  {
    const prev = S.habitUse?.[act.id];
    S.habitUse = S.habitUse || {};
    const sameYear = prev && prev.year === S.year;
    S.habitUse[act.id] = { year: S.year, month: S.month, count: sameYear ? (prev.count || 1) + 1 : 1 };
  }
  if (act.line) recordJournal(S, act.line, 'lifestyle');

  const deltaTxt = deltas.length
    ? deltas.map(d => `${d.label} ${d.delta > 0 ? '+' : '−'}${Math.abs(d.delta)}`).join(', ')
    : 'no stat change (already maxed)';
  return { ok: true, msg: `${act.label || act.name}: ${deltaTxt}. ${S.player.age < 18 && cost>0 ? 'Paid from living parents’ savings.' : cost > 0 ? `Paid ${formatMoney(cost, S.country)}.` : 'Free.'}`, deltas, actLabel: act.label || act.name };
}

export function launchCivilLawsuit(S, suitId) {
  const suit = CIVIL_LAWSUITS.find(s => s.id === suitId);
  if (!suit) return { ok: false, msg: 'Claim type not found.' };
  return fileCivilClaim(S,suit);
}

export function commitRiskyCrime(S, crimeId) {
  const cr = V1_CRIMES.find(c => c.id === crimeId);
  if(!cr)return {ok:false,msg:'Unknown action. Nothing happened.'};
  if (S.player.age < (cr.minAge || 16)) return { ok: false, msg: 'Unavailable.' };

  if (chance(S, cr.risk || 0.35)) {
    S.legal.criminalRecord = true;
    const fine = eraLocalCost(getCountry(S.country).monthlyBasket2026.rentStandard * 3, S.country, S.year);
    walletMove(S, -Math.min(Math.max(0, S.money.cash), fine), `Criminal fine & defense: ${cr.label}`, 'legal');
    if (S.career.employed) {
      S.career.employed = false;
      S.career.job = null;
    }
    S.player.vitals.happiness = clamp(S.player.vitals.happiness - 24);
    S.player.vitals.stress = clamp(S.player.vitals.stress + 25);
    /* Family shame ripple! */
    for (const pid of [S.relations.fatherId, S.relations.motherId, ...S.relations.spouseIds]) {
      const p = pid && S.people[pid];
      if (p && p.alive) rememberDeed(S, p, 'insulted', `Convicted of ${cr.label.toLowerCase()}.`, { respect: -22, trust: -18, resentment: 20 });
    }
    recordJournal(S, `Caught and convicted of ${cr.label.toLowerCase()}! Criminal record registered, employment lost, and family deeply shaken.`, 'life');
    return { ok: false, msg: `Arrested & convicted of ${cr.label}! Criminal record added.` };
  } else {
    const haul = Math.round(eraSalary(getCountry(S.country).annualSalaryTiers2026.mid, S.country, S.year) * Math.max(0.05, cr.payShare || 0.08));
    walletMove(S, haul, `Illicit proceeds (${cr.label})`, 'money');
    S.player.vitals.stress = clamp(S.player.vitals.stress + 9);
    recordJournal(S, `Slipped away undetected with ${formatMoney(haul, S.country)} from ${cr.label.toLowerCase()}.`, 'money');
    return { ok: true, msg: `Got away with ${formatMoney(haul, S.country)}.` };
  }
}

/* ============================================================================
   v2.8 §4 — PART-TIME & CASH GIGS, RECONSTRUCTED AS A REAL SYSTEM
   Was: one flat payment (food basket x 0.65) for ANY gig, no gates, no
   consequences. Now: every gig states what the work is, who pays, how much,
   how many hours, when, what it needs and what it risks — and the take
   function enforces the same evaluation the tab shows (one evaluator, used
   by both the render and the handler, so the button never promises what the
   handler refuses).
   - Pay follows the country's real wage: a part-time gig pays its data
     monthlyEGP as a share of Egypt's 2026 entry wage, scaled to the local
     entry wage (so in Egypt 2026 a barista pays exactly its data value
     5,000 EGP). A cash gig pays the game's own undocumented-hustle
     benchmark (modest rent x 0.85 a month, the same figure
     visaMigrationEngine.js pays undocumented lives), scaled by the gig's
     daily rate against the $20/day midpoint of the data's $10-45 range.
     The data's dailyRateUSD is NOT converted at market FX: that would pay
     an Egyptian dishwasher 750 EGP/day (1.70x a graduate's hourly wage)
     and an American one $120 a month — both absurd. The old flat formula
     (2,275 EGP for any gig in Egypt 2026) is gone.
   - Student visa: the visa system's real rule is part-time-only
     (canLegallyWorkInCurrentCountry). The 20h/week term-time cap — the
     standard limit on UK/US/Canada/Germany student visas — lives here as
     ONE constant; no numeric 20h rule existed in the visa system to read.
   - Undocumented cash work plugs into the real risk the visa system already
     carries (monthly raid / deportation, visaMigrationEngine.js:753); a
     student caught working cash-in-hand twice loses the visa to the
     existing grace_period via transitionResidency.
   - Age floor is per gig (the data's own minAge, 12-18), not a flat 16:
     a 12-year-old paperboy in 1970 is real; a 15-year-old cannot drive Uber.
   ========================================================================== */

/* Student-visa term-time work cap (UK / USA / Canada / Germany standard).
   Single place this number lives; the visa system itself holds only the
   part-time-only rule this cap hangs from. */
export const STUDENT_VISA_MAX_HOURS_PER_WEEK = 20;
/* A cash hustle is occasional day work, not a full month: 8 paid days. */
export const GIG_CASH_DAYS_PER_MONTH = 8;
const GIG_FULL_TIME_HOURS_PER_WEEK = 40;

function gigState(S) {
  ensureExtendedState(S);
  if (!S.career.gigs) S.career.gigs = { byId: {}, warnings: 0 };
  if (!S.career.gigs.byId) S.career.gigs.byId = {};
  if (typeof S.career.gigs.warnings !== 'number') S.career.gigs.warnings = 0;
  return S.career.gigs;
}

function gigHistoryRead(S, gigId) {
  const byId = S.career?.gigs?.byId || {};
  return byId[gigId] || { months: 0, reputation: 50, complaints: 0 };
}

function gigHistory(S, gigId) {
  const st = gigState(S);
  if (!st.byId[gigId]) st.byId[gigId] = { months: 0, reputation: 50, complaints: 0 };
  return st.byId[gigId];
}

/* Monthly pay for a gig in the player's own currency. Part-time: the gig's
   own monthlyEGP (Egypt 2026) as a share of Egypt's 2026 entry wage,
   applied to the local entry wage — so pay tracks the country's real wage
   for that work. Cash: the game's own undocumented-hustle benchmark
   (modest rent x 0.85 a month, era-adjusted), scaled by the gig's daily
   rate against the $20/day midpoint of the data's $10-45 range. Market-FX
   conversion of the day rate is deliberately NOT used: it pays an Egyptian
   dishwasher 1.70x a graduate's hourly wage and an American one $120 for
   a month of hustling. */
export function gigMonthlyPayLocal(S, gig, kind = 'parttime') {
  const cObj = getCountry(S.country);
  if (kind === 'cash') {
    const benchmark = eraLocalCost(cObj.monthlyBasket2026.rentModest * 0.85, S.country, S.year);
    return Math.round(benchmark * ((Number(gig.dailyRateUSD) || 0) / 20));
  }
  const egyEntryMonthly = getCountry('egy').annualSalaryTiers2026.entry / 12;
  const ratio = (Number(gig.monthlyEGP) || 0) / egyEntryMonthly;
  return Math.round((eraSalary(cObj.annualSalaryTiers2026.entry, S.country, S.year) / 12) * ratio);
}

export function gigHoursPerWeek(gig, kind = 'parttime') {
  if (kind === 'cash') return Math.round((GIG_CASH_DAYS_PER_MONTH * 8) / 4.33);
  return Number(gig.hoursPerWeek) || 15;
}

/* Entry-level full-time hourly wage here — the benchmark a gig must not
   beat for no reason (verification check (d)). */
export function entryHourlyWageLocal(S) {
  const cObj = getCountry(S.country);
  return (eraSalary(cObj.annualSalaryTiers2026.entry, S.country, S.year) / 12) / (GIG_FULL_TIME_HOURS_PER_WEEK * 4.33);
}

function gigWhenLabel(gig, kind) {
  const hay = `${gig.id || ''} ${gig.label || ''}`.toLowerCase();
  if (kind === 'cash') {
    if (/night/.test(hay)) return 'Nights';
    return 'Day work, paid daily';
  }
  if (/night/.test(hay)) return 'Nights';
  if (/wedding|event_steward|steward/.test(hay)) return 'Weekends';
  return 'Evenings & weekends';
}

function gigPayerLabel(S, gig, kind) {
  if (kind === 'cash') return 'Cash in hand — no employer on record';
  const id = gig.id || '';
  if (id === 'tutor' || id === 'language_tutor_online') return `A family in ${S.city} who hires you as a tutor`;
  if (id === 'delivery' || id === 'courier_scooter' || id === 'pharmacy_delivery') return 'The delivery platform / pharmacy that hires you (per-order pay)';
  if (['freelance_dev', 'translator', 'graphic_pt', 'photographer_pt'].includes(id)) {
    /* Named client: a real employer from the game's own pool for this
       country (never an invented name). Deterministic pick by gig id, so
       rendering never consumes the RNG stream. */
    const candidates = { freelance_dev: ['software'], translator: ['translation', 'languages'], graphic_pt: ['design', 'media'], photographer_pt: ['media', 'events'] }[id] || [];
    for (const trackId of candidates) {
      const names = getEmployersFor(S.country, trackId) || [];
      if (names.length) {
        const pickIdx = [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % names.length;
        return `Client: ${names[pickIdx]} (freelance contract)`;
      }
    }
    return `A private client in ${S.city} (freelance contract)`;
  }
  return 'The shop / business that hires you';
}

function gigRiskLines(S, gig, kind, hoursPerWeek) {
  const risks = [];
  const hay = `${gig.id || ''} ${gig.label || ''}`.toLowerCase();
  const employed = !!(S.career.employed && S.career.job);
  const inSchool = ['primary', 'middle', 'high'].includes(S.education.stage) || !!S.education.university;
  const res = S.legal.residency.kind;
  if (/night/.test(hay)) risks.push('Night shifts: tired days, worse sleep, worse health over time.');
  if (gig.requiresCar) risks.push('Fuel and wear on your own car come out of your pocket.');
  if (gig.requiresBike) risks.push('Delivery on a bicycle in traffic — a fall is on you.');
  if (employed) risks.push('Your manager may hear you are working a second job — it can count against you at review time.');
  if (inSchool && gig.affectsGrades !== false && hoursPerWeek >= 20) risks.push('These hours eat into study time — your grades will slip if you keep this up.');
  if (employed && hoursPerWeek + careerHours(S) > 60) risks.push('60+ hour weeks will hurt your health and your job performance.');
  if (kind === 'cash') {
    const rl = Number(gig.riskLevel) || 0;
    if (rl === 0) risks.push('Low risk — honest cash work, but no contract and no protection if you are hurt.');
    else if (rl <= 2) risks.push('Off the books: no contract, no sick pay, and if you are hurt nobody pays.');
    else if (rl <= 4) risks.push('High risk: undeclared work, no safety net, and the police do check.');
    else risks.push('Very high risk: raids, violence, and arrest are real possibilities here.');
    if (res === 'student_visa') risks.push('Cash work is NOT covered by your student visa — if you are caught you can be fined, and a second offence can cost you the visa itself.');
    else if (res === 'undocumented' || res === 'grace_period') risks.push('You have no valid status — an inspection can mean a fine and deportation back home.');
    else risks.push('If the authorities catch undeclared cash work, expect a fine.');
  }
  if (gig.requiresPhysical) risks.push('Heavy lifting with no safety net — a bad back or a fall is on you.');
  if (!risks.length) risks.push('Low risk — steady hours, but the time still comes out of your evenings.');
  return risks;
}

/* One evaluator for a gig: what it is, who pays, how much, how many hours,
   when, every requirement with met / not-met and the reason, and every risk
   — stated BEFORE the player takes it. The tab renders this; the take
   function enforces it. Never consumes RNG (render-safe). */
export function evaluateGig(S, kind = 'parttime', idx = 0) {
  ensureExtendedState(S);
  const list = kind === 'cash' ? V1_CASH_JOBS : V1_PARTTIME_JOBS;
  const gig = list[idx % list.length] || { label: 'Weekend Shift' };
  const label = gig.label || gig.title || gig.name || 'Part-time Shift';
  const hoursPerWeek = gigHoursPerWeek(gig, kind);
  const pay = gigMonthlyPayLocal(S, gig, kind);
  const requirements = [];
  const addReq = (reqLabel, met, reason) => requirements.push({ label: reqLabel, met, reason });

  const eraMet = (!gig.from || S.year >= gig.from) && (!gig.until || S.year <= gig.until);
  addReq('Available in this era', eraMet, eraMet
    ? `Offered in ${S.year}`
    : (gig.from && S.year < gig.from ? `Did not exist yet in ${S.year} (from ${gig.from})` : `Ended by ${gig.until}`));

  const minAge = Number(gig.minAge) || 16;
  addReq(`Age ${minAge}+`, S.player.age >= minAge, S.player.age >= minAge
    ? `You are ${S.player.age}`
    : `You are ${S.player.age} — this gig needs ${minAge}+`);

  if (gig.requiresCar) {
    const ownsCar = (S.cars || []).length > 0;
    const licenceOk = !!(S.drivingLicence?.valid && (S.drivingLicence.expiresYear == null || S.drivingLicence.expiresYear > S.year));
    addReq('Own car', ownsCar, ownsCar ? 'You own a car' : 'Needs your own car — you own none');
    addReq('Valid driving licence', licenceOk, licenceOk ? 'Your licence is valid' : 'Needs a valid driving licence');
  }
  if (gig.requiresBike) {
    const ownsBike = (S.inventory || []).some(it => /bicycle|bike/i.test(`${it.catalogId || ''} ${it.name || ''}`));
    addReq('Bicycle', ownsBike, ownsBike ? 'You own a bicycle' : 'Needs a bicycle — you own none, and none is sold in the shops');
  }
  if (gig.requiresSmart) {
    const smarts = S.player.vitals.smarts || 0;
    addReq(`Smarts ${gig.requiresSmart}+`, smarts >= gig.requiresSmart, `Needs Smarts ${gig.requiresSmart} — yours is ${smarts}`);
  }
  if (gig.requiresEnglish) {
    const ok = hasCertifiedEnglish(S);
    addReq(`English (IELTS ${gig.requiresEnglish})`, ok, ok ? 'Your English is certified (IELTS C1 / Fluent)' : `Needs certified English (IELTS ${gig.requiresEnglish}) — school "English (Basic)" is not enough`);
  }
  if (gig.requiresDegree) {
    const ok = (S.education.degrees || []).includes(gig.requiresDegree);
    addReq(`Degree in ${String(gig.requiresDegree).toUpperCase()}`, ok, ok ? `You hold ${String(gig.requiresDegree).toUpperCase()}` : `Needs a ${String(gig.requiresDegree).toUpperCase()} degree`);
  }
  if (gig.reqSocial) {
    const social = S.skills?.charisma || 45;
    addReq(`People skills ${gig.reqSocial}+`, social >= gig.reqSocial, `Needs Charisma ${gig.reqSocial} — yours is ${social}`);
  }
  if (gig.requiresPhysical) {
    const fit = S.skills?.fitness || 50;
    addReq('Fitness 50+', fit >= 50, `Needs Fitness 50 — yours is ${fit}`);
  }
  if (gig.reqSmarts) {
    const smarts = S.player.vitals.smarts || 0;
    addReq(`Smarts ${gig.reqSmarts}+`, smarts >= gig.reqSmarts, `Needs Smarts ${gig.reqSmarts} — yours is ${smarts}`);
  }

  const res = S.legal.residency.kind;
  if (kind === 'parttime') {
    const auth = canLegallyWorkInCurrentCountry(S);
    if (!auth.allowed) {
      addReq('Work permit', false, `${auth.reason} Formal part-time work needs a permit — cash gigs are the only option without one.`);
    } else if (auth.partTimeOnly) {
      const otherHours=careerHours(S),ok = hoursPerWeek+otherHours <= STUDENT_VISA_MAX_HOURS_PER_WEEK;
      addReq(`Student visa: ${STUDENT_VISA_MAX_HOURS_PER_WEEK}h/week max`, ok, ok
        ? `This gig plus existing employment is ${hoursPerWeek+otherHours}h/week, inside the modeled student cap`
        : `Modeled student cap ${STUDENT_VISA_MAX_HOURS_PER_WEEK}h/week: existing employment ${otherHours}h plus this gig ${hoursPerWeek}h exceeds it.`);
    } else {
      addReq('Work permit', true, 'You may work here');
    }
  } else {
    addReq('Work permit', true, 'Cash work asks no papers — but it carries the risks below, not a permit.');
  }

  const lock = requirements.find(r => !r.met);
  const hist = gigHistoryRead(S, gig.id || label);
  const key = `side_gig_${S.year}_${S.month}`;
  return {
    gig, kind, label, pay, hoursPerWeek,
    when: gigWhenLabel(gig, kind),
    payer: gigPayerLabel(S, gig, kind),
    requirements,
    risks: gigRiskLines(S, gig, kind, hoursPerWeek),
    available: !lock,
    lockReason: lock ? lock.reason : null,
    monthsWorked: hist.months,
    reputation: hist.reputation,
    complaints: hist.complaints,
    alreadyWorkedThisMonth: !!S.cooldowns[key]
  };
}

export function takeSideOrStudentGig(S, kind = 'parttime', idx = 0) {
  ensureExtendedState(S);
  const ev = evaluateGig(S, kind, idx);
  if (!ev.available) return { ok: false, msg: ev.lockReason };
  const key = `side_gig_${S.year}_${S.month}`;
  if (S.cooldowns[key]) return { ok: false, msg: 'You already worked a gig this month — one gig at a time. Come back next month.' };
  S.cooldowns[key] = 999999;

  const before = S.money.cash;
  walletMove(S, ev.pay, `Gig pay — ${ev.label} (${ev.payer})`, 'money');
  const paid = Math.round((S.money.cash - before) * 100) / 100;

  const hist = gigHistory(S, ev.gig.id || ev.label);
  hist.months += 1;

  /* The hours come from somewhere: study, the full-time job, sleep, health. */
  const inSchool = ['primary', 'middle', 'high'].includes(S.education.stage) || !!S.education.university;
  const employed = !!(S.career.employed && S.career.job);
  let stressAdd = 3 + Math.floor(ev.hoursPerWeek / 10);
  let healthCost = 0;
  if (/night/i.test(`${ev.gig.id || ''} ${ev.label}`)) healthCost += 2;
  if (ev.gig.requiresPhysical) healthCost += 2;
  if (inSchool && ev.gig.affectsGrades !== false) {
    S.education.academicSkill = clamp((S.education.academicSkill ?? 55) - (ev.hoursPerWeek >= 20 ? 4 : 2));
  }
  if (employed) {
    S.career.job.performance = clamp((S.career.job.performance ?? 70) - (ev.hoursPerWeek >= 20 ? 4 : 2));
    if (ev.hoursPerWeek + careerHours(S) > 60) {
      S.career.job.performance = clamp(S.career.job.performance - 2);
      stressAdd += 3;
    }
  }
  S.player.vitals.stress = clamp(S.player.vitals.stress + stressAdd);
  if (healthCost) S.player.vitals.health = clamp(S.player.vitals.health - healthCost);
  S.reputation = clamp((S.reputation ?? 55) + 1);

  /* Reputation builds: a reliable worker gets recommended; complaints hurt. */
  let complaintNote = '';
  const complaintChance = kind === 'cash'
    ? 0.05 + (Number(ev.gig.riskLevel) || 0) * 0.02
    : ['uber', 'delivery', 'courier_scooter'].includes(ev.gig.id) ? 0.10 : 0.04;
  if (chance(S, complaintChance)) {
    hist.complaints += 1;
    hist.reputation = clamp(hist.reputation - 8);
    complaintNote = ' A customer complained — your reputation for this gig fell.';
  } else {
    hist.reputation = clamp(hist.reputation + 2);
  }

  /* Cash work can get you caught: a fine, and worse on a student visa. */
  let caughtNote = '';
  if (kind === 'cash') {
    const catchChance = 0.03 + (Number(ev.gig.riskLevel) || 0) * 0.03;
    if (chance(S, catchChance)) {
      const fine = Math.min(Math.max(0, S.money.cash), Math.round(ev.pay * 2));
      if (fine > 0) walletMove(S, -fine, `Fine — caught working ${ev.label} without papers`, 'legal');
      S.player.vitals.stress = clamp(S.player.vitals.stress + 12);
      const res = S.legal.residency.kind;
      if (res === 'student_visa') {
        const st = gigState(S);
        st.warnings += 1;
        if (st.warnings >= 2) {
          transitionResidency(S, 'grace_period', { permitName: 'Student Visa Revoked — 60-Day Grace', graceMonthsLeft: 2 });
          caughtNote = ` Caught working cash-in-hand on a student visa — fined ${formatMoney(fine, S.country)}. This was your second offence: your student visa was revoked and you have a 60-day grace period to fix your status or leave.`;
          recordJournal(S, `Caught working ${ev.label} cash-in-hand on a student visa — fined ${formatMoney(fine, S.country)} and your visa was revoked (60-day grace).`, 'visa');
        } else {
          caughtNote = ` Caught working cash-in-hand on a student visa — fined ${formatMoney(fine, S.country)} and warned. One more offence and the visa is revoked.`;
          recordJournal(S, `Caught working ${ev.label} cash-in-hand on a student visa — fined ${formatMoney(fine, S.country)} and warned by the authorities.`, 'visa');
        }
      } else if (res === 'undocumented' || res === 'grace_period') {
        caughtNote = ` Caught by an inspection — fined ${formatMoney(fine, S.country)}. With no valid status, the next raid can mean deportation.`;
        recordJournal(S, `Caught working ${ev.label} without papers — fined ${formatMoney(fine, S.country)}.`, 'visa');
      } else {
        caughtNote = ` Caught working off the books — fined ${formatMoney(fine, S.country)}.`;
        recordJournal(S, `Caught working ${ev.label} off the books — fined ${formatMoney(fine, S.country)}.`, 'legal');
      }
    }
  }

  recordJournal(S, `Worked ${ev.label} for the month (${ev.hoursPerWeek}h/week, ${formatMoney(paid, S.country)} from ${ev.payer}).`, 'career');
  return { ok: true, msg: `Earned +${formatMoney(paid, S.country)} (${ev.label}, ${ev.hoursPerWeek}h/week).${complaintNote}${caughtNote} Stress +${stressAdd}${healthCost ? `, Health −${healthCost}` : ''}.` };
}

/* ============================================================================
   5B. GAM'IYA (ROSCA), SYNDICATE, POSTGRAD & CREATOR
   ========================================================================== */

/* Authentic Gam'iya (Rotating Savings & Credit Circle — ROSCA / MoneyFellows) */
export function joinGamiyaCircle(S, tier = 'standard', slotType = 'early') {
  ensureExtendedState(S);
  if (S.player.age < 18) return { ok: false, msg: 'Must be 18+ to join a Gam\'iya savings circle.' };
  if (S.gamiya && S.gamiya.active) return { ok: false, msg: `Finish your current 10-month ${S.gamiya.name} first (${10 - S.gamiya.currentMonth}m left).` };

  const cObj = getCountry(S.country);
  const mult = tier === 'property' ? 3.2 : tier === 'wedding' ? 1.4 : 0.55;
  const monthlyContrib = Math.max(50, eraLocalCost(cObj.monthlyBasket2026.rentModest * mult, S.country, S.year));
  if (S.money.cash < monthlyContrib) {
    return { ok: false, msg: `Need first monthly share (${formatMoney(monthlyContrib, S.country)}) in cash to join.` };
  }

  const potTotal = monthlyContrib * 10;
  const slotMonth = slotType === 'early' ? 2 : 10;
  const circleName = tier === 'property' ? 'Big Property Down-Payment Gam\'iya' : tier === 'wedding' ? 'Marriage & Gehaz Gam\'iya' : 'Neighborhood Trusted Gam\'iya';

  walletMove(S, -monthlyContrib, `Month 1/10 contribution: ${circleName}`, 'bank');
  S.gamiya = {
    active: true,
    name: circleName,
    monthlyContribution: monthlyContrib,
    potTotal,
    slotMonth,
    currentMonth: 1,
    totalMonths: 10,
    receivedPot: false,paidTotal:monthlyContrib,arrears:0,contributionHistory:[{year:S.year,month:S.month,due:monthlyContrib,paid:monthlyContrib}]
  };
  recordJournal(
    S,
    `Joined a 10-member ${circleName} (${formatMoney(monthlyContrib, S.country)}/mo → ${formatMoney(potTotal, S.country)} interest-free payout in Month ${slotMonth}).`,
    'money'
  );
  return { ok: true, msg: `Joined ${circleName} (Payout Month ${slotMonth}: ${formatMoney(potTotal, S.country)})!` };
}

/* Professional Syndicate Registration (Niqaba / Chartered Order) */
export function registerProfessionalSyndicate(S) {
  ensureExtendedState(S);
  if (S.syndicate.registered) return { ok: false, msg: `Already registered in ${S.syndicate.name}.` };
  if (S.education.degrees.length === 0) return { ok: false, msg: 'Requires an accredited university degree.' };

  const deg = S.education.degrees[0];
  const titles = {
    medicine: 'Medical Syndicate (Doctors Order)',
    dentistry: 'Dental Syndicate',
    pharmacy: 'Pharmacists Syndicate',
    engineering: 'Engineers Syndicate',
    architecture: 'Society of Architects & Engineers',
    law: 'Bar & Advocates Syndicate',
    business: 'Commerce & Chartered Accountants Syndicate'
  };
  const synName = `${getCountry(S.country).adjective} ${deg==='medicine'?'Medical':deg==='engineering'?'Engineering':'Professional'} Association (game membership)`;
  const fee = Math.round(convertCurrency(185, 'usa', S.country, S.year));
  if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} for game professional-association membership.` };

  walletMove(S, -fee, `Syndicate registration: ${synName}`, 'career');
  S.syndicate = { registered: true, name: synName, joinedYear: S.year };
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 4);
  recordJournal(S, `Joined ${synName}. This game membership grants a healthcare discount and retirement supplement; it is not a professional licence.`, 'milestone');
  return { ok: true, msg: `Registered in ${synName}!` };
}

/* Postgraduate Degrees: 2-Yr MSc/MBA & 3-Yr Clinical Fellowship / PhD */
export function postgradFee(S, tier) { return Math.round(convertCurrency(tier === 'fellowship_phd' ? 8500 : 6200, 'usa', S.country, S.year)); }
/* Parents may pay for postgraduate tuition only while the student is still young (30 or under), at home, and their finite family funds cover the fee. */
export function postgradParentsCanPay(S, tier) {
  if (!S?.player || S.player.age > 30) return false;
  return familyCoversTuition(S, postgradFee(S, tier), S.country);
}
export function enrollPostgraduateProgram(S, tier = 'masters_mba', funding = 'cash') {
  ensureExtendedState(S);
  if(S.pendingRelocation)return {ok:false,msg:'Finish your pending move first.'};
  if (S.education.degrees.length === 0) return { ok: false, msg: 'Complete a bachelor’s degree before enrolling in postgraduate study.' };
  if (S.education.university) return { ok: false, msg: 'Finish undergraduate university first.' };
  if (S.postgrad.active) return { ok: false, msg: `Already enrolled in ${S.postgrad.active.label}.` };
  if (S.postgrad.completed.some(p => p.tier === tier)) return { ok: false, msg: 'You already hold this postgraduate credential!' };

  if(!['masters_mba','fellowship_phd'].includes(tier))return {ok:false,msg:'Unknown postgraduate programme.'};
  const isDoc = tier === 'fellowship_phd';
  if(isDoc&&!S.postgrad.completed.some(p=>p.tier==='masters_mba'))return {ok:false,msg:'Complete the master’s game credential first.'};
  const label = isDoc
    ? (S.education.degrees.includes('medicine') ? 'Clinical Specialty Fellowship (MD / Board)' : 'Doctoral Research Degree (PhD)')
    : (S.education.degrees.includes('business') ? 'Executive MBA' : 'Master of Science (MSc)');
  const totalMonths = isDoc ? 36 : 24;
  const usdFee = isDoc ? 8500 : 6200;
  const feeLocal = Math.round(convertCurrency(usdFee, 'usa', S.country, S.year));
  let paidBy = 'you';
  if (funding === 'family') {
    if (!postgradParentsCanPay(S, tier)) return { ok: false, msg: S.player.age > 30 ? 'Your parents no longer pay for study after age 30 in this game.' : 'Your parents cannot cover this tuition from their funds.' };
    if (!chargeLivingParents(S, feeLocal)) return { ok: false, msg: 'Your parents cannot cover this tuition from their funds.' };
    paidBy = 'your parents';
  } else {
    if (S.money.cash < feeLocal) return { ok: false, msg: `Need ${formatMoney(feeLocal, S.country)} upfront game tuition for ${label}.` };
    walletMove(S, -feeLocal, `Postgraduate enrollment: ${label}`, 'career');
  }
  S.postgrad.active = { tier, label, monthsLeft: totalMonths, totalMonths, feePaid:feeLocal, country:S.country, paidBy };
  recordJournal(S, `Enrolled in ${label} (${totalMonths / 12}-year evening/research track). Tuition ${formatMoney(feeLocal, S.country)} paid by ${paidBy}.`, 'career');
  return { ok: true, msg: `Enrolled in ${label}!` };
}

/* Creator / Expert Thought-Leadership Channel (Passive Sponsor & Consulting Income) */
export function growCreatorOrExpertChannel(S, niche = 'tech_finance') {
  ensureExtendedState(S);
  if (S.player.age < 16) return { ok: false, msg: 'Available from age 16+.' };
  if (S.year < 2006) return { ok: false, msg: 'Online creator & video channels emerged from 2006 onward!' };
  const key = `creator_post_${S.year}_${S.month}`;
  if (S.cooldowns[key]) return { ok: false, msg: 'Already published content this month — advance to next month!' };
  S.cooldowns[key] = 999999;

  const labels = {
    tech_finance: 'Tech, Career & Finance Breakdown Channel',
    medical_edu: 'Trusted Medical & Wellness Education Channel',
    architecture_re: 'Real Estate, Architecture & Interiors Channel',
    lifestyle_food: 'Culinary, Travel & Lifestyle Vlog'
  };
  S.creatorChannel.niche = labels[niche] || labels.tech_finance;
  const activeHome = S.housing.properties.find(p => p.id === S.housing.currentHomeId);
  const studioMult = (activeHome?.remodeledRooms || []).includes('creator_studio') ? 2.2 : 1.0;
  const gain = Math.round((280 + S.player.vitals.smarts * 9 + S.player.vitals.looks * 5 + (S.skills?.creativity || 40) * 4) * (1 + Math.min(4, S.creatorChannel.followers / 25000)) * studioMult);
  S.creatorChannel.followers += gain;
  const usdPerMo = Math.floor(S.creatorChannel.followers / 1000) * 18;
  S.creatorChannel.monthlyIncomeLocal = usdPerMo > 0 ? Math.round(convertCurrency(usdPerMo, 'usa', S.country, S.year)) : 0;

  if (S.creatorChannel.followers >= 25000 && S.creatorChannel.followers - gain < 25000) {
    recordJournal(S, `Your ${S.creatorChannel.niche} crossed 25,000 subscribers — brand sponsorships now bring in ${formatMoney(S.creatorChannel.monthlyIncomeLocal, S.country)}/month!`, 'milestone');
  }
  return {
    ok: true,
    msg: `+${gain.toLocaleString()} followers (${S.creatorChannel.followers.toLocaleString()} total${S.creatorChannel.monthlyIncomeLocal > 0 ? ` · ${formatMoney(S.creatorChannel.monthlyIncomeLocal, S.country)}/mo` : ''})!`
  };
}

export const PET_CATALOG = [
  { id: 'cat_mau', label: 'Egyptian Mau / Shirazi Cat', usd: 140, upkeepUsd: 22, hap: 7 },
  { id: 'dog_golden', label: 'Golden Retriever', usd: 650, upkeepUsd: 48, hap: 9 },
  { id: 'dog_shepherd', label: 'German Shepherd Guard Dog', usd: 780, upkeepUsd: 55, hap: 8 },
  { id: 'bird_parrot', label: 'African Grey Talking Parrot', usd: 480, upkeepUsd: 18, hap: 6 },
  { id: 'horse_arabian', label: 'Purebred Arabian Horse (Stabled)', usd: 14500, upkeepUsd: 380, hap: 15 },
  { id: 'falcon_saker', label: 'Peregrine / Saker Falcon', usd: 6800, upkeepUsd: 190, hap: 12 }
];

export function adoptCompanionPet(S, petId, customName = '') {
  ensureExtendedState(S);
  const spec = PET_CATALOG.find(p => p.id === petId);
  if (!spec) return { ok: false, msg: 'Pet species unavailable.' };
  if (S.pets.length >= 4) return { ok: false, msg: 'Your household already cares for 4 animals.' };

  const cost = Math.round(convertCurrency(spec.usd, 'usa', S.country, S.year));
  if (S.money.cash < cost) return { ok: false, msg: `Need ${formatMoney(cost, S.country)} adoption & vet setup fee.` };

  { const paid = purchase(S, cost, `Adopted ${spec.label}`, 'cash', { category: 'lifestyle' }); if (!paid.ok) return paid; }
  const petName = (customName && customName.trim()) || pick(S, ['Sultan', 'Luna', 'Zaki', 'simba', 'Noor', 'Bella', 'Faris', 'Milo']);
  S.pets.push({
    id: nextId(S, 'pet'),
    specId: spec.id,
    name: petName.charAt(0).toUpperCase() + petName.slice(1),
    species: spec.label,
    upkeepUsd: spec.upkeepUsd,
    adoptedYear: S.year,
    /* v2.12 W5 — pets now carry their own condition (older saves lack it;
       petStats() fills the defaults). */
    health: 80, happiness: 75, obedience: 45
  });
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + spec.hap);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 8);
  recordJournal(S, `Welcomed ${petName} (${spec.label}) into your home!`, 'life');
  return { ok: true, msg: `Adopted ${petName} (${spec.label})!` };
}

/* ============================================================================
   v2.12 W5 — Pets verbs (item 6). The audit counted ONE verb on this
   screen (adopt-pet, 5x). These four are DISTINCT data-actions; each moves
   a number on the pet record (health / happiness / obedience) or money.
   No vet price table exists in the game data, so the vet visit is a plain
   visit with a real price (scaled to the animal's upkeep) and a real effect.
   ========================================================================== */
/* Pet condition, with defaults for pets adopted before v2.12. */
export function petStats(pt) {
  if (pt.health == null) pt.health = 80;
  if (pt.happiness == null) pt.happiness = 75;
  if (pt.obedience == null) pt.obedience = 45;
  return pt;
}
export function petFeedCostLocal(S, pt) {
  return Math.max(5, Math.round(convertCurrency((pt.upkeepUsd || 25) * 0.25, 'usa', S.country, S.year)));
}
export function petVetCostLocal(S, pt) {
  return Math.max(10, Math.round(convertCurrency(30 + (pt.upkeepUsd || 25) * 0.5, 'usa', S.country, S.year)));
}
function findPet(S, petId) {
  return (S.pets || []).find(p => p.id === petId || p.specId === petId);
}
function petOncePerTurn(S, key, pt) {
  if (!S.cooldowns) S.cooldowns = {};
  if ((S.cooldowns[key] || 0) > S.turn) return `${pt.name} already had your full attention this month.`;
  S.cooldowns[key] = S.turn + 1;
  return null;
}

/* Feed: a small money cost, health and happiness up. */
export function feedPet(S, petId) {
  const pt = findPet(S, petId);
  if (!pt) return { ok: false, msg: 'Pet not found.' };
  petStats(pt);
  const cost = petFeedCostLocal(S, pt);
  if (S.money.cash < cost) return { ok: false, msg: `Feeding ${pt.name} costs ${formatMoney(cost, S.country)} — you hold ${formatMoney(S.money.cash, S.country)}.` };
  walletMove(S, -cost, `Fed ${pt.name} (${pt.species})`, 'lifestyle');
  pt.health = clamp(pt.health + 6);
  pt.happiness = clamp(pt.happiness + 4);
  recordJournal(S, `Fed ${pt.name} properly — good food, fresh water, a full belly.`, 'life');
  return { ok: true, msg: `Fed ${pt.name} (+6 Health, +4 Happiness)!` };
}

/* Play: happiness up for the pet and for you. Free, once per month. */
export function playWithPet(S, petId) {
  const pt = findPet(S, petId);
  if (!pt) return { ok: false, msg: 'Pet not found.' };
  petStats(pt);
  const used = petOncePerTurn(S, `pet_play_${pt.id}`, pt);
  if (used) return { ok: false, msg: used };
  pt.happiness = clamp(pt.happiness + 8);
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 3);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 3);
  recordJournal(S, `Played with ${pt.name} until you were both tired out — fetch, fuss, and a happy animal.`, 'life');
  return { ok: true, msg: `Played with ${pt.name} (+8 Happiness)!` };
}

/* Train: obedience up. A horse learns the stable routine, a parrot learns
   words, a dog learns to heel — the same verb, the animal's own record. */
export function trainPet(S, petId) {
  const pt = findPet(S, petId);
  if (!pt) return { ok: false, msg: 'Pet not found.' };
  petStats(pt);
  const used = petOncePerTurn(S, `pet_train_${pt.id}`, pt);
  if (used) return { ok: false, msg: used };
  pt.obedience = clamp(pt.obedience + 8);
  pt.happiness = clamp(pt.happiness + 2);
  recordJournal(S, `Trained with ${pt.name} — patient repetition, a treat for every step done right (+8 Obedience).`, 'life');
  return { ok: true, msg: `Trained ${pt.name} (+8 Obedience)!` };
}

/* Take to the vet: a real price, health up a lot. Refused, with a reason,
   when the animal is already in perfect health. */
export function takePetToVet(S, petId) {
  const pt = findPet(S, petId);
  if (!pt) return { ok: false, msg: 'Pet not found.' };
  petStats(pt);
  if (pt.health >= 95) return { ok: false, msg: `${pt.name} is in perfect health — no vet visit needed.` };
  const cost = petVetCostLocal(S, pt);
  if (S.money.cash < cost) return { ok: false, msg: `A vet visit for ${pt.name} costs ${formatMoney(cost, S.country)} — you hold ${formatMoney(S.money.cash, S.country)}.` };
  walletMove(S, -cost, `Vet visit for ${pt.name} (${pt.species})`, 'health');
  pt.health = clamp(pt.health + 20);
  pt.happiness = clamp(pt.happiness + 3);
  recordJournal(S, `Took ${pt.name} to the vet — checkup, treatment, and a clean bill of health (${formatMoney(cost, S.country)}).`, 'health');
  return { ok: true, msg: `Vet visit for ${pt.name} (+20 Health)!` };
}

export function toggleInsurancePolicy(S, policyKey) {
  ensureExtendedState(S);
  if (S.player.age < 18) return { ok: false, msg: 'Adults 18+ only.' };
  if (!['health', 'auto', 'home'].includes(policyKey)) return { ok: false, msg: 'Invalid policy.' };
  S.insurance[policyKey] = !S.insurance[policyKey];
  /* v2.9 — S.medical.healthInsurance is the ONE cover flag, derived from
     the private policy and employer cover by syncHealthCover(): toggling
     the private policy on adds cover; cancelling it leaves employer cover
     alone, so cover only disappears when neither source remains. */
  if (policyKey === 'health') syncHealthCover(S);
  const label = policyKey === 'health' ? 'Comprehensive Private Health Insurance'
    : policyKey === 'auto' ? 'Full-Coverage Auto Insurance'
    : 'Home, Fire & Plumbing Insurance';
  recordJournal(S, `${S.insurance[policyKey] ? 'Activated' : 'Cancelled'} ${label}.`, 'money');
  return { ok: true, msg: `${label}: ${S.insurance[policyKey] ? 'Active' : 'Cancelled'}` };
}

export function setEstateWillPlan(S, charityPct = 0) {
  ensureExtendedState(S);
  const pct = clamp(Number(charityPct) || 0, 0, 33); // Sharia Wasiyyah cap 1/3 (33%)!
  S.willPlan.charityPct = pct;
  S.willPlan.draftedYear = S.year;
  if(!S.willPlan.reputationAwarded){
    S.reputation = clamp(S.reputation + (pct >= 10 ? 6 : 2));
    S.willPlan.reputationAwarded=true;
  }
  recordJournal(
    S,
    pct > 0
      ? `Notarized your Will / Wasiyyah allocating ${pct}% to charitable Sadaqah Jariyah / endowment alongside statutory heirs.`
      : `Notarized your Will consolidating 100% of assets cleanly for statutory family heirs.`,
    'milestone'
  );
  return { ok: true, msg: `Will / Wasiyyah updated (${pct}% charitable bequest)!` };
}

/* ============================================================================
   5B. ARCHITECTURAL ASSET MAINTENANCE, FIX-AND-FLIP, MACRO CYCLES & TIME FOCUS
   ========================================================================== */

export function getMacroEconomicRegime(country, year) {
  if (year === 2008 || year === 2009) {
    return { label: 'Global Financial Crisis & Credit Freeze', propDelta: -0.04, note: 'Tight credit; distressed property bargains', tone: 'bad' };
  }
  if (year === 2020) {
    return { label: 'Global Pandemic Supply Shock', propDelta: 0.01, note: 'Remote-work surge & healthcare strain', tone: 'gold' };
  }
  if (country === 'egy' && (year === 2016 || year === 2017 || (year >= 2022 && year <= 2025))) {
    return { label: 'FX Devaluation & Hard-Asset Hedge Supercycle', propDelta: 0.16, note: 'Compound brick-and-mortar & 21K gold shield purchasing power', tone: 'gold' };
  }
  if ((country === 'sau' || country === 'uae') && year >= 2021) {
    return { label: 'Gulf Vision 2030 & Prime Freehold Boom', propDelta: 0.09, note: 'Strong expat inflows, mega-projects & Golden Visa demand', tone: 'good' };
  }
  if (year >= 2023) {
    return { label: 'AI & Frontier Compute Cycle', propDelta: 0.05, note: 'High premium on STEM, medical specialists & scarce land', tone: 'good' };
  }
  return { label: 'Balanced Secular Growth Cycle', propDelta: 0.04, note: 'Steady rental yields & wage progression', tone: 'neutral' };
}

export function renovateProperty(S, propId) {
  ensureExtendedState(S);
  const found = ownedPropertyOrRefusal(S, propId, 'No owned property found.');
  if (!found.ok) return found;
  const prop = found.prop;
  if ((prop.conditionPct ?? 100) >= 98) return { ok: false, msg: `${prop.name} is already in pristine 100% structural condition.` };

  const deficit = 100 - (prop.conditionPct ?? 85);
  const repairCost = Math.max(250, Math.round(prop.valueLocal * (deficit * 0.0022)));
  if (S.money.cash < repairCost) {
    return { ok: false, msg: `Need ${formatMoney(repairCost, S.country)} for structural MEP, facade & waterproofing restoration.` };
  }

  { const paid = purchase(S, repairCost, `Architectural renovation: ${prop.name}`, 'cash', { category: 'housing' }); if (!paid.ok) return paid; }
  prop.conditionPct = 100;
  prop.nativeValue = Math.round((prop.nativeValue || prop.valueLocal) * 1.055);
  prop.valueLocal = Math.round(prop.valueLocal * 1.055);
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 5);
  recordJournal(S, `Completed full MEP, facade & interior restoration on ${prop.name} (${formatMoney(repairCost, S.country)}) — condition restored to 100% and appraisal rose +5.5%!`, 'housing');
  return { ok: true, msg: `Restored ${prop.name} to 100% (+5.5% equity)!` };
}

export function sellOwnedProperty(S, propId, {complete=false}={}) {
  ensureExtendedState(S);
  const idx = S.housing.properties.findIndex(p => p.id === propId);
  if (idx < 0) return { ok: false, msg: 'Property not found.' };
  const prop = S.housing.properties[idx];
  if(!complete){if(prop.salePending)return{ok:false,msg:'Sale already listed.'};prop.salePending={listedAt:S.year*12+S.month,dueAt:S.year*12+S.month+3};return{ok:true,msg:'Listed for sale. Estimated completion:3months. Costs and loan payments continue until closing.'};}

  const condFactor = 0.72 + ((prop.conditionPct ?? 100) / 100) * 0.28;
  const grossSale = Math.round(prop.valueLocal * condFactor);
  const closingFee = Math.round(grossSale * 0.025); // 2.5% brokerage + registration fee
  const debtPayoff = Math.max(0, Math.round(prop.installmentRemaining || 0));
  const netProceeds = grossSale - closingFee - debtPayoff;

  if (netProceeds < 0 && S.money.cash + netProceeds < 0) {
    return { ok: false, msg: `Remaining Aqsat payoff exceeds current market offer.` };
  }

  /* v2.15 (coordinator merge fix): a sale ends the tenancy, so a held
     deposit is settled before the property leaves the books — documented
     damage kept, the rest back to the tenant. Before this fix the deposit
     stayed in the player's cash after a plain sale. */
  const dep = settleDepositOnSale(S, prop, 'sold');
  const depNote = dep.tenantName
    ? ` — ${dep.tenantName}'s deposit settled (${formatMoney(dep.kept, S.country)} kept for damage, ${formatMoney(dep.returned, S.country)} returned)`
    : '';

  S.housing.properties.splice(idx, 1);
  if (S.housing.currentHomeId === prop.id) {
    const fallback = S.housing.properties.find(p => p.country === S.country);
    if (fallback) {
      S.housing.currentHomeId = fallback.id;
      S.housing.currentHomeName = fallback.name;
      S.housing.currentShape = fallback.shape || 'apartment';
    } else {
      S.housing.currentHomeId = null;
      S.housing.mode = 'rent';
      S.housing.currentHomeName = `${S.city} Leased Apartment`;
      S.housing.currentShape = 'apartment';
      S.housing.monthlyRent = eraLocalCost(getCountry(S.country).monthlyBasket2026.rentStandard, S.country, S.year);
    }
  }

  walletMove(S, netProceeds, `Sold real estate deed: ${prop.name}`, 'housing');
  S.skills.financialIq = clamp((S.skills.financialIq || 40) + 3);
  recordJournal(
    S,
    `Closed the sale of ${prop.name} at ${formatMoney(grossSale, S.country)} — netting ${formatMoney(netProceeds, S.country)} cash after 2.5% transfer fees${debtPayoff > 0 ? ` and ${formatMoney(debtPayoff, S.country)} Aqsat settlement` : ''}${depNote}.`,
    'milestone'
  );
  return { ok: true, msg: `Sold ${prop.name}! Netted ${formatMoney(netProceeds, S.country)}.` };
}

export function togglePropertyTenantMode(S, propId) {
  ensureExtendedState(S);
  const prop = S.housing.properties.find(p => p.id === propId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  if(prop.ruralCabin)return{ok:false,msg:'Personal-use cabin.'};
  if(prop.landlord?.tenant||prop.landlord?.deposit?.held||prop.landlord?.depositSettlement?.status==='pending')return{ok:false,msg:'End the existing tenancy and settle its deposit before changing lease type.'};
  prop.tenantMode = prop.tenantMode === 'short_term' ? 'long_term' : 'short_term';
  prop.rentedOut = S.housing.currentHomeId !== prop.id;
  const baseNative = Math.round(((prop.nativeValue || prop.valueLocal) * 0.068) / 12);
  prop.nativeMonthlyRent = prop.tenantMode === 'short_term' ? Math.round(baseNative * 1.36) : baseNative;
  return {
    ok: true,
    msg: `${prop.name}: ${prop.tenantMode === 'short_term' ? 'Short-Term Holiday / Executive Let (+36% Yield)' : 'Long-Term Family Lease (Low Wear)'}`
  };
}

export const WEEKLY_FOCUS_MODES = [
  { id: 'balanced', label: 'Balanced Rhythm (42h Work · 14h Wellness · 20h Family)', desc: 'Steady career, health & home harmony' },
  { id: 'career_surge', label: 'Executive Grind (62h Work · Networking)', desc: '+Performance, +Wasta, +Stress' },
  { id: 'wellness_longevity', label: 'Longevity & Athletics (Gym · 8h Sleep · Whole Foods)', desc: '+Health, +Fitness, −Stress' },
  { id: 'family_harmony', label: 'Present Parent & Spouse (Deep Family Hours)', desc: '+Family Bonds, +Child Smarts, +Peace' },
  { id: 'mastery_iq', label: 'Deep Study & Financial Mastery (15h Reading/Code)', desc: '+Smarts, +Financial IQ, +Creativity' }
];

export function setWeeklyTimeFocus(S, focusId) {
  ensureExtendedState(S);
  const spec = WEEKLY_FOCUS_MODES.find(m => m.id === focusId) || WEEKLY_FOCUS_MODES[0];
  S.timeBudget.focus = spec.id;
  return { ok: true, msg: `Weekly schedule set: ${spec.label.split('(')[0].trim()}` };
}

/* v2.11 W1 — the 3 run ops now live in businessEngine.runBusinessOp
   (industry labels, caps + cooldowns, temporary buffs, never a
   permanent ratchet). This keeps its old name and call shape so the
   main.js biz-op handler does not change; bizId selects which of the
   player's businesses the op runs on (no bizId = the first business). */
export function manageBusinessOperation(S, opKind, bizId) {
  return runBusinessOp(S, bizId, opKind);
}

/* ============================================================================
   5C. CUSTOM ARCHITECTURAL STUDIO (FACADES, ROOM REMODELING, EXTENSIONS) &
       BESPOKE CHARACTER / TAILOR CUSTOMIZATION
   ========================================================================== */

export const FACADE_PALETTE_OPTIONS = [
  { id: 'limestone_classic',        label: 'Cairo Cream Limestone' },
  { id: 'najdi_sandstone',          label: 'Riyadh Salmani Sandstone' },
  { id: 'mediterranean_terracotta', label: 'Mediterranean Terracotta' },
  { id: 'modern_travertine_glass',  label: 'Modern Anthracite & Travertine' },
  { id: 'georgian_heritage_brick',  label: 'Kensington Heritage Brick' }
];

export const ROOM_SPECIALTY_REMODELS = [
  { id: 'private_clinic',    label: 'Private Medical / Consulting Clinic', usd: 4200, benefit: '+Monthly private practice fees (Med/Law/Eng)' },
  { id: 'creator_studio',    label: 'Acoustic Creator & Broadcast Studio', usd: 2600, benefit: '2.2× Creator Channel subscriber & sponsor growth' },
  { id: 'diplomatic_majlis', label: 'Formal Diplomatic Majlis Salon',      usd: 3500, benefit: '+3 Wasta & +2 Reputation every year' },
  { id: 'montessori_lab',    label: 'Montessori & Olympiad Study Lab',     usd: 2200, benefit: '+4/yr Child Smarts & exam readiness' },
  { id: 'hammam_spa',        label: 'Private Hammam & Recovery Spa',       usd: 3800, benefit: '+5 Health & −8 Stress every year' }
];

export function setPropertyFacadePalette(S, propId, facadeId) {
  ensureExtendedState(S);
  const found = ownedPropertyOrRefusal(S, propId, 'Own a property first to customize its architectural facade.');
  if (!found.ok) return found;
  const prop = found.prop;
  const spec = FACADE_PALETTE_OPTIONS.find(f => f.id === facadeId);
  if (!spec) return { ok: false, msg: 'Unknown facade material.' };

  const cost = Math.round(convertCurrency(950, 'usa', S.country, S.year));
  if (S.money.cash < cost) return { ok: false, msg: `Need ${formatMoney(cost, S.country)} for exterior cladding & stonework.` };
  { const paid = purchase(S, cost, `Facade cladding: ${spec.label}`, 'cash', { category: 'housing' }); if (!paid.ok) return paid; }
  prop.facadeStyle = spec.id;
  prop.conditionPct = 100;
  return { ok: true, msg: `Applied ${spec.label} facade to ${prop.name}!` };
}

export function remodelPropertyRoomPurpose(S, propId, specialtyId) {
  ensureExtendedState(S);
  const found = ownedPropertyOrRefusal(S, propId, 'Own a property first to remodel interior rooms.');
  if (!found.ok) return found;
  const prop = found.prop;
  const spec = ROOM_SPECIALTY_REMODELS.find(r => r.id === specialtyId);
  if (!spec) return { ok: false, msg: 'Specialty room spec not found.' };

  if (!Array.isArray(prop.remodeledRooms)) prop.remodeledRooms = [];
  if (prop.remodeledRooms.includes(spec.id)) {
    return { ok: false, msg: `${spec.label} is already built in ${prop.name}!` };
  }

  const cost = Math.round(convertCurrency(spec.usd, 'usa', S.country, S.year));
  if (S.money.cash < cost) return { ok: false, msg: `Need ${formatMoney(cost, S.country)} to architect ${spec.label}.` };
  { const paid = purchase(S, cost, `Remodeled room: ${spec.label}`, 'cash', { category: 'housing' }); if (!paid.ok) return paid; }
  prop.remodeledRooms.push(spec.id);
  prop.nativeValue = Math.round((prop.nativeValue || prop.valueLocal) * 1.045);
  prop.valueLocal = Math.round(prop.valueLocal * 1.045);
  S.housing.gehazInvestedLocal = (S.housing.gehazInvestedLocal || 0) + cost;
  recordJournal(S, `Converted an interior wing of ${prop.name} into a ${spec.label} (${spec.benefit}).`, 'housing');
  return { ok: true, msg: `Built ${spec.label} (+4.5% equity)!` };
}

export function expandPropertyFootprint(S, propId) {
  ensureExtendedState(S);
  const found = ownedPropertyOrRefusal(S, propId, 'Own a property first.');
  if (!found.ok) return found;
  const prop = found.prop;
  if (prop.hasExtension) return { ok: false, msg: `${prop.name} already has its maximum municipal +45 m² wing extension.` };

  const areas=propertyAreas(prop);
  if(['apartment','studio','penthouse','duplex','family_duplex','commercial','land'].includes(prop.shape))return {ok:false,msg:'A ground wing extension needs a private-house plot, not this unit type.'};
  if(areas.gardenM2<45)return {ok:false,msg:'A45m²wing needs at least45m²of private planted garden within the existing plot.'};
  const cost = Math.max(1500, Math.round(prop.valueLocal * 0.14));
  if (S.money.cash < cost) {
    return { ok: false, msg: `Need ${formatMoney(cost, S.country)} for municipal permit & +45 m² structural extension.` };
  }
  { const paid = purchase(S, cost, `+45 m² architectural wing extension (${prop.name})`, 'cash', { category: 'housing' }); if (!paid.ok) return paid; }
  const ppm=(prop.nativeValue||1)/Math.max(1,pricedPropertyArea(prop));
  const outdoorBefore=outdoorAnnualBudget(prop,ppm);
  Object.assign(prop,areas,{gardenM2:areas.gardenM2-45,footprintM2:areas.footprintM2+45});
  prop.outdoorAnnualNative=Math.max(0,(prop.outdoorAnnualNative||0)+outdoorAnnualBudget(prop,ppm)-outdoorBefore);
  prop.hasExtension = true;
  prop.areaM2 = (prop.areaM2 || 140) + 45;
  prop.indoorM2=prop.areaM2;
  prop.rooms = (prop.rooms || 3) + 1;
  prop.nativeValue = Math.round((prop.nativeValue || prop.valueLocal) * 1.19);
  prop.valueLocal = Math.round(prop.valueLocal * 1.19);
  recordJournal(S, `Approved municipal permit and built a +45 m² architectural wing onto ${prop.name} (now ${prop.areaM2} m² · +19% appraisal uplift)!`, 'milestone');
  return { ok: true, msg: `Expanded ${prop.name} to ${prop.areaM2} m² (+19% value)!` };
}

export function customizePlayerAppearance(S, field, rawVal) {
  ensureExtendedState(S);
  if (!S.player.appearance) S.player.appearance = { seed: S.seed || 17 };
  const app = S.player.appearance;

  if (field === 'headwearMode') {
    app.headwearMode = String(rawVal || 'auto');
    return { ok: true, msg: 'Updated cultural headwear style.' };
  }
  if (field === 'inkArchetype') {
    app.portraitMode = 'ink';
    app.inkArchetype = String(rawVal || 'auto');
    return { ok: true, msg: 'Selected fine-line ink & watercolor portrait!' };
  }
  if (field === 'portraitMode') {
    app.portraitMode = rawVal === 'vector' ? 'vector' : 'ink';
    return { ok: true, msg: `Portrait style: ${app.portraitMode === 'ink' ? 'Fine-Line Ink & Watercolor Art' : 'Custom Sculpted Vector'}` };
  }

  const numVal = Number(rawVal || 0);
  const allowedNumeric = new Set(['skinToneIdx', 'faceShapeIdx', 'hairStyleIdx', 'hairColorIdx', 'irisIdx', 'beardStyleIdx', 'eyewearIdx', 'wardrobeIdx']);
  if (!allowedNumeric.has(field)) return { ok: false, msg: 'Invalid appearance attribute.' };

  if (field === 'wardrobeIdx' && S.player.age >= 18) {
    const fee = Math.round(convertCurrency(180, 'usa', S.country, S.year));
    if (!app.tailored && S.money.cash >= fee) {
      walletMove(S, -fee, 'Bespoke tailor wardrobe fitting', 'lifestyle');
      app.tailored = true;
      S.player.vitals.looks = clamp((S.player.vitals.looks || 65) + 4);
      S.skills.charisma = clamp((S.skills.charisma || 45) + 3);
      return { ok: true, msg: 'Commissioned bespoke tailoring (+4 Looks, +3 Charisma, +Interview Edge)!' };
    }
  }
  app[field] = numVal;
  return { ok: true, msg: 'Appearance updated!' };
}

/* ============================================================================
   v2.12 W6 — APPEARANCE VERBS: a haircut and an outfit are REAL choices,
   not another free portrait toggle. Each states its price and its looks /
   charisma change, charges money, writes the change onto the person record,
   and a haircut makes a real person react (affection moves on their record).
   The free portrait toggles above (edit-appearance) stay untouched.
   ========================================================================== */

export const HAIRCUT_STYLES = [
  { id: 'classic_trim', label: 'Classic Trim', priceUsd: 15, looks: 1, charisma: 0 },
  { id: 'fade', label: 'Skin Fade', priceUsd: 25, looks: 2, charisma: 1 },
  { id: 'executive', label: 'Executive Cut & Shave', priceUsd: 45, looks: 3, charisma: 2 },
  { id: 'salon_restlye', label: 'Salon Restyle', priceUsd: 70, looks: 4, charisma: 2 },
  { id: 'celebrity', label: 'Celebrity Stylist Session', priceUsd: 150, looks: 5, charisma: 3 }
];

export const OUTFIT_STYLES = [
  { id: 'thrift', label: 'Vintage Thrift Fit', priceUsd: 40, looks: 1, charisma: 1 },
  { id: 'street', label: 'Streetwear Drop', priceUsd: 120, looks: 2, charisma: 2 },
  { id: 'smart', label: 'Smart Casual Set', priceUsd: 250, looks: 3, charisma: 2 },
  { id: 'power', label: 'Business Power Suit', priceUsd: 600, looks: 4, charisma: 3 },
  { id: 'gala', label: 'Designer Evening Look', priceUsd: 1500, looks: 5, charisma: 4 }
];

export function getHaircut(S, styleId) {
  ensureExtendedState(S);
  const style = HAIRCUT_STYLES.find(s => s.id === styleId);
  if (!style) return { ok: false, msg: 'Haircut not offered.' };
  const fee = Math.round(convertCurrency(style.priceUsd, 'usa', S.country, S.year));
  if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} for a ${style.label}.` };
  walletMove(S, -fee, `Haircut: ${style.label}`, 'lifestyle');
  S.player.vitals.looks = clamp((S.player.vitals.looks || 65) + style.looks);
  if (style.charisma) S.skills.charisma = clamp((S.skills.charisma || 45) + style.charisma);
  if (!S.player.appearance) S.player.appearance = { seed: S.seed || 17 };
  S.player.appearance.haircut = { styleId: style.id, label: style.label, year: S.year };
  /* A real person reacts: spouse first, then a parent, then anyone close
     who is alive. Their affection moves on their own record. */
  const candidates = [
    ...(S.relations.spouseIds || []), S.relations.fatherId, S.relations.motherId,
    ...(S.relations.childIds || []),
    ...Object.keys(S.people || {}).filter(id => id !== 'player')
  ];
  let reactor = null;
  for (const pid of candidates) {
    const p = pid && S.people[pid];
    if (p && p.alive && p.rel && pid !== 'player') { reactor = p; break; }
  }
  let reaction = '';
  if (reactor) {
    rememberDeed(S, reactor, 'proud_moment', `Loved your new ${style.label} haircut.`, { affection: 3, respect: 1 });
    reaction = ` ${reactor.firstName || 'Someone close'} loved it (+3 affection).`;
  }
  recordJournal(S, `Got a ${style.label} haircut (${formatMoney(fee, S.country)}) — looks ${Math.round(S.player.vitals.looks)}%.${reaction}`, 'lifestyle');
  return { ok: true, msg: `Fresh ${style.label}! Looks +${style.looks}${style.charisma ? `, Charisma +${style.charisma}` : ''}.${reaction}` };
}

export function buyOutfit(S, styleId) {
  ensureExtendedState(S);
  const style = OUTFIT_STYLES.find(s => s.id === styleId);
  if (!style) return { ok: false, msg: 'Outfit not offered.' };
  const fee = Math.round(convertCurrency(style.priceUsd, 'usa', S.country, S.year));
  if (S.money.cash < fee) return { ok: false, msg: `Need ${formatMoney(fee, S.country)} for the ${style.label}.` };
  walletMove(S, -fee, `Outfit: ${style.label}`, 'lifestyle');
  S.player.vitals.looks = clamp((S.player.vitals.looks || 65) + style.looks);
  S.skills.charisma = clamp((S.skills.charisma || 45) + style.charisma);
  if (!S.player.appearance) S.player.appearance = { seed: S.seed || 17 };
  S.player.appearance.outfit = { styleId: style.id, label: style.label, year: S.year };
  recordJournal(S, `Bought the ${style.label} (${formatMoney(fee, S.country)}) — looks ${Math.round(S.player.vitals.looks)}%, charisma ${Math.round(S.skills.charisma)}.`, 'lifestyle');
  return { ok: true, msg: `New look: ${style.label}! Looks +${style.looks}, Charisma +${style.charisma}.` };
}

/* ============================================================================
   6. MONTHLY & ANNUAL MEGA-SYSTEMS TICK (Called from gameLoop.js!)
   ========================================================================== */
export function tickMegaSystemsMonthly(S) {
  tickCivilClaims(S);
  for(const prop of [...(S.housing.properties||[])])if(prop.salePending&&S.year*12+S.month>=prop.salePending.dueAt){const res=sellOwnedProperty(S,prop.id,{complete:true});if(!res.ok){prop.salePending.dueAt++;recordJournal(S,'Property sale delayed: available cash cannot clear the outstanding debt.','housing');}}

  ensureExtendedState(S);
  S.money._lastGoldUnitPrice = goldPricePerGram(S.country, S.year, 21);
  if (S.player.age < 18) return;

  /* 1. UAE Nafis top-up now runs inside the ONE monthly settlement
     (economyEngine settleRecurringHouseholdItems) — removed here (D3). */

  /* 2. Saudi Special Talent / Executive Premium Residency Automatic Check (2024+!) */
  if (
    S.country === 'sau' &&
    S.year >= 2024 &&
    !S.legal.citizenships.includes('sau') &&
    S.legal.residency.kind !== 'golden_visa' &&
    S.career.employed &&
    S.career.job
  ) {
    const gross = S.career.job.monthlyGross;
    const medTalent = S.career.job.track === 'medicine' && S.credentials.licenses.includes('lic_sau_scfhs') && gross >= 35000;
    const execTalent = gross >= 80000;
    if (medTalent || execTalent) {
      transitionResidency(S, 'golden_visa', { permitName: 'Saudi Special Talent Premium Residency (Iqama Mumayaza)', expiresYear: S.year + 5, force: true });
      recordJournal(S, `Qualified for Saudi Special Talent Premium Residency (Iqama Mumayaza) — exempt from Kafala & Nitaqat!`, 'visa');
    }
  }

  /* 3. Staff wages & solar savings now run inside the ONE monthly
     settlement — removed here (D3). */

  /* 3B. Gam'iya now runs inside the ONE monthly settlement — removed
     here (D3). The settlement's version also puts the contribution and the
     payout into the monthly summary buckets, which this tick never did. */

  /* 3C. Postgraduate Program Progression, Syndicate Pension & Creator Channel Income */
  if (S.postgrad && S.postgrad.active) {
    S.postgrad.active.monthsLeft -= 1;
    S.player.vitals.stress = clamp(S.player.vitals.stress + 1);
    if (S.postgrad.active.monthsLeft <= 0) {
      const done = S.postgrad.active;
      S.postgrad.active = null;
      S.postgrad.completed.push({ tier: done.tier, label: done.label, year: S.year,country:done.country,uniId:done.uniId });
      if(done.international)grantGameGraduatePermit(S,done.tier==='fellowship_phd'?'phd':'masters',done.majorId);
      S.player.vitals.smarts = clamp(S.player.vitals.smarts + (done.tier === 'fellowship_phd' ? 9 : 6));
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 12);
      if (S.career.employed && S.career.job) {
        /* v2.19 W5 — the enrol buttons promise +26% (MSc/MBA) and +42%
           (Fellowship/PhD), and the market/ladder pay uses the same
           1.26/1.42 boost (careerEducationEngine pgBoost). The completion
           raise here used 1.22/1.32, so a player who finished while
           employed got less than the button promised. Now it matches. */
        const mult = done.tier === 'fellowship_phd' ? 1.42 : 1.26;
        S.career.job.monthlyGross = Math.round(S.career.job.monthlyGross * mult);
      }
      recordJournal(S, `Awarded your ${done.label}! Senior specialist & executive compensation tiers unlocked.`, 'milestone');
    }
  }

  /* Creator income, home-clinic fees and the syndicate pension now run
     inside the ONE monthly settlement — removed here (D3). */

  /* 3D. Insurance premiums & pet care now run inside the ONE monthly
     settlement — removed here (D3). */

  /* 4–5. BNPL splits and credit-card minimums/interest now run inside the
     ONE monthly settlement with the shared missed-payment chain (D3/D14):
     late fee -> score hit -> warning -> plan cancelled / limit cut. The
     old tick paid BNPL even when broke and accrued card interest silently. */

  /* 6. Active Custom Land Construction Month-by-Month Progress! */
  for (const land of [...S.housing.lands]) {
    const bp = land.buildProject;
    if (!bp) continue;
    const draw=Math.min(bp.monthlyDrawPlayer,bp.remainingDrawPlayer??bp.monthlyDrawPlayer*bp.monthsLeft);
    if (S.money.cash < draw && S.money.savings > 0) {
      const pull = Math.min(S.money.savings, draw - S.money.cash);
      moveBalance(S, 'savings', -pull, 'Savings transfer for construction draw', 'bank');
      walletMove(S, pull, 'Savings transfer for construction draw', 'bank');
    }
    if (S.money.cash >= draw) {
      walletMove(S, -draw, `Construction draw: ${bp.label}`, 'housing');
      bp.remainingDrawPlayer=Math.max(0,(bp.remainingDrawPlayer??bp.monthlyDrawPlayer*bp.monthsLeft)-draw);
      bp.monthsLeft -= 1;
      bp.progressPct = Math.min(100, Math.round(((bp.totalMonths - bp.monthsLeft) / bp.totalMonths) * 100));
      if (bp.monthsLeft <= 0 && bp.remainingDrawPlayer<=0) {
        /* Construction Completed -> Converts into high-equity finished Property! */
        const finishedNativeVal = Math.round((land.nativeValue + bp.totalInvestedNative) * 1.28);
        const newProp = {
          id: nextId(S, 'prop'),
          catalogId: land.catalogId,
          name: `Custom-Built ${bp.label} (${land.city})`,
          shape: bp.shape,
          finishing: bp.finishId,
          furnishedRooms: {},
          upgrades: [],
          country: land.country,
          city: land.city,
          rooms: bp.shape === 'apartment' ? 8 : 5,
          areaM2: bp.builtArea,
          indoorM2:bp.builtArea,
          plotM2:land.areaM2,
          footprintM2:Math.round(land.areaM2*.65),
          gardenM2:Math.max(0,land.areaM2-Math.round(land.areaM2*.65)),
          hasGarden:true,poolM2:0,terraceM2:0,courtyardM2:0,parkingM2:0,
          outdoorAnnualNative:Math.round(finishedNativeVal/Math.max(1,bp.builtArea)*Math.max(0,land.areaM2-Math.round(land.areaM2*.65))*.001),
          nativeValue: finishedNativeVal,
          valueLocal: Math.round(convertCurrency(finishedNativeVal, land.country, S.country, S.year)),
          nativeMonthlyRent: Math.round((finishedNativeVal * 0.075) / 12),
          rentedOut: land.country !== S.country,
          nativeInstallmentRemaining: 0,
          installmentRemaining: 0,
          nativeMonthlyInstallment: 0,
          monthsLeft: 0
        };
        S.housing.properties.push(newProp);
        land.buildProject = null;
        S.housing.lands = S.housing.lands.filter(x => x.id !== land.id);
        checkRealEstateResidencyUnlocks(S, newProp);
        recordJournal(S, `Construction completed! Handed keys to your custom-built ${newProp.name} — valued at ${formatMoney(newProp.valueLocal, S.country)} (+28% development equity)!`, 'milestone');
      }
    }
  }

  /* 7. Annual Investment Returns & Collectible Watch/Jewelry Appreciation (December rollover) */
  if (S.month === 12) {
    const iqAlpha = Math.max(0, ((S.skills?.financialIq || 42) - 50) * 0.0005);
    for (const pos of S.investments) {
      const spec = GLOBAL_MARKET_ASSETS.find(a => a.id === pos.assetId);
      if (!spec) continue;
      const shock = (rand(S) - 0.5) * 2 * spec.volatility;
      const totalRet = Math.max(-0.42, spec.meanReturn + iqAlpha + shock);
      const divCash = Math.round(pos.valueLocal * (spec.dividendPct || 0));
      pos.valueLocal = Math.max(10, Math.round(pos.valueLocal * (1 + totalRet - (spec.dividendPct || 0))));
      if (divCash > 0) {
        walletMove(S, divCash, `Annual dividend/coupon: ${pos.name}`, 'investment');
      }
    }

    const localInf = Math.max(0, inflationRate(S.country, S.year) / 100);
    for (const inv of S.inventory) {
      if (inv.appreciates) {
        inv.valueLocal = Math.round(inv.valueLocal * (1 + localInf + 0.03));
      }
    }

    /* 8. Architectural Wear, Macro Appreciation, School-District Impact & Weekly Focus Evolution */
    const macro = getMacroEconomicRegime(S.country, S.year);
    for (const pr of (S.housing.properties || [])) {
      const wear = pr.rentedOut && pr.tenantMode === 'short_term' ? 4 : 2;
      pr.conditionPct = clamp((pr.conditionPct ?? 100) - wear, 35, 100);
      const growth = Math.max(-0.06, (macro.propDelta || 0.03) * ((pr.conditionPct ?? 90) >= 70 ? 1.0 : 0.4));
      pr.nativeValue = Math.round((pr.nativeValue || pr.valueLocal) * (1 + growth));
      pr.valueLocal = Math.round(convertCurrency(pr.nativeValue, pr.country, S.country, S.year));
    }

    const curHome = S.housing.properties.find(p => p.id === S.housing.currentHomeId);
    if (curHome) {
      if (['villa', 'mansion', 'twin_house', 'townhouse', 'penthouse', 'duplex'].includes(curHome.shape)) {
        S.player.vitals.stress = clamp(S.player.vitals.stress - 4);
        S.skills.wasta = clamp((S.skills.wasta || 35) + 1);
        for (const cid of S.relations.childIds) {
          const ch = S.people[cid];
          if (ch && ch.alive && ch.age >= 5 && ch.age <= 18) ch.vitals.smarts = clamp(ch.vitals.smarts + 2);
        }
      }
      const rem = curHome.remodeledRooms || [];
      if (rem.includes('diplomatic_majlis')) {
        S.skills.wasta = clamp((S.skills.wasta || 35) + 3);
        S.reputation = clamp((S.reputation || 55) + 2);
      }
      if (rem.includes('montessori_lab')) {
        for (const cid of S.relations.childIds) {
          const ch = S.people[cid];
          if (ch && ch.alive && ch.age >= 3 && ch.age <= 18) ch.vitals.smarts = clamp(ch.vitals.smarts + 4);
        }
      }
      if (rem.includes('hammam_spa')) {
        S.player.vitals.health = clamp(S.player.vitals.health + 5);
        S.player.vitals.stress = clamp(S.player.vitals.stress - 8);
      }
    }

    const foc = S.timeBudget?.focus || 'balanced';
    if (foc === 'career_surge') {
      if (S.career.job) S.career.job.performance = clamp(S.career.job.performance + 6);
      S.skills.wasta = clamp((S.skills.wasta || 35) + 3);
      S.player.vitals.stress = clamp(S.player.vitals.stress + 6);
    } else if (foc === 'wellness_longevity') {
      S.player.vitals.health = clamp(S.player.vitals.health + 4);
      S.skills.fitness = clamp((S.skills.fitness || 50) + 4);
      S.player.vitals.stress = clamp(S.player.vitals.stress - 7);
    } else if (foc === 'family_harmony') {
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 4);
      S.values.familyDevotion = clamp((S.values.familyDevotion || 65) + 2);
      for (const pid of [...S.relations.spouseIds, ...S.relations.childIds]) {
        const np = S.people[pid];
        if (np && np.alive && np.rel) np.rel.affection = clamp(np.rel.affection + 3);
      }
    } else if (foc === 'mastery_iq') {
      S.player.vitals.smarts = clamp(S.player.vitals.smarts + 3);
      S.skills.financialIq = clamp((S.skills.financialIq || 40) + 4);
      S.skills.creativity = clamp((S.skills.creativity || 40) + 3);
    }

    /* 9. Record 4D Life Telemetry Snapshot */
    const kinshipAvg = (() => {
      const close = Object.values(S.people).filter(p => p && p.alive && p.id !== 'player' && p.rel);
      if (!close.length) return 60;
      return Math.round(close.reduce((s, p) => s + (p.rel.affection || 50), 0) / close.length);
    })();
    S.telemetryHistory.push({
      age: S.player.age,
      year: S.year,
      netWorth: computeNetWorthLocal(S),
      vitality: Math.round((S.player.vitals.health + (100 - S.player.vitals.stress)) / 2),
      intellect: Math.round((S.player.vitals.smarts + (S.skills.financialIq || 40)) / 2),
      kinship: kinshipAvg
    });
    if (S.telemetryHistory.length > 80) S.telemetryHistory.shift();
  }
}

export function restoreInformationScene(S,saved){
 const labels={business_quit_notice:'Acknowledge',shop_compare:'Done comparing',shop_ask:'Thanks, close advice',card_limit:'Done',trip_compare:'Done comparing'};
 if(!Object.hasOwn(labels,saved?.baseId)||typeof saved.title!=='string'||typeof saved.text!=='string')return null;
 return{...saved,choices:[{label:labels[saved.baseId],effect:()=>{}}]};
}
