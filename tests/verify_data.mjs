import { COUNTRY_IDS, getCountry } from '../src/data/countries.js';
import { convertCurrency, eraSalary, goldPricePerGram, computeMonthlyNetPay } from '../src/data/economy.js';
import { getSchoolsFor, getUniversitiesFor, getBanksFor, getHousingFor, getHospitalsFor, MAJORS } from '../src/data/institutions.js';
import { getMarriageProfile } from '../src/data/visasAndMarriage.js';
import { COMPOUNDS_BY_COUNTRY, NEIGHBORHOODS_BY_COUNTRY, LAND_PLOTS, PROPERTY_UNITS, FINISHING_TIERS, PAYMENT_PLANS } from '../src/data/megaRealEstate.js';
import { CARS_MEGA_CATALOG, SHOP_MEGA_CATALOG, CAR_COLORS, CAR_TRIMS } from '../src/data/megaCarsAndShop.js';
import { V1_BANKS, V1_CREDIT_CARDS, GLOBAL_MARKET_ASSETS, REMITTANCE_CHANNELS } from '../src/data/megaFinanceAndMarkets.js';
import { ALL_VACATIONS, ALL_SURGERIES, PROFESSIONAL_LICENSES, LANGUAGE_EXAMS, FULL_MARRIAGE_PROFILES_7875 } from '../src/data/megaCareerEduMedical.js';
import { getMergedCareerTracks } from '../src/systems/careerEducationEngine.js';

// print was never defined: the checks ran, then the report line crashed. Define it (console.log), checks untouched.
const print = (...a) => console.log(...a);

let maxDrift = 0;
for (const yr of [1965, 1985, 2005, 2017, 2024, 2026, 2040]) {
  for (const a of COUNTRY_IDS) {
    for (const b of COUNTRY_IDS) {
      const x = 100000;
      const y = convertCurrency(convertCurrency(x, a, b, yr), b, a, yr);
      const drift = Math.abs(y - x) / x;
      if (drift > maxDrift) maxDrift = drift;
    }
  }
}
if (maxDrift > 1e-12) throw new Error('FX round-trip drift: ' + maxDrift);

let totalCompounds = 0;
for (const cid of COUNTRY_IDS) {
  const c = getCountry(cid);
  if (!getSchoolsFor(cid, 1995).length) throw new Error('No schools for ' + cid);
  if (!getUniversitiesFor(cid, 2005).length) throw new Error('No unis for ' + cid);
  if (!getBanksFor(cid, 2005).length) throw new Error('No banks for ' + cid);
  if (!getHousingFor(cid, 2005).length) throw new Error('No housing for ' + cid);
  if (!getHospitalsFor(cid, 2005).length) throw new Error('No hospitals for ' + cid);
  totalCompounds += (COMPOUNDS_BY_COUNTRY[cid] || []).length + (NEIGHBORHOODS_BY_COUNTRY[cid] || []).length;
  const mp = getMarriageProfile(cid, 2020);
  if (!mp.venues2026.length) throw new Error('No venues for ' + cid);
  const pay = computeMonthlyNetPay(eraSalary(c.annualSalaryTiers2026.mid / 12, cid, 2024), cid, 2024, true);
  if (!(pay.net > 0 && pay.net <= pay.gross)) throw new Error('Bad net pay for ' + cid);
}

const tracks2026 = Object.keys(getMergedCareerTracks(2026)).length;
if (CARS_MEGA_CATALOG.length < 1000) throw new Error('Expected 1000+ cars, got ' + CARS_MEGA_CATALOG.length);
if (SHOP_MEGA_CATALOG.length < 1200) throw new Error('Expected 1200+ shop items, got ' + SHOP_MEGA_CATALOG.length);
if (totalCompounds < 250) throw new Error('Expected 250+ compounds/districts, got ' + totalCompounds);
if (LAND_PLOTS.length < 100) throw new Error('Expected 100+ land plots, got ' + LAND_PLOTS.length);
if (tracks2026 < 80) throw new Error('Expected 80+ career tracks in 2026, got ' + tracks2026);
if (ALL_VACATIONS.length < 95) throw new Error('Expected 95+ vacations, got ' + ALL_VACATIONS.length);

print('DATA_OK: ' + JSON.stringify({
  countries: COUNTRY_IDS.length,
  majors: MAJORS.length,
  compoundsAndDistricts: totalCompounds,
  landPlots: LAND_PLOTS.length,
  unitTypes: PROPERTY_UNITS.length,
  finishingTiers: FINISHING_TIERS.length,
  paymentPlans: PAYMENT_PLANS.length,
  cars: CARS_MEGA_CATALOG.length,
  carColors: CAR_COLORS.length,
  carTrims: CAR_TRIMS.length,
  shopItems: SHOP_MEGA_CATALOG.length,
  careerTracks2026: tracks2026,
  vacationsAndPilgrimages: ALL_VACATIONS.length,
  surgeries: ALL_SURGERIES.length,
  boards: PROFESSIONAL_LICENSES.length,
  languageExams: LANGUAGE_EXAMS.length,
  marketAssets: GLOBAL_MARKET_ASSETS.length,
  remittanceChannels: REMITTANCE_CHANNELS.length,
  marriageProfilesPreserved: Object.keys(FULL_MARRIAGE_PROFILES_7875 || {}).length,
  maxFxDrift: maxDrift
}));
