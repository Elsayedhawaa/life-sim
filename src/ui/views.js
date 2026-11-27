import { lenderCreditScore, familyNameCreditPoints, familyNameInterviewPoints } from '../systems/familyName.js';
import { discretionaryLock } from '../core/discretionary.js';
import { siblingCompanyLine } from '../systems/siblingCompanies.js';
import { isFortuneParent, askPreview, familyLedgerView, siblingStakeLine, siblingAssetsLine, parentAssetsLine, siblingEmployerLine } from '../systems/familyFortune.js';
import {courtshipMonthsApart} from '../systems/courtshipLife.js';
import{personalLoanGates}from'../systems/economyEngine.js';
import{renderHiring}from'../systems/companyHiring.js';
import{renderCustomers}from'../systems/companyCustomers.js';
import{renderCompliance}from'../systems/companyCompliance.js';
import{renderContracts}from'../systems/companyContracts.js';
import{renderLots}from'../systems/companyLots.js';
import{renderCompetition}from'../systems/companyCompetition.js';
import{renderNpcCompanyControls}from'../systems/companyNpcControls.js';
import{renderEstateReviews}from'../systems/companyEstateReview.js';
import{renderNpcCompanyEstates}from'../systems/companyEstate.js';
import{renderCompanyTrusts}from'../systems/companyTrust.js';
import{renderCompanyMarital}from'../systems/companyMarital.js';
import{renderBranches}from'../systems/companyBranches.js';
import{renderMigration}from '../systems/companyMigration.js';
import{renderFamilyRota}from '../systems/companyRota.js';
import{renderFamilyOwnership}from '../systems/companyOwnership.js';
import{renderEstateRecord}from '../systems/companyEstate.js';
import{renderDivorceShares}from'../systems/companyDivorceShares.js';
import{renderFamily}from'../systems/companyFamily.js';
import{operatingBase}from'../systems/companyOperatingContent.js';
import{renderEquipment}from'../systems/companyEquipment.js';
import{renderSpace}from'../systems/companySpace.js';
import{renderInputs}from '../systems/companyInputUI.js';
import{renderCatalog}from '../systems/companyCatalog.js';
import{renderOperating}from '../systems/companyOperatingContent.js';
import{renderCompany,companyOpenBlocker,companyOutOfStock}from '../systems/companyLifecycle.js';
import{renderTech}from '../systems/techStartup.js';
import{businessSector,businessIllustration,businessHistoryChart}from './businessVisuals.js';
import{shopCategoryIcon}from './shopVisuals.js';
import{civilClaimQuote}from '../systems/civilClaims.js';
import{retirementIncomePreview}from '../systems/usRetirement.js';
import{PEOPLE_REQUESTS,peopleRequestAmount}from '../systems/peopleAutonomy.js';
import{personMind,canContactPerson}from '../systems/personMind.js';
import{spouseMind,SPOUSE_DECISIONS,spouseRequestCost}from '../systems/spouseAutonomy.js';
import{flyingDutyStatus}from '../systems/dutyEligibility.js';
import {RURAL_CABIN} from '../data/ruralCabin.js';
import {hasCurrentLanguage} from '../data/languageQualifications.js';
import {ABROAD_LEVELS,ABROAD_SUBJECTS,abroadUniversities,studyAbroadQuote} from '../systems/studyAbroadPlanning.js';
import {propertyAreas,pricedPropertyArea,outdoorAnnualBudget,outdoorAreaSummary} from '../data/propertyAreas.js';
import {familyCoversUniversity,childSchoolQuote,childCourseQuote} from '../systems/educationFunding.js';
import {annualUniversityBudget,universityBudgetRange} from '../data/universityCosts.js';
import {degreeProgramFor,programsForCountry} from '../data/degreePrograms.js';
import {universitySectorLabel} from '../data/institutions.js';
import {LOCAL_PROPERTY_STYLES} from '../data/localPropertyStyles.js';
import {renderHomeTypeArt} from './homeTypeArt.js';
/* ============================================================================
   World Life Complete Edition — 7-Pillar Sub-Tabbed UI & 3D Scene Renderer
   100% of V1's Deep Catalogs + 50% Researched Expansion + 3D & BitLife Visuals.
   ========================================================================== */

import { MONTH_NAMES, FAMILY_TIERS, LIFE_AMBITIONS, computeNetWorthLocal, ensureExtendedState, liquidFundsLocal, JOURNAL_REACTIONS } from '../core/schema.js';
import { fitBannerToCountry } from './countryArt.js';
import { COUNTRIES, COUNTRY_IDS, getCountry, formatMoney } from '../data/countries.js';
import { entryDelta, entryCurrencyIsCurrent } from '../core/ledgerCurrency.js';
import {
  eraLocalCost,
  eraSalary,
  eraDepositRates,
  goldPricePerGram,
  convertCurrency,
  computeMonthlyNetPay,
  incomeTaxNote,
  isNoPersonalIncomeTaxCountry,
  inflationRate,
  contractRuleFor,
  vacationEntitlementDays, eraUsdCost,
  vacationRuleFor
} from '../data/economy.js';
import {
  MAJORS,
  EMPLOYERS,
  getSchoolsFor,
  getUniversitiesFor,
  getHousingFor,
  getHospitalsFor
} from '../data/institutions.js';
import { SCHOLARSHIPS, INTERNSHIPS, CLUBS, SCHOOL_TRACKS, TRACK_SYSTEM_INFO } from '../data/educationExtras.js';
import {
  GULF_ENTRY_CHANNELS,
  STUDY_ABROAD_PIPELINES,
  SKILLED_MIGRATION_RULES,
  getMarriageProfile
} from '../data/visasAndMarriage.js';
import {
  PROPERTY_UNITS,
  getPropertyUnits,
  FINISHING_TIERS,
  COMPOUNDS_BY_COUNTRY,
  NEIGHBORHOODS_BY_COUNTRY,
  LAND_PLOTS,
  PAYMENT_PLANS,
  HOUSEHOLD_STAFF_CATALOG,
  PROPERTY_DEV_SPECS
} from '../data/megaRealEstate.js';
import {
  CAR_TRIMS,
  CAR_COLORS,
  CARS_MEGA_CATALOG, carSoldInCountry,
  SHOP_MEGA_CATALOG,
  BNPL_PROVIDERS
} from '../data/megaCarsAndShop.js';
import {
  V1_BANKS,
  V1_CERTIFICATES,
  V1_CREDIT_CARDS,
  V1_LOAN_PRODUCTS,
  GLOBAL_MARKET_ASSETS,
  REMITTANCE_CHANNELS
} from '../data/megaFinanceAndMarkets.js';
import {
  PROFESSIONAL_LICENSES,
  LANGUAGE_EXAMS,
  V1_PARTTIME_JOBS,
  V1_CASH_JOBS,
  V1_CHILD_NURSERIES,
  V1_CHILD_ACTIVITIES,
  V1_MED_TESTS,
  V1_MED_MEDICATIONS,
  ALL_SURGERIES,
  V1_FERTILITY_TREATMENTS,
  ALL_VACATIONS,
  V1_ACTIVITIES,
  CIVIL_LAWSUITS,
  V1_CRIMES
} from '../data/megaCareerEduMedical.js';
import { generateContextualLine, visitTripCostLocal, giftableShopItems, cashGiftAmountLocal } from '../systems/soulEngine.js';
import { childOutingCostLocal } from '../systems/marriageFamilyEngine.js';
import { listAvailableJobs, listAllBusinessVentures, getMergedCareerTracks, describeJobOffer, jobEligibility, getJobContract, getLadderForJob, employerHealthCover, staffLoanTerms, staffTreatmentEligible, computeEndOfService, uniSupportsMajor, eligibleMajorsFor, examProjection, hasExamResult, tansikCutoffFor, scholarshipLockReason, internshipLockReason, schoolAffordability, universityAffordability, schoolSystemFor, trackSystemFor, trackSystemInfo, trackNeedsOwnSchool, cheapestSchoolForSystem } from '../systems/careerEducationEngine.js';
import { additionalSpousePath } from '../systems/marriageFamilyEngine.js';
import { actionPreviews, securitySummary } from '../systems/careerActions.js';
import { buildLegacySummary, computeLiveLegacyScore, legacyScoreReasons } from '../systems/healthDirectorEngine.js';
/* v2.13 Worker 1 — progress system + stakes dashboard (Timeline panel). */
import { getProgress, computeStakes } from '../systems/progressEngine.js';
import { getCurrentChapter, noteChapterChange, ambitionStatus, noteAmbitionOutcome } from '../systems/storyLibrary.js';
import { rentalMoveInQuote, childPocketMoneyMonthly, resolveCurrentHome } from '../systems/economyEngine.js';
import { migrateBusinesses, evaluateBusinessLaunch, computeWorkload, ventureViabilityWarningHtml, BUSINESS_FULL_TIME_HOURS, BUSINESS_PART_TIME_HOURS } from '../systems/businessEngine.js';
/* v2.14 — management capacity (W1), manager (W2), per-industry decisions
   (W3), buying + branches (W4), exits + cash (W5). The hard cap is gone:
   the limit is hours + manager salaries now, not a number. */
import { managementCapacityInfo, businessIsManaged } from '../systems/businessCapacity.js';
import { renderManagerSectionHtml, managerShortlist } from '../systems/businessManager.js';
import { renderDecisionsHtml } from '../systems/businessDecisions.js';
import { renderForSaleHtml } from '../systems/businessAcquisitions.js';
import { renderBranchesHtml } from '../systems/businessBranches.js';
import { renderBrandHtml, renderGroupCashLinesHtml, renderGroupSupplyLineHtml } from '../systems/businessGrowth.js';
import { renderStaffListHtml } from '../systems/businessRoles.js';
import { renderOperationsMenuHtml } from '../systems/businessOperations.js';
/* v2.18 W1 (§1) — real work inside the job: the Current Work card. */
import { renderCareerWorkHtml } from '../systems/careerWork.js';
import { SECOND_LOSS_KIND_WORDS } from '../systems/careerConsequences.js';
import { renderExitsHtml } from '../systems/businessExits.js';
/* v2.11 W3: premises link on the property card — one line only. */
import { businessUsingProperty, renderBusinessPremisesSection, businessLevelCap } from '../systems/businessPremises.js';
/* v2.15 W1 — landlord cards (named tenants, deposits, leases, damage,
   market) on the Real Estate tab. */
import { renderLandlordSectionHtml } from './propertyLandlord.js';
/* v2.15 W3 — social energy meter + drift warnings on the People tab. */
import { renderSocialEnergyHtml, renderDriftWarningHtml, socialEnergyCostLabel } from './socialEnergy.js';
/* v2.12 W6: haircut / outfit tables (priced choices with real effects). */
import { HAIRCUT_STYLES, OUTFIT_STYLES, activityAvailability } from '../systems/completeLifeSystems.js';
/* v2.11 merge: business card sections (staff + loan by W2, will by W4). */
import { renderBusinessLoanSection } from '../systems/businessLoans.js';
import { renderBusinessWillSection, renderWillHeirSection } from '../systems/businessLegacy.js';
import { isSeriousCondition, treatmentOptions, oddsInWords } from '../systems/mortalityModel.js';
import {
  surgeryEligibility, fertilityCostLocal, tripCostLocal, tripLeaveImpact, tripExecutionQuote,
  activityCostLocal,
  computeZakatDueLocal,
  computeChancenkartePoints,
  evaluateGig,
  PET_CATALOG,
  petStats,
  petFeedCostLocal,
  petVetCostLocal,
  getMacroEconomicRegime,
  WEEKLY_FOCUS_MODES,
  CONSULAR_TOURIST_VISAS,
  FACADE_PALETTE_OPTIONS,
  ROOM_SPECIALTY_REMODELS,
  furnishingOptions,
  postgradFee,
  postgradParentsCanPay
} from '../systems/completeLifeSystems.js';
import { icon } from './icons.js';
/* v2.15 W4 — the world & markets panel on the Finance tab. */
import { renderWorldMarketPanelHtml } from './worldEvents.js';
/* v2.15 W2 — career market (headhunters, dashboard, pension, mentor /
   rival) on the Career tab's current-job card. */
import { renderCareerMarketHtml } from './careerMarket.js';
/* v2.18 W2 — one source of truth for the numbers the player sees:
   businessLastMonthNet (the one folded P&L) and salaryNetFor (the
   settlement's own salary arithmetic). Every render site below reads
   these — no site recomputes a net. */
import { businessLastMonthNet, businessesLastMonthNet, salaryNetFor, financeSalaryLine } from '../systems/moneyTruth.js';
/* v2.12 Worker 3 — the one central disabled-button reason helper. Re-exported
   so the other v2.12 workers (and any render file) can use it too. */
import { lockReason } from './lockReason.js';
export { lockReason };
import {
  renderPortraitSvg,
  SKIN_PALETTES,
  HAIR_COLORS,
  IRIS_COLORS,
  FACE_SHAPES,
  HAIR_STYLES,
  BEARD_STYLES,
  EYEWEAR_STYLES,
  HEADWEAR_STYLES,
  WARDROBE_STYLES,
  INK_PORTRAIT_ARCHETYPES
} from './portraits.js';
import { renderEditorialSketchSvg, renderSocialConstellationSvg } from './editorialSketches.js';
import {
  renderPassportDocumentHtml,
  renderMarriageContractHtml,
  renderMonthlyCashflowSlipHtml
} from './documents.js';
import {
  renderBitlifePropertyShapeSvg,
  renderAllPropertyFloorsHtml,
  renderHome3dAndFloorplanHtml,
  renderCar3dTurntableHtml,
  renderCarShowroomSvg
} from './visualEngine3d.js';
import {
  furnishablePlanRooms,
  isPlanRoomFurnished,
  furnishedLabelFor,
  roomInfoMessage
} from './planRoomLookup.js';

export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ============================================================================
   v2.16 Worker 1 — LIGHT/DARK THEME. The saved theme is the single source
   of truth: localStorage key 'world_life_2_theme', 'light' | 'dark'.
   A new player starts in light mode — getSavedTheme() returns 'light'
   for anything missing, unknown or unreadable, so the game never opens
   dark by surprise. main.js applies the saved theme to #app (and <html>)
   at boot, before the first render, and re-renders on toggle; the header
   reads the same key so the toggle always marks the active theme.
   No filter/invert is used anywhere in this theme: dark mode redefines
   the colour variables, it does not restyle the light theme.
   ========================================================================== */
export const THEME_STORAGE_KEY = 'world_life_2_theme';
export function getSavedTheme() {
  try {
    if (typeof localStorage === 'undefined') return 'light';
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch (_) { return 'light'; }
}
export function saveTheme(theme) {
  const t = theme === 'dark' ? 'dark' : 'light';
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_STORAGE_KEY, t);
  } catch (_) {}
  return t;
}
/* Segmented Light / Dark control in the header (renderHudHtml): both
   labels always visible, the active one marked. */
function renderThemeToggleHtml() {
  const theme = getSavedTheme();
  return `
    <span class="theme-toggle" role="group" aria-label="Theme">
      <button type="button" class="theme-toggle-btn ${theme === 'light' ? 'active' : ''}" data-action="toggle-theme" data-theme="light" aria-pressed="${theme === 'light'}">Light</button>
      <button type="button" class="theme-toggle-btn ${theme === 'dark' ? 'active' : ''}" data-action="toggle-theme" data-theme="dark" aria-pressed="${theme === 'dark'}">Dark</button>
    </span>`;
}

function renderEditorialBannerHtml(imgFile, caption) {
  return `
    <div class="editorial-banner">
      <img src="assets/banners/${imgFile}" alt="${esc(caption)}" loading="eager">
      <span class="editorial-banner-caption">${esc(caption)}</span>
    </div>
  `;
}

// Country-level scenery, fictional illustrations rather than a claimed city/address.
export const COUNTRY_SCENES = {
  can:{since:1990,scene:'canada_toronto_neighborhood_ink.jpg'},
  deu:{since:1995,scene:'germany_berlin_neighborhood_ink.jpg'},
  usa:{since:1990,scene:'usa_chicago_neighborhood_ink.jpg'},
  gbr:{since:1990,scene:'uk_terraced_neighborhood_ink.jpg'},
  uae:{since:2010,scene:'uae_apartment_home_ink.jpg'},
  sau:{since:2005,scene:'saudi_family_home_ink.jpg'},
  egy:{since:1980,scene:'egypt_apartment_evening_ink.jpg'},
  jpn:{since:1990,scene:'japan_neighborhood_ink.jpg'}
};

export function countryLevelNarrative(text,S){
  let out=String(text??'');
  const entries=Object.values(COUNTRIES).flatMap(c=>(c.cities||[]).map(city=>[city,c.name]));
  if(S.city&&!entries.some(([city])=>city===S.city))entries.push([S.city,getCountry(S.country).name]);
  entries.sort((a,b)=>b[0].length-a[0].length);
  /* Only a place is rewritten. A city inside a proper name (an institution, employer or person: "Cairo University", "Cairo Steel", "American University in Cairo") stays whole,
     decided by shape rather than by a list of nouns: a city directly followed by another capitalised word is part of a name, and so is "<Capitalised word> in/of/at <City>" in mid-sentence. */
  const isCap=w=>/^\p{Lu}/u.test(w||'');
  for(const [city,country] of entries){
    const esc=city.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    out=out.replace(new RegExp(`(^|[^\\p{L}])${esc}(?![\\p{L}])`,'gu'),(m,pre,off,str)=>{
      const start=off+pre.length, after=str.slice(start+city.length);
      if(/^(?:['\u2019]s)?\s+[\p{Lu}&]/u.test(after.replace(/^,/,'\u0000'))&&!/^,/.test(after))return m;
      const before=str.slice(0,start);
      const pm=before.match(/(\p{L}[\p{L}.'&-]*)\s+(in|of|at)\s+$/u);
      if(pm){ const wb=before.slice(0,before.length-pm[0].length); const sentenceStart=!/\p{L}/u.test(wb.slice(-2).replace(/\s/g,''))||/[.!?:\u2014\u2013]\s*$/.test(wb)||wb.trim()===''; if(isCap(pm[1])&&!sentenceStart)return m; }
      return pre+country;
    });
  }
  /* "Istanbul, Turkey" became "Turkey, Turkey": keep one country name when the stored text already named it after the city. */
  for(const country of new Set(entries.map(e=>e[1]))){
    const esc=country.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    out=out.replace(new RegExp(`(${esc}),\\s*${esc}(?![\\p{L}])`,'gu'),'$1');
  }
  return out;
}

function pickDynamicBannerRaw(S, section = 'life', sub = '') {
  const c = String(S?.country || 'egy').toLowerCase();
  const month = Number(S?.month || 1);
  const age = Number(S?.player?.age ?? 22);
  const rot = (((Number(S?.turn || 0) * 2654435761) ^ (month * 374761393) ^ (Number(S?.year || 2000) * 668265263) ^ Math.trunc(Number(S?.seed || 17))) >>> 0) % 100003;

  const isMenaGulf = ['egy', 'sau', 'uae', 'qat', 'kwt', 'tur', 'mys'].includes(c);
  const isEastAsia = ['jpn', 'sgp', 'mys'].includes(c);
  const regionalSkyline = c === 'egy'
    ? (rot % 2 === 0 ? 'city_mena_cairo.jpg' : 'cairo_nile_felucca_ink.jpg')
    : (c === 'sau' || c === 'uae' || c === 'qat' || c === 'kwt')
    ? 'city_gulf_skyline.jpg'
    : c === 'che'
    ? 'switzerland_alps_lake_ink.jpg'
    : c === 'swe'
    ? 'sweden_stockholm_archipelago_ink.jpg'
    : c === 'tur'
    ? 'turkey_istanbul_bosphorus_ink.jpg'
    : isEastAsia
    ? 'east_asia_skyline_ink.jpg'
    : (month >= 9 && month <= 11 ? 'autumn_park_boulevard_ink.jpg' : 'city_europe_west.jpg');

  const scenery=COUNTRY_SCENES[c];
  if(scenery && ['life','people'].includes(section)) {
    return Number(S.year||2000)<scenery.since?'era_vintage_street_ink.jpg':scenery.scene;
  }
  if(section==='realestate') {
    const interiors={can:'canada_home_evening_ink.jpg',deu:'germany_flat_evening_ink.jpg',usa:'usa_apartment_evening_ink.jpg',uae:'uae_apartment_home_ink.jpg',sau:'saudi_family_home_ink.jpg'};
    if(interiors[c])return interiors[c];
    if(c==='gbr') {
      const shape=resolveCurrentHome(S)?.shape || S.housing?.currentShape || 'apartment';
      return ['studio','apartment','duplex','penthouse'].includes(shape)?'uk_flat_evening_ink.jpg':'uk_terraced_neighborhood_ink.jpg';
    }
  }
  if (c === 'egy' && section === 'realestate') {
    const selectedHome = resolveCurrentHome(S);
    const shape = selectedHome?.shape || S.housing?.currentShape || 'apartment';
    if (shape === 'chalet') return 'coastal_summer_chalet_ink.jpg';
    if (['villa','mansion','twin_house','townhouse'].includes(shape)) return 'home_villa_compound.jpg';
    return 'egypt_apartment_evening_ink.jpg';
  }
  if (c === 'jpn' && section === 'realestate') return 'tokyo_apartment_evening_ink.jpg';

  if (section === 'life') {
    if (S?.education?.degrees?.length && rot % 2 === 0) return 'graduation_ceremony_ink.jpg';
    if (S?.education?.university && rot % 3 === 0) return 'uni_campus_courtyard_ink.jpg';
    if (age < 13) {
      const childPool = ['life_stages_ink.jpg', 'family_kinship_ink.jpg', regionalSkyline];
      return childPool[rot % childPool.length];
    }
    if ((month === 7 || month === 8) && rot % 3 === 1) return rot % 2 === 0 ? 'coastal_summer_chalet_ink.jpg' : 'red_sea_beach_vacation_ink.jpg';
    if ((month === 3 || month === 9) && isMenaGulf && rot % 3 === 2) return 'ramadan_lantern_courtyard_ink.jpg';
    if (c === 'egy') {
      const egyPool = ['city_mena_cairo.jpg', 'cairo_nile_felucca_ink.jpg', 'ramadan_lantern_courtyard_ink.jpg', 'coastal_summer_chalet_ink.jpg'];
      return egyPool[rot % egyPool.length];
    }
    if (c === 'sau' || c === 'uae' || c === 'qat' || c === 'kwt') {
      const gulfPool = ['city_gulf_skyline.jpg', 'ramadan_lantern_courtyard_ink.jpg', 'home_villa_compound.jpg', 'pilgrimage_travel.jpg'];
      return gulfPool[rot % gulfPool.length];
    }
    if (c === 'che') {
      const chPool = ['switzerland_alps_lake_ink.jpg', 'switzerland_alps_lake_ink.jpg', 'autumn_park_boulevard_ink.jpg', 'uni_campus_courtyard_ink.jpg'];
      return chPool[rot % chPool.length];
    }
    if (c === 'swe') {
      const sePool = ['sweden_stockholm_archipelago_ink.jpg', 'sweden_stockholm_archipelago_ink.jpg', 'autumn_park_boulevard_ink.jpg', 'uni_campus_courtyard_ink.jpg'];
      return sePool[rot % sePool.length];
    }
    if (c === 'tur') {
      const trPool = ['turkey_istanbul_bosphorus_ink.jpg', 'turkey_istanbul_bosphorus_ink.jpg', 'ramadan_lantern_courtyard_ink.jpg', 'coastal_summer_chalet_ink.jpg'];
      return trPool[rot % trPool.length];
    }
    if (isEastAsia) {
      const eaPool = ['east_asia_skyline_ink.jpg', 'autumn_park_boulevard_ink.jpg', 'uni_campus_courtyard_ink.jpg'];
      return eaPool[rot % eaPool.length];
    }
    const westPool = ['city_europe_west.jpg', 'autumn_park_boulevard_ink.jpg', 'uni_campus_courtyard_ink.jpg', 'coastal_summer_chalet_ink.jpg'];
    return westPool[rot % westPool.length];
  }

  if (section === 'people') {
    if (sub === 'marriage') {
      const mPool = ['wedding_courtship_ink.jpg', 'wedding_courtship_ink.jpg', isMenaGulf ? 'ramadan_lantern_courtyard_ink.jpg' : 'autumn_park_boulevard_ink.jpg'];
      return mPool[rot % mPool.length];
    }
    if (sub === 'children') {
      const chPool = ['life_stages_ink.jpg', 'family_kinship_ink.jpg', 'newborn_family_ink.jpg', 'uni_campus_courtyard_ink.jpg'];
      return chPool[rot % chPool.length];
    }
    const pPool = ['family_kinship_ink.jpg', isMenaGulf ? 'ramadan_lantern_courtyard_ink.jpg' : 'autumn_park_boulevard_ink.jpg', c === 'egy' ? 'cairo_nile_felucca_ink.jpg' : 'life_stages_ink.jpg'];
    return pPool[rot % pPool.length];
  }

  if (section === 'work') {
    if (sub === 'boards' || age < 21) {
      if (S?.education?.degrees?.length) return rot % 2 === 0 ? 'graduation_ceremony_ink.jpg' : 'uni_campus_courtyard_ink.jpg';
      return rot % 2 === 0 ? 'uni_campus_courtyard_ink.jpg' : 'career_enterprise_ink.jpg';
    }
    if (S?.career?.business) return 'business_office_ink.jpg';
    if (S?.career?.job?.track === 'medicine' || S?.career?.job?.track === 'law') {
      return rot % 2 === 0 ? 'medical_courts_ink.jpg' : 'career_enterprise_ink.jpg';
    }
    const wPool = ['career_enterprise_ink.jpg', 'business_office_ink.jpg', regionalSkyline, 'uni_campus_courtyard_ink.jpg'];
    return wPool[rot % wPool.length];
  }

  if (section === 'realestate') {
    if (sub === 'compounds') {
      const cPool = ['home_villa_compound.jpg', 'architecture_studio_ink.jpg', 'coastal_summer_chalet_ink.jpg'];
      return cPool[rot % cPool.length];
    }
    return rot % 2 === 0 ? 'architecture_studio_ink.jpg' : 'home_villa_compound.jpg';
  }

  if (section === 'finance') {
    const fPool = ['finance_vault_ink.jpg', 'finance_vault_ink.jpg', regionalSkyline];
    return fPool[rot % fPool.length];
  }

  if (section === 'lifestyle') {
    if (sub === 'travel') {
      if (month === 12 && rot % 2 === 0) return 'winter_city_ink.jpg';
      const trPool = ['pilgrimage_travel.jpg', 'airport_departure_terminal_ink.jpg', 'coastal_summer_chalet_ink.jpg', 'desert_road_trip_ink.jpg', 'red_sea_beach_vacation_ink.jpg', 'winter_city_ink.jpg'];
      return trPool[rot % trPool.length];
    }
    if (sub === 'appearance') return rot % 2 === 0 ? 'life_stages_ink.jpg' : 'family_kinship_ink.jpg';
    if (sub === 'pets') return rot % 2 === 0 ? 'family_kinship_ink.jpg' : 'autumn_park_boulevard_ink.jpg';
    if (sub === 'shop') return rot % 2 === 0 ? 'finance_vault_ink.jpg' : regionalSkyline;
    if (sub === 'medical' || sub === 'legal') return 'medical_courts_ink.jpg';
    return rot % 3 === 0 ? regionalSkyline : 'showroom_automotive.jpg';
  }

  if (section === 'world') {
    if (sub === 'gulf') {
      const gPool = ['city_gulf_skyline.jpg', 'passport_world_ink.jpg', 'airport_departure_terminal_ink.jpg'];
      return gPool[rot % gPool.length];
    }
    if (sub === 'global') {
      const glPool = ['airport_departure_terminal_ink.jpg', 'passport_world_ink.jpg', 'east_asia_skyline_ink.jpg', 'city_europe_west.jpg'];
      return glPool[rot % glPool.length];
    }
    return rot % 2 === 0 ? 'passport_world_ink.jpg' : 'airport_departure_terminal_ink.jpg';
  }

  return regionalSkyline;
}

export function pickDynamicBanner(S, section = 'life', sub = '') {
  const raw = pickDynamicBannerRaw(S, section, sub);
  const c = String(S?.country || 'egy').toLowerCase();
  const sc = COUNTRY_SCENES[c];
  const own = sc && Number(S?.year || 2000) >= sc.since ? sc.scene : null;
  const muslim = ['muslim', 'islam'].includes(String(S?.player?.religion || '').toLowerCase());
  return fitBannerToCountry(raw, c, section, own, Number(S?.turn || 0) + Number(S?.month || 0), { muslim });
}

/* Counts computed from the live data, never hand-typed: merged career tracks
   for the year, and distinct employer names in the EMPLOYERS table. */
function countEmployerNames() {
  const names = new Set();
  for (const byCountry of Object.values(EMPLOYERS || {})) {
    for (const list of Object.values(byCountry || {})) {
      for (const n of list || []) names.add(n);
    }
  }
  return names.size;
}


function renderSubtabs(tabId, subtabs, currentSub) {
  return `
    <div class="subtab-bar" role="tablist">
      ${subtabs.map(st => `
        <button type="button" class="subtab-pill ${currentSub === st.id ? 'active' : ''}" data-action="switch-subtab" data-tab="${tabId}" data-sub="${st.id}">
          ${esc(st.label)}
        </button>
      `).join('')}
    </div>
  `;
}

export function renderHudHtml(S, flashKeys) {
  ensureExtendedState(S);
  const p = S.player;
  /* Habit feedback: keys of stats that just changed (health, happiness,
     smarts, stress) — those bars render with a flash animation. */
  const flashSet = Array.isArray(flashKeys) && flashKeys.length ? new Set(flashKeys) : null;
  const cObj = getCountry(S.country);
  const netWorth = computeNetWorthLocal(S);
  const dateStr = S.pacing === 'monthly'
    ? `${MONTH_NAMES[(S.month - 1) % 12].slice(0, 3)} ${S.year}`
    : `Year ${S.year}`;

  const statusPill = S.legal.military.status === 'active_duty'
    ? `Military Service (${S.legal.military.monthsRemaining}m left)`
    : S.career.employed && S.career.job
    ? `${S.career.job.title} · ${S.career.job.employer}`
    : S.career.business
    ? `Founder · ${S.career.business.name}`
    : S.education.university
    ? `Student · ${S.education.university.name}`
    : S.player.age < 18
    ? (S.player.age < 6 ? 'Before school' : `${S.education.schoolName || 'School Student'}`)
    : S.career.retired
    ? 'Retired'
    : 'Seeking Next Step';

  const calmScore = Math.max(0, 100 - (p.vitals.stress || 0));
  const macro = getMacroEconomicRegime(S.country, S.year);

  return `
    <header class="hud-card">
      <div class="hud-top">
        <div class="hud-identity">
          ${renderPortraitSvg(p, 64, { isMilitaryActive: S.legal.military.status === 'active_duty' })}
          <div class="hud-identity-text">
            <h1>${esc(p.fullName)} ${S.generation > 1 ? `<span class="hud-pill">Gen ${S.generation}</span>` : ''} ${S.credentials?.hajjCompleted ? `<span class="hud-pill" style="background:#EAF6F0;color:#186A47">Hajj</span>` : ''}</h1>
            <div class="hud-subline">
              <span class="hud-pill">${esc(cObj.flagCode)} ${esc(cObj.name)}</span>
              <span class="mono">Age ${p.age} · ${esc(dateStr)}</span>
              <span>${esc(statusPill)}</span>
            </div>
            <div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:6px;align-items:center">
              <span class="hud-pill" style="font-size:0.71rem;background:#FAF4EA">Macro: ${esc(macro.label)}</span>
              <button type="button" class="btn btn-sm" style="padding:2px 8px;font-size:0.71rem" data-action="open-appearance-studio">✎ Face &amp; Tailor</button>
              ${/* v2.16 W1 — light/dark toggle, in the header so it is on the main page on every tab. */ renderThemeToggleHtml()}
            </div>
          </div>
        </div>

        <div class="hud-wealth-box">
          ${(S.player.age >= 16 || S.money.cash !== 0 || netWorth !== 0) ? `
          <div class="hud-wealth-label">Liquid Cash / Net Worth</div>
          <div class="hud-wealth-val mono ${S.money.cash < 0 ? 'text-bad' : 'text-good'}">${esc(formatMoney(S.money.cash, S.country, true))}</div>
          <div class="muted mono" style="font-size:0.76rem">Net worth: ${esc(formatMoney(netWorth, S.country, true))}</div>
          ` : ''}
          <button class="btn btn-sm" style="margin-top:6px" data-action="open-new-life">${icon('refresh', 13)} New Life</button>
        </div>
      </div>

      <div class="hud-vitals">
        ${vitalBarHtml('Health', p.vitals.health, '#186A47', flashSet && flashSet.has('health'))}
        ${vitalBarHtml('Happiness', p.vitals.happiness, '#C84B31', flashSet && flashSet.has('happiness'))}
        ${vitalBarHtml('Smarts', p.vitals.smarts, '#1D3557', flashSet && flashSet.has('smarts'))}
        ${vitalBarHtml('Peace of Mind', calmScore, '#A97115', flashSet && flashSet.has('stress'))}
      </div>
    </header>
  `;
}

function vitalBarHtml(label, val, color, flash) {
  const v = Math.max(0, Math.min(100, Math.round(Number(val) || 0)));
  return `
    <div class="vital-item${flash ? ' vital-flash' : ''}">
      <div class="vital-head"><span>${esc(label)}</span><span class="mono">${v}%</span></div>
      <div class="vital-track"><div class="vital-fill" style="width:${v}%;background:${color}"></div></div>
    </div>
  `;
}

/* Age-appropriate surface: a young child is not shown the job market, banking, car showroom, shop or courts. Nothing is deleted; each appears at its age. */
const TAB_MIN_AGE = { work: 14, finance: 14 };
const LIFESTYLE_SUB_MIN_AGE = { cars: 18, shop: 14, legal: 16 };
export function tabVisibleForAge(tabId, age) { return (age ?? 0) >= (TAB_MIN_AGE[tabId] || 0); }

export function renderNavTabsHtml(S, activeTab) {
  ensureExtendedState(S);
  const openPromises = Object.values(S.people).reduce(
    (sum, p) => sum + (p && p.alive && p.rel?.promises ? p.rel.promises.filter(pr => pr.status === 'open').length : 0),
    0
  );
  const expiredPass = S.legal.passports.every(p => p.expiresYear <= S.year);
  const visaAlert = (S.player?.age ?? 0) >= 18 && (expiredPass || ['grace_period', 'undocumented'].includes(S.legal.residency.kind));
  const buildActive = (S.housing.lands || []).some(l => !!l.buildProject);

  const tabs = [
    { id: 'life',       label: 'Timeline',    iconName: 'life',       badge: S.activeScene ? '!' : '' },
    { id: 'education',  label: 'Education',   iconName: 'graduation', badge: '' },
    { id: 'people',     label: 'People',      iconName: 'people',     badge: openPromises > 0 ? String(openPromises) : '' },
    { id: 'work',       label: 'Career',      iconName: 'work',       badge: '' },
    { id: 'realestate', label: (S.player?.age ?? 0) < 18 ? 'Home' : 'Real Estate', iconName: 'realestate', badge: buildActive ? '3D' : '' },
    { id: 'finance',    label: 'Finance',     iconName: 'finance',    badge: S.money.cash < 0 ? '!' : '' },
    { id: 'lifestyle',  label: 'Lifestyle',   iconName: 'lifestyle',  badge: '' },
    { id: 'world',      label: 'Passport',    iconName: 'world',      badge: visaAlert ? '!' : '' }
  ].filter(tb => tabVisibleForAge(tb.id, S.player?.age));

  const navArt = {
    life: 'life_stages_ink.jpg',
    education: 'uni_campus_courtyard_ink.jpg',
    people: 'family_kinship_ink.jpg',
    work: 'career_enterprise_ink.jpg',
    realestate: 'architecture_studio_ink.jpg',
    finance: 'finance_vault_ink.jpg',
    lifestyle: 'family_hearth_home_ink.jpg',
    world: 'passport_world_ink.jpg'
  };
  return `
    <nav class="nav-tabs nav-tabs-illustrated" aria-label="Primary sections">
      ${tabs.map(t => `
        <button type="button" class="nav-tab-btn ${activeTab === t.id ? 'active' : ''}" data-action="switch-tab" data-tab="${t.id}">
          <img class="nav-tile-art" src="assets/banners/${esc(navArt[t.id])}" alt="" width="128" height="62" loading="eager">
          <span>${t.label}</span>
          ${t.badge ? `<span class="tab-badge">${t.badge}</span>` : ''}
        </button>
      `).join('')}
    </nav>
  `;
}

/* ============================================================================
   TAB 1: TIMELINE, DAILY ACTIVITIES, GOALS & MEMOIR JOURNAL
   ========================================================================== */

/* v2.12 — journal filter types. A journal entry's stored `category` is
   mapped onto one of these six types; categories that do not belong to any
   of them (life, milestone, lifestyle, friends, housing, …) are NOT forced
   into a wrong type — they fall under "Other", labelled as such. */
export const JOURNAL_FILTER_TYPES = [
  { id: 'all', label: 'All moments' },
  { id: 'family', label: 'Family' },
  { id: 'money', label: 'Money' },
  { id: 'health', label: 'Health' },
  { id: 'career', label: 'Career' },
  { id: 'business', label: 'Business' },
  { id: 'world', label: 'World' },
  { id: 'other', label: 'Other' }
];

const JOURNAL_CATEGORY_MAP = {
  family: ['family', 'relationship', 'marriage', 'children'],
  money: ['money', 'bank', 'investment'],
  health: ['health'],
  career: ['career', 'school', 'work'],
  business: ['business'],
  world: ['world', 'visa']
};

export function journalFilterCategory(entry) {
  const cat = String((entry && entry.category) || '').toLowerCase();
  for (const [type, cats] of Object.entries(JOURNAL_CATEGORY_MAP)) {
    if (cats.includes(cat)) return type;
  }
  return 'other';
}

/* v2.12 — pure journal filtering, shared by the render and the tests.
   type: one of JOURNAL_FILTER_TYPES (or 'all'); query: a word matched
   against the entry text (case-insensitive); year: a year number, or 'all'. */
export function applyJournalFilters(entries, { type = 'all', query = '', year = 'all' } = {}) {
  const q = String(query || '').trim().toLowerCase();
  const y = year === 'all' || year == null || year === '' ? 'all' : String(year);
  return (entries || []).filter(e => {
    if (!e) return false;
    if (type && type !== 'all' && journalFilterCategory(e) !== type) return false;
    if (q && !String(e.text || '').toLowerCase().includes(q)) return false;
    if (y !== 'all' && String(e.year) !== y) return false;
    return true;
  });
}

export function renderLifeTabHtml(S, uiState = {}) {
  ensureExtendedState(S);
  const cObj = getCountry(S.country);

  let topHtml = '';
  if (S.gameOver) {
    topHtml = renderLegacyScreenHtml(S);
  } else if (S.activeScene) {
    topHtml = renderActiveSceneHtml(S);
  }

  /* Quick Daily Routine & Spiritual / Zakat Strip */
  const zakat = S.player.age >= 18 && ['muslim', 'islam'].includes(String(S.player.religion || '').toLowerCase()) ? computeZakatDueLocal(S) : { eligible: false, due: 0 };
  /* Habits the character is too young for are not listed at all (no "Needs age N" chips). Underlying data is untouched; they appear when the age is reached. */
  const quickActs = (V1_ACTIVITIES || []).slice(0, 5).filter(a => activityAvailability(S, a).locked !== 'age');
  const routineHtml = (!S.gameOver && (quickActs.length > 0 || S.player.age >= 12 || zakat.eligible)) ? `
    <div class="card">
      <div class="section-head">
        <h3>${icon('heart', 17)} Daily Routines & Habits</h3>
        <span class="muted">Looks: <strong class="mono">${Math.round(S.player.vitals.looks || 65)}%</strong> · Reputation: <strong class="mono">${Math.round(S.reputation || 50)}/100</strong></span>
      </div>
      ${S.pacing === 'yearly' ? '<p class="habit-pacing-hint">Childhood moves a year at a time. Each habit counts once for the year, as a summary of the year, not one single session.</p>' : ''}
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${quickActs.map(a => `
          <button type="button" class="btn btn-sm habit-btn" data-action="do-activity" data-id="${esc(a.id)}" ${activityAvailability(S, a).ok ? '' : 'disabled'}>
            ${esc(a.id === 'jog' && S.player.age < 10 ? 'Play outside' : (a.label || a.name))}${activityAvailability(S, a).ok ? '' : lockReason(activityAvailability(S, a).reason, '')}
            <span class="muted"> · ${S.player.age < 18 && activityCostLocal(S,a)>0 ? `${esc(formatMoney(activityCostLocal(S,a),S.country))} from living parents’ savings` : activityCostLocal(S, a) > 0 ? esc(formatMoney(activityCostLocal(S, a), S.country)) : 'Free'}</span>
          </button>
        `).join('')}
        ${(zakat.eligible && S.credentials.zakatLastYearPaid !== S.year) ? `
          <button type="button" class="btn btn-primary btn-sm" data-action="pay-zakat">
            Pay 2.5% Zakat (${esc(formatMoney(zakat.due, S.country, true))})
          </button>
        ` : ''}
      </div>
      <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line-soft);display:flex;flex-wrap:wrap;gap:6px;align-items:center">
        <span class="hud-pill">Charisma <strong>${Math.round(S.skills?.charisma || 30)}</strong></span>
        ${S.player.age >= 12 ? `<span class="hud-pill">Financial IQ <strong>${Math.round(S.skills?.financialIq || 25)}</strong></span>`: ''}
        <span class="hud-pill">Fitness <strong>${Math.round(S.skills?.fitness || 45)}</strong></span>
        <span class="hud-pill">Creativity <strong>${Math.round(S.skills?.creativity || 30)}</strong></span>
        ${S.player.age >= 12 ? `<span class="hud-pill">Network <strong>${Math.round(S.skills?.wasta || 15)}</strong></span>`: ''}
        ${S.player.age >= 12 ? `<span class="muted" style="font-size:0.75rem;margin-left:auto">Values — Integrity: <strong>${Math.round(S.values?.integrity || 60)}</strong> · Family: <strong>${Math.round(S.values?.familyDevotion || 65)}</strong> · Ambition: <strong>${Math.round(S.values?.ambitionDrive || 55)}</strong></span>` : ''}
      </div>

      ${S.player.age >= 16 ? `
        <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line-soft)">
          <div class="muted" style="font-size:0.76rem;margin-bottom:5px"><strong>Weekly 112-Hour Waking Rhythm:</strong> Shapes burnout, career velocity, longevity &amp; family warmth each year</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px">
            ${WEEKLY_FOCUS_MODES.map(fm => `
              <button type="button" class="btn btn-sm ${(S.timeBudget?.focus || 'balanced') === fm.id ? 'btn-navy' : ''}" data-action="set-time-focus" data-id="${fm.id}" title="${esc(fm.desc)}">
                ${esc(fm.label.split('(')[0].trim())}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  ` : '';

  /* v2.12 — journal controls: filter by type, search by word, jump to a
     year. The filter/search/year live in uiState (session-only); reactions
     are data on the entry itself (see setJournalReaction in schema.js). */
  const jType = uiState.journalType || 'all';
  const jQueryRaw = String(uiState.journalQuery || '');
  const jYear = uiState.journalYear == null || uiState.journalYear === '' ? 'all' : String(uiState.journalYear);
  const journalYears = [...new Set((S.journal || []).map(e => e.year).filter(y => y != null))].sort((a, b) => b - a);
  const filteredJournal = applyJournalFilters(S.journal || [], { type: jType, query: jQueryRaw, year: jYear });
  const journalFiltered = jType !== 'all' || jQueryRaw.trim() !== '' || jYear !== 'all';

  const groups = [];
  let lastKey = null;
  for (const entry of filteredJournal.slice(0, 140)) {
    const k = `${entry.year}_${entry.age}`;
    if (k !== lastKey) {
      groups.push({ year: entry.year, age: entry.age, items: [] });
      lastKey = k;
    }
    groups[groups.length - 1].items.push(entry);
  }

  const journalHtml = `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('life', 18)} Life Journal</h2>
        <span class="muted mono">${journalFiltered ? `${filteredJournal.length} of ${S.journal.length} moments shown` : `${S.journal.length} moments recorded`}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px" role="group" aria-label="Filter journal by type">
        ${JOURNAL_FILTER_TYPES.map(f => `
          <button type="button" class="btn btn-sm ${jType === f.id ? 'btn-navy' : ''}" data-action="set-journal-filter" data-filter="${f.id}">
            ${esc(f.label)}
          </button>
        `).join('')}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;align-items:center">
        <input type="text" class="text-input" style="flex:1;min-width:160px" placeholder="Search your journal…" value="${esc(jQueryRaw)}" data-filter="journalQuery" aria-label="Search journal" />
        <label class="muted" style="font-size:0.8rem">Jump to year
          <select data-filter="journalYear" aria-label="Jump to year" style="margin-left:4px">
            <option value="all" ${jYear === 'all' ? 'selected' : ''}>All years</option>
            ${journalYears.map(y => `<option value="${y}" ${jYear === String(y) ? 'selected' : ''}>${y}</option>`).join('')}
          </select>
        </label>
        ${journalFiltered ? `
          <button type="button" class="btn btn-sm" data-action="set-journal-filter" data-filter="all">Clear filters</button>
        ` : ''}
      </div>
      ${filteredJournal.length === 0 ? `
        <div class="muted" style="padding:8px 0">No moments match this filter yet — try another type, word or year.</div>
      ` : ''}
      ${groups.map(g => `
        <div class="journal-year-group">
          <div class="journal-year-head mono">Age ${g.age} · ${g.year}</div>
          ${g.items.map(it => `
            <div class="journal-entry cat-${esc(it.category || 'life')}">
              ${it.month ? `<span class="muted mono" style="font-size:0.75rem">${MONTH_NAMES[(it.month - 1) % 12].slice(0, 3)} · </span>` : ''}
              ${esc(countryLevelNarrative(it.text,S))}
              <span style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;align-items:center">
                ${JOURNAL_REACTIONS.map(r => `
                  <button type="button" class="btn btn-sm ${it.reaction === r ? 'btn-navy' : ''}" data-action="journal-react" data-id="${esc(it.id || '')}" data-reaction="${r}">${r}</button>
                `).join('')}
                ${it.reaction ? `<span class="muted" style="font-size:0.78rem">You felt: ${esc(it.reaction)}</span>` : ''}
              </span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;

  const hist = S.telemetryHistory || [];
  let trajectoryHtml = '';
  if (hist.length >= 2) {
    const wSvg = 760, hSvg = 104, padX = 28, padY = 14;
    const minNW = Math.min(0, ...hist.map(h => h.netWorth));
    const maxNW = Math.max(1000, ...hist.map(h => h.netWorth));
    const clamp01 = v => Math.max(0, Math.min(1, v));
    const polyFor = (fn) => hist.map((pt, idx) => {
      const x = (padX + (idx / (hist.length - 1)) * (wSvg - padX * 2)).toFixed(1);
      const y = (hSvg - padY - clamp01(fn(pt)) * (hSvg - padY * 2)).toFixed(1);
      return `${x},${y}`;
    }).join(' ');
    trajectoryHtml = `
      <div class="card">
        <div class="section-head">
          <h3>Multi-Decade 4D Life &amp; Estate Trajectory (Ages ${hist[0].age}–${hist[hist.length - 1].age})</h3>
          <span class="muted mono" style="font-size:0.74rem">
            <span style="color:var(--chart-green)">■ Vitality</span> ·
            <span style="color:var(--chart-navy)">■ Intellect</span> ·
            <span style="color:var(--chart-terracotta)">■ Kinship</span> ·
            <span style="color:var(--chart-gold)">■ Net Worth</span>
          </span>
        </div>
        <svg viewBox="0 0 ${wSvg} ${hSvg}" width="100%" height="96" role="img" aria-label="Life Trajectory Chart" style="background:var(--bg-chart);border:1px solid var(--line-soft);border-radius:8px;display:block">
          <line x1="${padX}" y1="${hSvg / 2}" x2="${wSvg - padX}" y2="${hSvg / 2}" style="stroke:var(--chart-grid)" stroke-dasharray="4 3"/>
          <polyline fill="none" style="stroke:var(--chart-green)" stroke-width="1.8" points="${polyFor(p => p.vitality / 100)}"/>
          <polyline fill="none" style="stroke:var(--chart-navy)" stroke-width="1.8" points="${polyFor(p => p.intellect / 100)}"/>
          <polyline fill="none" style="stroke:var(--chart-terracotta)" stroke-width="1.8" points="${polyFor(p => p.kinship / 100)}"/>
          <polyline fill="none" style="stroke:var(--chart-gold)" stroke-width="2.2" stroke-dasharray="4 2" points="${polyFor(p => (p.netWorth - minNW) / Math.max(1, maxNW - minNW))}"/>
        </svg>
      </div>
    `;
  }

  const timelineBanner = pickDynamicBanner(S, 'life');
  /* v2.10 — the Timeline is headed by the current chapter, not a month
     label. The chapter is derived from live state every render, and a
     change writes one milestone journal line (noteChapterChange). */
  const chapter = getCurrentChapter(S);
  noteChapterChange(S, chapter);
  const seasonLabel = chapter.name;
  const bannerHtml = !S.gameOver
    ? renderEditorialBannerHtml(timelineBanner, `${cObj.name} · ${S.year} · ${eraNameForYear(S.year)} (${seasonLabel})`)
    : '';
  const chapterHtml = !S.gameOver ? `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('life', 18)} ${esc(chapter.name)}</h2>
        <span class="muted mono">Age ${S.player.age}</span>
      </div>
      <div style="font-size:0.9rem">${esc(chapter.meaning)}</div>
      <div style="margin-top:8px">
        ${chapter.beats.map(b => `
          <div style="font-size:0.85rem;padding:2px 0">${b.state === 'done' ? '✓' : '○'} ${esc(countryLevelNarrative(b.text,S))}</div>
        `).join('')}
      </div>
    </div>
  ` : '';
  /* v2.18 W2 — "Last month at a glance" on the Timeline: the salary
     net and each business's last-month net, read from the one source
     of truth (salaryNetFor / businessLastMonthNet) the Career and
     Finance tabs read. The Timeline used to never state the business
     net at all, so the three screens could not be compared. */
  const glanceHtml = (!S.gameOver && S.player.age >= 18) ? (() => {
    const sal = salaryNetFor(S);
    const bizNet = businessesLastMonthNet(S);
    if (!sal.hasJob && !bizNet.perBusiness.length) return '';
    const salLine = sal.hasJob
      ? (sal.withheld
        ? `<span>Salary: <strong class="mono" data-salary-net="0">no pay — withheld</strong></span>`
        : `<span>Salary take-home last month: <strong class="mono" data-salary-net="${sal.net}">${esc(formatMoney(sal.net, S.country))}</strong>/mo</span>`)
      : '';
    const bizLine = bizNet.settledCount
      ? `<span>Businesses last month: ${bizNet.perBusiness.filter(b => b.hasPL).map(b => `${esc(b.name)} net <strong class="mono" data-biz-net="${b.net}" data-biz-name="${esc(b.name)}">${esc(formatMoney(b.net, S.country))}</strong>`).join(' · ')}</span>`
      : (bizNet.perBusiness.length ? '<span>Businesses: no month settled yet.</span>' : '');
    return `
    <div class="card">
      <div class="section-head"><h3>Last Month at a Glance</h3><span class="muted"></span></div>
      <div class="muted" style="display:flex;flex-wrap:wrap;gap:14px">${salLine}${bizLine}</div>
    </div>`;
  })() : '';
  if (S.activeScene) {
    return `<div class="decision-focus">${topHtml}<p class="decision-pause-note">Choose a response before advancing your life. You can still check the other tabs.</p><details class="decision-background"><summary>Your life at a glance</summary>${chapterHtml}${glanceHtml}</details></div>`;
  }
  return `${bannerHtml}${topHtml}${chapterHtml}${routineHtml}${glanceHtml}${renderGoalsCardHtml(S)}${renderProgressPanelHtml(S)}${renderStakesDashboardHtml(S)}${trajectoryHtml}${journalHtml}`;
}

/* v2.13 Worker 1 — Progress panel. Shows the level, the XP progress to
   the next level, the next milestone (and what would earn it, in plain
   words), and every achievement earned with the date it was earned. The
   Legacy Score shown here is the SAME live number as the goals card
   above (computeLiveLegacyScore); the reasons behind it live only in
   that card, not twice (v2.19 W5). Dates are when the game first noticed each
   milestone: achievements already true on an old save are dated to when
   they were first noticed, never backdated. */
function renderProgressPanelHtml(S) {
  if (S.gameOver || (S.player?.age ?? 0) < ADULT_PANEL_MIN_AGE) return '';
  /* v2.13 coordinator fix — renders must be READ-ONLY. evaluateProgress()
     used to run here, and granting an achievement writes a journal line,
     which consumes S.seq; every person created after that render then got
     an id one higher, and npcBondDriftAndDivorce compares spouse ids as
     STRINGS ('p_4' > 'p_39' but 'p_4' < 'p_40'), so the drift ran for a
     different partner and the NPC stream shifted — one render changed
     which NPC baby was born. Progress is evaluated on real actions only
     (main.js hooks: every action, advance, fast-forward, scene choice);
     this panel only reads it via getProgress(). */
  const prog = getProgress(S);
  const score = computeLiveLegacyScore(S);
  const barPct = prog.nextThreshold == null ? 100
    : Math.max(0, Math.min(100, Math.round(100 * (prog.xp - prog.levelBase) / Math.max(1, prog.nextThreshold - prog.levelBase))));
  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h3>${icon('life', 17)} Your Progress</h3>
        <span class="hud-pill mono">Level ${prog.level} · Legacy Score: ${score}/100</span>
      </div>
      <div style="font-size:0.85rem;margin-bottom:4px"><strong>${prog.xp} XP</strong>${prog.xpToNext == null ? ' — highest level reached' : ` — ${prog.xpToNext} XP to Level ${prog.level + 1} (${prog.nextThreshold} XP)`}</div>
      <div style="height:8px;background:var(--line-soft);border-radius:4px;margin-bottom:10px;overflow:hidden">
        <div style="height:100%;width:${barPct}%;background:var(--brand-emerald);border-radius:4px"></div>
      </div>
      ${prog.next ? `
        <div style="font-size:0.85rem;margin-bottom:8px"><strong>Next milestone: ${esc(prog.next.label)}</strong> (+${prog.next.xp} XP) — ${esc(prog.next.desc)}</div>
      ` : `
        <div style="font-size:0.85rem;margin-bottom:8px"><strong>Every milestone earned.</strong></div>
      `}
      <div style="font-size:0.85rem;margin-bottom:4px"><strong>Milestones earned (${prog.earned.length}/${prog.total}):</strong></div>
      ${prog.earned.length === 0 ? `
        <div class="muted" style="font-size:0.82rem;margin-bottom:8px">No milestones earned yet — your first job, first home or first finished goal will be the first.</div>
      ` : prog.earned.map(a => `
        <div style="font-size:0.82rem;padding:1px 0">✓ ${esc(a.label)} — ${esc(MONTH_NAMES[((a.month || 1) - 1) % 12])} ${a.year} (+${a.xp} XP)</div>
      `).join('')}
      ${/* v2.19 W5 — the "Why your Legacy Score is" reasons used to print
             here AND in the Life Goals card above, word for word. The
             goals card owns the reasons now; this panel keeps the live
             score in its header and points up, instead of repeating
             the whole list. */''}

      <div class="muted" style="font-size:0.76rem;margin-top:8px">Dates are when the game first noticed each milestone — milestones already earned before this panel existed are dated to then, not backdated.</div>
    </div>
  `;
}

/* v2.13 Worker 1 — Stakes dashboard. Every stake comes from a real
   record (loans, instalments, businesses, the marriage, parents' and
   children's health, untreated conditions, checkups). Nothing is
   invented: with no real stake the card says so plainly. */
function renderStakesDashboardHtml(S) {
  if (S.gameOver) return '';
  const stakes = computeStakes(S);
  if (stakes.length === 0) return ''; /* an empty "nothing at risk" card is boilerplate */
  const order = ['Money', 'Relationships', 'Health', 'Business'];
  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h3>${icon('life', 17)} What Is At Stake Right Now</h3>
        <span class="muted mono">${stakes.length === 0 ? 'Nothing at risk' : `${stakes.length} stake${stakes.length > 1 ? 's' : ''}`}</span>
      </div>
      ${stakes.length === 0 ? `
        <div class="muted" style="font-size:0.9rem">Nothing is at risk right now.</div>
      ` : order.filter(sec => stakes.some(s => s.section === sec)).map(sec => `
        <div style="margin-bottom:8px">
          <div style="font-size:0.85rem;margin-bottom:4px"><strong>${esc(sec)}</strong></div>
          ${stakes.filter(s => s.section === sec).map(s => `
            <div style="font-size:0.85rem;padding:4px 0;border-top:1px dashed var(--line-soft)">
              <div><strong>${esc(s.title)}</strong></div>
              <div>${esc(s.detail)}</div>
              <div class="muted" style="font-size:0.82rem">If it goes wrong: ${esc(s.consequence)}</div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
  `;
}

/* v2.9 (B3) — S.goals was written and never shown. The Timeline now renders
   every goal with live progress, plus the Legacy Score while still alive
   (the same score the death summary computes). */
function goalProgressDetail(S, g) {
  const cObj = getCountry(S.country);
  const netWorth = computeNetWorthLocal(S);
  const closeCircle = Object.values(S.people).filter(p => p && p.alive && p.id !== 'player' && p.rel?.affection >= 75).length;
  if (g.done) return { pct: 100, text: 'Done' };
  /* v2.12 item 1 — a save-for-this goal is measured against live liquid
     funds (cash + savings) versus the listing price it was set for. */
  if (g.kind === 'save_property') {
    const saved = liquidFundsLocal(S);
    const target = Math.max(1, g.target || 1);
    const pct = Math.min(100, Math.round((saved / target) * 100));
    return {
      pct,
      text: saved >= (g.target || 0)
        ? `Saved ${formatMoney(saved, S.country)} — enough to buy it`
        : `Saved ${formatMoney(saved, S.country)} of ${formatMoney(g.target || 0, S.country)}`
    };
  }
  if (g.id === 'g_grad') {
    if (S.education.degrees.length > 0) return { pct: 100, text: 'Degree earned' };
    if (S.education.highSchoolScore != null) return { pct: Math.round(S.education.highSchoolScore), text: S.education.university ? `Exam score ${S.education.highSchoolScore}% — passed, and you are studying at ${S.education.university.name}` : `Exam score ${S.education.highSchoolScore}% — secondary school is complete` };
    /* Progress is the share of the school years (6 to 18) actually lived: nothing before school starts, never an invented flat figure. */
    if (S.player.age < 6) return { pct: 0, text: 'Not in school yet — it starts at six' };
    return { pct: Math.max(0, Math.min(90, Math.round(((S.player.age - 6) / 12) * 100))), text: `Still in school (${S.education.stage.replace('_', ' ')}), age ${S.player.age} of 18` };
  }
  if (g.id === 'g_income') {
    const gross = S.career.job?.monthlyGross || 0;
    if (gross > 0) return { pct: 70, text: `Earning ${formatMoney(gross, S.country)}/mo — keep the job to make it self-sustaining` };
    return { pct: 0, text: 'No income yet — find work or start a business' };
  }
  if (g.id === 'g_home') {
    if (S.housing.properties.length > 0) return { pct: 100, text: `${S.housing.properties.length} ${S.housing.properties.length === 1 ? 'home' : 'homes'} owned` };
    if (S.housing.mode === 'rent') return { pct: 50, text: 'Renting a home of your own — buying would finish this goal' };
    return { pct: 0, text: ((S.player?.age ?? 0) < 18 ? 'No home of your own yet — you live with your family until you are 18' : 'No home of your own yet — rent or buy on the Real Estate tab') };
  }
  if (g.id === 'g_family') {
    const spouse = S.relations.spouseIds.length > 0;
    return { pct: Math.min(100, Math.round((closeCircle / 3) * 100)), text: spouse ? `Married · ${closeCircle}/3 close bonds` : `${closeCircle}/3 close bonds — marry or build deep friendships` };
  }
  if (g.id === 'g_ambition') {
    const a=ambitionStatus(S);return{pct:a.pct,text:a.reason};
  }
  return { pct: 0, text: 'In progress' };
}

/* v2.10 — evaluate one goal stage against live state. `check` is the key
   stored on the stage in buildStarterGoals; the done-rules in gameLoop.js
   are untouched — this only reads the same live state for display. */
export function goalStageProgress(S, g) {
  const cObj = getCountry(S.country);
  const netWorth = computeNetWorthLocal(S);
  const closeCircle = Object.values(S.people).filter(p => p && p.alive && p.id !== 'player' && p.rel?.affection >= 75).length;
  const annualBenchmark = eraSalary(cObj.annualSalaryTiers2026.mid, S.country, S.year);
  const furnished = (S.housing.properties || []).some(p => p.furnishedRooms && Object.keys(p.furnishedRooms).length > 0);
  /* v2.12 item 1 — save-goal stages read the same live liquid funds. */
  const liquid = liquidFundsLocal(S);
  const saveTarget = Math.max(1, g.target || 1);
  const check = (key) => {
    switch (key) {
      case 'balanced_work': return ['g_grad','g_income'].every(id=>S.goals.some(g=>g.id===id&&g.done));
      case 'balanced_home': return S.goals.some(g=>g.id==='g_home'&&g.done);
      case 'balanced_circle': return S.goals.some(g=>g.id==='g_family'&&g.done);
      case 'save_quarter': return liquid >= saveTarget * 0.25;
      case 'save_half': return liquid >= saveTarget * 0.5;
      case 'save_full': return liquid >= saveTarget;
      case 'in_school': return S.player.age >= 6 && !!S.education.schoolId;
      case 'exams_taken': return S.education.highSchoolScore != null;
      case 'has_degree': return S.education.degrees.length > 0 || (S.education.highSchoolScore != null && S.education.stage !== 'high');
      case 'has_work': return !!(S.career.employed || S.career.job || S.career.business || (S.career.yearsExperience || 0) > 0 || S.career.retired);
      case 'has_pay': return (S.career.job?.monthlyGross || 0) > 0 || !!S.career.business || (S.career.yearsExperience || 0) > 0;
      case 'year_in_work': return (S.career.yearsExperience || 0) >= 1 || (S.career.job?.monthsInRole || 0) >= 12;
      case 'has_savings': return (S.money.savings || 0) > 0;
      case 'has_own_home': return ['rent', 'owned'].includes(S.housing.mode) || S.housing.properties.length > 0 || !!S.housing.currentHomeId;
      case 'owns_home': return S.housing.properties.length > 0;
      case 'home_furnished': return furnished;
      case 'one_close_bond': return closeCircle >= 1;
      case 'married_or_three_bonds': return S.relations.spouseIds.length > 0 || closeCircle >= 3;
      case 'married_and_three_bonds': return S.relations.spouseIds.length > 0 && closeCircle >= 3;
      case 'has_passport': return (S.legal.passports || []).length > 0;
      case 'living_abroad': return S.country !== S.homeCountry;
      case 'second_passport': return (S.legal.citizenships || []).length > 1 || S.legal.residency?.kind === 'permanent_resident';
      case 'has_business': return !!S.career.business;
      case 'team_of_six': return (S.career.business?.employees || 0) >= 6;
      case 'is_married': return S.relations.spouseIds.length > 0;
      case 'has_child': return S.relations.childIds.length > 0;
      case 'worth_3x_salary': return netWorth >= annualBenchmark * 3;
      case 'worth_6x_salary': return netWorth >= annualBenchmark * 6;
      default: return false;
    }
  };
  const stages = (g.stages || []).map(st => ({ ...st, done: g.done ? true : check(st.check) }));
  let currentSeen = false;
  for (const st of stages) {
    if (st.done) st.state = 'done';
    else if (!currentSeen) { st.state = 'current'; currentSeen = true; }
    else st.state = 'locked';
  }
  return stages;
}

/* Adult life goals, the Legacy Score and the milestone ladder (first job, first home) are not shown to a child. Data keeps accruing underneath. */
const ADULT_PANEL_MIN_AGE = 16;

function renderGoalsCardHtml(S) {
  if (S.gameOver || !Array.isArray(S.goals) || S.goals.length === 0 || (S.player?.age ?? 0) < ADULT_PANEL_MIN_AGE) return '';
  const doneCount = S.goals.filter(g => g.done).length;
  const score = computeLiveLegacyScore(S);
  const reasons = legacyScoreReasons(S);
  /* v2.10 — the ambition is tracked during life, not only picked at birth.
     Its ending (achieved or failed, with the reason) is journalled once. */
  const amb = ambitionStatus(S);
  noteAmbitionOutcome(S, amb);
  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h3>${icon('life', 17)} Life Goals (${doneCount}/${S.goals.length} done)</h3>
        <span class="hud-pill mono">Legacy Score: ${score}/100</span>
      </div>
      <div class="muted" style="font-size:0.82rem;margin-bottom:8px">Your goals, tracked live — and your Legacy Score as it stands today, not only at the end of your life.</div>
      <div style="margin-bottom:10px;padding:8px 10px;border:1px solid var(--line-soft);border-radius:8px">
        <div style="font-size:0.85rem"><strong>Your ambition: ${esc(amb.label)}</strong> — ${amb.state === 'achieved' ? 'Achieved' : amb.state === 'failed' ? 'Ended' : 'In progress'} (${amb.pct}%)</div>
        <div class="muted" style="font-size:0.82rem">${esc(amb.reason)}</div>
        ${amb.failNote ? `<div class="muted" style="font-size:0.8rem">${esc(amb.failNote)}</div>` : ''}
      </div>
      ${S.goals.map(g => {
        const d = goalProgressDetail(S, g);
        const stages = goalStageProgress(S, g);
        return `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${g.done ? '✓ ' : ''}${esc(g.label)}</strong>
              <span>${esc(d.text)}</span>
              <div style="height:6px;background:var(--line-soft);border-radius:3px;margin-top:4px;overflow:hidden">
                <div style="height:100%;width:${d.pct}%;background:${g.done ? '#1B734E' : '#1D3557'};border-radius:3px"></div>
              </div>
              ${stages.length ? `<div style="margin-top:6px">
                ${stages.map(st => `
                  <div style="font-size:0.8rem;padding:1px 0;color:${st.state === 'locked' ? 'var(--muted)' : 'inherit'}">${st.state === 'done' ? '✓' : st.state === 'current' ? '→' : '○'} ${esc(st.label)}${st.state === 'locked' ? ' — locked until the step before is done' : ''}</div>
                `).join('')}
              </div>` : ''}
            </div>
            <span class="mono">${g.done ? 'Done' : `${d.pct}%`}</span>
          </div>
        `;
      }).join('')}
      <div style="margin-top:10px;padding-top:8px;border-top:1px dashed var(--line-soft)">
        <div style="font-size:0.85rem;margin-bottom:4px"><strong>Why your Legacy Score is ${score}/100:</strong></div>
        ${reasons.map(r => `
          <div style="font-size:0.82rem;padding:1px 0">${r.points > 0 ? `+${r.points}` : '0'} — ${esc(r.text)}${r.open ? ' (still open)' : ''}</div>
        `).join('')}
      </div>
    </div>
  `;
}

/* v2.12 Worker 3 — a disabled scene choice states why. Choice objects
   carry no lock text, so: use ch.lockReason when present; else, when the
   label names a price the player cannot afford, name the shortfall; else
   a plain generic lock line (never a silent disabled button). */
function sceneChoiceLockReason(S, ch, lbl) {
  const explicit = typeof ch.lockReason === 'function' ? ch.lockReason(S) : ch.lockReason;
  if (explicit) return lockReason(String(explicit), '');
  return lockReason('Not available right now', 'This choice needs something you do not have yet');
}

function renderActiveSceneHtml(S) {
  const sc = S.activeScene;
  const speaker = sc.speakerId ? S.people[sc.speakerId] : null;
  /* v2.10 — the scene kicker names the chapter the player is in. */
  const chapter = getCurrentChapter(S);

  return `
    <section class="scene-card" aria-live="polite" tabindex="-1">
      <div class="scene-kicker">${sc.major ? 'MAJOR LIFE EVENT' : sc.urgent ? 'URGENT CROSSROADS' : `CHAPTER: ${esc(chapter.name.toUpperCase())} — A DECISION`}</div>
      <div class="scene-header" style="justify-content:space-between;align-items:flex-start;flex-wrap:wrap">
        <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:220px">
          ${speaker ? renderPortraitSvg(speaker, 58) : ''}
          <div>
            <h2>${esc(sc.title)}</h2>
            ${speaker ? `<div class="muted">${esc(speaker.fullName)} · ${esc(speaker.relationLabel)} (${esc(speaker.traitTags.join(', '))})</div>` : ''}
          </div>
        </div>
        ${renderEditorialSketchSvg(sc.category || 'life', 124, 80, `${S.turn || 0}_${sc.id || sc.title || ''}_${S.seed || 1}`)}
      </div>
      ${Array.isArray(sc.people) && sc.people.length ? `<div class="muted scene-people" style="font-size:0.85rem;margin:2px 0 6px">${sc.people.map(x => `${esc(x.label.charAt(0).toUpperCase() + x.label.slice(1))}, ${esc(x.name)}`).join(" · ")}</div>` : ""}
      <p class="scene-body">${esc(countryLevelNarrative(sc.text,S))}</p>
      ${sc.details?.text?`<details class="scene-details"><summary>${esc(sc.details.label||'Details')}</summary><p class="muted">${esc(sc.details.text)}</p></details>`:''}
      <div class="scene-choices">
        ${(() => {
          const choiceHtml = (ch, idx) => {
          const limitLock = discretionaryLock(S, sc, ch);
          const avail = !limitLock && (typeof ch.available !== 'function' || ch.available(S));
          const lbl = typeof ch.label === 'function' ? ch.label(S) : ch.label;
          return `
            <button type="button" class="choice-btn" data-action="choose-scene" data-idx="${idx}" ${avail ? '' : 'disabled'}>
              ${esc(lbl)}
            </button>
            ${avail ? '' : (limitLock ? lockReason('Credit limit reached', limitLock) : sceneChoiceLockReason(S, ch, lbl))}
          `;
          };
          if (sc.choices.length <= 6) return sc.choices.map(choiceHtml).join('');
          /* Exit/navigation choices (ch.exit) always stay visible so the way out is never hidden inside the fold. */
          const idxAll = sc.choices.map((ch, i) => i), idxExit = idxAll.filter(i => sc.choices[i].exit), idxRest = idxAll.filter(i => !sc.choices[i].exit);
          const shown = idxRest.slice(0, 5), folded = idxRest.slice(5);
          return shown.map(i => choiceHtml(sc.choices[i], i)).join('') +
            (folded.length ? `<details class="scene-more-choices"><summary>All other options (${folded.length})</summary>${folded.map(i => choiceHtml(sc.choices[i], i)).join('')}</details>` : '') +
            idxExit.map(i => choiceHtml(sc.choices[i], i)).join('');
        })()}
      </div>
    </section>
  `;
}

function renderLegacyScreenHtml(S) {
  const sum = buildLegacySummary(S);
  return `
    <section class="scene-card" style="border-color:var(--brand-gold);background:var(--bg-accent-warm)">
      <div class="scene-kicker" style="color:var(--brand-gold)">END OF A CHAPTER · GENERATION ${sum.generation}</div>
      <h2 style="font-size:1.35rem;margin-bottom:6px">${esc(sum.fullName)} (${esc(sum.lifespan)})</h2>
      <p class="scene-body">Passed away ${esc(sum.cause)} in ${esc(sum.finalCountry)}. Final Estate: <strong class="mono">${esc(sum.netWorthFormatted)}</strong> · Passports: ${esc(sum.citizenships.join(', '))} · Legacy Score: <strong class="mono">${sum.score}/100</strong>.</p>
      <p class="muted" style="font-size:.8rem;margin:0 0 10px">Game rule: inheritance shares and estate tax are simplified. Only the UK has an estate tax in this game; other countries show none. This is not real-world legal or tax guidance.</p>
      ${sum.livingChildren.length > 0 ? `
        <div style="margin-bottom:12px">
          <strong style="display:block;margin-bottom:6px">Continue the Family Dynasty as Your Child:</strong>
          <div class="scene-choices">
            ${sum.livingChildren.map(ch => `
              <button type="button" class="choice-btn" data-action="continue-as-child" data-id="${ch.id}">
                Continue as ${esc(ch.fullName)} (Age ${ch.age}, ${esc(ch.career.title)} in ${esc(getCountry(ch.residenceCountry).name)}) →
              </button>
            `).join('')}
          </div>
        </div>
      ` : `<p class="muted" style="margin-bottom:10px">No surviving children to carry on this dynasty directly.</p>`}
      <button type="button" class="btn btn-primary" data-action="open-new-life">Start a Brand-New Life</button>
    </section>
  `;
}

/* ============================================================================
   TAB 2: PEOPLE (Sub-tabs: Circle & Soul | Relationships & Marriage | Children & Nurseries)
   ========================================================================== */
export function renderPeopleTabHtml(S, uiState = {}) {
  ensureExtendedState(S);
  const ageP = S.player?.age ?? 0;
  /* Marriage and nurseries are not offered to a young child; they appear from 16, or earlier if a child already exists. */
  const peopleSubs = [
    { id: 'circle', label: 'Circle & Soul' },
    ...(ageP >= 16 || S.relations.spouseIds.length ? [{ id: 'marriage', label: 'Relationships & Marriage' }] : []),
    ...(ageP >= 16 || S.relations.childIds.length ? [{ id: 'children', label: `Children & Nurseries (${S.relations.childIds.length})` }] : [])
  ];
  const sub = peopleSubs.some(s => s.id === uiState.peopleSub) ? uiState.peopleSub : 'circle';
  const nav = peopleSubs.length > 1 ? renderSubtabs('people', peopleSubs, sub) : '';

  if (sub === 'marriage') {
    return renderEditorialBannerHtml(pickDynamicBanner(S, 'people', 'marriage'), 'Relationships & Marriage') + nav + renderMarriageSubtabHtml(S);
  }
  if (sub === 'children') {
    return renderEditorialBannerHtml(pickDynamicBanner(S, 'people', 'children'), 'Generations, Nurseries & Family Heritage') + nav + renderChildrenSubtabHtml(S);
  }

  const orderedIds = [
    ...S.relations.spouseIds,
    ...(S.relations.partnerId ? [S.relations.partnerId] : []),
    ...S.relations.childIds,
    S.relations.fatherId,
    S.relations.motherId,
    ...S.relations.siblingIds,
    ...S.relations.friendIds,
    ...(S.relations.colleagueIds||[]),
    ...(S.relations.bossId ? [S.relations.bossId] : []),
    ...S.relations.inLawIds
  ].filter(Boolean);

  const seen = new Set();
  const livingPeople = [];
  const departedPeople = [];
  for (const id of orderedIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const p = S.people[id];
    if (!p) continue;
    if (p.alive) livingPeople.push(p);
    else departedPeople.push(p);
  }

  return `
    ${renderEditorialBannerHtml(pickDynamicBanner(S, 'people', 'circle'), `${getCountry(S.country).name} · People`)}
    ${nav}
    <div class="card card-elevated">
      <div class="section-head">
        <h3>${icon('people', 18)} People in Your Life (${livingPeople.length})</h3>
        <span class="muted"></span>
      </div>
      ${/* v2.15 W3 — the social-energy budget, stated on the screen. */ renderSocialEnergyHtml(S)}
      ${livingPeople.filter(p=>p.role!=='spouse'&&p.mind?.pending).map(p=>`<div class="card"><strong>${esc(p.firstName)}</strong>${renderPersonRequest(S,p)}</div>`).join('')}
      ${renderFamilyLedgerCardHtml(S)}
      ${renderSocialConstellationSvg(S)}
      <div class="npc-grid">
        ${livingPeople.map(p => renderNpcCardHtml(S, p)).join('')}
      </div>
    </div>
    ${departedPeople.length > 0 ? `
      <div class="card">
        <div class="section-head"><h3>In Memoriam (${departedPeople.length})</h3></div>
        ${departedPeople.map(p => `<div class="muted" style="padding:4px 0">${esc(p.fullName)} (${esc(p.relationLabel)}) · ${p.birthYear}–${p.deathYear}</div>`).join('')}
      </div>
    ` : ''}
  `;
}

/* The ask button states what the family can give and whether the ask will be heard, before the player commits. */
function askLabelSuffix(S, p) {
  const pr = askPreview(S, p);
  if (!pr) return '';
  if (pr.cooldown) return ` (asked recently, ${pr.monthsLeft} month${pr.monthsLeft === 1 ? '' : 's'} to wait)`;
  return ` (about ${formatMoney(pr.low, S.country, true)} to ${formatMoney(pr.high, S.country, true)})`;
}

/* Family ledger: the fortune behind the family, in the money of the year being played. Era scaling is done inside the simulation, not shown as a conversion. */
function renderFamilyLedgerCardHtml(S) {
  const lv = familyLedgerView(S);
  if (!lv) return '';
  const { f } = lv;
  const m = (n) => esc(formatMoney(Math.round(n), S.country, true));
  const row = (label, n) => `<tr><td>${label}</td><td class="mono">${m(n)}</td></tr>`;
  const age = S.player.age;
  const tr = f.trust, rel = tr.released;
  const schedule = [[18, 'at18', 0.25], [21, 'at21', 0.25], [25, 'at25', 0.5]].map(([a, k, sh]) => `${a}: ${rel[k] ? 'paid' : 'due'}`).join(' · ');
  const recent = (f.grants || []).slice(-5).reverse().map(g => `<div class="muted" style="font-size:0.82rem">${g.year} · ${esc(g.kind)} · ${m(g.amountLocal)}${g.note ? ' · ' + esc(g.note) : ''}</div>`).join('');
  return `<div class="card" id="family-ledger">
    <div class="section-head"><h3>Family fortune</h3><span class="muted mono">${esc(FAMILY_TIERS[f.tier]?.label || '')}</span></div>
    ${f.company?.sold ? `<div class="muted" style="font-size:0.88rem">The family company, ${esc(f.company.name)}, was sold${f.company.soldYear ? ' in ' + f.company.soldYear : ''}. No shares, dividends or company income remain.</div>` : f.company ? `<div class="muted" style="font-size:0.88rem">The family company: ${esc(f.company.name)}, ${esc(f.company.sector)}${f.company.sites.length > 1 ? `, ${f.company.sites.length} sites in ${[...new Set(f.company.sites.map(s => getCountry(s.country).name))].join(', ')}` : ''}.</div>` : ''}
    <table style="width:100%;margin:8px 0;font-size:0.9rem"><tbody>
      ${row('Family net worth', f.netWorthLocal)}${row('Cash fund', f.fundLocal)}${f.company?.sold ? '' : row('Yearly inflow', f.yearlyInflowLocal)}${row('Gifts to you this year (cash help, car)', Math.max(0, f.yearGifts - (f.yearEducation || 0)))}${(() => { const h = (f.grants || []).filter(g => g.kind === 'home' && g.year === S.year).reduce((a, g) => a + g.amountLocal, 0); return h > 0 ? row('Home put in your name (from the estate)', h) : ''; })()}${(() => { const t = (f.grants || []).filter(g => g.kind === 'trust' && g.year === S.year).reduce((a, g) => a + g.amountLocal, 0); return t > 0 ? row('Trust released to you this year', t) : ''; })()}${(f.yearEducation || 0) > 0 ? row('Fees the family paid this year', f.yearEducation) : ''}${f.shares && !f.company?.sold ? `<tr><td>Your shares in ${esc(f.company.name)}</td><td class="mono" colspan="1">${f.shares.pct}%${(f.yearDividend || 0) > 0 ? ' · dividend this year ' + m(f.yearDividend) : ''}</td></tr>` : ''}${(f.yearUpkeep || 0) > 0 ? row('Car running costs the family paid', f.yearUpkeep) : ''}
    </tbody></table>
    ${f.yearState && f.yearState.year === S.year ? `<div class="muted" style="font-size:0.88rem;margin-bottom:6px">${f.yearState.kind === 'record' ? esc(f.company.name) + ' had a record year: ' + (f.yearState.outcome === 'allowance' ? 'the allowance is higher.' : f.yearState.outcome === 'gift' ? 'a one-time gift was sent.' : 'profit went into family property.') : esc(f.company.name) + ' had a tight year: allowance cut, asks capped at half, planned gifts waiting.'}</div>` : ''}
    ${f.inherited ? `<div class="muted" style="font-size:0.88rem;margin-bottom:6px">Your parents' estate has been settled. Family allowance, asks, car and home gifts have ended: what you inherited replaces them. ${f.company && !f.company.sold ? esc(f.company.name) + ' still pays dividends from its own profit to the children who own shares.' : ''}</div>` : ''}
    ${familyNameCreditPoints(S) > 0 ? `<div class="muted" style="font-size:0.88rem;margin-bottom:6px">Your family name is known here: lenders read your credit score ${familyNameCreditPoints(S)} points higher and employers add ${familyNameInterviewPoints(S)} to your interview score. It does not help abroad.</div>` : ''}
    <div class="muted" style="font-size:0.88rem">Your trust fund: ${m(tr.fundedLocal)} still set aside for you. Releases at ${esc(schedule)}.${age < 18 ? ' Allowance: ' + m(lv.allowance) + ' a month.' : ''}</div>
    ${recent ? `<div style="margin-top:6px"><strong style="font-size:0.85rem">Recent gifts and help</strong>${recent}</div>` : ''}
  </div>`;
}

function renderMarriageSubtabHtml(S) {
  if (S.player.age < 18) {
    return `<div class="card"><p class="muted">Relationships open at age 18.</p></div>`;
  }
  const prof = getMarriageProfile(S.country, S.year);
  const partner = S.relations.partnerId ? S.people[S.relations.partnerId] : null;
  const spouses = S.relations.spouseIds.map(id => S.people[id]).filter(p => p && p.alive);
  const activeContracts = S.marriage.contracts.filter(c => c.active);
  /* v2.12 — the second-wife path is decided by the engine from the
     country's own marriage profile (additionalSpousePath): married and
     the law allows this player another spouse, the buttons say so
     plainly; married and it does not, no second-wife path is offered. */
  const spousePath = additionalSpousePath(S, prof);
  const canPolygamy = spousePath.allowed;
  const gehazCredit = Number(S.housing?.gehazInvestedLocal || 0);

  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('ring', 18)} Relationships & Marriage (${esc(getCountry(S.country).name)})</h2>
        <span class="hud-pill">${esc(S.marriage.status.toUpperCase())}</span>
      </div>

      ${/* v2.13 Worker 2 — spouse portrait(s): the same deterministic ink
           portrait person cards use (renderPortraitSvg / resolveInkPortraitFile).
           Married: every living spouse, each with her/his name. Dating: the
           partner, labelled as such. Single/divorced/widowed: nothing. */
        spouses.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:14px;margin:2px 0 12px">
          ${spouses.map(sp => `
            <div style="display:flex;gap:10px;align-items:center;background:var(--bg-canvas);padding:10px 12px;border-radius:10px">
              ${renderPortraitSvg(sp, 96)}
              <div><strong>${esc(sp.fullName)}</strong><br><span class="muted">Your spouse · Age ${sp.age}${sp.career?.title ? ` · ${esc(sp.career.title)}` : ''}${sp.nationality ? ` · ${esc(getCountry(sp.nationality).adjective)}` : ''}</span></div>
            </div>`).join('')}
        </div>` : (partner ? `
        <div style="display:flex;gap:10px;align-items:center;background:var(--bg-canvas);padding:10px 12px;border-radius:10px;margin:2px 0 12px">
          ${renderPortraitSvg(partner, 96)}
          <div><strong>${esc(partner.fullName)}</strong><br><span class="muted">Seeing · Age ${partner.age}${partner.career?.title ? ` · ${esc(partner.career.title)}` : ''}</span></div>
        </div>` : '')}

      ${gehazCredit > 0 ? `
        <div class="muted" style="margin-bottom:10px;padding:8px 10px;background:#EAF6F0;border-radius:8px;color:#1B734E">
          ✓ <strong>3D Home Gehaz Furnishing Credit:</strong> ${esc(formatMoney(gehazCredit, S.country))} already furnished on your home blueprint (reduces wedding home-setup cost & backs Qa'ima valuation!).
        </div>
      ` : `
        <div class="muted" style="margin-bottom:10px"></div>
      `}

      ${activeContracts.map(c => renderMarriageContractHtml(S, c)).join('')}

      ${(!partner && (spouses.length === 0 || canPolygamy)) ? `
        <p class="muted" style="margin-bottom:10px">
          ${spouses.map(sp=>{const r=sp.relationshipProgress;const m=spouseMind(S,sp);return `<div class="card"><strong>${esc(sp.firstName)} · ${r?.stage==='separated'?'Separated':'Together'}</strong><div class="muted">${m.ambition>65?'Ambitious · ':''}${m.thrift>65?'Careful with money · ':''}${m.independence>55?'Independent · ':''}${m.wantsChildren?'Wants children':'Does not want children'}</div>${m.pending?`<p>${esc(SPOUSE_DECISIONS[m.pending.kind])}${m.pending.kind==='spending'?` · ${esc(formatMoney(spouseRequestCost(S,'spending'),S.country))}`:''}</p><button class="btn btn-sm" data-action="spouse-decision" data-spouse="${sp.id}" data-accept="yes">Agree</button> <button class="btn btn-sm" data-action="spouse-decision" data-spouse="${sp.id}" data-accept="no">Not now</button>`:''}${r?.affair&&r.affair.status!=='hidden'?'<p>Affair confirmed</p>':''}${r?.courtCase?`<p>${esc(r.courtCase.stage)} · ${Math.max(0,r.courtCase.dueAt-S.year*12-S.month)} mo</p>`:''}<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btn btn-sm" data-action="relationship-step" data-spouse="${sp.id}" data-step="counsel">Counselling</button>${r?.stage==='separated'?`<button class="btn btn-sm" data-action="relationship-step" data-spouse="${sp.id}" data-step="reconcile" ${r?.courtCase?'disabled':''}>Reconcile</button>`:`<button class="btn btn-sm" data-action="relationship-step" data-spouse="${sp.id}" data-step="separate">Separate</button>`}${r?.affair?.status==='discovered'?`<button class="btn btn-sm" data-action="relationship-step" data-spouse="${sp.id}" data-step="discuss">Discuss affair</button>`:''}</div></div>`;}).join('')}
      ${spouses.length > 0 ? `You are already married to ${esc(spousePath.firstSpouse?.fullName || 'your spouse')}. These meetings are for a second wife: personal status law here permits a second marriage if financially capable — but your first wife will learn of it, and she can ask for a divorce.` : 'Meet someone through your work/social circle or ask family for a traditional Salonat match.'}
        </p>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          <button class="btn btn-primary" data-action="meet-partner" data-channel="social">${spouses.length > 0 ? 'Meet a second wife — through work / social circle' : 'Meet Through Work / Social Circle'}</button>
          <button class="btn" data-action="meet-partner" data-channel="family_intro">${spouses.length > 0 ? 'Meet a second wife — traditional family / Salonat match' : 'Traditional Family / Salonat Match'}</button>
        </div>
      ` : ''}

      ${(partner && !S.marriage.engagement) ? `
        <div style="background:var(--bg-canvas);padding:12px;border-radius:8px;margin-top:8px">
          <p class="muted">${courtshipMonthsApart(S,partner)} months since time together.</p>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">
            <button class="btn btn-sm" data-action="courtship-action" data-id="${partner.id}" data-kind="time">Make Time</button>
            <button class="btn btn-sm" data-action="courtship-action" data-id="${partner.id}" data-kind="later">${S.career.employed&&S.career.job?'Work First · performance +2, stress +3':'Not Ready Yet'}</button>
            <button class="btn btn-sm" data-action="courtship-action" data-id="${partner.id}" data-kind="end">End Courtship</button>
          </div>
          <strong>Seeing: ${esc(partner.fullName)}</strong> <span class="muted">(Age ${partner.age}, ${esc(partner.career.title)}, ${esc(getCountry(partner.nationality).adjective)})</span>
          ${prof.hasShabkaGold ? `<div class="muted" style="margin-top:4px">21K Gold today: <strong class="mono">${esc(formatMoney(goldPricePerGram(S.country, S.year, 21), S.country))}/g</strong>. ${S.country === 'egy' ? 'Wali vetting checks job stability, military clearance & Qa\'ima.' : ''}</div>` : ''}
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;align-items:center">
            <button class="btn btn-sm" data-action="propose-engagement" data-tier="modest" data-qaima="1">Propose (Modest ${prof.hasShabkaGold ? `${prof.shabkaGramsTiers.modest}g Shabka` : 'Ring'})</button>
            <button class="btn btn-primary btn-sm" data-action="propose-engagement" data-tier="standard" data-qaima="1">Propose (Standard ${prof.hasShabkaGold ? `${prof.shabkaGramsTiers.standard}g Shabka` : 'Ring'})</button>
            <button class="btn btn-sm" data-action="propose-engagement" data-tier="generous" data-qaima="1">Propose (Generous ${prof.hasShabkaGold ? `${prof.shabkaGramsTiers.generous}g Shabka` : 'Ring'})</button>
            ${S.country === 'egy' ? `<button class="btn btn-sm" data-action="propose-engagement" data-tier="standard" data-qaima="0">Propose Refusing Qa'ima</button>` : ''}
            ${prof.cohabitationAllowedNow ? `<button class="btn btn-sm" data-action="cohabit">Move In Together</button>` : ''}
          </div>
        </div>
      ` : ''}

      ${Object.values(S.people).filter(p=>p?.alive&&p.role==='ex_partner'&&p.courtship).map(p=>`<details class="card"><summary>${esc(p.fullName)} · Former partner${p.maritalStatus==='married'?' · Married':''}</summary><p class="muted">${p.courtship.endedReason==='stopped_waiting'?'Ended after months without time together.':'You chose to end the courtship.'}${p.courtship.deferrals?' Plans put off '+p.courtship.deferrals+' times.':''}</p>${!partner&&!spouses.length&&!S.marriage.engagement?`<button class="btn btn-sm" data-action="courtship-reconnect" data-id="${p.id}">Ask to Meet Again</button>`:''}</details>`).join('')}
      ${S.marriage.engagement ? `
        <div style="background:var(--bg-accent-warm);border:1px solid var(--brand-gold);padding:12px;border-radius:8px;margin-top:8px">
          <strong>Engaged to ${esc(S.people[S.marriage.engagement.partnerId]?.fullName || '')}</strong>
          <div class="muted" style="margin:4px 0 10px">
            ${['egy', 'sau', 'uae'].includes(S.country) && S.housing.mode === 'parents'
              ? '⚠ Rent or buy an independent home on the Real Estate tab before celebrating your wedding!'
              : 'Choose your wedding ceremony venue (guests will also gift Noqta / wedding cash envelopes!):'}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${prof.venues2026.map(v => {
              const vCost = eraLocalCost(v.cost, S.country, S.year) + (S.player.gender === 'm' ? (S.marriage.engagement.mahrPrompt || 0) : 0);
              return `<button class="btn btn-primary btn-sm" data-action="celebrate-wedding" data-venue="${v.id}">${esc(v.label)} (~${esc(formatMoney(vCost, S.country))})</button>`;
            }).join('')}
            ${!prof.hasMahr ? `<button class="btn btn-sm" data-action="toggle-prenup">${S.marriage.engagement.prenupSigned ? '✓ Prenup Signed' : 'Draft Prenup Agreement'}</button>` : ''}
          </div>
        </div>
      ` : ''}

      ${spouses.map(sp=>{const r=sp.relationshipProgress;const m=spouseMind(S,sp);return `<div class="card"><strong>${esc(sp.firstName)} · ${r?.stage==='separated'?'Separated':'Together'}</strong><div class="muted">${m.ambition>65?'Ambitious · ':''}${m.thrift>65?'Careful with money · ':''}${m.independence>55?'Independent · ':''}${m.wantsChildren?'Wants children':'Does not want children'}</div>${m.pending?`<p>${esc(SPOUSE_DECISIONS[m.pending.kind])}${m.pending.kind==='spending'?` · ${esc(formatMoney(spouseRequestCost(S,'spending'),S.country))}`:''}</p><button class="btn btn-sm" data-action="spouse-decision" data-spouse="${sp.id}" data-accept="yes">Agree</button> <button class="btn btn-sm" data-action="spouse-decision" data-spouse="${sp.id}" data-accept="no">Not now</button>`:''}${r?.affair&&r.affair.status!=='hidden'?'<p>Affair confirmed</p>':''}${r?.courtCase?`<p>${esc(r.courtCase.stage)} · ${Math.max(0,r.courtCase.dueAt-S.year*12-S.month)} mo</p>`:''}<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btn btn-sm" data-action="relationship-step" data-spouse="${sp.id}" data-step="counsel">Counselling</button>${r?.stage==='separated'?`<button class="btn btn-sm" data-action="relationship-step" data-spouse="${sp.id}" data-step="reconcile" ${r?.courtCase?'disabled':''}>Reconcile</button>`:`<button class="btn btn-sm" data-action="relationship-step" data-spouse="${sp.id}" data-step="separate">Separate</button>`}${r?.affair?.status==='discovered'?`<button class="btn btn-sm" data-action="relationship-step" data-spouse="${sp.id}" data-step="discuss">Discuss affair</button>`:''}</div></div>`;}).join('')}
      ${spouses.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--line-soft)">
          ${S.marriage.pregnancy
            ? `<span class="hud-pill" style="background:#EAF6F0;color:#1B734E">Expecting Baby in ${S.marriage.pregnancy.dueMonths} month(s)!</span>`
            : `<button class="btn btn-primary btn-sm" data-action="toggle-baby" ${spouses.every(sp=>sp.relationshipProgress?.stage==='separated')?'disabled':''}>${S.marriage.tryingForBaby ? '✓ Trying for Baby (Pause)' : 'Try for a Baby'}</button>`
          }
          <button class="btn btn-sm" data-action="cycle-split">Finances: ${S.marriage.householdSplit === 'traditional_provider' ? 'Provider' : S.marriage.householdSplit === 'shared_50_50' ? 'Shared 50/50' : 'Proportional'}</button>
          ${spouses.some(sp => sp.residenceCountry !== S.country) ? `<button class="btn btn-navy btn-sm" data-action="reunify-family">Sponsor Family Reunification to ${esc(getCountry(S.country).name)}</button>` : ''}
          <button class="btn btn-sm" data-action="divorce" data-mode="standard">Divorce, sell shared titles</button><button class="btn btn-sm" data-action="divorce" data-mode="standard" data-assets="buyout">Negotiate keeping home/car titles (cash buyout)</button>
          ${(S.player.gender === 'f' && prof.hasMahr) ? `<button class="btn btn-sm" data-action="divorce" data-mode="khula">File Khula</button>` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function divorceSummaryHtml(S){
  return (S.marriage.divorceOrders||[]).map(o=>{const kids=o.childIds.filter(id=>S.people[id]?.alive&&S.people[id].age<18).length;const money=x=>esc(formatMoney(convertCurrency(x||0,o.country,S.country,S.year),S.country));return `<div class="card"><strong>Family settlement</strong> <span title="Estimated game rules; local law varies." aria-label="Information">ⓘ</span><div class="muted">${esc(S.people[o.spouseId]?.fullName||'Former spouse')} · ${o.year}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0"><div>Support<br><strong>${money(o.monthlySupport*kids/Math.max(1,o.childIds.length))}/mo</strong></div><div>Arrears<br><strong>${money(o.arrears)}</strong></div><div>Custody<br><strong>${o.custody==='spouse'?'Other parent':o.custody==='player'?'With you':'Shared'} · ${kids} ${kids===1?'child':'children'}</strong></div><div>Paid by<br><strong>${o.payer==='player'?'You':'Other parent'}</strong></div></div><button class="btn btn-sm" data-action="support-review" data-id="${o.id}" ${o.reviewPending?'disabled':''}>${o.reviewPending?'Review pending':'Review support'}</button><details style="margin-top:10px"><summary>Settlement details</summary><p>Legal fees: ${money(o.legalFees)}<br>Asset award: ${money(o.spouseAward)}</p><div>Sold: ${(o.soldAssets||[]).map(p=>esc(p.name)).join(', ')||'None'}</div><div>Kept: ${(o.keptAssets||[]).map(p=>esc(p.name)).join(', ')||'None'}</div><div>Transfers: ${(o.financialTransfers||[]).map(a=>esc(a.kind)+' '+(a.percent!=null?a.percent+'%':money(a.value))).join(', ')||'None'}</div></details></div>`;}).join('');
}

function renderChildrenSubtabHtml(S) {
  const kids = S.relations.childIds.map(id => S.people[id]).filter(c => c && c.alive);
  const nurseries = (V1_CHILD_NURSERIES || []).slice(0, 4);
  const clubs = (V1_CHILD_ACTIVITIES || []).slice(0, 6);

  return `
    ${divorceSummaryHtml(S)}
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('people', 18)} Children</h2>
        <span class="hud-pill">Fertility: ${Math.round(S.medical.fertilityScore)}%</span>
      </div>
      ${kids.length === 0 ? `<p class="muted">You have no children yet. Marry and enable "Try for a Baby" (or visit IVF Fertility under Lifestyle → Medical).</p>` : ''}
      ${kids.map(ch => `
        <div class="npc-card" style="margin-bottom:10px">
          <div class="npc-top">
            ${renderPortraitSvg(ch, 50)}
            <div class="npc-info">
              <div class="npc-title-row">
                <span class="npc-name">${esc(ch.fullName)} · Age ${ch.age}</span>
                <span class="npc-role-badge">Passports: ${esc(ch.citizenships.map(c => getCountry(c).flagCode).join(' '))}</span>
              </div>
              <div class="muted">${ch.age>=18?(ch.leftHome||ch.householdWith&&ch.householdWith!=='player'?'Separate household · ':ch.householdWith==='player'||ch.leftHome===false?'Living at home · ':''):''}${ch.age<18&&ch.custody?`Custody: ${esc(ch.custody.arrangement)} · ${ch.custody.playerNightsPer14}/14 nights with you. `:''}Education fund: ${esc(formatMoney(convertCurrency(ch.educationFund?.balance||0,ch.educationFund?.country||S.country,S.country,S.year),S.country))}.</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn btn-sm" data-action="child-support-action" data-cid="${ch.id}" data-kind="visit">Visit / spend time</button><button class="btn btn-sm" data-action="child-support-action" data-cid="${ch.id}" data-kind="gift">Buy a gift</button><button class="btn btn-sm" data-action="child-support-action" data-cid="${ch.id}" data-kind="education">Add to education fund</button></div>
              ${ch.schoolEnrollment?`<p>School: ${esc(ch.schoolEnrollment.label)} · ${ch.schoolEnrollment.until>S.year*12+S.month?'Prepaid '+(ch.schoolEnrollment.until-S.year*12-S.month)+' months left':'Paid year ended; no automatic renewal'}</p>`:''}
              ${ch.age>=6&&ch.age<18?`<button class="btn btn-sm" data-action="child-school-year" data-cid="${ch.id}" data-tier="standard">Local year · ${esc(formatMoney(childSchoolQuote(S,ch.id).cost,S.country))}</button><button class="btn btn-sm" data-action="child-school-year" data-cid="${ch.id}" data-tier="international">International year · ${esc(formatMoney(childSchoolQuote(S,ch.id,"international").cost,S.country))}</button>`:''}
              ${childCourseQuote(S,ch.id)?`<p>Course tuition: ${esc(formatMoney(childCourseQuote(S,ch.id).monthly,childCourseQuote(S,ch.id).country))}/mo · 48 months</p><button class="btn btn-sm" data-action="child-course" data-cid="${ch.id}" ${ch.parentFundedCourse?'disabled':''}>${ch.parentFundedCourse?(ch.parentFundedCourse.completed?'Course completed':ch.parentFundedCourse.paused?'Course paused, insufficient funds':ch.parentFundedCourse.monthsRemaining+' months remaining'):'Enroll and fund child course'}</button>`:''}
              <div class="muted">Smarts: <strong>${Math.round(ch.vitals.smarts)}%</strong> · Health: <strong>${Math.round(ch.vitals.health)}%</strong> · Happiness: <strong>${Math.round(ch.vitals.happiness)}%</strong></div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
                ${ch.age <= 5 ? nurseries.map(n => `
                  <button class="btn btn-sm" data-action="child-program" data-cid="${ch.id}" data-kind="nursery" data-pid="${n.id}">
                    ${esc(n.label)}
                  </button>
                `).join('') : ''}
                ${(ch.age >= 4 && ch.age < 18) ? clubs.map(cl => `
                  <button class="btn btn-sm" data-action="child-program" data-cid="${ch.id}" data-kind="club" data-pid="${cl.id}">
                    ${esc(cl.label)}
                  </button>
                `).join('') : ''}
                ${/* v2.12 W5 — Children verbs: Play, Teach, Take out, Homework.
                       Distinct data-actions (audit: one verb, child-program, 14x).
                       Unavailable verbs show the plain reason inline. */
                  (() => {
                    const outingCost = childOutingCostLocal(S);
                    const mySmarts = Math.round(S.player.vitals.smarts || 0);
                    return `
                ${ch.age<18?`<button class="btn btn-sm" data-action="child-play" data-cid="${ch.id}">Play With</button>`:''}
                ${ch.age >= 18 ? '' : ch.age < 4
                  ? `<span class="hud-pill">Too young for lessons yet</span>`
                  : mySmarts < 50
                  ? `<span class="hud-pill">Teach needs your Smarts at 50%+ (yours: ${mySmarts}%)</span>`
                  : `<button class="btn btn-sm" data-action="child-teach" data-cid="${ch.id}">Teach</button>`}
                ${ch.age < 4
                  ? `<span class="hud-pill">Outings from age 4</span>`
                  : S.money.cash < outingCost
                  ? `<span class="hud-pill">A day out costs ${esc(formatMoney(outingCost, S.country))} — you hold ${esc(formatMoney(S.money.cash, S.country))}</span>`
                  : `<button class="btn btn-sm" data-action="child-outing" data-cid="${ch.id}">${ch.age>=18?'Go out together':'Take Out'} (${esc(formatMoney(outingCost, S.country))})</button>`}
                ${ch.age >= 18 ? '' : ch.age < 6
                  ? `<span class="hud-pill">Not in school yet — homework help starts at 6</span>`
                  : ch.age >= 18
                  ? `<span class="hud-pill">Finished school — no homework left</span>`
                  : `<button class="btn btn-sm" data-action="child-homework" data-cid="${ch.id}">Help With Homework</button>`}`;
                  })()}
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPersonRequest(S,p){const m=personMind(S,p);if(!canContactPerson(S,p))return '<p class="muted">Taking space · Not accepting contact</p>';const q=m.pending;if(!q||p.role==='spouse')return '';return `<div class="person-request"><p>${esc(PEOPLE_REQUESTS[q.kind]||q.kind)}${q.kind==='money'?` · ${esc(formatMoney(peopleRequestAmount(S,p),S.country))}`:''}</p><button class="btn btn-sm" data-action="people-decision" data-id="${p.id}" data-accept="yes">${q.kind==='call'?'Answer':'Help'}</button> <button class="btn btn-sm" data-action="people-decision" data-id="${p.id}" data-accept="no">Not now</button></div>`;}
function renderNpcCardHtml(S, p) {
  const quote = generateContextualLine(S, p);
  const mind=personMind(S,p);
  const openPromises = (p.rel?.promises || []).filter(pr => pr.status === 'open');
  /* v2.15 W5 — the full memory list is rendered below ("What X remembers"). */
  const pCountry = getCountry(p.residenceCountry || S.country);

  return `
    <div class="npc-card">
      <div class="npc-top">
        ${renderPortraitSvg(p, 56)}
        <div class="npc-info">
          <div class="npc-title-row">
            <span class="npc-name">${esc(p.fullName)} · Age ${p.age}</span>
            <span class="npc-role-badge">${esc(p.relationLabel)} · ${esc(pCountry.name)}</span>
          </div>
          <div class="muted" style="font-size:0.8rem">
            ${esc(p.career.title)}${p.role === 'sibling' ? esc(siblingEmployerLine(S, p.id)) : ''}${p.career.monthlyIncomeLocal > 0 ? ` (${esc(formatMoney(p.career.monthlyIncomeLocal, p.residenceCountry, true))}/mo)` : ''} · Traits: <strong>${esc(p.traitTags.join(', '))}</strong>
          </div>
          ${['father', 'mother', 'sibling', 'spouse', 'partner', 'child'].includes(p.role) ? `
            <div class="muted" style="font-size:0.8rem">
              ${(Number(p.career?.savingsLocal) || 0) > 0
                ? `Holds about <strong>${esc(formatMoney(p.career.savingsLocal, p.residenceCountry || S.country))}</strong> in savings of their own.`
                : 'No savings put aside of their own.'}
              ${(p.role === 'father' || p.role === 'mother') && parentAssetsLine(S, p.id) ? ` ${esc(parentAssetsLine(S, p.id))}` : ''}
              ${p.role === 'sibling' && (siblingStakeLine(S, p.id) || siblingAssetsLine(S, p.id) || siblingCompanyLine(S, p.id)) ? ` ${esc(siblingStakeLine(S, p.id))} ${esc(siblingAssetsLine(S, p.id))} ${esc(siblingCompanyLine(S, p.id))}` : ''}
            </div>
          ` : ''}
          ${quote ? `<div class="npc-quote">${esc(quote)}</div>` : ''}
          ${/* v2.15 W5 — what this person remembers, in words (up to 5
               memories, newest first). A memory is a real record, not
               flavour: later events read it. When small memories were
               forgotten to make room, the card says so honestly. */
            (() => {
              const mems = (p.rel?.memories || []).slice(0, 5);
              if (!mems.length) return '';
              const forgotten = p.rel?.memoriesForgotten;
              return `<div style="font-size:0.78rem;margin-top:6px"><strong>What ${esc(p.firstName)} remembers:</strong><ul style="margin:2px 0 0 16px;padding:0">${mems.map(m => `<li>${esc(m.summary)} (${m.year})</li>`).join('')}</ul>${forgotten && forgotten.count > 0 ? `<div class="muted">Small things fade — ${esc(p.firstName)} has forgotten ${forgotten.count} little moment${forgotten.count > 1 ? 's' : ''} over the years.</div>` : ''}</div>`;
            })()}
        </div>
      </div>

      ${renderPersonRequest(S,p)}
      <div class="npc-meters">
        ${vitalBarHtml('Affection', p.rel.affection, '#C84B31')}
        ${vitalBarHtml('Respect', p.rel.respect, '#1D3557')}
        ${vitalBarHtml('Trust', p.rel.trust, '#1B734E')}
        ${vitalBarHtml('Resentment', p.rel.resentment, '#B42318')}
      </div>
      ${/* v2.15 W3 — a drifting relationship warns here, before it breaks, and names what stops the drift. */ renderDriftWarningHtml(S, p)}

      <div class="npc-actions">
        <button class="btn btn-sm" data-action="npc-interact" data-id="${p.id}" data-kind="talk_visit">
          ${p.residenceCountry === S.country ? 'Visit & Talk' : 'International Call'}${/* v2.15 W3 — every relationship button states its energy cost. */ socialEnergyCostLabel(S, p, 'interact:talk_visit')}
        </button>
        ${p.residenceCountry === S.country ? `<button class="btn btn-sm" data-action="npc-interact" data-id="${p.id}" data-kind="family_meal">Friday Meal${socialEnergyCostLabel(S, p, 'interact:family_meal')}</button>` : ''}
        ${S.player.age >= 16 ? `<button class="btn btn-sm" data-action="npc-interact" data-id="${p.id}" data-kind="gift">${icon('gift', 13)} Gift${socialEnergyCostLabel(S, p, 'interact:gift')}</button>` : ''}
        ${S.player.age >= 18 ? `<button class="btn btn-sm" data-action="npc-interact" data-id="${p.id}" data-kind="financial_support">Send Support${socialEnergyCostLabel(S, p, 'interact:financial_support')}</button>` : ''}
        ${(S.player.age >= 18 && p.age >= 22) ? `<button class="btn btn-sm" data-action="npc-interact" data-id="${p.id}" data-kind="ask_for_help">Ask for Financial Help${isFortuneParent(S, p) ? esc(askLabelSuffix(S, p)) : ''}${socialEnergyCostLabel(S, p, 'interact:ask_for_help')}</button>` : ''}
        ${(S.player.age >= 18 && p.age >= 24 && (p.career?.monthlyIncomeLocal || 0) > 0) ? `<button class="btn btn-sm" data-action="npc-interact" data-id="${p.id}" data-kind="wasta_referral">Ask Career / Wasta Referral${socialEnergyCostLabel(S, p, 'interact:wasta_referral')}</button>` : ''}
        ${(p.role === 'child' && p.age >= 5) ? `<button class="btn btn-sm" data-action="npc-interact" data-id="${p.id}" data-kind="mentor_child">Mentor Studies${socialEnergyCostLabel(S, p, 'interact:mentor_child')}</button>` : ''}
        ${p.rel.resentment > 10 ? `<button class="btn btn-sm" data-action="npc-interact" data-id="${p.id}" data-kind="reconcile">Apologize / Clear Air${socialEnergyCostLabel(S, p, 'interact:reconcile')}</button>` : ''}
        ${/* v2.12 W5 — Circle verbs: Call, Visit, Gift, Ask for help, Conversation.
               Each is a distinct data-action (audit: one verb, npc-interact, 61x).
               Unavailable verbs show the plain reason inline, not a tooltip. */
          (() => {
            const trip = visitTripCostLocal(S, p);
            const cheapestGift = giftableShopItems(S).find(i => i.priceLocal <= S.money.cash);
            const cashAmt = cashGiftAmountLocal(S);
            const canGift = S.player.age >= 16 && (cheapestGift || S.money.cash >= cashAmt);
            return `
        ${p.age < 4
          ? `<span class="hud-pill">Too young to talk on the phone</span>`
          : `<button class="btn btn-sm" data-action="npc-call" data-id="${p.id}">Call${/* v2.15 W3 */ socialEnergyCostLabel(S, p, 'call')}</button>`}
        ${trip.cost > 0 && S.money.cash < trip.cost
          ? `<span class="hud-pill">Visit costs ${esc(formatMoney(trip.cost, S.country))} for the trip — you hold ${esc(formatMoney(S.money.cash, S.country))}</span>`
          : `<button class="btn btn-sm" data-action="npc-visit" data-id="${p.id}">${trip.cost > 0 ? `Visit${socialEnergyCostLabel(S, p, 'visit')} · ${esc(formatMoney(trip.cost, S.country))} trip` : `Visit${socialEnergyCostLabel(S, p, 'visit')}`}</button>`}
        ${S.player.age < 16
          ? `<span class="hud-pill">Gifts from 16</span>`
          : !canGift
          ? `<span class="hud-pill">No gift you can afford yet</span>`
          : `<button class="btn btn-sm" data-action="npc-gift" data-id="${p.id}">${icon('gift', 13)} Give a Gift${socialEnergyCostLabel(S, p, 'gift')}</button>`}
        ${S.player.age < 18
          ? `<span class="hud-pill">Ask for help from 18</span>`
          : p.age < 22
          ? `<span class="hud-pill">${esc(p.firstName)} is too young to help you out</span>`
          : `<button class="btn btn-sm" data-action="npc-ask-help" data-id="${p.id}">Ask for Help${socialEnergyCostLabel(S, p, 'askHelp')}</button>`}
        ${p.age < 4
          ? `<span class="hud-pill">Too young for a real conversation</span>`
          : p.rel.resentment >= 80
          ? `<span class="hud-pill">Won't talk to you right now — clear the air first</span>`
          : `<button class="btn btn-sm" data-action="npc-talk" data-id="${p.id}">Have a Conversation${socialEnergyCostLabel(S, p, 'talk')}</button>`}`;
          })()}
        ${openPromises.map(pr => `
          <button class="btn btn-primary btn-sm" data-action="fulfill-promise" data-id="${p.id}" data-pid="${pr.id}">
            Fulfill Promise (${pr.amountLocal > 0 ? esc(formatMoney(Math.round(convertCurrency(pr.amountLocal, pr.currencyCountry || S.country, S.country, S.year)), S.country)) : 'Keep Word'})
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/* ============================================================================
   TAB 3: CAREER & EDUCATION (92 Tracks | Universities & Licensing Boards | 55 Ventures | Side Gigs)
   ========================================================================== */
/* ============================================================================
   TAB: EDUCATION (v2.5) — school choice, track & study, clubs, full Tansik
   university list with player-picked majors, named scholarships,
   internships, languages & boards, conscription.
   ========================================================================== */
export function renderEducationTabHtml(S, uiState = {}) {
  ensureExtendedState(S);
  const cObj = getCountry(S.country);
  const edu = S.education;
  const age = S.player.age;
  const inSchool = ['primary', 'middle', 'high'].includes(edu.stage);
  /* v2.7 — before the secondary exam there is NO result and NO university
     list, only a labelled projection that moves with skill and effort. */
  const hasResult = hasExamResult(S);
  const score = edu.highSchoolScore ?? Math.round(edu.academicSkill || 65);
  const projection = examProjection(S);
  const schools = getSchoolsFor(S.country, S.year);
  const tracks = SCHOOL_TRACKS[S.country] || [];
  const currentTrack = tracks.find(t => t.id === edu.trackId);
  const tutorFee = eraLocalCost((cObj.examSystem.tutoringMonthly2026 || 0) * 3, S.country, S.year);
  const unis = getUniversitiesFor(S.country, S.year);
  const mySchool = schools.find(x => x.id === edu.schoolId);
  const mySystem = schoolSystemFor(mySchool, S.country);
  const mySystemLabel = (TRACK_SYSTEM_INFO[mySystem] || TRACK_SYSTEM_INFO.national).label;
  const tansikFootnote = 'Admission scores, course availability, durations and tuition are simplified game rules. They are not official university requirements or a guide to applying in real life.';
  const banner = renderEditorialBannerHtml(pickDynamicBanner(S, 'education'), `${getCountry(S.country).name} Schools, Universities & Scholarships`);

  const tierLabel = t => t === 'state' ? 'State (free)' : t === 'private' ? 'Private' : 'International';
  const schoolRows = ['state', 'private', 'international'].map(tier => {
    const list = schools.filter(x => x.tier === tier);
    if (!list.length) return '';
    return `
      <div style="margin-top:8px">
        <strong style="font-size:0.84rem">${tierLabel(tier)} (${list.length})</strong>
        ${list.map(sc => {
          const aff = schoolAffordability(S, sc);
          const fee = aff.fee;
          const sysLabel = (TRACK_SYSTEM_INFO[schoolSystemFor(sc, S.country)] || TRACK_SYSTEM_INFO.national).label;
          const payerLine = fee <= 0 ? 'No fees' : aff.familyPays ? 'Your family covers the fees' : aff.youCanPay ? 'You would pay the first year yourself' : `Your family can't cover ${esc(formatMoney(fee, S.country))}/yr and you hold ${esc(formatMoney(S.money.cash || 0, S.country))}`;
          const isCurrent = sc.id === edu.schoolId;
          const canChange = age >= 6 && age <= 17 && inSchool && !isCurrent;
          const canChoose = age < 6 && !isCurrent;
          const actionOk = canChoose || canChange;
          return `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(sc.name)}</strong>
                <span>${fee > 0 ? `${esc(formatMoney(fee, S.country))}/yr` : 'Free'} · ${esc(sysLabel)}</span>
                ${fee>0?`<span class="muted">${esc(payerLine)}</span>`:''}
              </div>
              ${isCurrent
                ? '<span class="hud-pill">Your school</span>'
                : !actionOk
                ? `<span class="muted" style="font-size:0.82rem">${age < 6 ? 'Starts at 6' : 'School years over'}</span>`
                : !aff.affordable
                ? `<span class="hud-pill">Can't afford — ${esc(payerLine)}</span>`
                : canChoose
                ? `<button class="btn btn-sm btn-primary" data-action="choose-school" data-id="${sc.id}">Choose</button>`
                : `<button class="btn btn-sm btn-primary" data-action="change-school" data-id="${sc.id}">Move here</button>`}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('');

  /* v2.7 — the track follows the school. Tracks inside your school's system
     switch freely; a track from another system means changing school, so it
     is shown with its cost, its gain and its loss — never as a free button.
     Every track states its benefit in plain words. */
  /* v2.19 W5 — the Opens / Cost / Risk lines belong to the SYSTEM, not
     the track: every track in the same system printed them word for
     word (national Science and Literary both carried the identical
     three lines). Each system states them once, above its tracks;
     a track card keeps only its own label, description, cheapest-school
     note (when it needs a different school) and its switch button. */
  const trackCards = (() => {
    const bySys = new Map();
    for (const t of tracks) {
      const sys = trackSystemFor(t, S.country);
      if (!bySys.has(sys)) bySys.set(sys, []);
      bySys.get(sys).push(t);
    }
    return [...bySys.entries()].map(([sys, sysTracks]) => {
      const info = TRACK_SYSTEM_INFO[sys] || TRACK_SYSTEM_INFO.national;
      const cards = sysTracks.map(t => {
        const isCurrent = edu.trackId === t.id;
        const needsOwnSchool = trackNeedsOwnSchool(S, t);
        const canSwitch = age >= 12 && age <= 17 && ['middle', 'high'].includes(edu.stage);
        const cheapest = needsOwnSchool ? cheapestSchoolForSystem(S, sys) : null;
        const cheapestFee = cheapest ? eraLocalCost(cheapest.annualTuition2026 || 0, S.country, S.year) : 0;
        return `
          <div class="item-row" style="display:block">
            <div class="item-row-main" style="margin-bottom:6px">
              <strong>${esc(t.label)}${isCurrent ? ' — your track' : ''}</strong>
              <span>${esc(t.desc)}</span>
              ${needsOwnSchool && cheapest ? `<span class="muted">Cheapest ${esc(info.schoolNoun)} here: ${esc(cheapest.name)}, ${esc(formatMoney(cheapestFee, S.country))}/yr.</span>` : ''}
              ${needsOwnSchool && !cheapest ? `<span class="text-gold">No ${esc(info.schoolNoun)} is listed for ${esc(cObj.name)} here.</span>` : ''}
            </div>
            ${isCurrent
              ? '<span class="hud-pill">Your track</span>'
              : needsOwnSchool
              ? '<span class="hud-pill">Needs a different school — see My School above</span>'
              : `<button type="button" class="btn btn-sm btn-primary" data-action="set-track" data-id="${t.id}" ${canSwitch ? '' : 'disabled'}>${canSwitch ? 'Switch to this track' : 'Tracks open at 12–17'}</button>`}
          </div>
        `;
      }).join('');
      return `
        <div class="edu-tip"><strong>${esc(info.label)}</strong><br>${esc(info.benefit)} ${esc(info.risk)}</div>
        ${cards}
      `;
    }).join('');
  })();

  const clubRows = (level) => CLUBS.filter(c => c.level === level).map(c => {
    const joined = (edu.clubs || []).includes(c.id);
    const allowed = level === 'school' ? (age >= 6 && age <= 17 && inSchool) : !!edu.university;
    const lockReason = level === 'school'
      ? (age < 6 ? 'Opens at age 6' : 'School years over')
      : 'Enrol at university first';
    return `
      <div class="item-row">
        <div class="item-row-main">
          <strong>${esc(c.label)}</strong>
          <span>${esc(c.desc)}</span>
        </div>
        ${joined ? '<span class="hud-pill">Member</span>' : allowed ? `<button class="btn btn-sm btn-primary" data-action="join-club" data-id="${c.id}">Join</button>` : `<span class="hud-pill">${esc(lockReason)}</span>`}
      </div>
    `;
  }).join('');

  const uniRows = unis.map(u => {
    const tuit = annualUniversityBudget(S,u);
    const range=universityBudgetRange(S,u,programsForCountry(S.country,u,S.year).filter(m=>uniSupportsMajor(u.name,m.id)));
    const aff = universityAffordability(S, u);
    const canApply = age >= 18 && ['graduated_high', 'completed'].includes(edu.stage) && !edu.university;
    const majorsHtml = programsForCountry(S.country,u,S.year).filter(m=>uniSupportsMajor(u.name,m.id)).map(m => {
      const bar = tansikCutoffFor(S.country, u, m.id, S.year).cutoff;
      const supported = !m.graduateEntry || edu.degrees.length > 0;
      const already = edu.degrees.includes(m.id);
      const courseAff=universityAffordability(S,u,m.id);
      const eligible = supported && !already && score >= bar && courseAff.status!=='cannot';
      const fee=annualUniversityBudget(S,u,m.id);
      const gate=canApply&&supported&&!already&&score>=bar;
      const familyOk=familyCoversUniversity(S,fee,u.country);
      const scholarshipOk=courseAff.short==='scholarship pays it in full';
      const fundsButton=(kind,label,ok,why)=>`<button class="btn btn-sm ${ok&&gate?'btn-primary':''}" data-action="apply-university" data-uid="${u.id}" data-major="${m.id}" data-funding="${kind}" ${ok&&gate?'':'disabled'}>${esc(label)}</button>${!ok?`<small class="edu-funding-reason">${esc(why)}</small>`:''}`;
      return `<div class="edu-programme"><div class="edu-programme-top"><strong>${esc(m.label)}</strong><span>${m.years} yrs</span></div><div class="edu-programme-meta">${esc(m.level)} · Entry index ${bar}/100</div><div class="edu-programme-price">${esc(formatMoney(fee,S.country))}<small> / year</small></div><div class="edu-funding">${esc(supported?courseAff.short:"Requires an earlier degree")}</div>${fee<=0?fundsButton('self','Enrol · no tuition',true,''):fundsButton('family','Ask parents to pay',familyOk,'Not enough savings from living parents for year one.')+fundsButton('self','Pay tuition myself',S.money.cash>=fee,'Needs a first-year cash buffer. Charged monthly.')+fundsButton('scholarship','Use awarded scholarship',scholarshipOk,'Apply under Scholarships first.')}<div class="edu-programme-meta">${!supported?'First degree required.':already?'Degree already held.':score<bar?'Your game score is below the entry index.':''}</div>${!canApply ? lockReason(age < 18 ? 'Applications open at 18' : edu.university ? `Already enrolled at ${edu.university.name}` : 'Finish secondary school first', age < 18 ? `You are ${age}` : edu.university ? 'Finish or leave your current degree first' : 'You need a secondary-school result first') : ''}</div>`;
    }).join('');
    return `
      <article class="edu-university">
        <div class="item-row-main">
          <div class="edu-overline">${esc(universitySectorLabel(u))}</div><strong class="edu-university-name">${esc(u.name)}</strong>
          <span>${tuit > 0 ? `${esc(formatMoney(range.min, S.country))}${range.min!==range.max?` to ${esc(formatMoney(range.max,S.country))}`:''}/yr game budget${S.country==='gbr'?' · eligible-local cap model':''}` : 'No tuition in this game pathway'}</span>

        </div>
        <details class="university-programmes"><summary>Explore programmes <span>${programsForCountry(S.country,u,S.year).filter(m=>uniSupportsMajor(u.name,m.id)).length}</span></summary><div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">${majorsHtml}</div><details class="edu-fee-note"><summary>Budget details</summary><p>${esc(u.feeBasis || "Game budget, not a fee quote.")}</p></details></details>
      </article>
    `;
  }).join('');

  /* v2.18 W3 — the "what to do if you cannot afford it" paths are the
     same for every university (same cheapest public option, same
     scholarship / loan / work-a-year routes), so they are written ONCE
     above the list instead of on every unaffordable row. */
  const affordPaths = (unis.map(u => universityAffordability(S, u)).find(a => a.paths.length) || { paths: [] }).paths;

  const scholarshipRows = SCHOLARSHIPS.filter(sch=>sch.level!=='postgrad'&&(sch.country===S.country||sch.country==='eu')).map(sch => {
    const app = (edu.scholarships || []).find(a => a.id === sch.id&&(a.status==='awarded'||a.year===S.year));
    const lock = scholarshipLockReason(S, sch);
    const bars = [`GPA ${sch.requiresGPA} (about ${sch.minScore}%)`, sch.requiresIELTS ? `IELTS ${sch.requiresIELTS}` : null, sch.requiresGerman ? 'German B1+' : null, sch.requiresFrench ? 'French B1+' : null, sch.requiresWork ? `${sch.requiresWork} yrs work` : null, sch.requiresLeadership ? 'Leadership' : null, sch.level === 'postgrad' ? 'Needs a degree' : sch.level === 'undergrad' ? 'Before first degree' : 'Any stage'].filter(Boolean).join(' · ');
    return `
      <div class="item-row">
        <div class="item-row-main">
          <strong>${esc(sch.name)}${sch.modelled ? ' <span class="muted">(bars estimated)</span>' : ''}</strong>
          <span>${esc(sch.desc)}</span>
          <span class="muted">Needs: ${esc(bars)} · Success rate: ${Math.round(sch.acceptanceRate * 100)}%</span>
        </div>
        ${app ? `<span class="hud-pill">${app.status === 'awarded' ? '✓ Awarded' : 'Turned down'} (${app.year})</span>` : lock ? `<span class="hud-pill">${esc(lock)}</span>` : `<button class="btn btn-sm btn-primary" data-action="apply-scholarship" data-id="${sch.id}">Apply</button>`}
      </div>
    `;
  }).join('');

  const internshipRows = INTERNSHIPS.map(intn => {
    const app = (edu.internships || []).filter(a => a.id === intn.id).at(-1);
    const lock = internshipLockReason(S, intn);
    const payLocal = Math.round(convertCurrency(intn.monthlyPayUsd2026, 'usa', S.country, S.year));
    return `
      <div class="item-row">
        <div class="item-row-main">
          <strong>${esc(intn.label)}${intn.modelled ? ' <span class="muted">(pay estimated)</span>' : ''}</strong>
          <span>${esc(intn.company)} · ${intn.months} months · ${intn.paid ? (payLocal > 0 ? `${esc(formatMoney(payLocal, S.country))}/mo` : 'Paid') : 'Unpaid'} · For: ${intn.requiresMajor.length ? esc(intn.requiresMajor.join('/').toUpperCase()) : 'Any major'}</span>
        </div>
        ${app&&(app.status==='completed'||app.status==='active'||app.year===S.year) ? `<span class="hud-pill" style="white-space:normal">${app.status === 'active' ? (app.paused?'Paused':'Working')+' '+(app.completedMonths||0)+'/'+intn.months+' months' : esc(app.status)} (${app.year})</span>` : lock ? `<span class="hud-pill" style="white-space:normal">${esc(lock)}</span>` : `<button class="btn btn-sm btn-primary" data-action="apply-internship" data-id="${intn.id}">Apply</button>`}
      </div>
    `;
  }).join('');

  return `
    <div class="education-screen">
    ${banner}
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('graduation', 18)} Education</h2>
        <span class="hud-pill">${esc(S.postgrad?.active?'Postgraduate student':({graduated_high:'Ready for university',high:'Secondary school',middle:'Middle school',primary:'Primary school',infancy:'Early years',completed:'Studies completed',university:'At university'})[edu.stage]||edu.stage)}</span>
      </div>
      <div class="item-row">
        <div class="item-row-main">
          <strong>Your progress</strong>
          <span>${edu.university
            ? `Enrolled: ${esc(edu.university.name)} — ${esc(edu.university.majorLabel)} (Year ${edu.university.yearInProgram}/${edu.university.totalYears})`
            : edu.degrees.length > 0
            ? `Degrees Earned: ${edu.degrees.map(d => esc(degreeProgramFor(S.country,d)?.label||d)).join(', ')}`
            : edu.highSchoolScore != null
            ? `${esc(cObj.examSystem.name)} Score: ${edu.highSchoolScore}%`
            : `${esc(edu.schoolName || 'School')} · Effort: ${edu.studyEffort}`}</span>
          ${edu.university?`<span class="muted">Funding: ${esc(edu.university.fundingSource==='scholarship_ended'?'scholarship ended':(edu.university.fundingSource||'legacy contract'))}${edu.university.fundingSource==='family'?` · ${edu.university.familyMonthsRemaining||0} prepaid months`:edu.university.fundingSource==='self'?` · ${esc(formatMoney(Math.round(edu.university.annualTuition/12),S.country))}/month`:edu.university.fundingSource==='scholarship'?(edu.university.probation?' · on probation: results under 60%, one more weak year ends it':' · game renewal rule: results must stay at 60% each year'):edu.university.fundingSource==='loan'?' · game student loan':edu.university.fundingSource==='scholarship_ended'?' · choose how to pay':edu.university.scholarshipLost?' · scholarship ended on results':``}</span>`:''}
          <span class="muted">Academic skill ${Math.round(edu.academicSkill || 0)}/100 · ${esc(edu.languages.join(' · '))}${inSchool&&currentTrack?` · ${esc(currentTrack.label)}`:''}</span>
        </div>
      </div>
    </div>

    ${S.postgrad?.active?`<div class="card"><h3>Current postgraduate study</h3><p>${esc(S.postgrad.active.label)}</p><div class="edu-programme-top"><strong>${Math.max(0,S.postgrad.active.totalMonths-S.postgrad.active.monthsLeft)} / ${S.postgrad.active.totalMonths} months</strong><span>${Math.round(100*(1-S.postgrad.active.monthsLeft/S.postgrad.active.totalMonths))}%</span></div><progress max="${S.postgrad.active.totalMonths}" value="${S.postgrad.active.totalMonths-S.postgrad.active.monthsLeft}" style="width:100%;accent-color:#285b50;height:12px;margin:12px 0"></progress><p class="muted">Tuition paid upfront${S.postgrad.active.paidBy==="your parents"?" by your parents":S.postgrad.active.paidBy==="a student loan"?" by a student loan (6% a year, payments and interest wait until you finish)":""}${S.postgrad.active.feePaid!=null?`: ${esc(formatMoney(S.postgrad.active.feePaid,S.country))}`:''}. No stipend.</p><p class="muted">Outcome: ${S.postgrad.active.tier==='fellowship_phd'?'research credential, +9 smarts and a 42% game pay bonus':'master’s credential, +6 smarts and a 26% game pay bonus'}.</p></div>`:''}
    ${(S.player.age>=18&&!edu.university&&!S.postgrad?.active&&(inSchool===false))?`<div class="card"><h3>Study abroad</h3><p class="muted">Bachelor, master's and PhD places in other countries, paid from your own money, your living parents' savings, or a game tuition award. Game rules, not real admissions or scholarship rules.</p><button class="btn btn-sm" data-action="open-study-abroad">Open study abroad (Passport)</button></div>`:''}
    ${edu.university?`<div class="card"><h3>Current degree</h3><p>${esc(edu.university.majorLabel)} at ${esc(edu.university.name)}</p><p>Year ${edu.university.yearInProgram} of ${edu.university.totalYears} · ${edu.university.elapsedMonths??((edu.university.yearInProgram-1)*12)} / ${edu.university.totalYears*12} months</p><details><summary>Leave this degree</summary><p>All progress is lost. Paid tuition is not refunded. Applying again starts from year one.</p><button class="btn" data-action="education-withdraw-confirm">Confirm withdrawal</button></details></div>`:''}
    ${edu.university||edu.degrees.length>0?`<details class="card edu-section"><summary>Education history</summary><p>${esc(edu.schoolName||'Secondary school')} · Secondary complete${edu.highSchoolScore!=null?` · Game score ${edu.highSchoolScore}/100`:``}</p>${edu.degrees.map(id=>`<p>${esc(degreeProgramFor(S.country,id)?.label||id)} · Completed</p>`).join('')}${(edu.history||[]).map(h=>`<p>${esc(h.majorLabel)} at ${esc(h.name)} · Left in ${h.year}</p>`).join('')}${(S.postgrad?.completed||[]).map(p=>`<p>${esc(p.label)} · ${p.year}</p>`).join('')}</details>`:hasResult ? `
    <div class="card">
      <div class="section-head">
        <h3>Universities <span class="edu-count">${unis.length}</span></h3>
        <span class="muted">Game score ${score}/100</span>
      </div>
      <p class="muted">${canApplyNote(age, edu)}</p>
<details class="edu-model-note"><summary>About these game pathways</summary><p>${esc(tansikFootnote)} Fees are game budgets, not quotes. Clinical coverage is limited to checked examples; other clinical courses are not yet modelled.</p></details>
      ${affordPaths.length ? `<details class="edu-model-note"><summary>Need funding?</summary><p>${esc(affordPaths.join(' '))}</p><button class="btn btn-sm" data-action="switch-tab" data-tab="finance">View bank loan options</button></details>` : ''}
      ${edu.university ? `<p class="muted">You are currently enrolled at ${esc(edu.university.name)} — ${esc(edu.university.majorLabel)}.</p>` : ''}
      ${uniRows}
    </div>` : `
    <div class="card">
      <div class="section-head">
        <h3>${esc(cObj.examSystem.placementName)} — Projection (not a result)</h3>
        <span class="muted">Exam at 18</span>
      </div>
      <p>If you took the exam today, you would score about ${projection}% — keep studying to raise it.</p>
      <p class="muted">Your final game score arrives at 18 and opens university applications. Study hard to improve it; coasting lowers it.</p>
    </div>`}

    ${age<18?`    <details class="card edu-section"><summary>Schools</summary>
      <p class="muted">Choose before age 6. Change schools at 6-17. Each option shows who pays.</p>
      ${schoolRows}
    </details>`:''}

    ${inSchool?`    <details class="card edu-section" ${inSchool?'open':''}><summary>Study routine &amp; exam track</summary>
      <p class="muted">${esc(mySystemLabel)} · Switch tracks at 12-17. A different exam system requires a different school.</p>
      <div class="edu-tip">Hard study improves your score but adds stress. Tutor: ${esc(formatMoney(tutorFee,S.country))}/term${familyCoversUniversity(S,tutorFee)?' · parents can pay from savings':''}.</div>
      ${trackCards}
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px">
        <button type="button" class="btn btn-sm ${edu.studyEffort === 'hard' ? 'btn-navy' : ''}" data-action="set-effort" data-effort="hard">Study Hard</button>
        <button type="button" class="btn btn-sm ${edu.studyEffort === 'normal' ? 'btn-navy' : ''}" data-action="set-effort" data-effort="normal">Steady Routine</button>
        <button type="button" class="btn btn-sm ${edu.studyEffort === 'coasting' ? 'btn-navy' : ''}" data-action="set-effort" data-effort="coasting">Coast</button>
        <button type="button" class="btn btn-sm ${edu.privateTutoring ? '' : 'btn-primary'}" data-action="hire-tutor" ${edu.privateTutoring || age<12 || age>17 || (!familyCoversUniversity(S,tutorFee)&&S.money.cash<tutorFee) ? 'disabled' : ''}>${edu.privateTutoring ? '✓ Tutor Hired' : `Hire a Tutor — ${esc(cObj.examSystem.tutoringLabel)} (${esc(formatMoney(tutorFee, S.country))} this school year)`}</button>${edu.privateTutoring?lockReason('Tutor already hired for this school year'):age<12||age>17?lockReason('Tutor coaching is available at ages12to17'):!familyCoversUniversity(S,tutorFee)&&S.money.cash<tutorFee?lockReason('Not enough family savings or player cash',`Need ${formatMoney(tutorFee,S.country)} for this school year`):''}
      </div>
    </details>`:''}

    ${inSchool||edu.university?`    <details class="card edu-section" ${inSchool||edu.university?'open':''}><summary>Clubs</summary>
      ${inSchool ? `<p class="muted">School clubs (ages 6-17):</p>${clubRows('school')}` : ''}
      ${edu.university ? `<p class="muted" style="margin-top:8px">University clubs at ${esc(edu.university.name)}:</p>${clubRows('university')}` : '<p class="muted" style="margin-top:8px">University clubs open once you enrol.</p>'}
    </details>`:''}



    ${!edu.degrees.length?`    <details class="card edu-section" ><summary>Scholarships</summary>
      <p class="muted">Tuition awards <span title="Eligibility and outcomes are game estimates." aria-label="Information">ⓘ</span></p>
      ${scholarshipRows||'<p class="muted">No undergraduate scholarship route is modelled in this country yet. Postgraduate awards are not wired and are not offered.</p>'}
    </details>`:''}

    ${edu.university?`    <details class="card edu-section" ><summary>Internships</summary>
      <p class="muted">20h/week. Pay follows each worked month, never upfront. One active placement; country/work authorization required.</p>
      ${internshipRows}
    </details>`:''}

    <details class="card edu-section"><summary>Languages &amp; professional licences</summary>${renderEduAndLicensingHtml(S)}</details>
    </div>
  `;
}

function canApplyNote(age, edu) {
  if (edu.university) return 'Finish your current degree first.';
  if (age < 18) return 'Applications open at 18, after your secondary exam.';
  if (!['graduated_high', 'completed'].includes(edu.stage)) return 'Finish secondary school first.';
  return 'Choose a university, then a programme. Check your funding before enrolling.';
}

/* v2.8 §3 — job actions. Every button prints its cost and consequence
   BEFORE the player takes it; the numbers come from actionPreviews(S),
   the same functions the handlers use, so the preview can never lie. */
function renderJobActionsHtml(S, job) {
  const act = actionPreviews(S);
  if (!act) return '';
  const bal = act.leave.balance;
  /* v2.18 W2 — the Promotion block lived here AND in the ladder
     above (same next rung, same missing list, same Apply button).
     The ladder owns it now, including the Apply button when every
     requirement is met, so this section keeps only the actions. */
  const sec = act.security;
  const lic = act.licence;
  const licAlert = lic.lapsed
    ? `<div class="text-bad" style="margin:6px 0">Your licence check is overdue${lic.medicalOverdue ? ' (fitness medical)' : ''}${lic.simOverdue ? ' (simulator)' : ''}${lic.renewalLapsed ? ' (board renewal)' : ''} — promotion and overtime are blocked until you renew it below.</div>`
    : (lic.required && !lic.held)
    ? `<div class="text-gold" style="margin:6px 0">This job needs ${esc(lic.required.label)} and you do not hold it yet — sit it under Train &amp; Licences.</div>`
    : '';
  return `
    ${licAlert}
    <div style="margin-top:10px"><strong>Your pace</strong> <span class="muted">— hours, pay, stress and health, before you choose</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
      ${act.workModes.map(m => `<button class="btn btn-sm ${job.workMode === m.mode ? 'btn-navy' : ''}" data-action="set-workmode" data-mode="${m.mode}">${esc(m.label)}</button>`).join('')}
    </div>
    <div class="muted" style="margin-top:4px">${act.workModes.map(m => `• <strong>${esc(m.label)}:</strong> ${esc(m.preview)}`).join('<br>')}</div>

    <div style="margin-top:12px"><strong>Step up</strong> <span class="muted">— your manager remembers who volunteered (${act.steppedUpCount} time(s) on your record)</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
      ${act.takeOn.map(t => `<button class="btn btn-sm" data-action="job-takeon" data-kind="${t.kind}">${esc(t.label)}</button>`).join('')}
    </div>
    <div class="muted" style="margin-top:4px">${act.takeOn.map(t => `• <strong>${esc(t.label)}:</strong> ${esc(t.preview)}`).join('<br>')}</div>

    <div style="margin-top:12px"><strong>Train &amp; licences</strong> <span class="muted"></span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
      ${act.train.map(t => `<button class="btn btn-sm" data-action="job-train" data-kind="${t.kind}" ${t.locked ? 'disabled title="'+esc(t.locked)+'"' : ''} ${t.id ? `data-id="${esc(t.id)}"` : ''}>${esc(t.label)}${t.locked ? ' · current' : ''}</button>`).join('')}
    </div>
    <div class="muted" style="margin-top:4px">${act.train.map(t => `• <strong>${esc(t.label)}:</strong> ${esc(t.locked||t.preview)}`).join('<br>')}</div>

    <div style="margin-top:12px"><strong>Ask for more</strong> <span class="muted">— a refusal always says why</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
      <button class="btn btn-primary btn-sm" data-action="ask-raise">Negotiate Raise</button>
      ${act.ask.map(a => `<button class="btn btn-sm" data-action="job-ask" data-kind="${a.kind}">${esc(a.label)}</button>`).join('')}
      <button class="btn btn-sm" data-action="job-transfer">Look for Sponsored Work Abroad</button>
    </div>
    <div class="muted" style="margin-top:4px">${act.ask.map(a => `• <strong>${esc(a.label)}:</strong> ${esc(a.preview)}`).join('<br>')}• <strong>Work abroad:</strong> a new-employer search through Passport, not an internal company transfer. Household consent, business decisions, eligibility and costs apply.</div>

    <div style="margin-top:12px"><strong>Take leave</strong> <span class="muted">— vacation: ${bal.left} of ${bal.entitlement} days left this year${bal.rule && bal.rule.source === 'modelled' ? ' (modelled — no statutory minimum here)' : ' (statutory)'}</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
      <button class="btn btn-sm" data-action="job-leave" data-kind="vacation5">Take 5 Days’ Vacation</button>
      <button class="btn btn-sm" data-action="job-leave" data-kind="vacation10">Take 10 Days’ Vacation</button>
      <button class="btn btn-sm" data-action="job-leave" data-kind="sick">Sick Leave (3 Days)</button>
      <button class="btn btn-sm" data-action="job-leave" data-kind="parental">Parental Leave (30 Days)</button>
      <button class="btn btn-sm" data-action="job-leave" data-kind="unpaid">Unpaid Leave (5 Days)</button>
    </div>
    <div class="muted" style="margin-top:4px">• <strong>5 days’ vacation:</strong> ${esc(act.leave.vacation5)}<br>• <strong>10 days’ vacation:</strong> ${esc(act.leave.vacation10)}<br>• <strong>Sick leave:</strong> ${esc(act.leave.sick)}<br>• <strong>Parental leave:</strong> ${esc(act.leave.parental)}<br>• <strong>Unpaid leave:</strong> ${esc(act.leave.unpaid)}</div>
    ${act.leaveLog.length ? `<div class="muted" style="margin-top:4px">Recent leave: ${act.leaveLog.map(l => `${esc(l.kind)} ${l.days}d — ${l.approved ? 'approved' : 'refused'} (${esc(l.reason || '')})`).join(' · ')}</div>` : ''}

    <div style="margin-top:12px"><strong>People at work</strong> <span class="muted"></span></div>
    ${act.people.map(p => `
      <div style="margin-top:6px"><strong>${esc(p.name)}</strong> <span class="muted">(${esc(p.role)} — ${esc(p.rel)})</span>
        <span style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
          <button class="btn btn-sm" data-action="job-people" data-act="praise" data-pid="${esc(p.id)}">Praise</button>
          <button class="btn btn-sm" data-action="job-people" data-act="ask_help" data-pid="${esc(p.id)}">Ask for Help</button>
          <button class="btn btn-sm" data-action="job-people" data-act="ask_reference" data-pid="${esc(p.id)}">Ask for a Reference</button>
          <button class="btn btn-sm" data-action="job-people" data-act="argue" data-pid="${esc(p.id)}">Argue</button>
        </span>
      </div>`).join('')}
    ${act.reference ? `<div class="muted" style="margin-top:4px">Reference on file: <strong>${esc(act.reference.fromName)}</strong> (strength ${act.reference.strength}%) — it helps your next promotion interview and job application.</div>` : '<div class="muted" style="margin-top:4px">No reference on file yet — ask someone who respects and trusts you (65% respect, 60% trust).</div>'}

    <div style="margin-top:12px"><strong>Your standing</strong> <span class="muted">— warnings: ${sec.warnings} of 3${sec.performancePlan ? ' · you are on a performance plan' : ''}${sec.noticeServing ? ` · notice being served (${Math.max(0, sec.noticeServing.untilTurn - S.turn)} month(s) left)` : ''}. Dismissal only follows warnings, never out of nowhere. If you were dismissed today, severance would be ${esc(formatMoney(sec.severanceAmount, S.country))} (${sec.severanceMonths} months’ pay — ${sec.severanceSource === 'law' ? 'by law' : 'modelled practice'}).</span></div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px">
      <button class="btn btn-sm" data-action="job-resign-notice">Resign (Serve ${sec.noticeMonths}-Month Notice)</button>
      <button class="btn btn-sm" data-action="job-walkout">Walk Out Now (No Notice, Poor Reference)</button>
      ${S.player.age >= 58 ? `<button class="btn btn-sm" data-action="retire" ${S.career.retired?'disabled':''}>${S.career.retired?'Already retired':'Retire with Pension'}</button>` : ''}
    </div>
    ${['sau', 'uae', 'egy'].includes(S.country) && job.monthsInRole >= 24 ? `<div class="muted" style="margin-top:4px">Game end-service accrual settles when notice ends. A strict sponsor can withhold payment; any withheld amount is recorded as a dispute.</div>` : ''}
  `;
}

/* v2.8 §5 — one market listing with its inside information: what the job
   involves, the ladder and the next rung, the contract, hours and shift,
   the location, the benefits, the real gross → net breakdown, and every
   requirement with met / not-met and the reason. The Apply button is live
   only when jobEligibility says the job really can be taken; otherwise the
   first blocking reason is shown instead of a button that refuses. The pay
   breakdown comes from describeJobOffer, which reads W1's computePayslip —
   the same function the job card reads. */
function renderMarketListingHtml(S,j){
 const detail=describeJobOffer(S,j),elig=jobEligibility(S,j),pay=detail.pay;
 return `<div class="item-row" style="align-items:flex-start"><div class="item-row-main"><strong>${esc(j.title)} · ${esc(j.employer)}</strong><span>${esc(formatMoney(pay.gross,S.country))} gross/mo · ${esc(formatMoney(pay.net,S.country))} net/mo · ${detail.hoursPerWeek} h/wk</span>${!elig.eligible?`<div class="muted">${esc(elig.blockedBy[0]||'Not eligible')}</div>`:''}<details style="margin-top:6px"><summary>Role &amp; requirements</summary><p>${esc(detail.involves)}<br>${esc(detail.contract)} · ${esc(detail.shift)}</p>${detail.nextRung?`<p>Next: ${esc(detail.nextRung.title)} · ${detail.nextRung.minExp} yrs experience</p>`:''}<p>Tax ${esc(formatMoney(pay.incomeTax,S.country))}/mo · Social insurance ${esc(formatMoney(pay.socialSecurity,S.country))}/mo<br>${detail.benefits.map(esc).join('<br>')}</p>${elig.rows.map(r=>`<div>${r.met?'✓':'✗'} ${esc(r.label)} · ${esc(r.reason)}</div>`).join('')}</details></div>${elig.eligible?`<button class="btn btn-sm btn-primary" data-action="apply-job" data-idx="${j.origIdx}">Apply</button>`:''}</div>`;
}

/* ============================================================================
   v2.8 §2 (W1) — the job card's inside information. Every figure comes from
   the game's real systems: the payslip is salaryNetFor (the settlement's
   own arithmetic, so the net on the card IS the net that lands in the
   ledger); the contract is getJobContract (the one leave balance); the
   ladder is getLadderForJob (the same rung/pay formula as the job market);
   performance lives in the dashboard's three views (boss, team, numbers);
   benefits read the same insurance records the Medical tab reads, and
   the pension lives in the market pension section below.
   ========================================================================== */
function renderPayslipHtml(S, job, cObj, isCit) {
  /* v2.18 W2 — the payslip reads salaryNetFor(S): the settlement's
     own arithmetic (overtime, world-event salary multiplier, tax), so
     the net on this card IS the net in the Finance tab's salary line.
     computePayslip on the contract gross used to disagree in a crisis
     year; it no longer runs here. */
  const slip = salaryNetFor(S);
  const midMonthly = eraSalary(cObj.annualSalaryTiers2026.mid / 12, S.country, S.year);
  const ratio = midMonthly > 0 ? slip.gross / midMonthly : 0;
  const verdict = ratio >= 1.5 ? 'well above the typical mid-career pay here'
    : ratio >= 1.1 ? 'above the typical mid-career pay here'
    : ratio >= 0.8 ? 'about the typical mid-career pay here'
    : ratio >= 0.5 ? 'below the typical mid-career pay here'
    : 'far below the typical mid-career pay here';
  const freeBand = slip.taxBands.find(b => b.rate === 0);
  const taxedBands = slip.taxBands.filter(b => b.rate > 0 && b.taxMonthly > 0);
  const homeNote = S.country !== S.homeCountry
    ? `<span>Back home (${esc(getCountry(S.homeCountry).name)}) that net is about <strong>${esc(formatMoney(Math.round(convertCurrency(slip.net, S.country, S.homeCountry, S.year)), S.homeCountry))}</strong>/mo at the game's exchange rate.</span>`
    : '';
  return `
    <div style="margin-top:10px" data-salary-net="${slip.net}" data-salary-gross="${slip.gross}">
      <strong>Payslip — ${esc(cObj.name)} (${esc(cObj.currency)})</strong>
      <span class="muted"></span>
      <div style="margin-top:6px;font-size:0.86rem">
        ${slip.withheld ? `<div class="text-bad"><strong>No pay this month — withheld.</strong> <span class="muted">Your employer cannot legally pay you while your work authorisation in ${esc(cObj.name)} is not valid. Fix the visa and pay resumes; the Finance tab shows no salary line this month either.</span></div>` : ''}
        ${slip.payFrozen ? `<div class="text-gold" style="margin-top:4px"><strong>Pay frozen.</strong> <span class="muted">${esc(slip.freezeNote)}</span></div>` : ''}
        ${!slip.withheld && slip.salaryMult !== 1 ? `<div class="muted" style="margin-top:4px">Pay is at ${Math.round(slip.salaryMult * 100)}% while ${esc((slip.salaryEventNames || []).join(', '))} lasts </div>` : ''}
        <div>Base pay: <strong class="mono">${esc(formatMoney(slip.baseGross, S.country))}</strong>/mo</div>
        ${slip.overtimePay > 0 ? `<div>Overtime pay: <strong class="mono">+${esc(formatMoney(slip.overtimePay, S.country))}</strong>/mo <span class="muted">(20 extra hours at the overtime rate)</span></div>` : ''}
        <div>Gross paid: <strong class="mono">${esc(formatMoney(slip.gross, S.country))}</strong>/mo</div>
        <div style="margin-top:4px">− Income tax: <strong class="mono">${esc(formatMoney(slip.incomeTax, S.country))}</strong>/mo
          ${slip.taxFree ? `<span class="muted">— no personal income tax in ${esc(cObj.name)}; salaries are not taxed here.</span>`
            : slip.incomeTax <= 0 ? `<span class="muted">— ${esc(incomeTaxNote(S.country))}</span>`
            : `<span class="muted">${freeBand ? `first ${esc(formatMoney(freeBand.taxableMonthly, S.country))}/mo tax-free; ` : ''}${taxedBands.map(b => `${Math.round(b.rate * 100)}% on ${esc(formatMoney(b.taxableMonthly, S.country))}/mo`).join('; ')}</span>`}
        </div>
        <div>− Social insurance: <strong class="mono">${esc(formatMoney(slip.socialSecurity, S.country))}</strong>/mo <span class="muted">(${(slip.socialPct * 100).toFixed(1)}% of gross ${S.country==='usa'?' · Social Security/Medicare, separate from 401(k)':' · pension '+esc(formatMoney(slip.pensionContribution,S.country))+'/mo'})</span></div>
        <div class="muted">Allowances included in gross</div>
        <div style="margin-top:4px">Net take-home: <strong class="mono text-good">${esc(formatMoney(slip.net, S.country))}</strong>/mo <span class="muted">(${Math.round(slip.effectiveRate * 100)}% of gross goes on tax and social insurance${job.workMode === 'overtime' ? ' — overtime is on, so this net includes the overtime pay' : ''})</span></div>
        <div class="muted" style="margin-top:4px">A mid-career salary in ${esc(cObj.name)} is about ${esc(formatMoney(Math.round(midMonthly), S.country))}/mo — your gross is ${ratio.toFixed(2)}× that, ${esc(verdict)}.</div>
        ${homeNote}
        ${slip.employerPension > 0 ? `<div class="muted">Your employer also pays ${esc(formatMoney(slip.employerPension, S.country))}/mo into your pension on top of your gross — never deducted from you.</div>` : ''}
      </div>
    </div>
  `;
}

function renderJobContractHtml(S, job, cObj) {
  const ct = getJobContract(S);
  if (!ct) return '';
  const eos = computeEndOfService(S);
  const eosLine = ['sau','uae','egy'].includes(S.country)
    ? (eos.eligible
      ? `Game end-service estimate: <strong>${esc(formatMoney(eos.amount,S.country))}</strong> · ${eos.yrsServed} completed years. May be withheld on exit.`
      : `Game end-service estimate: no accrual before 2 completed years.`)+` <details><summary>Game rule</summary>Shared simplified rule, not local law:65% of gross as basic pay;21 days/year for years1-5,30 thereafter. Withheld amounts become recorded disputes, not guaranteed court recovery.</details>`
    : `Game model: no end-service lump sum. Notice ${ct.notice.noticeMonths} month(s); severance estimate ${ct.notice.severanceMonths} month(s).`;

  return `
    <div style="margin-top:12px">
      <strong>Your contract</strong>
      <div style="margin-top:6px;font-size:0.86rem">
        <div>Type: <strong>${esc(ct.contractType)}</strong>${ct.onProbation ? ` — month ${job.monthsInRole + 1} of ${ct.probationMonths} probation. While on probation the employer can end the contract quickly if the work is not up to standard; pass it and the job is permanent.` : ' — probation passed.'}</div>
        <div>Notice period: <strong>${ct.notice.noticeMonths} month(s)</strong> <span class="muted">— that is what leaving really costs you; the notice is served, not skipped. ${esc(ct.notice.note)}</span></div>
        <div>Paid vacation: <strong>${ct.leave.usedDays} used of ${ct.leave.annualDays} days this year — ${ct.remainingLeave} left</strong> <span class="muted">(the same balance the Take Leave buttons below and every trip spend; ${ct.rules && ct.leave.extraDays > 0 ? `includes ${ct.leave.extraDays} extra day(s) you negotiated. ` : ''}statutory minimum here, rising with tenure)</span></div>
        <div>Sick leave: <strong>${ct.rules.sickDaysPaid > 0 ? `${ct.rules.sickDaysPaid} paid days a year` : 'no paid sick days by law here'}</strong> <span class="muted">${ct.rules.sickDaysPaid > 0 ? '' : '— sick days come out of your leave or go unpaid.'}</span></div>
        <div>${eosLine}</div>
        <div>Shift: <strong>${esc(ct.shift)}</strong></div>
        <div>Location: <strong>${esc(ct.location)}</strong> · Team: <strong>${ct.teamSize} people</strong> · People reporting to you: <strong>${ct.directReports > 0 ? ct.directReports : 'none'}</strong></div>
      </div>
    </div>
  `;
}

function renderJobLadderHtml(S, job) {
  const ladder = getLadderForJob(S);
  if (!ladder) return '';
  const next = ladder.next;
  const missing = next ? next.reqs.filter(r => !r.met) : [];
  return `
    <div style="margin-top:12px">
      <strong>Career ladder — ${esc(ladder.trackLabel)}</strong>
      <span class="muted"> — the rungs that exist in ${S.year}; pay is the market rate for the rung (your own rung shows what you actually earn).</span>
      <div style="margin-top:6px;font-size:0.86rem">
        ${ladder.rungs.map(r => `
          <div style="margin-top:4px">${r.current ? '●' : '○'} <strong>${esc(r.title)}</strong>${r.current ? ' — your rung' : ''} · ${r.current ? `you earn <strong class="mono">${esc(formatMoney(job.monthlyGross, S.country))}</strong>/mo` : `about <strong class="mono">${esc(formatMoney(r.pay, S.country))}</strong>/mo gross`}
            <div class="muted" style="margin-left:14px">${r.reqs.map(q => `${q.met ? '✓' : '✗'} ${esc(q.label)} — ${esc(q.detail)}${q.modelled ? ' (modelled)' : ''}`).join('<br>')}</div>
          </div>`).join('')}
        ${next ? (missing.length
          ? `<div style="margin-top:6px">Next rung: <strong>${esc(next.title)}</strong> — what is missing: ${missing.map(m => esc(m.label)).join('; ')}.</div>`
          : `<div style="margin-top:6px">Next rung: <strong>${esc(next.title)}</strong> — you meet every requirement. <button class="btn btn-primary btn-sm" data-action="job-promote">Apply for ${esc(next.title)}</button> <span class="muted">The application opens an interview with your manager, with words.</span></div>`)
          : `<div style="margin-top:6px">You are at the top of this ladder — there is no higher rung in ${S.year}.</div>`}
      </div>
    </div>
  `;
}

function renderJobBenefitsHtml(S, job, slip, cObj) {
  const cover = employerHealthCover(S);
  /* v2.18 W2 — the pension line lived here AND in the career-market
     pension section below; the market section owns it now (the pot,
     the contributions, the opt-out), so this section keeps only the
     medical cover and the perk. The slip argument stays for the call
     signature; the pension numbers are read by the market section. */
  const hospitals = getHospitalsFor(S.country, S.year);
  const privHosp = hospitals.filter(h => h.sector === 'private').slice(0, 2).map(h => h.name).join(', ');
  const industry = (getMergedCareerTracks(S.year)[job.track] || {}).industry || 'general';
  const staffTerms = staffLoanTerms(S);
  const perk = industry === 'aviation'
    ? 'Staff travel — you fly standby at 10% of the fare: every trip you book costs 90% less on the flight part (wired — try a trip and watch the price).'
    : job.track === 'teaching'
    ? 'School holidays — your leave follows the school calendar. The holiday timing itself is not a separate system; your leave balance above is the real number.'
    : (industry === 'finance' || industry === 'banking' || job.track === 'finance')
    ? `Staff rates on loans — as bank staff you borrow at ${(staffTerms.staffRate * 100).toFixed(1)}% instead of the usual ${(staffTerms.standardRate * 100).toFixed(1)}%: take a Staff Loan under Finance → Banks, CDs & Loans, and the loan record carries that rate.`
    : (industry === 'medicine' || industry === 'nursing' || job.track === 'medicine' || job.track === 'nursing')
    ? 'Staff treatment at your own hospital — as hospital staff, private specialist treatment for you costs about a quarter of the full bill. The Medical tab’s prices already include that, and that is what treatment charges.'
    : 'No extra wired perk for this job.';
  return `
    <div style="margin-top:12px">
      <strong>Benefits — beyond the pay</strong>
      <div style="margin-top:6px;font-size:0.86rem">
        <div>Medical insurance: <strong>${esc(cover.label)}</strong> <span class="muted">— ${esc(cover.detail)}</span></div>
        <div class="muted">Private care: ${cover.covered?'Employer cover active':'No employer cover'} · ${S.insurance?.health?'Insured':'Uninsured'}</div>
        <div style="margin-top:4px">Perk: ${esc(perk)}</div>
      </div>
    </div>
  `;
}

/* v2.19 W5 — a second job loss in the same calendar year loses real
   things (the bank's second letter and second payment holiday, the
   second spouse/children/visa conversations) because the merge guards
   hold each reaction to once a year. The guards stay; what changes is
   that the player is told, in plain words, on the Career tab itself —
   not only in the journal. The first loss's mortgage choice is named,
   because that choice still stands. Shown only in the year it happened. */
function renderSecondLossNoteHtml(S) {
  const note = S?.career?.jobLoss?.secondLossNote;
  if (!note || note.year !== S.year || !Array.isArray(note.kinds) || !note.kinds.length) return '';
  const bits = note.kinds.map((k) => SECOND_LOSS_KIND_WORDS[k] || `the ${k} reaction already fired this year`).join('; ');
  const choice = note.mortgageChoice
    ? ` The first time, you ${esc(note.mortgageChoice)} — that choice still stands.`
    : ' The choice you made the first time still stands.';
  return `
    <div class="card" style="border:2px solid var(--brand-crimson);background:rgba(180,35,24,0.10)">
      <div class="section-head">
        <h3 style="color:var(--brand-crimson)">⚠ You Lost Your Job Twice This Year</h3>
        <span class="hud-pill">${esc(String(note.year))}</span>
      </div>
      <div class="muted">
        You lost your job again in ${esc(String(note.year))}, and each of these already happened once this year: ${esc(bits)}.${esc(choice)}
      </div>
    </div>
  `;
}

export function renderWorkTabHtml(S, uiState = {}) {
  ensureExtendedState(S);
  const sub = uiState.workSub || 'jobs';
  const allJobs = listAvailableJobs(S);
  const allVentures = listAllBusinessVentures(S);

  /* v2.8 §1 (W1) — the 'boards' subtab was only ever the Education stub
     (a card pointing at the other tab). The stub is deleted, so the subtab
     goes with it; school, university, IELTS and boards live on the
     Education tab itself. */
  const nav = renderSubtabs('work', [
    { id: 'jobs', label: `Job Market (${allJobs.length} Tracks)` },
    { id: 'ventures', label: `Enterprises (${allVentures.length})` },
    { id: 'gigs', label: 'Part-Time & Cash Gigs' }
  ], sub);

  const careerBanner = renderEditorialBannerHtml(pickDynamicBanner(S, 'work', sub), `${getCountry(S.country).name} Vocations & Private Enterprise`);
  if (sub === 'ventures') {
    return careerBanner + nav + renderVenturesSubtabHtml(S, uiState, allVentures);
  }
  if (sub === 'gigs') {
    return careerBanner + nav + renderSideGigsSubtabHtml(S);
  }

  const cObj = getCountry(S.country);
  if (S.player.age < 18) {
    return `${careerBanner}${nav}<div class="card"><p class="muted">Full-time careers open at age 18 (check Part-Time & Cash Gigs from age 16+!).</p></div>`;
  }

  /* v2.18 W2 §2 — the Career tab is a desk: the current work, the
     pay, the contract, the next promotion and what it needs, the
     benefits, your standing at work, and what you can do — each in
     its place, none of it twice. What was duplicated before:
     - the boss + performance % in the header, in Performance, and in
       the dashboard (the dashboard owns them now);
     - the pension in Benefits and in the market pension section (the
       market section owns it now);
     - the next rung + Apply button in the ladder and in the actions
       Promotion block (the ladder owns them now);
     - Performance as a whole (attendance / quality / teamwork /
       manager's view) in renderPerformanceHtml and in the dashboard's
       three views (the dashboard owns them now — the function is
       deleted, not just uncalled).
     The sections below are the desk: each carries data-desk once. */
  let currentJobHtml = '';
  if (S.career.employed && S.career.job) {
    const job = S.career.job;
    const isCit = S.legal.citizenships.includes(S.country) || S.legal.residency.kind === 'permanent_resident';
    const slip = salaryNetFor(S);

    currentJobHtml = `
      <div class="card card-elevated">
        <section data-desk="current-work">
          <div class="section-head">
            <h2>${icon('work', 18)} ${esc(job.title)}</h2>
            <span class="hud-pill">${esc(job.employer)}</span>
          </div>
          <div class="item-row">
            <div class="item-row-main">
              <span>${esc(cObj.name)} · ${S.career.yearsExperience} yrs experience · ${job.monthsInRole} months in this role (since ${job.startYear})</span>
            </div>
          </div>
          ${renderCareerWorkHtml(S)}
        </section>
        <section data-desk="pay">
          <div style="margin-top:12px"><h3 style="margin:0">Pay</h3></div>
          ${renderPayslipHtml(S, job, cObj, isCit)}
        </section>
        <section data-desk="contract">
          <div style="margin-top:12px"><h3 style="margin:0">Contract</h3></div>
          ${renderJobContractHtml(S, job, cObj)}
        </section>
        <section data-desk="promotion">
          <div style="margin-top:12px"><h3 style="margin:0">Next Promotion</h3></div>
          ${renderJobLadderHtml(S, job)}
        </section>
        <section data-desk="benefits">
          <div style="margin-top:12px"><h3 style="margin:0">Benefits</h3></div>
          ${renderJobBenefitsHtml(S, job, slip, cObj)}
          <div class="muted" style="margin-top:4px">Your pension lives in Your Standing at Work below — one place, not two.</div>
        </section>
        <section data-desk="standing">
          <div style="margin-top:12px"><h3 style="margin:0">Your Standing at Work</h3></div>
          ${/* v2.15 W2 — career market: dashboard (boss, team, numbers), headhunter offer, pension, mentor & rival. */ renderCareerMarketHtml(S)}
        </section>
        <section data-desk="actions">
          <div style="margin-top:12px"><h3 style="margin:0">What You Can Do</h3></div>
          ${renderJobActionsHtml(S, job)}
        </section>
      </div>
    `;
  }

  /* v2.9 (M5) — when pay is withheld the journal fires once and nothing
     else says so. S.money._salaryWithheldNoted is set in economyEngine
     while the player has no valid work authorisation; it clears the month
     the status is regularised again. */
  const withheldHtml = S.money._salaryWithheldNoted ? `
    <div class="card" style="border:2px solid var(--brand-crimson);background:rgba(180,35,24,0.10)">
      <div class="section-head">
        <h3 style="color:var(--brand-crimson)">⚠ Salary Withheld — Not Being Paid</h3>
        <span class="hud-pill">Until status is regularised</span>
      </div>
      <div class="muted">
        Your employer cannot legally pay you while your work authorisation in ${esc(cObj.name)} is not valid.
        ${S.career.job ? `Withheld: about <strong>${esc(formatMoney(S.career.job.monthlyGross, S.country))}</strong> a month (your gross pay).` : 'Your pay is held back this month.'}
        It clears as soon as your residence / work status is regularised — fix the visa, and pay resumes.
      </div>
    </div>
  ` : '';

  const q = String(uiState.jobQuery || '').trim().toLowerCase();
  const onlyQual = !!uiState.jobOnlyQualified;
  const filteredJobs = allJobs.map((j, origIdx) => ({ ...j, origIdx })).filter(j => {
    if (onlyQual && !j.qualifiedByDegree) return false;
    if (q && !(`${j.title} ${j.trackLabel} ${j.employer}`.toLowerCase().includes(q))) return false;
    return true;
  });

  const trackCount = Object.keys(getMergedCareerTracks(S.year)).length;
  const employerCount = countEmployerNames();
  return `
    ${careerBanner}
    ${nav}
    ${withheldHtml}
    ${renderSecondLossNoteHtml(S)}
    ${currentJobHtml}
    ${flyingDutyStatus(S).grounded?'<div class="card"><strong>Ground duty</strong> <span title="Employer pay estimate." aria-label="Information">ⓘ</span><p>Base pay 50% · Overtime unavailable</p><p>Renew medical & simulator checks</p></div>':''}
    ${!S.career.job&&S.player.age>=58?`<div class="card"><strong>${S.career.retired?'Retired':'Retirement'}</strong><p>${S.career.retired?'Next pension: '+esc(formatMoney(retirementIncomePreview(S).monthly,S.country))+'/mo':(S.country==='usa'?'State pension: age 62 · 40 credits':'Pension depends on work history')}</p>${!S.career.retired?'<button class="btn" data-action="retire">Retire</button>':''}</div>`:''}
    <div class="card">
      <div class="section-head">
        <h3>Local Job Market — ${esc(cObj.name)} (${filteredJobs.length}/${allJobs.length})</h3>
        <span class="muted">Game job listings</span>
      </div>
      ${S.career.lastApplication ? `<p class="muted">Last application: <strong>${esc(S.career.lastApplication.title)}</strong> at ${esc(S.career.lastApplication.employer)} — ${S.career.lastApplication.hired ? '✓ Hired. ' : ''}${esc(S.career.lastApplication.reason)}</p>` : ''}
      <div class="catalog-filter-bar">
        <input type="search" class="filter-input" data-filter="jobQuery" placeholder="Search ${trackCount} tracks or ${employerCount} employers (e.g. AI, Medicine, CIB, Aramco)..." value="${esc(uiState.jobQuery || '')}">
        <button type="button" class="btn btn-sm ${onlyQual ? 'btn-navy' : ''}" data-action="toggle-job-qual">${onlyQual ? '✓ Qualified Only' : 'Show Qualified Only'}</button>
      </div>
      ${(() => {
        /* v2.18 purge — what every job in this country comes with, printed
           once above the market instead of on all 35 listings: medical
           cover, sick leave and the standard annual-leave days are the
           same for every job here. A listing only adds its own leave
           line when its track experience earns more than the standard. */
        const mc = contractRuleFor(S.country);
        const mv = vacationRuleFor(S.country);
        const base = vacationEntitlementDays(S.country, 0);
        const rise = (mv.steps || []).length ? `, rising to ${mv.steps[mv.steps.length - 1][1]} days after ${mv.steps[mv.steps.length - 1][0]} years` : '';
        return `<p class="muted">Annual leave: ${base} days · Sick leave: ${mc.sickDaysPaid} paid days</p>`;
      })()}
      ${filteredJobs.slice(0, 35).map(j => renderMarketListingHtml(S, j)).join('')}
    </div>
  `;
}

function renderEduAndLicensingHtml(S) {
  const cObj = getCountry(S.country);
  const edu = S.education;
  const mil = S.legal.military;

  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h3>${icon('graduation', 18)} Qualifications${mil.applicable?' &amp; service':''}</h3>
        <span class="hud-pill">${esc(({graduated_high:'Secondary complete',high:'Secondary school',middle:'Middle school',primary:'Primary school',infancy:'Early years',completed:'Studies completed',university:'At university'})[edu.stage]||edu.stage)}</span>
      </div>
      ${/* v2.7 — the Academic Record line lived here AND in the Education
             tab's own top card: it rendered twice. The top card owns it now;
             this card keeps only degrees, conscription, syndicate and
             postgrad — each section exactly once. */''}
      ${edu.degrees.length > 0 ? `
        <div class="item-row">
          <div class="item-row-main">
            <strong>Degrees Earned</strong>
            <span>${esc(edu.degrees.map(d => esc(degreeProgramFor(S.country,d)?.label||d)).join(', '))} · Languages: ${esc(edu.languages.join(' · '))}</span>
          </div>
        </div>
      ` : `
        <div class="item-row">
          <div class="item-row-main">
            <strong>Degrees Earned</strong>
            <span>${edu.highSchoolScore != null ? `${esc(cObj.examSystem.name)} Score: ${edu.highSchoolScore}%` : 'No degree yet.'} · Languages: ${esc(edu.languages.join(' · '))}</span>
          </div>
        </div>
      `}
      ${mil.applicable ? `
        <div class="item-row">
          <div class="item-row-main">
            <strong>National Military Service</strong>
            <span>Status: ${esc(mil.status.replace('_', ' '))}${mil.exemptionReason ? ` (${esc(mil.exemptionReason)})` : ''}${mil.monthsRemaining > 0 ? ` · ${mil.monthsRemaining} months remaining` : ''}</span>
          </div>
          <span class="hud-pill">${mil.travelPermitted ? 'Travel Cleared' : 'Travel Restricted'}</span>
        </div>
      ` : ''}

      ${edu.degrees.length > 0 ? `
        <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--line-soft);display:flex;flex-wrap:wrap;gap:6px;align-items:center">
          <button class="btn btn-sm ${S.syndicate?.registered ? '' : 'btn-primary'}" data-action="register-syndicate" ${S.syndicate?.registered || S.money.cash<Math.round(convertCurrency(185,'usa',S.country,S.year)) ? 'disabled' : ''}>
            ${S.syndicate?.registered ? `✓ ${esc(S.syndicate.name)}` : `Join professional association · ${esc(formatMoney(Math.round(convertCurrency(185,'usa',S.country,S.year)),S.country))}`}
          </button>
          ${S.postgrad?.active ? `<span class="hud-pill">Studying ${esc(S.postgrad.active.label)} (${S.postgrad.active.monthsLeft}m left)</span>` : `
            <button class="btn btn-sm" data-action="enroll-postgrad" data-tier="masters_mba" ${S.postgrad?.completed?.some(p => p.tier === 'masters_mba') || S.education.university || S.money.cash<Math.round(convertCurrency(6200,'usa',S.country,S.year)) ? 'disabled' : ''}>
              ${S.postgrad?.completed?.some(p => p.tier === 'masters_mba') ? '✓ Holds MSc/MBA' : `2-year master’s · ${esc(formatMoney(Math.round(convertCurrency(6200,'usa',S.country,S.year)),S.country))} upfront`}
            </button>
            <button class="btn btn-sm" data-action="enroll-postgrad" data-tier="fellowship_phd" ${S.postgrad?.completed?.some(p => p.tier === 'fellowship_phd') || S.education.university || !S.postgrad?.completed?.some(p=>p.tier==='masters_mba') || S.money.cash<Math.round(convertCurrency(8500,'usa',S.country,S.year)) ? 'disabled' : ''}>
              ${S.postgrad?.completed?.some(p => p.tier === 'fellowship_phd') ? '✓ Holds Fellowship/PhD' : `3-year doctorate · ${esc(formatMoney(Math.round(convertCurrency(8500,'usa',S.country,S.year)),S.country))} upfront`}
            </button>${S.postgrad?.completed?.some(p=>p.tier==='fellowship_phd')?lockReason('Doctorate already completed'):S.education.university?lockReason('Finish or withdraw from the current course first'):!S.postgrad?.completed?.some(p=>p.tier==='masters_mba')?lockReason('Complete a master’s first'):S.money.cash<Math.round(convertCurrency(8500,'usa',S.country,S.year))?lockReason('Save the full doctorate tuition shown'):''}
          ${(!S.postgrad?.active&&!S.education.university)?['masters_mba','fellowship_phd'].filter(tr=>!S.postgrad?.completed?.some(p=>p.tier===tr)&&(tr==='masters_mba'||S.postgrad?.completed?.some(p=>p.tier==='masters_mba'))&&postgradParentsCanPay(S,tr)).map(tr=>`<button class="btn btn-sm" data-action="enroll-postgrad" data-tier="${tr}" data-funding="family">Parents pay: ${tr==='masters_mba'?'master’s':'doctorate'} · ${esc(formatMoney(postgradFee(S,tr),S.country))}</button>`).join(''):''}
          ${(!S.postgrad?.active&&!S.education.university&&S.education.degrees.length&&S.player.age>=18&&!S.money.loans.some(l=>l.narrativeKind==='student'))?['masters_mba','fellowship_phd'].filter(tr=>!S.postgrad?.completed?.some(p=>p.tier===tr)&&(tr==='masters_mba'||S.postgrad?.completed?.some(p=>p.tier==='masters_mba'))).map(tr=>`<button class="btn btn-sm" data-action="enroll-postgrad" data-tier="${tr}" data-funding="loan">Student loan: ${tr==='masters_mba'?'master’s':'doctorate'} · ${esc(formatMoney(postgradFee(S,tr),S.country))} at 6%, 60 payments after you finish</button>`).join(''):''}
          `}
          <p class="muted">Tuition is paid once, by you or (30 and under, if their funds cover it) your parents. Doctorate requires a master’s. Save the fee shown to enrol. Completion gives a game pay bonus.</p>
        </div>
      ` : ''}
    </div>

    ${S.player.age >= 17 ? `
      <div class="card">
        <div class="section-head">
          <h3>Language Certifications (IELTS / Goethe / FSP Medical C1 / TEF)</h3>
          <span class="muted">Unlocks Chancenkarte points & medical boards</span>
        </div>
        ${LANGUAGE_EXAMS.map(ex => {
          const fee = Math.round(convertCurrency(ex.feeUsd, 'usa', S.country, S.year));
          const held=hasCurrentLanguage(S,new RegExp(ex.lang.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
          const attempted=S.credentials.examAttempts?.[`language_${ex.id}`]===S.year*12+S.month;
          /* v2.7 — same rule as scholarships: no live button that leads to a
             refusal; a fee the player cannot pay says so. */
          const lock = held ? null : attempted?'Already sat this exam this game month':(S.money.cash || 0) < fee ? `Needs ${formatMoney(fee, S.country)} — you hold ${formatMoney(S.money.cash || 0, S.country)}` : null;
          return `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(ex.label)}</strong>
                <span>Certifies: <strong>${esc(ex.lang)}</strong> · Fee: <strong class="mono">${esc(formatMoney(fee, S.country))}</strong> · Valid ${ex.validityYears} yrs</span>
              </div>
              ${held ? '<span class="hud-pill">✓ Certified</span>' : lock ? `<span class="hud-pill">${esc(lock)}</span>` : `<button class="btn btn-sm btn-primary" data-action="sit-exam" data-kind="language" data-id="${ex.id}">Sit Exam</button>`}
            </div>
          `;
        }).join('')}
      </div>

      <div class="card">
        <div class="section-head">
          <h3>International Medical, Engineering & Financial Licensing Boards</h3>
          <span class="muted">Required for overseas doctors/engineers + boosts pay +18%</span>
        </div>
        ${PROFESSIONAL_LICENSES.map(lic => {
          const fee = Math.round(convertCurrency(lic.feeUsd, 'usa', S.country, S.year));
          const held = S.credentials.licenses.includes(lic.id);
          const tier1 = lic.id === 'lic_uae_dha' && (S.credentials.licenses.includes('lic_uk_plab') || S.credentials.licenses.includes('lic_us_usmle'));
          /* v2.7 — a board that needs a degree or a language says so instead
             of offering a live button that refuses after the click. */
          const lock = held ? null
            : lic.reqDegree && !S.education.degrees.includes(lic.reqDegree) ? `Needs a ${lic.reqDegree.toUpperCase()} degree`
            : lic.reqLang && !hasCurrentLanguage(S,new RegExp(lic.reqLang.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))) ? `Needs current ${lic.reqLang}`
            : S.credentials.examAttempts?.[`board_${lic.id}`]===S.year*12+S.month?'Already sat this board this game month'
            : (S.money.cash || 0) < fee ? `Needs ${formatMoney(fee, S.country)} — you hold ${formatMoney(S.money.cash || 0, S.country)}`
            : null;
          return `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(lic.label)}</strong>
                <span>${lic.reqDegree ? `Req: ${lic.reqDegree.toUpperCase()}` : 'Open'}${lic.reqLang ? ` + ${lic.reqLang}` : ''} · Fee: <strong class="mono">${esc(formatMoney(fee, S.country))}</strong>${tier1 ? ' · ★ Tier-1 UK/US Exam Exempt!' : ''}</span>
              </div>
              ${held ? '<span class="hud-pill">✓ Licensed</span>' : lock ? `<span class="hud-pill">${esc(lock)}</span>` : `<button class="btn btn-sm btn-primary" data-action="sit-exam" data-kind="board" data-id="${lic.id}">Sit Board</button>`}
            </div>
          `;
        }).join('')}
      </div>
    ` : ''}
  `;
}

/* v2.17 W5 — branch "Hire a manager" wart fix (v2.14): the branch
   row's button used to be a signpost toast (main.js:
   biz-branch-hire-manager) pointing at the branch's own card. It now
   hires for real. renderBranchesHtml (businessBranches.js — not this
   round's file) still emits the old signpost button, so views.js
   replaces it at the point the section is embedded: for each branch
   without a manager, the row shows that branch's real manager
   shortlist — the same candidates, the same biz-hire-manager hire
   buttons (candidate, skill, wage on the button, hiring costs one
   month's wage), as the branch's own card. Clicking hires a manager
   for THAT branch; the old toast handler in main.js is then dead
   code and the coordinator can delete it at merge. */
function branchHireShortlistHtml(S, branch) {
  if (!branch || branch.manager) return '';
  const shortlist = managerShortlist(S, branch);
  if (!shortlist.length) return '';
  return shortlist.map(c => `
        <button class="btn btn-sm" data-action="biz-hire-manager" data-biz="${esc(branch.id)}" data-person="${esc(c.personId)}" data-name="${esc(c.name)}" data-skill="${c.skill}" data-wage="${c.wage}" data-loyalty="${c.loyalty}" title="Hire ${esc(c.name)} to manage ${esc(branch.name)} — ${esc(formatMoney(c.wage, branch.figuresCurrency || branch.country || S.country))}/month">Hire ${esc(c.name.split(' ')[0])} — ${esc(c.tier)} · skill ${c.skill} · ${esc(formatMoney(c.wage, branch.figuresCurrency || branch.country || S.country))}/mo</button>`).join('');
}

function fixBranchHireButtons(S, branchesHtml) {
  if (!branchesHtml) return '';
  return branchesHtml.replace(
    /<button class="btn btn-sm" data-action="biz-branch-hire-manager" data-biz="([^"]+)">Hire a manager<\/button>/g,
    (match, branchId) => {
      const branch = (S.career.businesses || []).find(b => b && b.id === branchId);
      const shortlistHtml = branch ? branchHireShortlistHtml(S, branch) : '';
      return shortlistHtml
        ? `<span style="display:inline-flex;flex-wrap:wrap;gap:6px;">${shortlistHtml}</span>`
        : match;
    }
  );
}

/* v2.11 W1 — Ventures sub-tab, rewritten for multiple businesses.
   The list is NEVER hidden while a business is active (Verdant's
   Hustle tab hides the whole list — not copied). Every business shows
   its name/type/level/mode, its full P&L table (revenue, rent, wages,
   other, tax, net), its last-12-months history, its run ops with cost /
   effect / availability, and the portfolio totals. A business losing
   money shows red numbers, a warning and a choice (expand/invest,
   Team Bonus to cut costs, or exit & sell). The launch list shows
   every venture with its TRUE monthly cost, its era availability and
   every lock reason — never a launch button on a locked option. */
function renderVenturesSubtabHtml(S, uiState, allVentures) {
  migrateBusinesses(S);
  const businesses = S.career.businesses || [];
  const desk=uiState.bizDesk||((businesses||[]).some(b=>!b.isBranch)?'owned':'start');
  /* v2.20 I1 — branches are records in S.career.businesses, but they
     render ONLY as branch rows inside the parent card
     (renderBranchesHtml). Cards, the header count and the portfolio
     totals read the non-branch portfolio; the storage is unchanged —
     settlement, listBranches and the monthly loop still read the
     branch records from S.career.businesses. */
  const portfolioBusinesses = businesses.filter(b => b && !b.isBranch);
  const selectedBusiness=portfolioBusinesses.find(b=>b.id===uiState.bizCompany)||portfolioBusinesses[0];
  const businessTab=uiState.bizTab||'overview';
  const q = String(uiState.bizQuery || '').trim().toLowerCase();
  const replacedStartTypes=new Set(['cafe','restaurant','retail_shop','pharmacy','clinic','logistics','academy','software_startup','saas_ai_agency','factory','construction','farm']);
  const startVentures=allVentures.filter(b=>!replacedStartTypes.has(b.id));
  const filtered=startVentures.filter(b=>(!uiState.bizSector||uiState.bizSector==='all'||businessSector(b)===uiState.bizSector)&&(!q||b.label.toLowerCase().includes(q)||String(b.desc||'').toLowerCase().includes(q)));
  const workload = computeWorkload(S);
  const jobHours = workload.jobHours;

  /* v2.18 W2 — portfolio totals read businessLastMonthNet, the one
     source of truth (the folded lastPL the settlement posted), never
     a local re-sum of lastPL fields. */
  const totals = businesses.filter(b=>b&&!b.dead).reduce((t, biz) => {
    const r = businessLastMonthNet(S, biz);
    if (!r.hasPL) return t;
    t.settled++;t.revenue += r.revenue; t.costs += r.costs; t.tax += r.tax; t.net += r.net;
    return t;
  }, { settled:0,revenue: 0, costs: 0, tax: 0, net: 0 });

  const bizCard = (biz) => {
    const pl = biz.lastPL;
    /* v2.18 W2 — the card's net IS businessLastMonthNet: the same
       helper the Finance tab and the Timeline read, so the three
       sites cannot disagree. */
    const netR = businessLastMonthNet(S, biz);
    const staffCount = (biz.staff || []).length;
    const losing = (biz.monthsLosing || 0) > 0;
    const mgrName = biz.manager && biz.manager.name ? biz.manager.name : '';
    const modeLabel = mgrName
      ? (biz.mode === 'full_time' ? `Run by ${mgrName} · full-time scale` : `Run by ${mgrName} · part-time scale (revenue ×0.6)`)
      : biz.mode === 'full_time'
      ? `Full-time (~${BUSINESS_FULL_TIME_HOURS} hrs/week)`
      : `Part-time (${BUSINESS_PART_TIME_HOURS} hrs/week, revenue ×0.6)`;
    const plHtml = pl ? `
      <table class="data-table" style="width:100%;margin:8px 0">
        <tr><th style="text-align:left">This month</th><th style="text-align:right">Amount</th></tr>
        <tr><td>Revenue</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.revenue, S.country))}</td></tr>
        ${pl.franchise > 0 ? `<tr><td style="padding-left:12px">— of which franchise royalties</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.franchise, S.country))}</td></tr>` : ''}
        <tr><td>Rent (${esc(biz.premises?.label || 'No premises')})</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.rent, S.country))}</td></tr>
        <tr><td>Payroll + benefits (${staffCount} staff)</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.wages, S.country))}</td></tr>
        <tr><td>Other costs (supplies, utilities, marketing)</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.other, S.country))}</td></tr>
        ${pl.remote > 0 ? `<tr><td>Remote management</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.remote, S.country))}</td></tr>` : ''}
        ${pl.manager > 0 ? `<tr><td>Manager — ${esc(biz.manager?.name || 'manager')}</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.manager, S.country))}</td></tr>` : ''}
        ${pl.reinvest > 0 ? `<tr><td>Growth reinvestment (manager's growth brief)</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.reinvest, S.country))}</td></tr>` : ''}
        ${pl.headOffice > 0 ? `<tr><td>Head office</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.headOffice, S.country))}</td></tr>` : ''}
        ${pl.regionalManager > 0 ? `<tr><td>Regional manager</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.regionalManager, S.country))}</td></tr>` : ''}
        ${pl.staffSavings > 0 ? `<tr><td>Staff savings</td><td style="text-align:right" class="mono">−${esc(formatMoney(pl.staffSavings, S.country))}</td></tr>` : ''}
        ${pl.supplyChainSaving > 0 ? `<tr><td>Supply-chain saving</td><td style="text-align:right" class="mono">−${esc(formatMoney(pl.supplyChainSaving, S.country))}</td></tr>` : ''}
        <tr><td>${esc(pl.taxLabel)}</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.tax, S.country))}</td></tr>
        <tr><td><strong>Company net after tax, before debt and owners</strong></td><td style="text-align:right" class="mono" data-biz-net="${netR.net ?? ''}" data-biz-name="${esc(biz.name)}"><strong class="${(netR.net ?? 0) < 0 ? 'text-bad' : 'text-good'}">${netR.hasPL ? esc(formatMoney(netR.net, S.country)) : '—'}</strong></td></tr>
        ${pl.debtRepaid>0?`<tr><td>Less old company bills</td><td>${esc(formatMoney(pl.debtRepaid,S.country))}</td></tr>`:''}
        ${pl.familyRetained>0?`<tr><td>Less cash retained in company</td><td>${esc(formatMoney(pl.familyRetained,S.country))}</td></tr>`:''}
        ${pl.coOwnerDistribution>0?`<tr><td>Less family/former-partner dividends</td><td>${esc(formatMoney(pl.coOwnerDistribution,S.country))}</td></tr>`:''}
        ${pl.investorDistribution>0?`<tr><td>Less investor distribution</td><td>${esc(formatMoney(pl.investorDistribution,S.country))}</td></tr>`:''}
        ${Number.isFinite(pl.ownerCash)?`<tr><td><strong>Your business cash</strong></td><td><strong>${esc(formatMoney(pl.ownerCash,S.country))}</strong></td></tr>`:''}
        ${pl.harvestOut > 0 ? `<tr><td>Plus harvest cash out (lands separately — taken from the business's capital)</td><td style="text-align:right" class="mono">${esc(formatMoney(pl.harvestOut, S.country))}</td></tr>` : ''}
      </table>` : `
      <p class="muted">No month settled yet — the first profit-and-loss lands at the end of this month.</p>`;
    const historyHtml = (biz.history || []).length ? `
      <div class="muted" style="margin:6px 0"><strong>${biz.history.length === 1 ? 'Last month:' : `Last ${Math.min(12, biz.history.length)} months:`}</strong>
        ${(biz.history || []).slice(-12).map(h => `${MONTH_NAMES[(h.month || 1) - 1].slice(0, 3)} ${h.year}: ${formatMoney(h.net, S.country)} net`).join(' · ')}
      </div>` : '';
    /* v2.20 I3 — ONE losing counter, one honest sentence: the losing
       streak (monthsLosing) and the closure rule (3 months the
       household cannot pay for — misses, not losing months) are
       different numbers and the old text mixed them ("after 3 months
       the household cannot cover" while the business was merely
       losing). Capital left is the equity: capital in plus retained
       earnings. */
    const capitalLeft = Math.max(0, Math.round((Number(biz.capitalInvested) || 0) + (Number(biz.retainedEarnings) || 0)));
    const losingHtml = losing ? `
      <div class="card" style="border:2px solid var(--brand-crimson);background:rgba(180,35,24,0.10);margin:8px 0">
        <strong style="color:var(--brand-crimson)">⚠ Losing money — ${biz.monthsLosing} month${biz.monthsLosing > 1 ? 's' : ''} in a row.</strong>
        <div class="muted">Unpaid months ${biz.misses||0}/3 · Equity ${esc(formatMoney(capitalLeft,S.country))}</div>
        ${biz.enterprise&&biz.enterprise.stage==='trading'&&(Number(biz.enterprise.reach)||0)<1.2?'<div class="muted">Still building customers. A new business usually takes a year or two to fill its capacity, so early losses are normal, but payroll and rent keep running and come out of the company cash.</div>':''}
      </div>` : '';
    /* v2.20 I3 — the debt line follows the real state: the miss count
       is never reset while debt stands, the month the debt began is
       named, and the player can pay it down from cash (a profitable
       month also pays it from its own profit, in the settlement). The
       button needs one main.js branch (biz-repay-debt); see
       repayBusinessDebt in economyEngine.js. */
    const debtSinceTxt = (biz.debtSinceYear && biz.debtSinceMonth) ? ` (${MONTH_NAMES[(biz.debtSinceMonth || 1) - 1]} ${biz.debtSinceYear})` : '';
    const debtHtml = (biz.debtLocal || 0) > 0 ? `<div class="muted">Company bills, before dividends: <strong class="text-bad">${esc(formatMoney(biz.debtLocal, S.country))}</strong> — owes ${esc(formatMoney(biz.debtLocal, S.country))} from ${biz.misses || 0} missed month${(biz.misses || 0) === 1 ? '' : 's'}${esc(debtSinceTxt)} — founder guarantees uncovered bills; other owners risk their stake only. <button class="btn btn-sm" data-action="biz-repay-debt" data-biz="${biz.id}" title="Pay the debt down from your cash now">Repay debt (${esc(formatMoney(biz.debtLocal, S.country))})</button></div>` : '';
    /* v2.20 I4 — the card is a menu now: the P&L, the history and the
       alerts stay open (that is the card), and everything else lives
       inside collapsed sections — the 7-section operating menu, with
       the old open sections folded into it (staff + manager → Staff,
       premises + branches → Premises, loan + exits + group costs →
       Cash, brand → Marketing, group supply chain → Suppliers), plus
       one collapsed Ownership details (will & heir) and one collapsed
       Decisions details. Nothing that used to sit open on the card
       sits open any more. */
    const levelCap = businessLevelCap(biz);
    const managedBadge = businessIsManaged(S, biz) ? 'Managed' : 'Unmanaged — nobody runs it';
    return `
    <div class="biz-workspace" style="margin-bottom:10px">
      <div class="section-head">
        <div class="biz-card-title">${businessIllustration(biz)}<h3>${esc(biz.name)}</h3></div>
        <span class="hud-pill">${biz.enterprise?`${biz.enterprise.stage} · ${mgrName?esc(`Run by ${mgrName}`):biz.mode==='full_time'?'Full-time owner':'Part-time owner'}`:biz.tech?`${biz.tech.stage==='live'?'Trading':'Pre-launch'} · ${mgrName?esc(`Run by ${mgrName}`):biz.mode==='full_time'?'Full-time founder':'Part-time founder'}`:`${Number.isFinite(levelCap)?`Level ${biz.level}/${levelCap}`:`Level ${biz.level}`} · ${esc(modeLabel)}`}</span>
        <span class="hud-pill">${managedBadge}</span>
        ${!businessIsManaged(S,biz)?'<span class="biz-alert">Management hours uncovered</span>':''}
      </div>
      <div class="biz-subtitle">${esc(getCountry(biz.country||S.country).name)} · ${esc(biz.premises?.label||'Home based')} · ${staffCount} ${staffCount===1?'employee':'employees'}</div>
      <nav class="biz-work-tabs" aria-label="Company area">${[['overview','Overview'],['products','Products'],['team','Team'],['operations','Operations'],['growth','Growth'],['money','Money']].map(([id,label])=>`<button class="${businessTab===id?'active':''}" aria-pressed="${businessTab===id}" data-action="biz-tab" data-area="${id}">${label}</button>`).join('')}</nav>
      ${renderBranches(S,biz,businessTab)}${renderMigration(S,biz,businessTab)}${biz.enterprise?renderCompany(S,biz,businessTab):biz.tech?renderTech(S,biz,businessTab):''}
      ${renderDivorceShares(S,biz,businessTab)}${renderCompanyMarital(S,biz,businessTab)}
      ${renderFamily(S,biz,businessTab)}${renderFamilyRota(S,biz,businessTab)}${renderHiring(S,biz,businessTab)}${renderFamilyOwnership(S,biz,businessTab)}
      ${renderSpace(S,biz,businessTab)}
      ${renderOperating(S,biz,businessTab)}${renderCompetition(S,biz,businessTab)}${renderCompliance(S,biz,businessTab)}${renderCustomers(S,biz,businessTab)}${renderLots(S,biz,businessTab)}${renderContracts(S,biz,businessTab)}
      ${renderCatalog(S,biz,businessTab)}
      ${renderInputs(S,biz,businessTab)}
      ${renderEquipment(S,biz,businessTab,operatingBase(S,biz))}
      ${businessTab==='overview'?`
      <div class="biz-period">LAST SETTLED MONTH ${pl?`· ${MONTH_NAMES[(biz.history?.at(-1)?.month||S.month)-1]} ${biz.history?.at(-1)?.year||S.year}`:''}</div>
      <div class="biz-kpis"><div>Sales<strong>${netR.hasPL?esc(formatMoney(netR.revenue,S.country)):'Pending'}</strong></div><div>Net profit<strong class="${(netR.net||0)<0?'text-bad':'text-good'}">${netR.hasPL?esc(formatMoney(netR.net,S.country)):'Pending'}</strong></div><div>Costs &amp; tax<strong>${netR.hasPL?esc(formatMoney(netR.costs+netR.tax,S.country)):'Pending'}</strong></div><div>${biz.tech||biz.enterprise?'Investor payout':'Repeat customers'}<strong>${biz.tech||biz.enterprise?esc(formatMoney(pl?.investorDistribution||0,S.country)):Math.round((biz.repeatRate??.5)*100)+'%'}</strong></div></div>
      <section class="biz-chart-panel"><h4>Monthly net profit</h4>${businessHistoryChart(biz)||'<p class="muted">Your chart starts after two trading months.</p>'}</section>
      ${losingHtml}${debtHtml}
      <section class="biz-next"><div><small>NEXT REVIEW</small><h4>${biz.enterprise&&biz.enterprise.niche===null?'Choose your market':biz.enterprise&&biz.enterprise.stage==='ready'?'Ready to open':companyOutOfStock(biz)?'Out of stock':biz.enterprise&&biz.enterprise.stage!=='trading'?'Prepare for opening':biz.tech&&!biz.tech.niche?'Choose your first product':biz.tech&&biz.tech.stage!=='live'?'Build, test, then release':!businessIsManaged(S,biz)?'Appoint a manager':!pl?'Prepare for opening month':(biz.monthsLosing||0)>0?'Review your costs':'Review your product prices'}</h4><p>${companyOutOfStock(biz)?'There is nothing left to sell, so sales are zero while wages and rent still run. Order stock on the Products tab; it arrives and is paid next month.':biz.enterprise&&biz.enterprise.stage==='ready'?(companyOpenBlocker(biz)?'Preparation is finished, but it cannot open yet: '+companyOpenBlocker(biz)+'. Wages and other costs keep running meanwhile.':'Preparation is finished, but nothing sells until you press Open for business on the Products tab. Wages and other costs keep running meanwhile.'):!businessIsManaged(S,biz)?'Nobody is covering all the required hours.':!pl?'Check the team and prices, then advance one month.':'Decisions now affect the next trading month.'}</p></div><button class="btn btn-primary" data-action="biz-tab" data-area="${biz.tech||biz.enterprise?'products':!businessIsManaged(S,biz)||!pl?'team':(biz.monthsLosing||0)>0?'money':'products'}">${biz.tech||biz.enterprise?'Open product':!businessIsManaged(S,biz)?'Find manager':!pl?'Review team':(biz.monthsLosing||0)>0?'See costs':'Set prices'}</button></section>
      ${biz.lastPL?.safetyNotes?.length?`<div class="biz-alert">${biz.lastPL.safetyNotes.map(esc).join(' · ')}</div>`:''}
      <details class="biz-company-info"><summary>Company facts</summary>Founded ${MONTH_NAMES[(biz.foundedMonth||1)-1]} ${biz.foundedYear} · Capital ${esc(formatMoney(biz.capitalInvested,S.country))}<div class="biz-mode-control"><button class="btn" data-action="biz-mode" data-biz="${biz.id}" data-mode="${biz.mode==='full_time'?'part_time':'full_time'}">Switch to ${biz.mode==='full_time'?'part-time':'full-time'}</button></div></details>
      `:''}
      ${businessTab==='money'?`<section class="biz-statement"><h4>Last monthly statement</h4>${biz.enterprise?'<p class="muted">Cash-basis game statement: stock purchases and project inputs count when paid, not when sold. Net here is operating cash after game tax, not accrual accounting profit.</p>':''}${plHtml}${historyHtml}${debtHtml}</section>`:''}
      ${renderOperationsMenuHtml(S, biz, {
        area:businessTab,
        staffHtml: renderStaffListHtml(S, biz, uiState.bizEmployee),
        managerHtml: renderManagerSectionHtml(S, biz),
        premisesHtml: renderBusinessPremisesSection(S, biz),
        branchesHtml: fixBranchHireButtons(S, renderBranchesHtml(S, biz)),
        loanHtml: renderBusinessLoanSection(S, biz),
        exitsHtml: renderExitsHtml(S, biz),
        brandHtml: renderBrandHtml(S, biz),
        groupCashHtml: renderGroupCashLinesHtml(S, biz),
        groupSupplyHtml: renderGroupSupplyLineHtml(S, biz)
      })}
      ${businessTab==='money'?`<details class="biz-ownership"><summary>Ownership &amp; succession</summary>${renderBusinessWillSection(S,biz)}</details>`:''}
      ${businessTab==='overview'&&!biz.tech&&!biz.enterprise&&renderDecisionsHtml(S,biz)?`<details class="biz-decisions"><summary>Company decisions</summary>${renderDecisionsHtml(S,biz)}</details>`:''}
    </div>`;
  };

  /* v2.18 W3 — the hours note and the manager/hours constraint depend
     only on the player's state (job hours, free hours, manager wage),
     never on the venture, so they are written ONCE above the list
     instead of on every row. Same for the profit-unknown note: one
     sentence, once. */
  const timeNote = jobHours > 0
    ? `Full-time adds ~${BUSINESS_FULL_TIME_HOURS} hrs/week to your job (${jobHours} hrs/week) = ${jobHours + BUSINESS_FULL_TIME_HOURS} hrs/week — over 50 means Stretched: +5 stress and −2 job performance a month. Running it full-time yourself means leaving your job — hire a manager to run it and keep your job, or resign first and then launch. Part-time adds ${BUSINESS_PART_TIME_HOURS} hrs/week (revenue ×0.6; your job performance falls).`
    : `Full-time takes ~${BUSINESS_FULL_TIME_HOURS} hrs/week; part-time takes ${BUSINESS_PART_TIME_HOURS} hrs/week (revenue ×0.6).`;
  const headerConstraintNote = filtered.length ? evaluateBusinessLaunch(S, filtered[0]).constraintNote : '';
  const launchRow = (bp) => {
    const ev = evaluateBusinessLaunch(S, bp);
    const cap = ev.capitalLocal;
    /* v2.17: no forecast anywhere on the launch row. The old
       revenue / net forecast figures are deleted — a business that has
       sold nothing has no profit to show. The row shows the real
       inputs only: the capital, the monthly cost from home (other
       costs + the starter wage bill — v2.20 I3: monthlyCost is other
       costs only, the wages are charged from the staff), and the rent
       if the business moves out of the house. */
    const costFromHome = ev.costLocal + ev.wageEstimateLocal;
    const otherEstimateLocal = ev.costLocal;
    const locksHtml = ev.locks.length
      ? `<div style="margin-top:4px">${ev.locks.map(l => `<div>${esc(l)}</div>`).join('')}</div>` : '';
    /* v2.20 I1 — who runs it, chosen on the row: the engine already
       supports a manager-run launch (runBy:'manager' + a manager
       record keeps the job), but the screen never offered it. The
       shortlist is the same managerShortlist the manager tab hires
       from; picking a candidate stores it on the row until launch,
       and the launch buttons carry the candidate through. A live
       business of the same type is named here too, with a real
       "Open a second one" confirmation — a second click is never a
       silent second business. */
    const runBy = uiState[`bizRunBy_${bp.id}`] || 'self';
    const pickedMgr = uiState[`bizLaunchMgr_${bp.id}`] || null;
    const liveSameType = (S.career.businesses || []).find(b => b && !b.isBranch && !b.dead && b.typeId === bp.id);
    const allowDup = !!uiState[`bizAllowDup_${bp.id}`];
    const mgrAttrs = pickedMgr
      ? ` data-mgr-name="${esc(pickedMgr.name)}" data-mgr-skill="${pickedMgr.skill}" data-mgr-wage="${pickedMgr.wage}" data-mgr-loyalty="${pickedMgr.loyalty}" data-mgr-person="${esc(pickedMgr.personId || '')}"`
      : '';
    const dupAttr = allowDup ? ' data-allow-dup="1"' : '';
    const launchBtns = `
        <div style="display:flex;flex-direction:column;gap:6px">
          <button class="btn btn-sm btn-primary" data-action="launch-business" data-type="${bp.id}" data-mode="full_time" data-runby="${runBy}"${mgrAttrs}${dupAttr}>Launch full-time</button>
          <button class="btn btn-sm" data-action="launch-business" data-type="${bp.id}" data-mode="part_time" data-runby="${runBy}"${mgrAttrs}${dupAttr}>Launch part-time</button>
        </div>`;
    const runByHtml = `
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px">
          <span class="muted">Who runs it?</span>
          <button class="btn btn-sm${runBy === 'self' ? ' btn-primary' : ''}" data-action="biz-launch-runby" data-type="${bp.id}" data-runby="self">Run it myself</button>
          <button class="btn btn-sm${runBy === 'manager' ? ' btn-primary' : ''}" data-action="biz-launch-runby" data-type="${bp.id}" data-runby="manager">Hire a manager to run it (~${esc(formatMoney(ev.managerWageEstimateLocal, S.country))}/mo)</button>
        </div>`;
    let managerHtml = '';
    if (runBy === 'manager') {
      if (pickedMgr) {
        managerHtml = `<div class="muted" style="margin-top:4px">Manager: <strong>${esc(pickedMgr.name)}</strong> — skill ${pickedMgr.skill} · ${esc(formatMoney(pickedMgr.wage, S.country))}/mo · none of your hours, so you keep your job. <button class="btn btn-sm" data-action="biz-launch-clear-manager" data-type="${bp.id}">Change manager</button></div>`;
      } else {
        /* A launch-time shortlist needs a business-shaped record for
           the tier curve: the venture's own takings and capital. */
        const shortlist = managerShortlist(S, { country: S.country, monthlyRev: ev.revLocal, capitalInvested: ev.capitalLocal, staff: [], mode: 'part_time', manager: null });
        managerHtml = `<div class="muted" style="margin-top:4px">Pick who runs it — they cost their wage every month and it costs none of your hours, so you keep your job:</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">${shortlist.map(c => `
          <button class="btn btn-sm" data-action="biz-launch-pick-manager" data-type="${bp.id}" data-name="${esc(c.name)}" data-skill="${c.skill}" data-wage="${c.wage}" data-loyalty="${c.loyalty}" data-person="${esc(c.personId || '')}" title="Hire ${esc(c.name)} to run this business — ${esc(formatMoney(c.wage, S.country))}/month, hiring costs one month's wage">${esc(c.name.split(' ')[0])} — ${esc(c.tier)} · skill ${c.skill} · ${esc(formatMoney(c.wage, S.country))}/mo</button>`).join('')}</div>`;
      }
    }
    const dupHtml = liveSameType && !allowDup
      ? `<div class="muted" style="margin-top:4px">You already own a ${esc(bp.label)} (${esc(liveSameType.name)}, opened ${esc(MONTH_NAMES[(liveSameType.foundedMonth || 1) - 1])} ${liveSameType.foundedYear}). <button class="btn btn-sm" data-action="biz-launch-dup" data-type="${bp.id}">Open a second one</button></div>`
      : liveSameType && allowDup
        ? `<div class="muted" style="margin-top:4px">Opening a second ${esc(bp.label)} — it will be named ${esc(liveSameType.name)} 2.</div>`
        : '';
    return `<article class="biz-start-card"><div class="biz-start-head">${businessIllustration(bp)}<div><small>${esc(businessSector(bp))} · ${bp.id.startsWith('enterprise_')||bp.id==='tech_founder'?'Staged company':'Classic model'}</small><h3>${esc(bp.label)}</h3><strong>${esc(formatMoney(cap,S.country))}</strong><div class="muted">Startup capital</div></div></div><div class="biz-start-costs">Operating estimate ${esc(formatMoney(costFromHome,S.country))}/mo<br>${bp.id==='tech_founder'||bp.id.startsWith('enterprise_')?'Starter workspace included':`Premises rent +${esc(formatMoney(ev.rentEstimateLocal,S.country))}/mo`}</div>${bp.id==='tech_founder'?ventureViabilityWarningHtml(S,bp,ev)+'<p class="muted">Solo founder · optional hires cost extra.</p>':bp.id.startsWith('enterprise_')?ventureViabilityWarningHtml(S,bp,ev)+'<p class="muted">Solo founder · optional hires cost extra.</p>':ventureViabilityWarningHtml(S,bp,ev)}<details><summary>Review startup</summary><div class="muted">Wages ${esc(formatMoney(ev.wageEstimateLocal,S.country))}/mo · Other ${esc(formatMoney(otherEstimateLocal,S.country))}/mo</div>${locksHtml}${dupHtml}${runByHtml}${managerHtml}${ev.ok?(runBy==='manager'&&!pickedMgr?'<p>Choose a manager.</p>':launchBtns):'<p class="muted">Requirements not met.</p>'}</details></article>`;
  };

  /* v2.14 §1 — no cap any more: the limit is your hours and your
     managers. The header shows the real constraint. */
  /* v2.20 I4 — ONE hour computation: the header prints the workload
     from the single allocation walk (job + ALLOCATED business hours),
     so used + free always equals the 70-hour week (66 + 4 = 70) and
     the workload is the same number the Stretched penalty and the
     cards read. Hours a business needs but did not get are shown
     separately as uncovered, never folded into the workload. */
  const capacity = managementCapacityInfo(S);
  const atRiskNames = capacity.atRiskList.map(b => b.name).join(', ');
  /* Uncovered work is its own warning block (not a clause in the header line): plain words first, hours second. */
  const uncoveredWarn = workload.uncoveredHours > 0
    ? `<div class="card" role="status" style="border:2px solid var(--brand-crimson);background:rgba(180,35,24,0.08);margin:8px 0"><strong style="color:var(--brand-crimson)">⚠ Nobody is running ${esc(workload.uncoveredNames.join(', '))}.</strong> <span class="muted">${workload.uncoveredHours}h/week of work there is not getting done. Hire a manager, or free up your own hours.</span></div>`
    : '';

  return `
    <div class="biz-desk-tabs" aria-label="Business desk">${[['owned','My business'],['start','Start'],['buy','Buy existing']].map(([id,label])=>`<button class="btn ${desk===id?'btn-navy':''}" data-action="biz-desk" data-desk="${id}">${label}</button>`).join('')}</div>
    ${desk==='owned'?`<div class="card card-elevated">
      <div class="section-head">
        <h3>Business</h3>
        <span class="muted">${portfolioBusinesses.length} owned · ${workload.totalHours} h/wk used (job ${workload.jobHours} + businesses ${workload.businessHours}) · ${workload.ownerHoursFree} h/wk free${workload.stretched?' · Overloaded':''} · ${workload.managedCount} managed · ${workload.unmanagedCount} unmanaged</span>
      </div>
      ${uncoveredWarn}
      ${atRiskNames ? `<div class="card" style="border:2px solid var(--brand-crimson);background:rgba(180,35,24,0.10);margin:8px 0"><strong style="color:var(--brand-crimson)">⚠ At risk — nobody is running ${esc(atRiskNames)}.</strong> <span class="muted">Revenue and staff morale fall each month a business stays unmanaged. Hire a manager, take it over yourself, or sell it.</span></div>` : ''}
      ${portfolioBusinesses.length ? `
      ${totals.settled?`<div class="biz-portfolio-line">Portfolio net <strong class="${totals.net<0?'text-bad':'text-good'}">${esc(formatMoney(totals.net,S.country))}</strong><span>last month · all locations</span></div>`:''}
      <div class="biz-company-picker ${portfolioBusinesses.length===1?'biz-single-company':''}" aria-label="Select company">${portfolioBusinesses.map(b=>`<button class="${b.id===selectedBusiness.id?'active':''}" data-action="biz-company" data-biz="${esc(b.id)}">${esc(b.name)}<small>${b.staff?.length||0} staff · Level ${b.level}</small></button>`).join('')}</div>${bizCard(selectedBusiness)}` : `
      <p class="muted">No businesses</p>`}
    </div>
    `:''}
    ${desk==='buy'?renderForSaleHtml(S):''}
    ${desk==='start'?`<div class="card">
      <div class="section-head">
        <h3>Start a business · ${filtered.length} options</h3>
      </div>
      <details class="biz-index"><summary>Wage &amp; price basis</summary><p>Game wage index · ${esc(getCountry(S.country).name)} · ${S.year}<br>Mid-career ${esc(formatMoney(eraSalary(getCountry(S.country).annualSalaryTiers2026.mid/12,S.country,S.year),S.country))}/mo × role factor.<br>Startup, sales and costs: country/era catalog scaling. Estimates, not live market quotes.</p></details>
      <div class="biz-sector-tabs">${[['all','All'],['food','Food'],['retail','Retail'],['tech','Tech'],['health','Health'],['services','Services']].map(([id,label])=>`<button class="btn btn-sm ${(uiState.bizSector||'all')===id?'btn-navy':''}" data-action="biz-sector" data-sector="${id}">${label}</button>`).join('')}</div>
      <p class="muted">Full-time ${BUSINESS_FULL_TIME_HOURS} h/wk · Part-time ${BUSINESS_PART_TIME_HOURS} h/wk <span title="Profit varies. Running full-time yourself requires leaving your job. Managers use no player hours." aria-label="Information">ⓘ</span></p>
      <div class="catalog-filter-bar">
        <input type="search" class="filter-input" data-filter="bizQuery" placeholder="Search ${startVentures.length} ventures (e.g. Café, Pharmacy, SaaS, Clinic, Factory)..." value="${esc(uiState.bizQuery || '')}">
      </div>
      ${filtered.map(launchRow).join('') || '<p class="muted">No ventures match that search.</p>'}
    </div>`:''}
  `;
}

/* v2.8 §4 — the gigs tab is a real system now, not a list of buttons. Every
   gig shows what the work is, who pays, how much (and per hour), how many
   hours, when, every requirement with met / not-met and the reason, every
   risk, and the reputation built on that gig so far. Gigs that did not exist
   in this year are not shown. Buttons are live only when evaluateGig says
   the gig can be taken; otherwise the plain lock reason is shown (same
   evaluator the take function enforces, so the tab never promises what the
   handler refuses). */
function renderSideGigsSubtabHtml(S) {
  const onStudentVisa = S.legal.residency.kind === 'student_visa';
  const workedThisMonth = !!S.cooldowns[`side_gig_${S.year}_${S.month}`];
  const eraMatch = (g) => (!g.from || S.year >= g.from) && (!g.until || S.year <= g.until);
  const ptCount = (V1_PARTTIME_JOBS || []).filter(eraMatch).length;
  const cashCount = (V1_CASH_JOBS || []).filter(eraMatch).length;

  /* v2.19 W5 — the risk lines come from the player's SHARED situation
     (employed, hours, cash work), so the same warning printed on every
     single row: "Your manager may hear..." 47 times on one tab. The
     warnings stay — they are the risk, stated before the player takes
     a gig — but a warning that applies to more than one gig is stated
     ONCE, above the card (for every gig, or named with the gigs it
     applies to), and each row keeps only the risks that belong to
     that gig alone. */
  const riskGroups = (evs) => {
    const map = new Map(); // risk line -> [gig labels carrying it]
    for (const ev of evs) for (const r of ev.risks) {
      if (!map.has(r)) map.set(r, []);
      map.get(r).push(ev.label);
    }
    return map;
  };
  const groupedRisksHtml = evs => {
    const risks=[...riskGroups(evs).keys()];
    return risks.length?`<details class="muted" style="margin:6px 0"><summary>Time &amp; work risks</summary>${risks.map(r=>`<p>${esc(r)}</p>`).join('')}</details>`:'';
  };
  const sharedRiskSet = (evs) => new Set([...riskGroups(evs).entries()].filter(([, labels]) => labels.length > 1).map(([r]) => r));
  const gigRow = (ev, kind, shared) => {
    const hourly = Math.round(ev.pay / Math.max(1, ev.hoursPerWeek * 4.33));
    const payLine = kind === 'cash'
      ? `Pay: <strong class="mono">${esc(formatMoney(ev.pay, S.country))}</strong>/month — ${8} days at about ${esc(formatMoney(Math.round(ev.pay / 8), S.country))}/day, cash in hand (about ${esc(formatMoney(hourly, S.country))}/hour)`
      : `Pay: <strong class="mono">${esc(formatMoney(ev.pay, S.country))}</strong>/month — about ${esc(formatMoney(hourly, S.country))}/hour`;
    const repLine = ev.monthsWorked > 0
      ? `<span>Worked ${ev.monthsWorked} month${ev.monthsWorked > 1 ? 's' : ''} · reputation ${ev.reputation}/100${ev.complaints ? ` · ${ev.complaints} complaint${ev.complaints > 1 ? 's' : ''}` : ''}</span>`
      : '';
    const btn = !ev.available
      ? `<span class="hud-pill" style="white-space:normal;overflow-wrap:anywhere;max-width:100%">${esc(ev.lockReason)}</span>`
      : workedThisMonth
        ? `<span class="hud-pill">Worked this month</span>`
        : `<button class="btn btn-sm ${kind === 'parttime' ? 'btn-primary' : ''}" data-action="side-gig" data-kind="${kind}" data-idx="${ev.idx}">${kind === 'parttime' ? 'Work this gig for the month' : 'Hustle for cash'}</button>`;
    const ownRisks = ev.risks.filter((r) => !shared.has(r));
    return `
      <div class="item-row" style="align-items:flex-start">
        <div class="item-row-main">
          <strong>${esc(ev.label)}</strong>
          <span>${esc(ev.payer)} · ${esc(ev.when)} · ${ev.hoursPerWeek}h/week</span>
          <span>${payLine}</span>
          <details style="margin-top:4px"><summary>Requirements</summary>${ev.requirements.map(r => `<div>${r.met ? '✓' : '✗'} ${esc(r.label)} · ${esc(r.reason)}</div>`).join('')}</details>
          ${ownRisks.length ? `<div style="margin-top:4px">${ownRisks.map(r => `<div>⚠ ${esc(r)}</div>`).join('')}</div>` : ''}
          ${repLine}
        </div>
        ${btn}
      </div>
    `;
  };
  const ptEvs = (V1_PARTTIME_JOBS || []).map((pt, idx) => ({ ...evaluateGig(S, 'parttime', idx), idx })).filter((ev) => eraMatch(ev.gig));
  const cashEvs = (V1_CASH_JOBS || []).map((cj, idx) => ({ ...evaluateGig(S, 'cash', idx), idx })).filter((ev) => eraMatch(ev.gig));
  const ptShared = sharedRiskSet(ptEvs);
  const cashShared = sharedRiskSet(cashEvs);

  return `
    ${S.year >= 2006 ? `
      <div class="card card-elevated">
        <div class="section-head">
          <h3>Creator channel</h3>
          <span class="hud-pill mono">${(S.creatorChannel?.followers || 0).toLocaleString()} Followers${S.creatorChannel?.monthlyIncomeLocal > 0 ? ` · ${formatMoney(S.creatorChannel.monthlyIncomeLocal, S.country, true)}/mo` : ''}</span>
        </div>
        <p class="muted" style="margin-bottom:8px">Publish monthly educational/lifestyle content — crosses into passive monthly sponsorship revenue as your audience scales!</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          <button class="btn btn-sm btn-primary" data-action="grow-creator" data-niche="tech_finance">Tech &amp; Finance Breakdowns</button>
          <button class="btn btn-sm" data-action="grow-creator" data-niche="medical_edu">Medical &amp; Health Insights</button>
          <button class="btn btn-sm" data-action="grow-creator" data-niche="architecture_re">Real Estate &amp; Interiors</button>
          <button class="btn btn-sm" data-action="grow-creator" data-niche="lifestyle_food">Culinary &amp; Travel Vlog</button>
        </div>
      </div>
    ` : ''}
    <div class="card">
      <div class="section-head">
        <h3>Part-Time Shifts & Student Gigs (${ptCount} in ${S.year})</h3>
        <span class="muted">One gig at a time, for the month · ${workedThisMonth ? 'You already worked a gig this month' : 'No gig worked yet this month'}</span>
      </div>
      ${onStudentVisa ? `<p class="muted">Student work limit: 20 h/week · Cash gigs unavailable</p>` : ''}
      ${groupedRisksHtml(ptEvs)}
      ${ptEvs.map((ev) => gigRow(ev, 'parttime', ptShared)).join('')}
    </div>
    <div class="card">
      <div class="section-head">
        <h3>Informal Cash Hustles (${cashCount} in ${S.year})</h3>
        <span class="muted">Off-the-books cash work — no papers asked, no protection either</span>
      </div>
      ${groupedRisksHtml(cashEvs)}
      ${cashEvs.map((ev) => gigRow(ev, 'cash', cashShared)).join('')}
    </div>
  `;
}

/* ============================================================================
   TAB 4: REAL ESTATE (3D Isometric Home & Blueprint | 280+ Compounds | 117 Land Plots & Custom Build)
   ========================================================================== */
export function renderRealEstateTabHtml(S, uiState = {}) {
  ensureExtendedState(S);
  const isMinor = (S.player?.age ?? 0) < 18; /* a child sees the family home only: no compounds, land or building */
  const sub = isMinor ? 'myhome' : (uiState.reSub || 'myhome');
  const compoundsHere = (COMPOUNDS_BY_COUNTRY[S.country] || []).length + (NEIGHBORHOODS_BY_COUNTRY[S.country] || []).length;

  const nav = isMinor ? '' : renderSubtabs('realestate', [
    { id: 'myhome', label: 'My Home 3D, Rooms & Staff' },
    { id: 'compounds', label: `Compounds & Districts (${compoundsHere}+)` },
    { id: 'lands', label: `Land & Custom Build (${LAND_PLOTS.length})` }
  ], sub);

  if (sub === 'compounds') {
    return nav + renderCompoundsSubtabHtml(S, uiState);
  }
  if (sub === 'lands') {
    return renderEditorialBannerHtml(pickDynamicBanner(S, 'realestate', 'lands'), 'Freehold Land Surveys & Custom Architectural Construction') + nav + renderLandAndBuildSubtabHtml(S, uiState);
  }

  /* Active Residence 3D Scene + BitLife Room Blueprint */
  /* OWNERSHIP GATE (v2.7 item 5): the home on this tab is the home the
     player LIVES IN only when they own it. Living with parents, renting,
     or in employer housing is NOT ownership — even if the player owns
     other properties elsewhere (those live in the Portfolio below, with
     their own owner actions). The old `|| properties[0]` fallback showed
     a rented-out flat as "My Home" for a player living with parents. */
  /* v2.9 item 9: resolve through resolveCurrentHome so a rented home is
     found too (was: owned-properties lookup, silent miss for every renter). */
  const livedInProp = resolveCurrentHome(S);
  const curProp = S.housing.mode === 'owned' ? (livedInProp || S.housing.properties[0] || null) : null;
  const ownsCurrentHome = !!curProp;
  const activeLandBuild = (S.housing.lands || []).find(l => !!l.buildProject);
  const homeModel = curProp || {
    id: `${S.country}_${S.housing.currentHomeId || S.housing.currentHomeName || 'home'}_${S.seed || 1}`,
    country: S.country,
    name: S.housing.currentHomeName || 'Family Home',
    shape: S.housing.currentShape || 'apartment',
    finishing: 'standard',
    rooms: 3,
    furnishedRooms: {},
    upgrades: [],
    buildProgressPct: activeLandBuild ? activeLandBuild.buildProject.progressPct : 100
  };
  const parkedCar = S.cars[0] ? S.cars[0].colorHex : null;

  const shapesShowcase = ['studio', 'apartment', 'duplex', 'penthouse', 'townhouse', 'twin_house', 'villa', 'chalet', 'mansion', 'commercial', 'land'];
  /* The rooms of THIS home's own plan (every floor) — one row per real room,
     so Villa offices 102, 205 and 302 are independent rows, not one shared
     "office" that furnishes all three at once. */
  const planRooms = curProp ? furnishablePlanRooms(curProp.shape || 'apartment', curProp.country || S.country, curProp.rooms, curProp.furnishedRooms) : [];
  const staffRoles = Object.entries(HOUSEHOLD_STAFF_CATALOG || {}).slice(0, 8);
  const rentalUnits = getHousingFor(S.country, S.year).slice(0, 4);

  const activeShape = homeModel.shape || 'apartment';
  const stageModel = { ...homeModel, country: curProp?.country || S.country, shape: activeShape };

  /* "Where do I live" (v2.7 item 5): for a home the player does NOT own,
     say plainly where they live, who owns it, and what it costs them.
     All three lines are built here so the tab can never show a home
     without its owner and its cost again. */
  const fatherP = (S.people && S.relations) ? (S.people[S.relations.fatherId] || null) : null;
  const motherP = (S.people && S.relations) ? (S.people[S.relations.motherId] || null) : null;
  const whereHomeName = esc(S.housing.currentHomeName || 'Family Home');
  const wherePlace = `${esc(getCountry(S.country).name)}`;
  let wherePill = 'Family home';
  let whereLiveLine = `You live with your parents in the ${whereHomeName} in ${wherePlace}.`;
  let whereOwnerLine = '';
  let whereCostLine = '';
  if (S.housing.mode === 'parents') {
    if (fatherP && fatherP.alive) whereOwnerLine = `Your father ${esc(fatherP.fullName)} owns it.`;
    else if (motherP && motherP.alive) whereOwnerLine = `Your mother ${esc(motherP.fullName)} owns it.`;
    else whereOwnerLine = 'Your family owns it.';
    whereCostLine = 'It costs you nothing — your parents cover the home.';
  } else if (S.housing.mode === 'rent') {
    wherePill = 'Rented';
    whereLiveLine = `You rent the ${whereHomeName} in ${wherePlace}.`;
    whereOwnerLine = 'Your landlord owns it.';
    whereCostLine = S.housing.monthlyRent > 0
      ? `You pay ${esc(formatMoney(S.housing.monthlyRent, S.country))} a month in rent.`
      : 'You pay rent for it each month.';
  } else if (S.housing.mode === 'employer_provided') {
    wherePill = 'From your job';
    whereLiveLine = `You live in the ${whereHomeName} in ${wherePlace}, provided by your employer.`;
    whereOwnerLine = 'Your employer owns it.';
    whereCostLine = 'It comes with the job. It costs you nothing.';
  }

  return `
    ${renderEditorialBannerHtml(activeShape === 'chalet' ? 'coastal_summer_chalet_ink.jpg' : pickDynamicBanner(S, 'realestate', 'myhome'), ownsCurrentHome ? 'Your home — rooms and floor plan' : 'Where you live')}
    ${nav}
    <div class="card card-elevated">
      ${ownsCurrentHome ? `
      <div class="section-head">
        <h2>${icon('cube3d', 18)} ${esc(curProp.name)} — your home</h2>
        <span class="hud-pill">${curProp.areaM2 || 140} m²</span>
      </div>

      ${renderHome3dAndFloorplanHtml(stageModel, {
        viewMode: uiState.archViewMode || (uiState.vis3dCutaway ? 'cutaway' : 'elevation'),
        timeOfDay: uiState.solarTime || (uiState.vis3dNight ? 'night' : 'noon'),
        cadFloor: uiState.cadFloor !== undefined ? uiState.cadFloor : -1,
        cyanotype: !!uiState.cadCyanotype,
        showMep: !!uiState.cadShowMep,
        variantSeed: `${stageModel.id || stageModel.name}_${activeShape}_${S.country}`,
        country: stageModel.country || S.country,
        parkedCarColor: parkedCar
      })}
      ${/* v2.12 item 4b — the room detail a floor-plan tap opens */ renderRoomDetailCardHtml(uiState)}

      ${curProp ? `
        <div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--line-soft)">
          <strong style="font-size:0.84rem;display:block;margin-bottom:6px">1. Interior Finishing Tier (Core & Shell → Royal Smart):</strong>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
            ${FINISHING_TIERS.map(ft => `
              <button type="button" class="btn btn-sm ${curProp.finishing === ft.id ? 'btn-navy' : ''}" data-action="upgrade-finish" data-pid="${curProp.id}" data-fid="${ft.id}" ${curProp.finishing === ft.id ? 'disabled' : ''}>
                ${esc(ft.label.split('(')[0].trim())}
              </button>
              ${curProp.finishing === ft.id ? lockReason('Already your finish', 'Choose a different tier to change it') : ''}
            `).join('')}
          </div>

          <strong style="font-size:0.84rem;display:block;margin-bottom:6px">2. Furnish the rooms in your home:</strong>
          <div style="margin-bottom:12px">
            ${planRooms.length ? planRooms.map(rm => {
              const done = isPlanRoomFurnished(curProp.furnishedRooms, rm);
              const label = furnishedLabelFor(curProp.furnishedRooms, rm);
              /* The 11 real style choices for this room — prices come from
                 furnishingOptions, the same list the charge uses, so the
                 price on the button is the price you pay. */
              const opts = furnishingOptions(S, curProp, rm.key);
              if (!opts.length) return '';
              return `
                <div class="furnish-room">
                  <div class="furnish-room-head">
                    <strong style="font-size:0.82rem">Room ${esc(rm.no)} — ${esc(rm.name)}</strong>
                    <span class="muted" style="font-size:0.74rem">${done ? `✓ ${esc(label)}` : 'Empty — pick a style below'}</span>
                  </div>
                  <div class="furnish-styles">
                    ${opts.map(o => {
                      const valueTxt = o.valueAdd > 1 ? `home value +${Math.round((o.valueAdd - 1) * 100)}%` : 'home value unchanged';
                      return `
                      <div class="furnish-card">
                        <div class="furnish-art"><img src="${esc(o.drawing)}" alt="${esc(o.styleName)} style for the ${esc(rm.name)}" loading="lazy"></div>
                        <div class="furnish-body">
                          <div class="furnish-name">${esc(o.styleName)}</div>
                          <p class="furnish-desc">${esc(o.description)}</p>
                          <div class="furnish-line"><strong>Pieces:</strong> ${esc((o.pieces || []).join('; '))}</div>
                          <div class="furnish-line"><strong>Materials:</strong> ${esc((o.materials || []).join(', '))}</div>
                          <div class="furnish-line"><strong>Colours:</strong> ${esc((o.colours || []).join(', '))}</div>
                          <div class="furnish-line"><strong>Brands:</strong> ${esc((o.brands || []).join(', '))}</div>
                          <div class="furnish-line"><strong>What it gives:</strong> +${o.moodBonus} happiness · ${valueTxt} · ${esc(formatMoney(Math.round(o.maintenancePerYear), S.country))}/yr upkeep</div>
                          <div class="furnish-line furnish-era">${esc(o.eraNote)}</div>
                          <button class="btn btn-primary btn-sm furnish-btn" data-action="furnish-room" data-pid="${curProp.id}" data-room="${rm.no}" data-q="${esc(o.key)}" ${done ? 'disabled' : ''}>Furnish — ${esc(formatMoney(Math.round(o.priceLocal), S.country))}</button>
                          ${done ? lockReason('This room is already furnished', 'Furnish a different room instead') : ''}
                        </div>
                      </div>`;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('') : `<p class="muted" style="font-size:0.8rem">No rooms to furnish in this home.</p>`}
          </div>

          <strong style="font-size:0.84rem;display:block;margin-bottom:6px">3. Architectural Upgrades (Visible on 3D Villa/Roof!):</strong>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${[
              { k: 'solar', l: '☀ Rooftop Solar (−40% Bills)' },
              { k: 'pool', l: 'Heated Swimming Pool' },
              { k: 'smart_security', l: 'Smart CCTV & Automation' },
              { k: 'home_gym', l: 'Private Home Gym' },
              { k: 'generator', l: '⚡ Silent Backup Generator' }
            ].map(u => {
              const has = (curProp.upgrades || []).includes(u.k)||(u.k==='pool'&&curProp.hasPool);
              return `<button class="btn btn-sm ${has ? 'btn-navy' : ''}" data-action="install-upgrade" data-pid="${curProp.id}" data-upg="${u.k}" ${has ? 'disabled' : ''}>${has ? '✓ ' : ''}${esc(u.l)}</button>`;
            }).join('')}
          </div>

          <strong style="font-size:0.84rem;display:block;margin:12px 0 6px">4. Exterior Architectural Cladding &amp; Stonework Palette:</strong>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
            ${FACADE_PALETTE_OPTIONS.map(fp => `
              <button type="button" class="btn btn-sm ${curProp.facadeStyle === fp.id ? 'btn-navy' : ''}" data-action="set-facade" data-pid="${curProp.id}" data-fid="${fp.id}">
                ${curProp.facadeStyle === fp.id ? '✓ ' : ''}${esc(fp.label)}
              </button>
            `).join('')}
          </div>

          <strong style="font-size:0.84rem;display:block;margin-bottom:6px">5. Custom Room Purpose Remodeling (Connects Home to Career, Wasta &amp; Family!):</strong>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:6px;margin-bottom:12px">
            ${ROOM_SPECIALTY_REMODELS.map(rm => {
              const built = (curProp.remodeledRooms || []).includes(rm.id);
              const rCost = Math.round(convertCurrency(rm.usd, 'usa', S.country, S.year));
              return `
                <div style="padding:8px 10px;background:var(--bg-canvas);border:1px solid var(--line-soft);border-radius:8px;display:flex;justify-content:space-between;align-items:center;gap:8px">
                  <div>
                    <strong style="font-size:0.8rem">${esc(rm.label)}</strong>
                    <div class="muted" style="font-size:0.71rem">${esc(rm.benefit)}</div>
                  </div>
                  <button class="btn btn-sm ${built ? 'btn-navy' : 'btn-primary'}" data-action="remodel-room" data-pid="${curProp.id}" data-rid="${rm.id}" ${built ? 'disabled' : ''}>
                    ${built ? '✓ Built' : esc(formatMoney(rCost, S.country, true))}
                  </button>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;padding-top:8px;border-top:1px dashed var(--line-soft)">
            <div class="muted" style="font-size:0.8rem">
              <strong>6. Municipal Structural Wing Extension (+45 m²):</strong> Adds +1 Suite &amp; +19% Deed Valuation
            </div>
            <button type="button" class="btn btn-sm ${curProp.hasExtension ? 'btn-navy' : 'btn-primary'}" data-action="expand-prop" data-pid="${curProp.id}" ${curProp.hasExtension ? 'disabled' : ''}>
              ${curProp.hasExtension ? '✓ +45 m² Wing Added' : `Build +45 m² Wing (${esc(formatMoney(Math.max(1500, Math.round(curProp.valueLocal * 0.14)), S.country, true))})`}
            </button>
          </div>
        </div>
      ` : ''}
      ` : `
      <div class="section-head">
        <h2>${icon('cube3d', 18)} Where you live</h2>
        <span class="hud-pill">${esc(wherePill)}</span>
      </div>
      <p style="font-size:0.92rem;line-height:1.55;margin:6px 0">${whereLiveLine}</p>
      <p style="font-size:0.92rem;line-height:1.55;margin:6px 0">${whereOwnerLine} ${whereCostLine}</p>
      <p class="muted" style="font-size:0.85rem;line-height:1.55">Family-owned · Furnishing unavailable</p>
      ${S.housing.properties.length ? `<p style="font-size:0.85rem;line-height:1.55">${S.housing.properties.length} properties owned</p>` : ''}
      `}
    </div>

    ${S.housing.properties.length > 0 ? `
      <div class="card">
        <div class="section-head">
          <h3>Owned Real Estate Portfolio (${S.housing.properties.length})</h3>
          <span class="muted">Move in, rent out to tenants, or pay installments</span>
        </div>
        ${S.housing.properties.map(pr => `
          <div class="item-row">
            <div style="display:flex;align-items:center;gap:10px">
              ${renderHomeTypeArt(pr.shape || 'apartment', pr.country || S.country, 64, pr.styleId || pr.unitId || pr.id)}
              <div class="item-row-main">
                <strong>${esc(pr.name)} (${esc(getCountry(pr.country).name)})</strong>
                <span>Value: <strong class="mono">${esc(formatMoney(pr.valueLocal, S.country))}</strong> · Finish: ${esc((pr.finishing || 'standard').replace(/_/g, ' '))} · Condition: <strong class="${(pr.conditionPct ?? 100) < 70 ? 'text-bad' : 'text-good'}">${Math.round(pr.conditionPct ?? 100)}%</strong> ${pr.monthsLeft > 0 ? `· ${pr.monthsLeft}m Aqsat left` : '· Deed Clear'} ${pr.lastMarketChange?`· ${esc(pr.lastMarketChange.label)} (${pr.lastMarketChange.realChange>=0?'+':''}${Math.round(pr.lastMarketChange.realChange*100)}% real, game scenario)`:''} ${pr.ruralCabin?`· Rural getaway · annual tax ${esc(formatMoney(pr.annualTaxNative||0,pr.country))}, insurance ${esc(formatMoney(pr.annualInsuranceNative||0,pr.country))}, maintenance 3% of value`:""} ${pr.rentedOut ? `· [${pr.tenantMode === 'short_term' ? 'Short-Term Holiday +36%' : 'Long-Term Tenant'}]` : ''}${/* v2.11 W3: premises link on the property card */ (() => { const _b = businessUsingProperty(S, pr.id); return _b ? ` · <strong>Used by ${esc(_b.name)}</strong>` : ''; })()}</span>
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px">
              ${(pr.incidents||[]).some(d=>d.kind==='ceiling_water'&&d.status==='open')?`<button class="btn btn-sm" data-action="repair-ceiling-water" data-id="${pr.id}">Repair ceiling · ${esc(formatMoney(pr.incidents.find(d=>d.kind==='ceiling_water').quote.paid,S.country))}</button>`:''}
              ${(pr.conditionPct ?? 100) < 98 ? `<button class="btn btn-sm" data-action="renovate-prop" data-id="${pr.id}">Renovate (+5.5%)</button>` : ''}
              ${(pr.country === S.country && S.housing.currentHomeId !== pr.id) ? `<button class="btn btn-primary btn-sm" data-action="move-into-prop" data-id="${pr.id}">Move In</button>` : ''}
              ${S.housing.currentHomeId !== pr.id && !pr.ruralCabin ? `<button class="btn btn-sm" data-action="toggle-rent-prop" data-id="${pr.id}">${pr.rentedOut ? 'Stop Lease' : 'Lease Out'}</button>` : ''}
              ${S.housing.currentHomeId !== pr.id && !pr.ruralCabin ? `<button class="btn btn-sm" data-action="toggle-tenant-mode" data-id="${pr.id}">${pr.tenantMode === 'short_term' ? 'Switch Long-Term' : 'Holiday Let (+36%)'}</button>` : ''}
              <button class="btn btn-sm" data-action="sell-prop" data-id="${pr.id}" ${pr.salePending?'disabled':''}>${pr.salePending?'Sale pending':'List for sale · ~3 mo'}</button> <span title="2.5% closing fee; condition affects price." aria-label="Information">ⓘ</span>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${/* v2.15 W1 — landlord cards (named tenants, deposits, leases,
      damage, market) live under the portfolio, same tab, no new tab. */ renderLandlordSectionHtml(S)}

    ${S.player.age >= 18 ? `
      <div class="card">
        <div class="section-head">
          <h3>Household Staff (${S.housing.staff.length} Active) & Rental Leases</h3>
          <span class="muted">Chauffeur unlocks driving without a licence!</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
          ${staffRoles.map(([rk, rv]) => {
            const hired = S.housing.staff.some(s => s.roleKey === rk);
            return `<button class="btn btn-sm ${hired ? 'btn-navy' : ''}" data-action="toggle-staff" data-role="${rk}">${hired ? '✓ ' : '+ '}${esc(rv.label || rk)}</button>`;
          }).join('')}
        </div>
        <div style="border-top:1px solid var(--line-soft);padding-top:8px">
          ${S.housing.playerLease?.status==='active'?'<p>Paid rental deposit · '+esc(formatMoney(S.housing.playerLease.deposit,S.housing.playerLease.country))+' · Unpaid rent '+esc(formatMoney(S.housing.playerLease.rentArrears||0,S.country))+' · Deposit covers recorded unpaid rent, then inspected player damage; balance returned on moving or disputed after eviction.</p>':''}
          ${S.housing.playerLease?.status==='active'&&S.housing.playerLease.rentArrears>0?'<div style="margin:8px 0"><button class="btn btn-sm" data-action="pay-player-rent-arrears">Clear unpaid rent · '+esc(formatMoney(S.housing.playerLease.rentArrears,S.country))+' cash</button></div>':''}
          ${(S.housing.playerLease?.damage||[]).filter(d=>d.status==='open').map(d=>'<div class="item-row"><span>Recorded damage · '+esc(d.label)+' · '+esc(formatMoney(d.cost,S.country))+'</span><button class="btn btn-sm" data-action="repair-player-rental" data-id="'+esc(d.id)+'">Repair before inspection</button></div>').join('')}
          <strong style="font-size:0.82rem">Quick Rental Apartments in ${esc(getCountry(S.country).name)}:</strong>
          ${rentalUnits.map(h => {
            const quote = rentalMoveInQuote(S, h);
            const rCost = quote.monthlyRent;
            return `
              <div class="item-row">
                <div class="item-row-main">
                  <strong>Lease: ${esc(h.name)} (${h.rooms} rooms)</strong>
                  <span>Rent: <strong class="mono">${esc(formatMoney(rCost, S.country))}/mo</strong>, billed from the next monthly turn.</span>
                  <span>Move-in fee: ${esc(formatMoney(quote.moveInFee, S.country))}, non-refundable. Deposit: ${esc(formatMoney(quote.deposit,S.country))}, refundable on moving. Keep one month's rent in cash. Required: ${esc(formatMoney(quote.cashRequired, S.country))}.</span>
                </div>
                <button class="btn btn-sm" data-action="rent-home" data-id="${h.id}">Sign Lease</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

/* v2.12 item 1 — Compounds & Lands for a player who cannot afford a
   listing today. A listing is a plan, not a dead row: every row offers
   save-for-this (a staged goal in S.goals), set-a-goal (the deposit that
   unlocks the buy), view-cheaper (only what the player can afford) and
   compare (two listings side by side). */

/* What the player could borrow on top of cash + savings. The Banks tab
   offers personal loans up to 18× the monthly basket (Express 3×,
   Standard 8×, Executive 18×), so loan capacity here is the Executive
   18× figure less any loan balances already owed — and 0 when the
   player could not be approved at all, mirroring takePersonalLoan's
   gates (21+, credit score 560+, not bankrupt, fewer than 2 loans). */
export function loanCapacityLocal(S) {
  if (!S || !S.money) return 0;
  if ((S.player?.age || 0) < 21) return 0;
  if (lenderCreditScore(S) < 560) return 0;
  if (S.year <= (S.money.bankruptUntilYear || 0)) return 0;
  if ((S.money.loans || []).length >= 2) return 0;
  const cObj = getCountry(S.country);
  const top = eraLocalCost((cObj.monthlyBasket2026?.rentStandard || 0) * 18, S.country, S.year);
  const owed = (S.money.loans || []).reduce((a, l) => a + (l.balance || 0), 0);
  return Math.max(0, Math.round(top - owed));
}

/* Everything the player could put toward a home today: cash + savings +
   loan capacity. This is what "view cheaper" filters on. */
export function affordableFundsLocal(S) {
  return liquidFundsLocal(S) + loanCapacityLocal(S);
}

/* The price a Compounds row shows, factored out so the row, the
   view-cheaper filter and the compare table all use the same numbers.
   Same maths the row used inline before: area × price/m² × unit/finish
   markups, converted into the player's currency; the down payment is
   the plan's down share (full cash when the plan has no instalments). */
function compoundListingPrice(S, propMarket, dev, selUnit, selFinish, selPlan) {
  const basePpm = eraLocalCost(dev.ppm2026 || 35000, propMarket, S.year);
  const rawNative = Math.round(basePpm * pricedPropertyArea(selUnit) * selUnit.priceMult * selFinish.costMult * (selPlan.totalMarkup || 1.0));
  const downPct = selPlan.years > 0 ? Math.max(0.05, Number(selPlan.downPct ?? 0.10)) : 1.0;
  const downPlayer = Math.round(convertCurrency(rawNative * downPct, propMarket, S.country, S.year));
  const fullPlayer = Math.round(convertCurrency(rawNative, propMarket, S.country, S.year));
  const monthlyPlayer = selPlan.years > 0 ? Math.round((fullPlayer - downPlayer) / (selPlan.years * 12)) : 0;
  return { fullPlayer, downPlayer, monthlyPlayer, areaM2: selUnit.area };
}

export function propertyPaymentBudgetHtml(S, monthly) {
  if (!(monthly > 0)) return '';
  const summary = S.money?.lastMonthSummary;
  if (!summary || !Number.isFinite(summary.income) || !Number.isFinite(summary.living)) return '<p class="muted">Monthly budget not recorded yet. Check income, living costs and existing debts before signing.</p>';
  const available = summary.income - summary.living - (summary.debt || 0) - (summary.support || 0);
  const after = Math.round(available - monthly);
  return `<details class="property-budget"><summary class="${after < 0 ? 'text-bad' : 'muted'}">Monthly budget: ${esc(formatMoney(after,S.country))} left before housing upkeep</summary><p class="muted">Last settled month: ${esc(formatMoney(summary.income, S.country))} take-home income. After its living, debt and support costs, this installment would leave ${esc(formatMoney(after, S.country))}/mo before other housing, upkeep or new borrowing. Historical snapshot, not a forecast${!S.career?.employed ? '; no current job' : ''}.</p></details>`;
}

function landListingPrice(S, pl) {
  const area = pl.minArea || 400;
  const nativeCost = eraLocalCost(pl.ppm2026 * area, pl.country, S.year);
  const costPlayer = Math.round(convertCurrency(nativeCost, pl.country, S.country, S.year));
  return { costPlayer, areaM2: area };
}

/* One listing for the compare table, re-priced with the current unit /
   finish / plan selections so the table never disagrees with the rows.
   Keys are `compound:<devId>` or `land:<plotId>`. */
function compareListingData(S, uiState, key) {
  const [kind, ref] = String(key || '').split(':');
  const propMarket = (uiState.propMarket === 'home' && S.country !== S.homeCountry) ? S.homeCountry : S.country;
  if (kind === 'compound') {
    const dev = (COMPOUNDS_BY_COUNTRY[propMarket] || []).find(c => c.id === ref)
      || (NEIGHBORHOODS_BY_COUNTRY[propMarket] || []).find(d => d.id === ref);
    if (!dev) return null;
    const selUnit = getPropertyUnits(propMarket).find(u => u.id === uiState.reUnitId) || getPropertyUnits(propMarket)[4];
    const selFinish = FINISHING_TIERS.find(f => f.id === uiState.reFinishId) || FINISHING_TIERS[2];
    const selPlan = PAYMENT_PLANS.find(p => p.id === uiState.rePlanId) || PAYMENT_PLANS[0];
    const price = compoundListingPrice(S, propMarket, dev, selUnit, selFinish, selPlan);
    return {
      key, kind, name: dev.name, city: dev.city || getCountry(propMarket).cities[0],
      country: getCountry(propMarket).name,
      price: price.fullPlayer, down: price.downPlayer, monthly: price.monthlyPlayer,
      areaM2: price.areaM2,
      monthlyLabel: selPlan.years > 0 ? `${formatMoney(price.monthlyPlayer, S.country)}/mo for ${selPlan.years}y` : 'No instalments — full cash'
    };
  }
  if (kind === 'land') {
    const pl = LAND_PLOTS.find(l => l.id === ref);
    if (!pl) return null;
    const price = landListingPrice(S, pl);
    return {
      key, kind, name: pl.name, city: pl.city || '', country: getCountry(pl.country).name,
      price: price.costPlayer, down: price.costPlayer, monthly: 0, areaM2: price.areaM2,
      monthlyLabel: 'No monthly cost — build when ready'
    };
  }
  return null;
}

function renderCompareTableHtml(S, uiState, keys) {
  const items = keys.map(k => compareListingData(S, uiState, k)).filter(Boolean);
  if (!items.length) return '';
  const funds = affordableFundsLocal(S);
  const rows = [
    { label: 'Price', val: it => formatMoney(it.price, S.country) },
    { label: 'Size', val: it => `${it.areaM2} m²` },
    { label: 'Location', val: it => `${it.country}` },
    { label: 'Down payment', val: it => formatMoney(it.down, S.country) },
    { label: 'Running cost', val: it => it.monthlyLabel },
    {
      label: 'Deposit funding',
      val: it => it.down <= funds
        ? 'Deposit fits cash, savings and estimated credit; monthly budget not checked'
        : `Not yet — need ${formatMoney(it.down - funds, S.country)} more`
    }
  ];
  return `
    <div class="card" style="margin-bottom:10px">
      <div class="section-head">
        <h3>Comparing ${items.length === 2 ? 'two listings' : 'this listing'}</h3>
        <button class="btn btn-sm" data-action="clear-compare">Clear compare</button>
      </div>
      <div style="display:grid;grid-template-columns:130px ${items.map(() => '1fr').join(' ')};gap:4px 10px;font-size:0.85rem">
        <div></div>
        ${items.map(it => `<div><strong>${esc(it.name)}</strong></div>`).join('')}
        ${rows.map(r => `
          <div class="muted">${esc(r.label)}</div>
          ${items.map(it => `<div>${esc(r.val(it))}</div>`).join('')}
        `).join('')}
      </div>
    </div>
  `;
}

/* v2.12 item 4b — the room detail a floor-plan tap opens. A hallway,
   guest toilet or open void is not a room you furnish, but tapping it
   now opens its real record (number, name, size, floor, what it is)
   instead of a bare info message — and the Close button dismisses it. */
function renderRoomDetailCardHtml(uiState) {
  const d = uiState.roomDetail;
  if (!d) return '';
  return `
    <div class="card" style="margin-top:10px">
      <div class="section-head">
        <h3>Room ${esc(d.no || '')} — ${esc(d.name || 'Space')}</h3>
        <button class="btn btn-sm" data-action="close-room-detail">Close</button>
      </div>
      <p style="font-size:0.9rem;line-height:1.55;margin:6px 0">${esc(roomInfoMessage(d.key || '', d.no || ''))}</p>
      <p class="muted" style="font-size:0.85rem;margin:0">${d.m2 ? `${d.m2} m²` : 'Size not listed on the plan'}${d.floor ? ` · ${esc(d.floor)}` : ''} · Part of your home's floor plan.</p>
    </div>
  `;
}

function renderCompoundsSubtabHtml(S, uiState) {
  const propMarket = (uiState.propMarket === 'home' && S.country !== S.homeCountry) ? S.homeCountry : S.country;
  const mktCountryObj = getCountry(propMarket);
  const compounds = (COMPOUNDS_BY_COUNTRY[propMarket] || []).filter(c => !c.launchYear || c.launchYear <= S.year);
  const districts = NEIGHBORHOODS_BY_COUNTRY[propMarket] || [];
  const allDevs = [...compounds, ...districts];

  const selUnit = getPropertyUnits(propMarket).find(u => u.id === uiState.reUnitId) || getPropertyUnits(propMarket)[4];
  const selFinish = FINISHING_TIERS.find(f => f.id === uiState.reFinishId) || FINISHING_TIERS[2];
  const selPlan = PAYMENT_PLANS.find(p => p.id === uiState.rePlanId) || PAYMENT_PLANS[0];
  const q = String(uiState.reQuery || '').trim().toLowerCase();
  const filteredDevs = allDevs.filter(d => !q || `${d.name} ${d.city || ''} ${d.developer || ''} ${d.tag || ''}`.toLowerCase().includes(q));
  /* v2.12 item 1 — view cheaper: only the listings whose down payment
     fits what the player could put toward a home today (cash + savings
     + loan capacity). When nothing fits, the cheapest listing still
     shows, named as such, so the screen never goes empty. */
  const funds = affordableFundsLocal(S);
  const loanCap = loanCapacityLocal(S);
  const affordableOnly = !!uiState.reAffordableOnly;
  const compareKeys = Array.isArray(uiState.reCompare) ? uiState.reCompare : [];
  const priceOf = (dev) => compoundListingPrice(S, propMarket, dev, selUnit, selFinish, selPlan);
  const affordableDevs = filteredDevs.filter(d => priceOf(d).downPlayer <= funds);
  let shownDevs = affordableOnly ? affordableDevs : filteredDevs;
  let cheapestNote = '';
  if (affordableOnly && shownDevs.length === 0 && filteredDevs.length > 0) {
    const cheapest = filteredDevs.reduce((a, b) => (priceOf(a).downPlayer <= priceOf(b).downPlayer ? a : b));
    shownDevs = [cheapest];
    cheapestNote = `No deposit fits these funds yet — the cheapest here is ${cheapest.name} (down ${formatMoney(priceOf(cheapest).downPlayer, S.country)}; you could put ${formatMoney(funds, S.country)} toward a home today). Save for it below.`;
  }

  return `
    ${renderEditorialBannerHtml(selUnit.shape === 'chalet' ? 'coastal_summer_chalet_ink.jpg' : pickDynamicBanner(S, 'realestate', 'compounds'), `${mktCountryObj.name} Real Estate, Gated Compounds & National Housing`)}
    ${propMarket==='usa'?`<div class="card"><img src="assets/homes/usa-woodland-cabin.jpg" alt="Woodland Cabin exterior" style="width:100%;max-height:260px;object-fit:contain"><h3>Woodland Cabin <span title="Pennsylvania example; prices and costs are estimates." aria-label="Information">ⓘ</span></h3><p>109 m² · 2 bedrooms · Rural getaway</p><strong>${esc(formatMoney(eraLocalCost(RURAL_CABIN.price2026,'usa',S.year),S.country))}</strong><p>Tax ${esc(formatMoney(eraLocalCost(576,'usa',S.year),'usa'))}/yr · Insurance ${esc(formatMoney(eraLocalCost(420,'usa',S.year),'usa'))}/yr<br>Maintenance 3%/yr · Personal use</p><button class="btn" data-action="buy-rural-cabin" ${S.country==='usa'&&S.money.cash>=eraLocalCost(RURAL_CABIN.price2026,'usa',S.year)?'':'disabled'}>Buy cabin</button></div>`:''}
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('realestate', 18)} Real Compounds, Districts & National Housing (${esc(mktCountryObj.name)})</h2>
        ${S.country !== S.homeCountry ? `
          <div style="display:flex;gap:5px">
            <button class="btn btn-sm ${propMarket === S.country ? 'btn-navy' : ''}" data-action="set-prop-market" data-mkt="local">${esc(getCountry(S.country).name)}</button>
            <button class="btn btn-sm ${propMarket === S.homeCountry ? 'btn-navy' : ''}" data-action="set-prop-market" data-mkt="home">Expat Home (${esc(getCountry(S.homeCountry).name)})</button>
          </div>
        ` : `<span class="hud-pill">${allDevs.length} Developments</span>`}
      </div>

      ${LOCAL_PROPERTY_STYLES.some(p=>p.country===propMarket)?`<div class="local-property-styles" style="margin:12px 0"><h3>Homes by local style</h3><p class="muted" style="font-size:.83rem">Choose a home style</p><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:10px">${LOCAL_PROPERTY_STYLES.filter(p=>p.country===propMarket).map(p=>`<button type="button" class="btn" data-action="choose-property-style" data-unit="${p.id}" style="display:flex;flex-direction:column;align-items:stretch;text-align:left;white-space:normal;padding:8px;background:#faf5e9;border:${selUnit.id===p.id?'2px solid #9a523c':'1px solid #d4c7ae'}"><img src="assets/homes/${p.art}" alt="${esc(p.name)}" style="width:100%;height:145px;object-fit:contain"><strong style="font-size:.85rem">${esc(p.name)}</strong><span class="muted" style="font-size:.76rem">${p.area} m² indoor${outdoorAreaSummary(p)?` · ${outdoorAreaSummary(p)}`:''} · ${p.rooms===1?'Studio':`${p.rooms-1} bedroom${p.rooms>2?'s':''}`}</span></button>`).join('')}</div></div>`:''}
      <div class="catalog-filter-bar">
        <select class="filter-select" data-filter="reUnitId" aria-label="Unit Type">
          ${getPropertyUnits(propMarket).map(u => `<option value="${u.id}" ${u.id === selUnit.id ? 'selected' : ''}>${esc(u.name)} (${u.area}m² · ${u.shape})</option>`).join('')}
        </select>
        <select class="filter-select" data-filter="reFinishId" aria-label="Finishing Tier">
          ${FINISHING_TIERS.map(f => `<option value="${f.id}" ${f.id === selFinish.id ? 'selected' : ''}>${esc(f.label)}</option>`).join('')}
        </select>
        <select class="filter-select" data-filter="rePlanId" aria-label="Payment Plan">
          ${PAYMENT_PLANS.slice(0, 16).map(p => `<option value="${p.id}" ${p.id === selPlan.id ? 'selected' : ''}>${esc(p.label)}</option>`).join('')}
        </select>
        <input type="search" class="filter-input" data-filter="reQuery" placeholder="Search Madinaty, Ras El Hekma, Bait Al-Watan, Sakani, ROSHN, Palm..." value="${esc(uiState.reQuery || '')}">
      </div>

      <div style="padding:10px;background:var(--bg-accent-warm);border-radius:8px;margin-bottom:10px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
          ${renderHomeTypeArt(selUnit.shape, propMarket, 110, selUnit.styleId || selUnit.id)}
          <div class="muted" style="font-size:0.8rem">
            Selected unit: <strong>${esc(selUnit.name)} (${selUnit.area} m² indoor)</strong><br>${esc(outdoorAreaSummary(selUnit))}${propertyAreas(selUnit).plotM2?` · Plot ${propertyAreas(selUnit).plotM2} m²`:``}<br> · <strong>${esc(selFinish.label)}</strong> · Plan: <strong>${esc(selPlan.label)}</strong>
            ${propMarket === 'sau' && S.year >= 2019 ? ' · <em>4M+ SAR cash deed unlocks Saudi Property Premium Residency!</em>' : ''}
            ${propMarket === 'uae' && S.year >= 2019 ? ' · <em>2M+ AED deed unlocks 10-Yr UAE Golden Visa!</em>' : ''}
          </div>
        </div>
        ${renderHome3dAndFloorplanHtml({...selUnit,styleId:selUnit.styleId,areaM2:selUnit.area,country:propMarket,finishing:selFinish.id},{country:propMarket})}
      </div>
      ${renderRoomDetailCardHtml(uiState)}

      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 10px">
        <button class="btn btn-sm ${affordableOnly ? 'btn-navy' : ''}" data-action="toggle-affordable-only">${affordableOnly ? '✓ Deposit within funding range' : 'Filter by deposit funding'}</button>
        <span class="muted" style="font-size:0.82rem">You hold ${esc(formatMoney(liquidFundsLocal(S), S.country))}${loanCap > 0 ? ` + up to ${esc(formatMoney(loanCap, S.country))} in bank credit` : ''} — ${affordableDevs.length} of ${filteredDevs.length} deposits within funding range. This does not check monthly affordability.</span>
      </div>
      ${renderCompareTableHtml(S, uiState, compareKeys)}
      ${cheapestNote ? `<p class="muted" style="font-size:0.85rem">${esc(cheapestNote)}</p>` : ''}

      ${shownDevs.slice(0, 28).map(dev => {
        const { fullPlayer, downPlayer, monthlyPlayer } = priceOf(dev);
        const compareKey = `compound:${dev.id}`;
        const inCompare = compareKeys.includes(compareKey);
        const saving = (S.goals || []).some(g => g.kind === 'save_property' && g.saveKind === 'compound' && g.saveRef === dev.id && !g.done);

        return `
          <div class="item-row">
            <div style="display:flex;align-items:center;gap:10px">
              ${renderHomeTypeArt(selUnit.shape, propMarket, 88, selUnit.styleId || selUnit.id)}
              <div class="item-row-main">
                <strong>${esc(dev.name)} ${dev.developer ? `· ${esc(dev.developer)}` : ''} (${esc(mktCountryObj.name)})</strong>
                <span>Total: <strong class="mono">${esc(formatMoney(fullPlayer, S.country, true))}</strong> · ${selPlan.years > 0 ? `Down: <strong>${esc(formatMoney(downPlayer, S.country, true))}</strong> + ${esc(formatMoney(monthlyPlayer, S.country, true))}/mo (${selPlan.years}y)` : 'Full Cash'} ${dev.program ? `· [${esc(dev.program.toUpperCase())}]` : ''}</span>
                <span>${esc(outdoorAreaSummary(selUnit))} · Outdoor upkeep ${esc(formatMoney(Math.round(convertCurrency(outdoorAnnualBudget(selUnit,eraLocalCost(dev.ppm2026,propMarket,S.year)),propMarket,S.country,S.year)),S.country))}/yr game budget</span>
                ${saving ? `<span class="text-good">Saving for this — see Life Goals on the Timeline tab.</span>` : ''}
                ${propertyPaymentBudgetHtml(S,monthlyPlayer)}
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px">
              <button class="btn btn-sm ${S.money.cash >= downPlayer ? 'btn-primary' : ''}" data-action="buy-compound-unit" data-unit="${selUnit.id}" data-dev="${dev.id}" data-country="${propMarket}" ${(S.player.age >= 18 && S.money.cash >= downPlayer) ? '' : 'disabled'}>
                ${selPlan.years > 0 ? 'Sign Aqsat' : 'Buy Cash'}
              </button>
              ${(S.player.age >= 18 && S.money.cash >= downPlayer) ? '' : lockReason(S.player.age < 18 ? `You must be 18 to buy (you are ${S.player.age})` : 'Not enough cash for the down payment', S.player.age < 18 ? '' : `Need ${formatMoney(downPlayer - S.money.cash, S.country)} more — down payment ${formatMoney(downPlayer, S.country)}`)}
              <button class="btn btn-sm" data-action="save-for-listing" data-kind="compound" data-ref="${dev.id}" data-name="${esc(dev.name)}" data-full="${fullPlayer}" data-down="${downPlayer}">Save for this</button>
              <button class="btn btn-sm" data-action="save-for-listing" data-kind="compound" data-ref="${dev.id}" data-mode="deposit" data-name="${esc(dev.name)}" data-full="${fullPlayer}" data-down="${downPlayer}">Set a goal</button>
              <button class="btn btn-sm ${inCompare ? 'btn-navy' : ''}" data-action="compare-listing" data-kind="compound" data-ref="${dev.id}">${inCompare ? '✓ Comparing' : 'Compare'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderLandAndBuildSubtabHtml(S, uiState) {
  const propMarket = (uiState.propMarket === 'home' && S.country !== S.homeCountry) ? S.homeCountry : S.country;
  const plots = LAND_PLOTS.filter(l => l.country === propMarket && (!l.launchYear || l.launchYear <= S.year));
  const pTypes = (PROPERTY_DEV_SPECS?.PROJECT_TYPES || []).slice(0, 5);
  /* v2.12 item 1 — same actions as Compounds: view cheaper filters on
     what the player could put toward a plot today (cash + savings +
     loan capacity); a plot has no instalments, so the whole deed price
     is the amount to save toward. */
  const funds = affordableFundsLocal(S);
  const loanCap = loanCapacityLocal(S);
  const affordableOnly = !!uiState.reAffordableOnly;
  const compareKeys = Array.isArray(uiState.reCompare) ? uiState.reCompare : [];
  const priceOf = (pl) => landListingPrice(S, pl);
  const affordablePlots = plots.filter(pl => priceOf(pl).costPlayer <= funds);
  let shownPlots = affordableOnly ? affordablePlots : plots;
  let cheapestNote = '';
  if (affordableOnly && shownPlots.length === 0 && plots.length > 0) {
    const cheapest = plots.reduce((a, b) => (priceOf(a).costPlayer <= priceOf(b).costPlayer ? a : b));
    shownPlots = [cheapest];
    cheapestNote = `Nothing is within reach yet — the cheapest plot here is ${cheapest.name} (${formatMoney(priceOf(cheapest).costPlayer, S.country)}; you could put ${formatMoney(funds, S.country)} toward land today). Save for it below.`;
  }

  return `
    ${S.housing.lands.length > 0 ? `
      <div class="card card-elevated">
        <div class="section-head">
          <h2>${icon('cube3d', 18)} Owned Land Deeds & Active Construction (${S.housing.lands.length})</h2>
          <span class="muted">Finished builds gain +28% development equity!</span>
        </div>
        ${S.housing.lands.map(lnd => `
          <div style="padding:10px 0;border-bottom:1px solid var(--line-soft)">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
              <div>
                <strong>${esc(lnd.name)}</strong>
                <div class="muted">Land Value: <strong class="mono">${esc(formatMoney(lnd.valueLocal, S.country))}</strong></div>
              </div>
              ${lnd.buildProject ? `
                <span class="hud-pill" style="background:#FEF7E6;color:#B67D1E">Building ${esc(lnd.buildProject.label)}: ${lnd.buildProject.progressPct}% (${lnd.buildProject.monthsLeft}m left)</span>
              ` : `
                <div style="display:flex;flex-wrap:wrap;gap:6px">
                  ${pTypes.slice(0, 3).map(pt => `
                    <button class="btn btn-primary btn-sm" data-action="start-land-build" data-lid="${lnd.id}" data-ptype="${pt.id}">
                      Build ${esc(pt.label)} (${pt.buildMonths}m)
                    </button>
                  `).join('')}
                </div>
              `}
            </div>
            ${lnd.buildProject ? renderHome3dAndFloorplanHtml({
              name: lnd.buildProject.label,
              shape: lnd.buildProject.shape,
              finishing: 'core_shell',
              rooms: 4,
              buildProgressPct: lnd.buildProject.progressPct
            }) : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${/* v2.12 item 4b — the room detail a build-project floor-plan tap opens */ renderRoomDetailCardHtml(uiState)}

    <div class="card">
      <div class="section-head">
        <h3>Freehold Land Plots in ${esc(getCountry(propMarket).name)} (${plots.length} Available)</h3>
        ${S.country !== S.homeCountry ? `
          <div style="display:flex;gap:5px">
            <button class="btn btn-sm ${propMarket === S.country ? 'btn-navy' : ''}" data-action="set-prop-market" data-mkt="local">Local</button>
            <button class="btn btn-sm ${propMarket === S.homeCountry ? 'btn-navy' : ''}" data-action="set-prop-market" data-mkt="home">Home Country</button>
          </div>
        ` : ''}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:0 0 10px">
        <button class="btn btn-sm ${affordableOnly ? 'btn-navy' : ''}" data-action="toggle-affordable-only">${affordableOnly ? '✓ Deposit within funding range' : 'Filter by deposit funding'}</button>
        <span class="muted" style="font-size:0.82rem">You hold ${esc(formatMoney(liquidFundsLocal(S), S.country))}${loanCap > 0 ? ` + up to ${esc(formatMoney(loanCap, S.country))} in bank credit` : ''} — ${affordablePlots.length} of ${plots.length} prices within funding range. Building costs extra.</span>
      </div>
      ${renderCompareTableHtml(S, uiState, compareKeys)}
      ${cheapestNote ? `<p class="muted" style="font-size:0.85rem">${esc(cheapestNote)}</p>` : ''}
      ${shownPlots.slice(0, 24).map(pl => {
        const { costPlayer, areaM2: area } = priceOf(pl);
        const compareKey = `land:${pl.id}`;
        const inCompare = compareKeys.includes(compareKey);
        const saving = (S.goals || []).some(g => g.kind === 'save_property' && g.saveKind === 'land' && g.saveRef === pl.id && !g.done);
        return `
          <div class="item-row">
            <div style="display:flex;align-items:center;gap:10px">
              ${renderBitlifePropertyShapeSvg('land', 38, '#C84B31', pl.id || pl.name)}
              <div class="item-row-main">
                <strong>${esc(pl.name)} (${area} m²)</strong>
                <span>Zoning: ${esc(pl.zoning || 'residential')} · Deed Price: <strong class="mono">${esc(formatMoney(costPlayer, S.country, true))}</strong></span>
                <span>Plot area includes the entire deed. Garden and building areas are assigned when you build.</span>
                ${saving ? `<span class="text-good">Saving for this — see Life Goals on the Timeline tab.</span>` : ''}
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px">
              <button class="btn btn-sm ${S.money.cash >= costPlayer ? 'btn-primary' : ''}" data-action="buy-land" data-id="${pl.id}" ${(S.player.age >= 18 && S.money.cash >= costPlayer) ? '' : 'disabled'}>Buy Plot</button>
              ${(S.player.age >= 18 && S.money.cash >= costPlayer) ? '' : lockReason(S.player.age < 18 ? `You must be 18 to buy (you are ${S.player.age})` : 'Not enough cash for the deed price', S.player.age < 18 ? '' : `Need ${formatMoney(costPlayer - S.money.cash, S.country)} more — deed price ${formatMoney(costPlayer, S.country)}`)}
              <button class="btn btn-sm" data-action="save-for-listing" data-kind="land" data-ref="${pl.id}" data-name="${esc(pl.name)}" data-full="${costPlayer}" data-down="${costPlayer}">Save for this</button>
              <button class="btn btn-sm" data-action="save-for-listing" data-kind="land" data-ref="${pl.id}" data-mode="deposit" data-name="${esc(pl.name)}" data-full="${costPlayer}" data-down="${costPlayer}">Set a goal</button>
              <button class="btn btn-sm ${inCompare ? 'btn-navy' : ''}" data-action="compare-listing" data-kind="land" data-ref="${pl.id}">${inCompare ? '✓ Comparing' : 'Compare'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ============================================================================
   TAB 5: FINANCE (Cashflow & Zakat | Banks, CDs & Loans | 3D Credit Cards & BNPL | Gold Vault, Markets & Hawala)
   ========================================================================== */
/* v2.9 (B1) — the Finance tab said "Monthly Ledger" but only ever showed
   lastMonthSummary. Every line below comes from S.ledger itself (the
   recordLedgerEntry shape: year, month, age, label, category, account,
   delta, balanceAfter), so any pound in the balance traces back to the
   line that moved it. */
function ledgerGroupOf(e) {
  const c = String(e.category || 'general');
  if (c === 'career' || c === 'business' || c.startsWith('career_')) return 'work';
  if (c === 'housing' || c === 'family_home' || c === 'family_villa' || c === 'family_owned' || c === 'family_owned_upscale') return 'home';
  if (c === 'living' || c === 'lifestyle') return 'living';
  if (c === 'medical' || c.startsWith('medical_')) return 'health';
  if (c === 'visa' || c === 'golden_visa' || c === 'golden') return 'visa';
  if (c === 'bank' || c === 'banking' || c === 'banks' || c === 'debt' || c === 'card' || c === 'cards') return 'bank';
  if (c === 'education') return 'education';
  if (c === 'family' || c.startsWith('family') || c === 'inheritance' || c === 'money_help' || c === 'supported_crisis') return 'family';
  if (c === 'gold' || c === 'investment') return 'investments';
  if (c === 'car' || c === 'cars') return 'cars';
  return 'other';
}

const LEDGER_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'in', label: 'Money In' },
  { id: 'out', label: 'Money Out' },
  { id: 'work', label: 'Work & Business' },
  { id: 'home', label: 'Home' },
  { id: 'living', label: 'Living' },
  { id: 'health', label: 'Health' },
  { id: 'visa', label: 'Travel & Visa' },
  { id: 'bank', label: 'Bank & Debt' },
  { id: 'family', label: 'Family' },
  { id: 'education', label: 'Education' },
  { id: 'investments', label: 'Gold & Investments' },
  { id: 'cars', label: 'Cars' },
  { id: 'other', label: 'Other' }
];

/* ============================================================================
   v2.13 Worker 4 — ERA SKIN + FINANCE CHARTS
   Era bands are decades, driven ONLY by S.year (never a setting). Years
   before 1960 clamp to the Sixties, years after 2029 clamp to the 2020s
   (lives run 1960–2025, so in practice every life lands on its own band).
   The CSS lives in styles/main.css as #app.era-XXXX rules; main.js sets
   the class on the #app root at every render.
   ========================================================================== */
export const ERA_BANDS = [
  { from: 1960, to: 1969, cls: 'era-1960s', name: 'The Sixties' },
  { from: 1970, to: 1979, cls: 'era-1970s', name: 'The Seventies' },
  { from: 1980, to: 1989, cls: 'era-1980s', name: 'The Eighties' },
  { from: 1990, to: 1999, cls: 'era-1990s', name: 'The Nineties' },
  { from: 2000, to: 2009, cls: 'era-2000s', name: 'The 2000s' },
  { from: 2010, to: 2019, cls: 'era-2010s', name: 'The 2010s' },
  { from: 2020, to: 2029, cls: 'era-2020s', name: 'The 2020s' }
];
export const ERA_CLASSES = ERA_BANDS.map(b => b.cls);
export function eraForYear(year) {
  const y = Number(year) || 1960;
  if (y < 1960) return ERA_BANDS[0];
  if (y > 2029) return {...ERA_BANDS[ERA_BANDS.length - 1],from:Math.floor(y/10)*10,to:Math.floor(y/10)*10+9,name:'The '+Math.floor(y/10)*10+'s'};
  return ERA_BANDS.find(b => y >= b.from && y <= b.to) || ERA_BANDS[ERA_BANDS.length - 1];
}
export function eraClassForYear(year) { return eraForYear(year).cls; }
export function eraNameForYear(year) { return eraForYear(year).name; }

/* v2.13 Worker 4 — the net-worth history recorder lives in gameLoop.js
   (v2.18 W3: recorded from the yearly advance, not from the render).
   Imported here for the two render call sites below (now idempotent
   safety nets) and re-exported so main.js's import keeps working. */
import { recordFinanceHistorySnapshot } from '../core/gameLoop.js';
export { recordFinanceHistorySnapshot };

/* --- Finance charts: every number comes from S.ledger / S.financeHistory.
   Income vs expenses aggregates CASH-account ledger lines only: a transfer
   between cash and savings writes two lines (one out of cash, one into
   savings), so summing every account would count the same money twice.
   The chart is labelled "cash in vs cash out" for exactly that reason. --- */
function financeCashEntries(S) {
  const entries = Array.isArray(S.ledger) ? S.ledger : [];
  return entries.filter(e => e && e.category !== 'fx' && (e.account === 'cash' || !e.account)).map(e => entryCurrencyIsCurrent(S, e) ? e : { ...e, delta: entryDelta(S, e) }); /* a pure currency conversion is not money in or out */
}

function financeBuckets(entries) {
  // Monthly buckets when the history covers a year or less, yearly above
  // that. Returns { mode, buckets: [{ key, label, income, expenses }], truncated }
  const months = entries.map(e => ({ y: Number(e.year) || 0, m: Number(e.month) || 1, d: Number(e.delta) || 0 }));
  if (!months.length) return { mode: 'month', buckets: [], truncated: false };
  const keys = months.map(x => x.y * 12 + (x.m - 1));
  const span = Math.max(...keys) - Math.min(...keys);
  const byKey = new Map();
  const add = (key, label, d) => {
    if (!byKey.has(key)) byKey.set(key, { key, label, income: 0, expenses: 0 });
    const b = byKey.get(key);
    if (d > 0) b.income += d; else b.expenses += Math.abs(d);
  };
  if (span <= 11) {
    for (const x of months) add(x.y * 12 + (x.m - 1), `${MONTH_NAMES[(x.m - 1) % 12].slice(0, 3)} ${x.y}`, x.d);
    return { mode: 'month', buckets: [...byKey.values()].sort((a, b) => a.key - b.key), truncated: false };
  }
  for (const x of months) add(x.y, String(x.y), x.d);
  let buckets = [...byKey.values()].sort((a, b) => a.key - b.key);
  let truncated = false;
  if (buckets.length > 24) { buckets = buckets.slice(-24); truncated = true; }
  return { mode: 'year', buckets, truncated };
}

function financeGroupedBarSvg(S, buckets, opts) {
  const W = 760, H = 196, padL = 10, padR = 10, padT = 30, padB = 24;
  const maxV = Math.max(1, ...buckets.map(b => Math.max(b.income, b.expenses)));
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const gw = plotW / buckets.length;
  const barW = Math.max(6, Math.min(30, gw * 0.30));
  const yFor = v => (padT + plotH - (v / maxV) * plotH).toFixed(1);
  const every = buckets.length > 12 ? Math.ceil(buckets.length / 12) : 1;
  const bars = buckets.map((b, i) => {
    const cx = padL + gw * (i + 0.5);
    const inH = Math.max(0, (b.income / maxV) * plotH);
    const exH = Math.max(0, (b.expenses / maxV) * plotH);
    return `
      <g data-bucket="${esc(b.label)}" data-income="${Math.round(b.income)}" data-expenses="${Math.round(b.expenses)}">
        <rect x="${(cx - barW - 2).toFixed(1)}" y="${yFor(b.income)}" width="${barW.toFixed(1)}" height="${inH.toFixed(1)}" style="fill:var(--chart-green)" rx="2"/>
        <rect x="${(cx + 2).toFixed(1)}" y="${yFor(b.expenses)}" width="${barW.toFixed(1)}" height="${exH.toFixed(1)}" style="fill:var(--chart-terracotta)" rx="2"/>
        ${b.income > 0 ? `<text x="${(cx - barW / 2 - 2).toFixed(1)}" y="${(Number(yFor(b.income)) - 4).toFixed(1)}" font-size="8.5" style="fill:var(--chart-green)" text-anchor="middle">${esc(formatMoney(b.income, S.country, true))}</text>` : ''}
        ${b.expenses > 0 ? `<text x="${(cx + barW / 2 + 2).toFixed(1)}" y="${(Number(yFor(b.expenses)) - 4).toFixed(1)}" font-size="8.5" style="fill:var(--chart-terracotta)" text-anchor="middle">${esc(formatMoney(b.expenses, S.country, true))}</text>` : ''}
        ${i % every === 0 ? `<text x="${cx.toFixed(1)}" y="${H - 7}" font-size="9" style="fill:var(--ink-secondary)" text-anchor="middle">${esc(b.label)}</text>` : ''}
      </g>`;
  }).join('');
  return `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="180" role="img" aria-label="${esc(opts.ariaLabel)}" style="background:var(--bg-chart);border:1px solid var(--line-soft);border-radius:8px;display:block">
      <line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" style="stroke:var(--chart-grid)"/>
      ${bars}
    </svg>`;
}

function financeLineSvg(S, pts, opts) {
  // pts: [{ label, value }] in chronological order. Honest flat-line guard:
  // callers only call this with >= 2 points.
  const W = 760, H = 170, padL = 10, padR = 10, padT = 28, padB = 24;
  const vals = pts.map(p => p.value);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const span = (maxV - minV) || 1;
  const plotW = W - padL - padR, plotH = H - padT - padB;
  const xFor = i => (padL + (pts.length === 1 ? plotW / 2 : (i / (pts.length - 1)) * plotW)).toFixed(1);
  const yFor = v => (padT + plotH - ((v - minV) / span) * plotH).toFixed(1);
  const points = pts.map((p, i) => `${xFor(i)},${yFor(p.value)}`).join(' ');
  const dots = pts.map((p, i) => `<circle cx="${xFor(i)}" cy="${yFor(p.value)}" r="3" style="fill:${opts.color}" data-point-label="${esc(p.label)}" data-point-value="${Math.round(p.value)}"/>`).join('');
  return `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="160" role="img" aria-label="${esc(opts.ariaLabel)}" style="background:var(--bg-chart);border:1px solid var(--line-soft);border-radius:8px;display:block">
      <line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" style="stroke:var(--chart-grid)"/>
      <polyline fill="none" style="stroke:${opts.color}" stroke-width="2.2" points="${points}"/>
      ${dots}
      <text x="${xFor(0)}" y="${(Number(yFor(pts[0].value)) - 8).toFixed(1)}" font-size="9" style="fill:var(--ink-secondary)">${esc(pts[0].label)}: ${esc(formatMoney(pts[0].value, S.country))}</text>
      <text x="${xFor(pts.length - 1)}" y="${(Number(yFor(pts[pts.length - 1].value)) - 8).toFixed(1)}" font-size="9" style="fill:var(--ink-secondary)" text-anchor="end">${esc(pts[pts.length - 1].label)}: ${esc(formatMoney(pts[pts.length - 1].value, S.country))}</text>
      <text x="${padL}" y="${H - 7}" font-size="9" style="fill:var(--ink-secondary)">${esc(pts[0].label)}</text>
      <text x="${W - padR}" y="${H - 7}" font-size="9" style="fill:var(--ink-secondary)" text-anchor="end">${esc(pts[pts.length - 1].label)}</text>
    </svg>`;
}

function renderFinanceChartsHtml(S) {
  const cashEntries = financeCashEntries(S);
  const ledgerCount = Array.isArray(S.ledger) ? S.ledger.length : 0;

  /* (a) Income vs expenses — from the real cash ledger lines. */
  let incomeHtml = '';
  if (ledgerCount < 2) {
    incomeHtml = `<p class="muted">${ledgerCount} transactions · More history needed</p>`;
  } else {
    const { mode, buckets, truncated } = financeBuckets(cashEntries);
    const totalIn = buckets.reduce((s, b) => s + b.income, 0);
    const totalOut = buckets.reduce((s, b) => s + b.expenses, 0);
    incomeHtml = `
      <div data-chart="income-expenses" data-total-in="${Math.round(totalIn)}" data-total-out="${Math.round(totalOut)}">
        ${financeGroupedBarSvg(S, buckets, { ariaLabel: 'Income versus expenses over time' })}
        <div class="muted" style="font-size:0.82rem;margin-top:6px">
          <span style="color:var(--chart-green)">■ Money in</span> · <span style="color:var(--chart-terracotta)">■ Money out</span> — cash account, ${mode === 'month' ? 'by month' : 'by year'}${truncated ? ' (last 24 years shown)' : ''}. Total in: <strong class="mono">${esc(formatMoney(totalIn, S.country))}</strong> · Total out: <strong class="mono">${esc(formatMoney(totalOut, S.country))}</strong>. Drawn from your ${cashEntries.length} recorded cash transactions.
        </div>
      </div>`;
  }

  /* (b) Cash balance over time — balanceAfter IS the cash balance after
     that line (savings lines carry the savings balance instead, so only
     cash-account lines are plotted). Labelled cash, never net worth. */
  let cashHtml = '';
  if (ledgerCount < 2 || cashEntries.length < 2) {
    cashHtml = `<p class="muted">${cashEntries.length} transactions · More history needed</p>`;
  } else {
    const chrono = [...cashEntries].reverse();
    const pts = chrono.map(e => ({
      label: `${MONTH_NAMES[((Number(e.month) || 1) - 1) % 12].slice(0, 3)} ${e.year}`,
      value: Number(e.balanceAfter) || 0
    }));
    const bals = pts.map(p => p.value);
    const lo = Math.min(...bals), hi = Math.max(...bals);
    cashHtml = `
      <div data-chart="cash-balance" data-first-balance="${Math.round(pts[0].value)}" data-last-balance="${Math.round(pts[pts.length - 1].value)}" data-min-balance="${Math.round(lo)}" data-max-balance="${Math.round(hi)}">
        ${financeLineSvg(S, pts, { color: 'var(--chart-navy)', ariaLabel: 'Cash balance over time' })}
        <div class="muted" style="font-size:0.82rem;margin-top:6px">
          Cash now: <strong class="mono">${esc(formatMoney(pts[pts.length - 1].value, S.country))}</strong> · Lowest cash: <strong class="mono">${esc(formatMoney(lo, S.country))}</strong> · Highest cash: <strong class="mono">${esc(formatMoney(hi, S.country))}</strong> · ${pts.length} cash entries, oldest first. This is cash only — not net worth (homes, cars, gold and debts are not in it).
        </div>
      </div>`;
  }

  /* Net worth over time — ONLY the snapshots recorded going forward.
     Never backfilled: an old save starts recording today. */
  const hist = Array.isArray(S.financeHistory) ? [...S.financeHistory].sort((a, b) => Number(a.year) - Number(b.year)) : [];
  const currentNW = computeNetWorthLocal(S);
  let nwHtml = '';
  if (hist.length < 2) {
    nwHtml = `<p class="muted">Net worth recorded from ${hist.length === 1 ? hist[0].year : S.year} — earlier years were not recorded. Your net worth now is <strong class="mono">${esc(formatMoney(currentNW, S.country))}</strong>; a new point is recorded each year you play, and the line will grow from here.</p>`;
  } else {
    const pts = hist.map(h => ({ label: String(h.year), value: Number(h.netWorth) || 0 }));
    nwHtml = `
      <div data-chart="net-worth" data-first-year="${hist[0].year}" data-last-year="${hist[hist.length - 1].year}" data-first-value="${Math.round(pts[0].value)}" data-last-value="${Math.round(pts[pts.length - 1].value)}">
        ${financeLineSvg(S, pts, { color: 'var(--chart-gold)', ariaLabel: 'Net worth over time' })}
        <div class="muted" style="font-size:0.82rem;margin-top:6px">
          Net worth recorded from ${hist[0].year} — earlier years were not recorded. ${hist.length} yearly snapshots, each one the same net-worth number the Finance tab shows.
        </div>
      </div>`;
  }

  /* (c) Business portfolio income — the v2.11 settlement lines, label
     "Business revenue — {name}", category monthly_settlement. */
  const bizNames = (S.career && Array.isArray(S.career.businesses)) ? S.career.businesses.map(b => b && b.name).filter(Boolean) : [];
  const bizEntries = (Array.isArray(S.ledger) ? S.ledger : []).filter(e =>
    e && typeof e.label === 'string' && e.label.startsWith('Business revenue — ') && (Number(e.delta) || 0) > 0);
  let bizHtml = '';
  if (!bizEntries.length) {
    bizHtml = bizNames.length === 0
      ? `<p class="muted">No business yet — your business income will chart here once you start one.</p>`
      : `<p class="muted">${esc(bizNames.join(', '))} has not paid revenue yet — business income will chart here once it does.</p>`;
  } else {
    const { mode, buckets, truncated } = financeBuckets(bizEntries);
    const totalBiz = buckets.reduce((s, b) => s + b.income, 0);
    const bizBuckets = buckets.map(b => ({ ...b, expenses: 0 }));
    bizHtml = `
      <div data-chart="business-income" data-total-revenue="${Math.round(totalBiz)}">
        ${financeGroupedBarSvg(S, bizBuckets, { ariaLabel: 'Business revenue over time' })}
        <div class="muted" style="font-size:0.82rem;margin-top:6px">
          Business revenue, ${mode === 'month' ? 'by month' : 'by year'}${truncated ? ' (last 24 years shown)' : ''} — from ${bizEntries.length} recorded business-revenue lines (${esc(bizNames.join(', ') || 'your businesses')}). Total revenue in the chart: <strong class="mono">${esc(formatMoney(totalBiz, S.country))}</strong>. Costs and tax are already in the money-in / money-out chart above, not here.
        </div>
      </div>`;
  }

  return `
    <div class="card">
      <div class="section-head">
        <h3>Money History</h3>
        <span class="hud-pill mono">${ledgerCount} transactions recorded</span>
      </div>
      <h4 style="font-family:var(--font-editorial);font-size:1rem;margin:10px 0 6px">Money In vs Money Out</h4>
      ${incomeHtml}
      <h4 style="font-family:var(--font-editorial);font-size:1rem;margin:16px 0 6px">Cash Balance Over Time (cash, not net worth)</h4>
      ${cashHtml}
      <h4 style="font-family:var(--font-editorial);font-size:1rem;margin:16px 0 6px">Net Worth Over Time</h4>
      ${nwHtml}
      <h4 style="font-family:var(--font-editorial);font-size:1rem;margin:16px 0 6px">Business Income Over Time</h4>
      ${bizHtml}
    </div>
  `;
}

function renderLedgerHistoryHtml(S, uiState = {}) {
  const filter = uiState.ledgerFilter || 'all';
  const entries = Array.isArray(S.ledger) ? S.ledger : [];
  const shown = entries.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'in') return e.category !== 'fx' && (Number(e.delta) || 0) > 0;
    if (filter === 'out') return e.category !== 'fx' && (Number(e.delta) || 0) < 0;
    return ledgerGroupOf(e) === filter;
  }).slice(0, 40);
  return `
    <div class="card">
      <div class="section-head">
        <h3>Transaction History — every pound traced</h3>
        <span class="hud-pill mono">Cash: ${esc(formatMoney(S.money.cash, S.country))} · Savings: ${esc(formatMoney(S.money.savings, S.country))}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        ${LEDGER_FILTERS.map(f => `
          <button class="btn btn-sm ${filter === f.id ? 'btn-navy' : ''}" data-action="set-ledger-filter" data-filter="${f.id}">${f.label}</button>
        `).join('')}
      </div>
      ${shown.length === 0 ? `
        <p class="muted">No transactions ${filter === 'all' ? 'yet' : 'in this filter'} — every pound you earn or spend will appear here, with the balance it left behind.</p>
      ` : `
        <div class="muted">${shown.length} / ${entries.length} transactions</div>
        ${shown.map(e => {
          const d = Number(e.delta) || 0;
          const when = `${MONTH_NAMES[((e.month || 1) - 1) % 12].slice(0, 3)} ${e.year} · Age ${e.age}`;
          return `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(e.label)}</strong>
                <span>${esc(when)} · ${esc(e.category || 'general')}${e.account && e.account !== 'cash' ? ` · ${esc(e.account)} account` : ''}</span>
              </div>
              <div style="text-align:right">
                ${e.category === 'fx' ? `<div class="muted" style="font-weight:600">Currency conversion</div>` : `<div class="mono" style="color:${d >= 0 ? '#1B734E' : '#B42318'};font-weight:600">${d >= 0 ? '+' : '−'}${esc(formatMoney(Math.abs(d), e.currency || S.country))}</div>`}
                <div class="muted mono" style="font-size:0.75rem">Balance: ${esc(formatMoney(e.balanceAfter, e.currency || S.country))}</div>
              </div>
            </div>
          `;
        }).join('')}
      `}
    </div>
  `;
}

/* v2.9 (M3) — the Sperrkonto/GIC blocked account was written (study-abroad
   pipeline, Chancenkarte) and read by settlement/net worth, but had no
   screen. Shape from the two write sites: { kind, country, balanceLocal,
   balanceInPlayerLocal, monthlyReleaseLocal }. */
function renderBlockedAccountHtml(S) {
  const ba = S.legal?.blockedAccount;
  if (!ba || !(Number(ba.balanceLocal) > 0)) return '';
  const baCountry = getCountry(ba.country || S.country);
  return `
    <div class="card">
      <div class="section-head">
        <h3>Blocked Account — ${esc(ba.kind || 'Blocked account')}</h3>
        <span class="hud-pill">${esc(baCountry.name)}</span>
      </div>
      <div class="muted" style="margin-bottom:8px">
        Money held in a blocked account abroad as proof you can support yourself while you study or look for work.
        The bank releases it to you in monthly instalments — it is yours, just not all at once.
      </div>
      <div class="item-row">
        <div class="item-row-main">
          <strong>Balance held: ${esc(formatMoney(ba.balanceLocal, ba.country || S.country))}</strong>
          <span>Monthly release: <strong>${esc(formatMoney(ba.monthlyReleaseLocal, ba.country || S.country))}</strong> — about a year of living money, paid out month by month.</span>
        </div>
      </div>
    </div>
  `;
}

export function renderFinanceTabHtml(S, uiState = {}) {
  ensureExtendedState(S);
  recordFinanceHistorySnapshot(S); // v2.13 W4: one net-worth snapshot per year, recorded on render
  const sub = uiState.finSub || 'cashflow';
  const nav = renderSubtabs('finance', [
    { id: 'cashflow', label: ['muslim', 'islam'].includes(String(S.player?.religion || '').toLowerCase()) ? 'Cashflow & Zakat' : 'Cashflow' },
    { id: 'banks', label: 'Banks, CDs & Loans' },
    { id: 'cards', label: `Credit Cards & BNPL (${S.creditCards.length})` },
    { id: 'markets', label: 'Gold Vault, Stocks & Hawala' }
  ], sub);

  const cObj = getCountry(S.country);
  const finBanner = renderEditorialBannerHtml(pickDynamicBanner(S, 'finance', sub), `${cObj.name} Banking, Savings, Loans & Markets${['muslim', 'islam'].includes(String(S.player?.religion || '').toLowerCase()) ? ' & Zakat' : ''}`);
  if (sub === 'banks') return finBanner + nav + renderBanksSubtabHtml(S, cObj);
  if (sub === 'cards') return finBanner + nav + renderCardsAndBnplSubtabHtml(S, cObj);
  if (sub === 'markets') return finBanner + nav + renderMarketsAndGoldSubtabHtml(S, cObj);

  const infPct = inflationRate(S.country, S.year);
  const zakat = computeZakatDueLocal(S);

  return `
    ${finBanner}
    ${nav}
    ${divorceSummaryHtml(S)}
    ${S.housing.mode==='parents'&&S.player.age>=24?`<div class="card"><strong>Adult family-home board</strong><p>${esc(formatMoney(eraLocalCost(cObj.monthlyBasket2026.rentModest*.35,S.country,S.year),S.country))}/mo</p></div>`:''}
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('finance', 18)} Monthly Ledger & Inflation (${esc(cObj.name)})</h2>
        <span class="hud-pill mono">CPI Inflation: ${infPct.toFixed(1)}%/yr</span>
      </div>
      ${renderMonthlyCashflowSlipHtml(S)}
      ${(() => {
        /* v2.18 W2 — the Finance tab states each business's last-month
           net from businessLastMonthNet, the one source of truth the
           business card and the Timeline read too. Before this the
           tab showed revenue, costs and tax on separate lines and
           never stated the net, so the three screens could not be
           compared at all. */
        const bizNet = businessesLastMonthNet(S);
        if (!bizNet.perBusiness.length) return '';
        if (!bizNet.settledCount) return `<div class="muted" style="margin-top:8px">Your businesses have no settled month yet — the first profit-and-loss lands at the end of this month.</div>`;
        return `<div class="muted" style="margin-top:8px">Businesses last month: ${bizNet.perBusiness.filter(b => b.hasPL).map(b => `${esc(b.name)} net <strong class="mono" data-biz-net="${b.net}" data-biz-name="${esc(b.name)}">${esc(formatMoney(b.net, S.country))}</strong>`).join(' · ')}</div>`;
      })()}
      ${S.player.age < 18 ? `
        <div class="muted" style="font-size:0.85rem;margin-top:8px">
          ${(() => {
            const pm = childPocketMoneyMonthly(S);
            const tierLabel = (FAMILY_TIERS[S.familyTier]?.label || 'your family').toLowerCase();
            return pm > 0
              ? `Your pocket money: <strong>${esc(formatMoney(pm, S.country))} a month</strong> from your parents — a ${esc(tierLabel)} household gives this much, and it rises if the family does better. It arrives once a year, and your parents still cover housing, food and school.`
              : `No pocket money right now — either you are under 6, or no parent is alive to give it. Your parents (or guardians) still cover housing, food and school.`;
          })()}
        </div>
      ` : ''}
      ${S.player.age >= 18 ? `
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center">
          <span class="muted" style="font-size:0.8rem">Lifestyle Standard:</span>
          ${['frugal', 'comfortable', 'generous', 'lavish'].map(m => `
            <button class="btn btn-sm ${S.money.lifestyleMode === m ? 'btn-navy' : ''}" data-action="set-lifestyle" data-mode="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</button>
          `).join('')}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px">
          <span class="muted" style="font-size:0.8rem">Standing Parent Support:</span>
          ${[0, 0.5, 1.2].map(mult => {
            const amt = mult === 0 ? 0 : eraLocalCost(cObj.monthlyBasket2026.foodAdult * mult, S.country, S.year);
            return `<button class="btn btn-sm ${Math.abs(S.money.remittanceMonthlyLocal - amt) < 5 ? 'btn-navy' : ''}" data-action="set-remit" data-amt="${amt}">${mult === 0 ? 'None' : `${formatMoney(amt, S.country)}/mo`}</button>`;
          }).join('')}
        </div>
      ` : ''}
    </div>

    ${(S.money.personalReceivables||[]).some(l=>l.status==='open')?'<div class="card"><h3>Personal Loans You Funded</h3>'+(S.money.personalReceivables||[]).filter(l=>l.status==='open').map(l=>'<div class="item-row"><span>'+esc(S.people[l.personId]?.firstName||'Borrower')+' · Owed '+esc(formatMoney(l.balance,l.country))+' · Due '+Math.floor((l.dueAt-1)/12)+'/'+((l.dueAt-1)%12+1)+' · Actual available savings limit collection.</span><button class="btn btn-sm" data-action="collect-personal-loan" data-id="'+esc(l.id)+'">Request repayment</button></div>').join('')+'</div>':''}
    ${(S.money.personalReceivables||[]).some(l=>l.status==='written_off')?'<details class="card"><summary>Personal loan write-offs</summary>'+(S.money.personalReceivables||[]).filter(l=>l.status==='written_off').map(l=>'<p>'+esc(S.people[l.personId]?.firstName||'Borrower')+' · '+esc(formatMoney(l.writtenOff,l.country))+' · '+esc(l.reason)+'</p>').join('')+'</details>':''}
    ${renderBlockedAccountHtml(S)}
    ${renderFinanceChartsHtml(S)}
    ${/* v2.15 W4 — the world & markets panel: market state, rates, history. */ renderWorldMarketPanelHtml(S)}
    ${renderLedgerHistoryHtml(S, uiState)}

    ${S.player.age >= 18 ? `
      <div class="card">
        <div class="section-head">
          <h3>Zakat</h3>
          <span class="hud-pill mono">Nisab: ${esc(formatMoney(zakat.nisabLocal, S.country, true))}</span>
        </div>
        <div class="item-row">
          <div class="item-row-main">
            <strong>${S.credentials.zakatLastYearPaid === S.year ? `✓ Zakat Fulfilled for ${S.year}` : zakat.eligible ? `Suggested contribution: ${formatMoney(zakat.due, S.country)}` : 'Below 85g 24K Gold Nisab Threshold'}</strong>
            <span><span title="Estimate from cash, savings, gold and investments." aria-label="Information">ⓘ</span></span>
          </div>
          <button class="btn btn-primary btn-sm" data-action="pay-zakat" ${(zakat.eligible && S.credentials.zakatLastYearPaid !== S.year && S.money.cash >= zakat.due) ? '' : 'disabled'}>
            ${S.credentials.zakatLastYearPaid === S.year ? 'Paid' : 'Fulfill Zakat'}
          </button>
          ${(zakat.eligible && S.credentials.zakatLastYearPaid !== S.year && S.money.cash < zakat.due) ? lockReason('Not enough cash to pay Zakat', `Need ${formatMoney(Math.round(zakat.due - S.money.cash), S.country)} more`) : !zakat.eligible && S.credentials.zakatLastYearPaid !== S.year ? lockReason('Below the Nisab threshold', 'Zakat is due only once your wealth passes 85g of 24K gold') : ''}
        </div>
      </div>

      <div class="card">
        <div class="section-head">
          <h3>10-Month Gam'iya — Rotating Savings Circle (ROSCA / MoneyFellows)</h3>
          <span class="hud-pill">${S.gamiya?.active ? `Month ${S.gamiya.currentMonth}/10` : 'Interest-Free Lump Sum'}</span>
        </div>
        ${S.gamiya?.active ? `
          <div class="muted">
            Active: <strong>${esc(S.gamiya.name)}</strong> · Share: <strong class="mono">${esc(formatMoney(S.gamiya.monthlyContribution, S.country))}/mo</strong> ·
            Total Pot: <strong class="mono text-good">${esc(formatMoney(S.gamiya.potTotal, S.country))}</strong> (${S.gamiya.receivedPot ? '✓ Pot Collected!' : `Collects in Month ${S.gamiya.slotMonth}`}) · Recorded paid ${esc(formatMoney(S.gamiya.paidTotal||0,S.country))} · Unpaid shares ${esc(formatMoney(S.gamiya.arrears||0,S.country))}. Unpaid shares remain a debt at cycle end.
          </div>
        ` : `
          <p class="muted" style="margin-bottom:8px">Pool monthly shares with 10 trusted members — pick <strong>Early Slot (Month 2)</strong> for an immediate interest-free lump sum for Shabka/down-payments, or <strong>Late Slot (Month 10)</strong> for disciplined savings!</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <button class="btn btn-sm btn-primary" data-action="join-gamiya" data-tier="standard" data-slot="early">Standard Gam'iya (Early Mo. 2 Pot)</button>
            <button class="btn btn-sm" data-action="join-gamiya" data-tier="wedding" data-slot="early">Marriage/Gehaz Gam'iya (Early Mo. 2)</button>
            <button class="btn btn-sm" data-action="join-gamiya" data-tier="property" data-slot="early">Big Property Gam'iya (Early Mo. 2)</button>
            <button class="btn btn-sm" data-action="join-gamiya" data-tier="wedding" data-slot="late">Disciplined Saver (Month 10 Pot)</button>
          </div>
        `}
      </div>

      <div class="card">
        <div class="section-head">
          <h3>Insurance Policies &amp; Estate Will / Wasiyyah</h3>
          <span class="hud-pill">${S.willPlan?.draftedYear ? `Will Notarized (${S.willPlan.charityPct}% Sadaqah)` : 'Statutory Default'}</span>
        </div>
        <div class="muted" style="margin-bottom:8px">Protect against sudden ER hospitalization, traffic collisions, and burst-pipe home water damage:</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">
          <button class="btn btn-sm ${S.insurance?.health ? 'btn-navy' : ''}" data-action="toggle-insurance" data-key="health">
            ${S.insurance?.health ? '✓ Private Health Insurance' : '+ Private Health Insurance'} (${esc(formatMoney(eraLocalCost(cObj.monthlyBasket2026.foodAdult * 0.22, S.country, S.year), S.country))}/mo)
          </button>
          <button class="btn btn-sm ${S.insurance?.auto ? 'btn-navy' : ''}" data-action="toggle-insurance" data-key="auto">
            ${S.insurance?.auto ? '✓ Full Auto Insurance' : '+ Full Auto Insurance'} (${esc(formatMoney(eraLocalCost(cObj.monthlyBasket2026.transport * 0.45, S.country, S.year), S.country))}/mo)
          </button>
          <button class="btn btn-sm ${S.insurance?.home ? 'btn-navy' : ''}" data-action="toggle-insurance" data-key="home">
            ${S.insurance?.home ? '✓ Home & Plumbing Insurance' : '+ Home & Plumbing Insurance'} (${esc(formatMoney(eraLocalCost(cObj.monthlyBasket2026.utilities * 0.28, S.country, S.year), S.country))}/mo)
          </button>
        </div>
        <div style="border-top:1px dashed var(--line-soft);padding-top:8px">
          <div class="muted" style="margin-bottom:6px">
            <strong>Game estate rules, not legal advice:</strong> ${['egy', 'sau', 'uae', 'tur', 'mys'].includes(S.country) && S.player.religion === 'muslim'
              ? 'Sharia Al-Fara\'id (2:1 male/female statutory shares + 1/8th spouse) with up to 1/3 (33%) charitable Wasiyyah / Sadaqah Jariyah.'
              : S.country === 'gbr'
              ? 'Simplified UK estate: 40% game tax above an era-scaled 325,000 GBP band, surviving spouse reserves 1/8, remaining child shares equal. Company relief/dispute choices use fictional game rules, not local probate law.'
              : 'Simplified estate: surviving spouse reserves 1/8, remaining child shares equal, after the chosen charity share. No detailed local succession model.'}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            ${[0, 10, 25, 33].map(pct => `
              <button class="btn btn-sm ${(S.willPlan?.charityPct || 0) === pct ? 'btn-navy' : ''}" data-action="set-will" data-pct="${pct}">
                ${pct === 0 ? '100% Heirs (0% Charity)' : `${pct}% Sadaqah / Charity`}
              </button>
            `).join('')}
          </div>
          ${renderWillHeirSection(S)}${renderEstateRecord(S)}${renderCompanyTrusts(S)}${renderNpcCompanyEstates(S)}${renderEstateReviews(S)}${renderNpcCompanyControls(S)}
        </div>
      </div>
    ` : ''}
  `;
}

function renderBanksSubtabHtml(S, cObj) {
  const rates = eraDepositRates(S.country, S.year);
  const banksHere = V1_BANKS[S.country] || V1_BANKS.usa || [];
  const cdsHere = V1_CERTIFICATES[S.country] || [];
  const loansHere = V1_LOAN_PRODUCTS[S.country] || [];
  const staffTerms = staffLoanTerms(S);

  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h3>${esc(S.money.bankName || banksHere[0]?.name || 'National Bank')} — Deposits & Certificates</h3>
        <span class="hud-pill mono">Credit Score: ${S.money.creditScore}</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px">
        ${banksHere.slice(0, 6).map(b => `
          <button class="btn btn-sm ${S.money.bankName === b.name ? 'btn-navy' : ''}" data-action="switch-bank" data-name="${esc(b.name)}">${esc(b.shortName || b.name)}</button>
        `).join('')}
      </div>
      <div class="item-row">
        <div class="item-row-main">
          <strong>Savings Account (${(rates.savings * 100).toFixed(1)}% APY)</strong>
          <span>Balance: <strong class="mono">${esc(formatMoney(S.money.savings, S.country))}</strong> (auto-protects against overdrafts)</span>
          ${(() => {
            const dep = Number(S.money.savingsDepositsTotal) || 0;
            const wd = Number(S.money.savingsWithdrawalsTotal) || 0;
            const intr = Number(S.money.savingsInterestTotal) || 0;
            if (dep === 0 && wd === 0 && intr === 0) {
              return S.money.savings > 0
                ? `<span class="muted">Where it came from: saved before this breakdown began — this balance was already here when the record started.</span>`
                : `<span class="muted">Where it came from: nothing saved here yet. Move cash in with Deposit below — it comes from your pocket money, gifts and earnings.</span>`;
            }
            return `<span class="muted">Where it came from: ${esc(formatMoney(dep, S.country))} you moved here from your cash (pocket money, gifts and earnings you chose to save) + ${esc(formatMoney(intr, S.country))} interest earned − ${esc(formatMoney(wd, S.country))} withdrawn.</span>`;
          })()}
          <span class="muted">Deposit 50% moves half of the cash in your hand (${esc(formatMoney(Math.floor(S.money.cash * 0.5), S.country))}) into this savings account. Savings earns interest, and it is used first if a bill would leave your cash short.</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm" data-action="bank-deposit" data-pct="0.5" ${S.money.cash > 100 ? '' : 'disabled'}>Deposit 50% of cash (${esc(formatMoney(Math.floor(S.money.cash * 0.5), S.country))} → savings)</button>
          ${S.money.cash <= 100 ? lockReason('Not enough cash to deposit', `You hold ${esc(formatMoney(S.money.cash, S.country))} — a deposit needs more than ${esc(formatMoney(100, S.country))}`) : ''}
          <button class="btn btn-sm" data-action="bank-withdraw" ${S.money.savings > 0 ? '' : 'disabled'}>Withdraw All</button>
          ${S.money.savings <= 0 ? lockReason('Nothing in savings to withdraw', 'Deposit cash first') : ''}
        </div>
      </div>
      <div class="item-row">
        <div class="item-row-main">
          <strong>High-Yield Bank Certificate (${(rates.cd1Yr * 100).toFixed(1)}% APY${cdsHere[0] ? ` · ${cdsHere[0].name}` : ''})</strong>
          <span>Active CDs: ${S.money.certificates.length} (${esc(formatMoney(S.money.certificates.reduce((a, c) => a + c.principal, 0), S.country))})</span>
        </div>
        <button class="btn btn-primary btn-sm" data-action="buy-cd" ${S.money.cash >= eraLocalCost(cObj.monthlyBasket2026.rentStandard * 2, S.country, S.year) ? '' : 'disabled'}>
          Lock ${esc(formatMoney(eraLocalCost(cObj.monthlyBasket2026.rentStandard * 2, S.country, S.year), S.country))}
        </button>
        ${S.money.cash < eraLocalCost(cObj.monthlyBasket2026.rentStandard * 2, S.country, S.year) ? lockReason('Not enough cash to lock this certificate', `Need ${esc(formatMoney(Math.round(eraLocalCost(cObj.monthlyBasket2026.rentStandard * 2, S.country, S.year) - S.money.cash), S.country))} more`) : ''}
      </div>
    </div>

    ${S.player.age >= 18 ? `
      <div class="card">
        <div class="section-head">
          <h3>Personal Loan Facilities (3 modeled sizes)</h3>
          <span class="muted">${S.money.loans.length} active loan(s)</span>
        </div>
        ${S.money.loans.map(l => `
          <div class="muted" style="margin-bottom:6px">• <strong>${esc(l.label)}</strong>: ${esc(formatMoney(l.balance, S.country))} remaining (${esc(formatMoney(l.monthlyPayment, S.country))}/mo · ${l.deferredEducation&&S.education.university?'deferred while enrolled, no interest':l.inCollections ? 'collections, no new interest' : `${l.remainingMonths}m left`})</div>
        `).join('')}
        ${[3, 8, 18].map((mult, idx) => {
          const amt = eraLocalCost(cObj.monthlyBasket2026.rentStandard * mult, S.country, S.year);
          const prodName = `${mult === 3 ? 'Small' : mult === 8 ? 'Standard' : 'Large'} unsecured personal loan`;
          return `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(prodName)}</strong>
                <span>Principal: <strong class="mono">${esc(formatMoney(amt, S.country))}</strong> · 36-Month Term</span>
              </div>
              <button class="btn btn-sm" data-action="take-loan" data-amt="${amt}" ${(!personalLoanGates(S)) ? '' : 'disabled'}>Borrow</button>
              ${personalLoanGates(S)?lockReason(personalLoanGates(S),''):''}
            </div>
          `;
        }).join('')}
        ${staffTerms.eligible ? (() => {
          const amt = eraLocalCost(cObj.monthlyBasket2026.rentStandard * 3, S.country, S.year);
          return `
            <div class="item-row">
              <div class="item-row-main">
                <strong>Staff Loan — bank staff rate ${(staffTerms.staffRate * 100).toFixed(1)}%</strong>
                <span>Principal: <strong class="mono">${esc(formatMoney(amt, S.country))}</strong> · 36-Month Term · the staff rate is the bank’s own 1-year deposit rate with no markup — the usual personal rate is ${(staffTerms.standardRate * 100).toFixed(1)}%. The loan record carries the staff rate, and it is repaid like any other loan.</span>
              </div>
              <button class="btn btn-sm btn-primary" data-action="take-staff-loan" data-amt="${amt}" ${(!personalLoanGates(S)) ? '' : 'disabled'}>Borrow at staff rate</button>
            </div>
          `;
        })() : ''}
      </div>
    ` : ''}
  `;
}

function renderCardsAndBnplSubtabHtml(S, cObj) {
  const catalogCards = V1_CREDIT_CARDS[S.country] || V1_CREDIT_CARDS.usa || [];
  const bnpl = BNPL_PROVIDERS[S.country] || BNPL_PROVIDERS.default;

  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>Wallet — Credit Cards & Regional BNPL (${esc(bnpl.name)})</h2>
        <span class="hud-pill mono">Score: ${S.money.creditScore}</span>
      </div>
      ${S.creditCards.length > 0 ? `
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:10px">
          ${S.creditCards.map(cc => {
            const available = Math.max(0, cc.limit - cc.balance);
            /* v2.12 W6: the card's real use targets the first wishlist item
               its available limit covers — buying it is what the buttons do. */
            const target = (S.shopWishlist || []).find(w => w.priceLocal <= available);
            const perkUsed = cc.perkUsedYear === S.year;
            return `
            <div>
              <div style="padding:10px 12px;border:1px solid var(--line-strong);border-radius:10px;margin-bottom:6px">
                <strong>${esc(cc.name)}</strong> <span class="hud-pill">${esc((cc.tier || 'classic').toUpperCase())}</span>
                <div class="muted">Balance: <strong class="mono">${esc(formatMoney(cc.balance, S.country))}</strong> / Limit ${esc(formatMoney(cc.limit, S.country))} · Cashback ${(Number(cc.cashbackRate || 0) * 100).toFixed(1)}%</div>
              </div>
              ${cc.balance > 0 ? `
                <div style="display:flex;gap:6px">
                  <button class="btn btn-primary btn-sm" data-action="pay-card" data-id="${cc.id}" data-full="1">Pay Full (${esc(formatMoney(cc.balance, S.country))})</button>
                  <button class="btn btn-sm" data-action="pay-card" data-id="${cc.id}" data-full="0">Pay minimum (${esc(formatMoney(Math.min(cc.balance,Math.max(10,Math.round(cc.balance*.1))),S.country))})</button>
                </div>
              ` : `<span class="muted">✓ Zero Balance · ${(cc.cashbackRate * 100).toFixed(1)}% Cashback Active</span>`}
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
                <button class="btn btn-sm" data-action="card-limit" data-id="${cc.id}">Check Limit &amp; Benefits</button>
                <button class="btn btn-sm" data-action="card-pay" data-id="${cc.id}" ${target ? `data-item="${target.catalogId}"` : 'disabled'}>Pay With This Card${target ? ` — ${esc(target.name)}` : ''}</button>
                <button class="btn btn-sm" data-action="card-use-perk" data-id="${cc.id}" ${(target && !perkUsed) ? `data-item="${target.catalogId}"` : 'disabled'}>Use The Perk${perkUsed ? ' (Used This Year)' : target ? ` — ${esc(target.name)}` : ''}</button>
              </div>
              ${!target ? `<div class="muted" style="font-size:0.72rem;margin-top:4px">Pay &amp; perk need a wishlist item this card can cover — save one for later in the Shop first.</div>` : ''}
            </div>
          `;}).join('')}
        </div>
      ` : `<p class="muted" style="margin-bottom:10px">No active credit cards in your wallet yet. Apply below once age 21+!</p>`}

      ${S.bnplPlans.length > 0 ? `
        <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--line-soft)">
          <strong style="font-size:0.84rem">Active ${esc(bnpl.name)} Split Plans (${S.bnplPlans.length}):</strong>
          ${S.bnplPlans.map(bp => `<div class="muted">• ${esc(bp.label)} — <strong class="mono">${esc(formatMoney(bp.monthlyPay, S.country))}/mo</strong> (${bp.monthsLeft} splits left) · ${esc(formatMoney(bp.balanceRemaining??bp.monthlyPay*bp.monthsLeft,S.country))} remaining</div>`).join('')}
        </div>
      ` : ''}
    </div>

    <div class="card">
      <div class="section-head">
        <h3>Apply for Country Credit Cards (${catalogCards.length} Tiers)</h3>
        <span class="muted">Classic · Gold · Platinum · Infinite · Islamic</span>
      </div>
      ${catalogCards.map(spec => {
        const held = S.creditCards.some(c => c.catalogId === spec.id);
        const tooYoung = S.player.age < 21;
        return `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${esc(spec.name)} (${esc((spec.tier || 'classic').toUpperCase())})</strong>
              <span>Req Score: <strong>${spec.reqScore || 580}</strong> · Cashback: ${((spec.cashbackRate || 0.01) * 100).toFixed(1)}% · APR: ${Math.round((spec.apr || 0.24) * 100)}%</span>
              ${tooYoung && !held ? `<span class="muted" style="font-size:0.72rem">Need age 21+ to apply (you are ${S.player.age})</span>` : ''}
            </div>
            <button class="btn btn-sm ${held ? '' : 'btn-primary'}" data-action="open-card" data-id="${spec.id}" ${(held || tooYoung) ? 'disabled' : ''}>${held ? '✓ In Wallet' : 'Apply'}</button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderMarketsAndGoldSubtabHtml(S, cObj) {
  const goldG = goldPricePerGram(S.country, S.year, 21);
  const investTicket = Math.max(100, eraLocalCost(cObj.monthlyBasket2026.rentStandard, S.country, S.year));
  const remitTicket = Math.max(50, eraLocalCost(cObj.monthlyBasket2026.foodAdult, S.country, S.year));

  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>Gold Bullion Vault (21K Spot: ${esc(formatMoney(goldG, S.country))}/g)</h2>
        <span class="hud-pill mono text-gold">${S.money.goldGrams21k}g Held</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">
        <div><strong class="mono">${S.money.goldGrams21k}g</strong> <span class="muted">of 21K gold held</span></div>
        <div>
          <div class="muted" style="margin-bottom:8px">Vault Valuation: <strong class="mono">${esc(formatMoney(Math.round(S.money.goldGrams21k * goldG), S.country))}</strong></div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <button class="btn btn-sm btn-primary" data-action="buy-gold" data-grams="5" ${S.money.cash >= goldG * 5 ? '' : 'disabled'}>Buy 5g</button>
            ${S.money.cash < goldG * 5 ? lockReason('Not enough cash for 5g of gold', `Need ${esc(formatMoney(Math.round(goldG * 5 - S.money.cash), S.country))} more`) : ''}
            <button class="btn btn-sm btn-primary" data-action="buy-gold" data-grams="20" ${S.money.cash >= goldG * 20 ? '' : 'disabled'}>Buy 20g</button>
            ${S.money.cash < goldG * 20 ? lockReason('Not enough cash for 20g of gold', `Need ${esc(formatMoney(Math.round(goldG * 20 - S.money.cash), S.country))} more`) : ''}
            <button class="btn btn-sm" data-action="buy-gold" data-grams="100" ${S.money.cash >= goldG * 100 ? '' : 'disabled'}>Buy 100g Bar</button>
            ${S.money.cash < goldG * 100 ? lockReason('Not enough cash for a 100g bar', `Need ${esc(formatMoney(Math.round(goldG * 100 - S.money.cash), S.country))} more`) : ''}
            <button class="btn btn-sm" data-action="sell-gold" data-grams="${Math.min(10,S.money.goldGrams21k)}" ${S.money.goldGrams21k >= 1 ? '' : 'disabled'}>Sell ${Math.min(10, S.money.goldGrams21k)}g</button>
            ${S.money.goldGrams21k < 1 ? lockReason('You hold no gold to sell', 'Buy gold first') : ''}
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-head">
        <h3>Global & Regional Markets (${GLOBAL_MARKET_ASSETS.length} ETFs, Stocks, Sukuk & T-Bills)</h3>
        <span class="muted">Ticket: ${esc(formatMoney(investTicket, S.country, true))}</span>
      </div>
      ${S.investments.length > 0 ? `
        <div style="margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--line-soft)">
          <strong style="font-size:0.82rem;color:var(--brand-emerald)">Active Portfolio (${S.investments.length}):</strong>
          ${S.investments.map(pos => `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(pos.name)} ${pos.shariaCompliant ? '· [Sharia/Halal]' : ''}</strong>
                <span>Market Value: <strong class="mono">${esc(formatMoney(pos.valueLocal, S.country))}</strong> (Cost Basis: ${esc(formatMoney(pos.costBasisLocal, S.country))})</span>
              </div>
              <button class="btn btn-sm" data-action="sell-asset" data-id="${pos.assetId}">Sell Position</button>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${GLOBAL_MARKET_ASSETS.filter(a => a.availableFrom <= S.year).map(a => `
        <div class="item-row">
          <div class="item-row-main">
            <strong>${esc(a.name)} ${a.shariaCompliant ? '· ✓ Sharia' : ''}</strong>
            <span>Avg Return: ~${(a.meanReturn * 100).toFixed(1)}%/yr · Yield: ${((a.dividendPct || 0) * 100).toFixed(1)}% · Risk: ${a.volatility > 0.25 ? 'High' : a.volatility > 0.12 ? 'Moderate' : 'Low'}</span>
          </div>
          <button class="btn btn-sm btn-primary" data-action="buy-asset" data-id="${a.id}" data-amt="${investTicket}" ${(S.player.age >= 18 && S.money.cash >= investTicket) ? '' : 'disabled'}>
            Invest ${esc(formatMoney(investTicket, S.country, true))}
          </button>
          ${S.player.age < 18 ? lockReason('Investing opens at 18', `You are ${S.player.age}`) : S.money.cash < investTicket ? lockReason('Not enough cash to invest', `Need ${esc(formatMoney(Math.round(investTicket - S.money.cash), S.country))} more`) : ''}
        </div>
      `).join('')}
    </div>

    ${S.player.age >= 18 ? `
      <div class="card">
        <div class="section-head">
          <h3>International Remittance & Hawala Channels</h3>
          <span class="muted">Wire ${esc(formatMoney(remitTicket, S.country))} home to parents</span>
        </div>
        ${REMITTANCE_CHANNELS.map(ch => `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${esc(ch.label)}</strong>
              <span>Fee: ${(ch.feePct * 100).toFixed(1)}% ${ch.fxBonusPct > 0 ? `· Parallel FX Bonus: +${Math.round(ch.fxBonusPct * 100)}%` : ''} ${ch.scamRisk > 0 ? `· ⚠ ${Math.round(ch.scamRisk * 100)}% Broker Scam Risk!` : '· Regulated'}</span>
            </div>
            <button class="btn btn-sm" data-action="send-remittance" data-ch="${ch.id}" data-amt="${remitTicket}" ${S.money.cash >= remitTicket ? '' : 'disabled'}>Send</button>
            ${S.money.cash < remitTicket ? lockReason('Not enough cash to send this', `Need ${esc(formatMoney(Math.round(remitTicket - S.money.cash), S.country))} more`) : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}
  `;
}

/* ============================================================================
   TAB 6: LIFESTYLE (3D Car Showroom 1,111 Models | Shop 1,293 Items | 102 Trips + Hajj/Umrah | Medical & IVF | Courts & Crime)
   ========================================================================== */
export function renderLifestyleTabHtml(S, uiState = {}) {
  ensureExtendedState(S);
  const ageNow = S.player?.age ?? 0;
  const allSubs = [
    { id: 'cars', label: `3D Cars (${CARS_MEGA_CATALOG.length})` },
    { id: 'appearance', label: 'Face & Tailor Studio' },
    { id: 'shop', label: `Shopping (${SHOP_MEGA_CATALOG.length})` },
    { id: 'pets', label: `Pets & Companions (${(S.pets || []).length})` },
    { id: 'travel', label: `Trips, Hajj & Umrah (${ALL_VACATIONS.length})` },
    { id: 'medical', label: 'Hospitals, LASIK & IVF' },
    { id: 'legal', label: 'Courts & Crime' }
  ].filter(s => ageNow >= (LIFESTYLE_SUB_MIN_AGE[s.id] || 0));
  const sub = allSubs.some(s => s.id === uiState.lifeSub) ? uiState.lifeSub : allSubs[0].id;
  const nav = renderSubtabs('lifestyle', allSubs, sub);

  if (sub === 'appearance') return renderEditorialBannerHtml(pickDynamicBanner(S, 'lifestyle', 'appearance'), 'Editorial Ink Portrait Plates, Character Anatomy & Bespoke Tailoring') + nav + renderAppearanceStudioSubtabHtml(S);
  if (sub === 'shop') return renderEditorialBannerHtml(pickDynamicBanner(S, 'lifestyle', 'shop'), 'Boutique Acquisitions, Horology & Appreciating Collectibles') + nav + renderShoppingMallSubtabHtml(S, uiState);
  if (sub === 'pets') return renderEditorialBannerHtml(pickDynamicBanner(S, 'lifestyle', 'pets'), 'Companion Animals, Arabian Stables & Falconry') + nav + renderPetsSubtabHtml(S);
  if (sub === 'travel') return nav + renderTravelAndHajjSubtabHtml(S, uiState);
  if (sub === 'medical') return renderEditorialBannerHtml(pickDynamicBanner(S, 'lifestyle', 'medical'), 'Specialist Hospitals, Diagnostics, LASIK & Reproductive Medicine') + nav + renderMedicalAndSurgeriesSubtabHtml(S);
  if (sub === 'legal') return renderEditorialBannerHtml(pickDynamicBanner(S, 'lifestyle', 'legal'), 'Civil & Labor Courts, Jurisprudence & Criminal Risk') + nav + renderCourtsAndCrimeSubtabHtml(S);

  return nav + renderCarShowroomSubtabHtml(S, uiState);
}

function renderAppearanceStudioSubtabHtml(S) {
  const p = S.player;
  const app = p.appearance || {};
  const tailorFee = Math.round(convertCurrency(180, 'usa', S.country, S.year));

  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>Character Anatomy, Grooming &amp; Bespoke Tailor Studio</h2>
        <span class="hud-pill">Looks: ${Math.round(p.vitals.looks || 65)}% · Charisma: ${Math.round(S.skills?.charisma || 45)}</span>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;padding:14px;background:var(--bg-subtle);border:1px solid var(--line-strong);border-radius:14px">
          ${renderPortraitSvg(p, 152, { isMilitaryActive: S.legal.military.status === 'active_duty' })}
          <strong style="font-size:0.9rem">${esc(p.fullName)}</strong>
          <span class="muted" style="font-size:0.75rem">${app.tailored ? '✓ Bespoke Wardrobe (+Interview Edge)' : `Tailor Fitting: ${formatMoney(tailorFee, S.country)}`}</span>
        </div>

        <div style="flex:1;min-width:260px;display:flex;flex-direction:column;gap:12px">
          <div style="padding:10px 12px;background:var(--bg-subtle);border:1px solid var(--line-strong);border-radius:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;margin-bottom:8px">
              <strong style="font-size:0.82rem">Portrait Rendering Medium:</strong>
              <div style="display:flex;gap:5px">
                <button type="button" class="btn btn-sm ${app.portraitMode !== 'vector' ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="portraitMode" data-val="ink">Hand-Drawn Ink &amp; Wash Art</button>
                <button type="button" class="btn btn-sm ${app.portraitMode === 'vector' ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="portraitMode" data-val="vector">✎ Custom Combinatorial Vector</button>
              </div>
            </div>
            <strong style="font-size:0.76rem;display:block;margin-bottom:6px">Choose Hand-Drawn Pen-and-Ink &amp; Watercolor Portrait Plate:</strong>
            <div style="display:flex;flex-wrap:wrap;gap:5px">
              ${INK_PORTRAIT_ARCHETYPES.map(ia => `
                <button type="button" class="btn btn-sm ${(app.portraitMode !== 'vector' && (app.inkArchetype || 'auto') === ia.id) ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="inkArchetype" data-val="${ia.id}">
                  ${esc(ia.label)}
                </button>
              `).join('')}
            </div>
          </div>

          <div>
            <strong style="font-size:0.78rem;display:block;margin-bottom:5px">1. Facial Bone Structure (Vector Mode · 6 Contours):</strong>
            <div style="display:flex;flex-wrap:wrap;gap:5px">
              ${FACE_SHAPES.map(fs => `
                <button type="button" class="btn btn-sm ${(app.faceShapeIdx ?? 1) === fs.id ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="faceShapeIdx" data-val="${fs.id}">${esc(fs.label)}</button>
              `).join('')}
            </div>
          </div>

          <div>
            <strong style="font-size:0.78rem;display:block;margin-bottom:5px">2. Skin Complexion &amp; Iris Color:</strong>
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px">
              ${SKIN_PALETTES.map(sk => `
                <button type="button" class="btn btn-sm ${(app.skinToneIdx ?? 2) === sk.id ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="skinToneIdx" data-val="${sk.id}">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:99px;background:${sk.base};border:1px solid #191716"></span> ${esc(sk.label)}
                </button>
              `).join('')}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px">
              ${IRIS_COLORS.map(ir => `
                <button type="button" class="btn btn-sm ${(app.irisIdx ?? 0) === ir.id ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="irisIdx" data-val="${ir.id}">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:99px;background:${ir.inner};border:1px solid ${ir.outer}"></span> ${esc(ir.label)}
                </button>
              `).join('')}
            </div>
          </div>

          <div>
            <strong style="font-size:0.78rem;display:block;margin-bottom:5px">3. Hairstyle, Hair Pigment &amp; Cultural Headwear:</strong>
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px">
              ${HAIR_STYLES.map(hs => `
                <button type="button" class="btn btn-sm ${(app.hairStyleIdx ?? 0) === hs.id ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="hairStyleIdx" data-val="${hs.id}">${esc(hs.label)}</button>
              `).join('')}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px">
              ${HAIR_COLORS.map(hc => `
                <button type="button" class="btn btn-sm ${(app.hairColorIdx ?? 0) === hc.id ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="hairColorIdx" data-val="${hc.id}">
                  <span style="display:inline-block;width:10px;height:10px;border-radius:99px;background:${hc.main}"></span> ${esc(hc.label)}
                </button>
              `).join('')}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px">
              ${HEADWEAR_STYLES.map(hw => `
                <button type="button" class="btn btn-sm ${(app.headwearMode || 'auto') === hw.id ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="headwearMode" data-val="${hw.id}">${esc(hw.label)}</button>
              `).join('')}
            </div>
          </div>

          ${p.gender === 'm' && p.age >= 18 ? `
            <div>
              <strong style="font-size:0.78rem;display:block;margin-bottom:5px">4. Barber &amp; Facial Hair Sculpting:</strong>
              <div style="display:flex;flex-wrap:wrap;gap:5px">
                ${BEARD_STYLES.map(bs => `
                  <button type="button" class="btn btn-sm ${(app.beardStyleIdx ?? (app.beard ? 2 : 0)) === bs.id ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="beardStyleIdx" data-val="${bs.id}">${esc(bs.label)}</button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div>
            <strong style="font-size:0.78rem;display:block;margin-bottom:5px">5. Optical Eyewear &amp; Bespoke Wardrobe (+Charisma &amp; Interview Bonus):</strong>
            <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:6px">
              ${EYEWEAR_STYLES.map(ew => `
                <button type="button" class="btn btn-sm ${(app.eyewearIdx ?? (app.glasses ? 1 : 0)) === ew.id ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="eyewearIdx" data-val="${ew.id}">${esc(ew.label)}</button>
              `).join('')}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:5px">
              ${WARDROBE_STYLES.map(ws => `
                <button type="button" class="btn btn-sm ${(app.wardrobeIdx ?? 0) === ws.id ? 'btn-navy' : ''}" data-action="edit-appearance" data-field="wardrobeIdx" data-val="${ws.id}">${esc(ws.label)}</button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-head">
        <h3>Barber &amp; Salon — Haircuts That People Notice</h3>
        <span class="muted">${app.haircut ? `Current: ${esc(app.haircut.label)} (${app.haircut.year})` : 'No haircut yet this life'}</span>
      </div>
      <p class="muted" style="margin-bottom:8px">A haircut costs real money, changes your looks on your record, and someone close to you reacts to it. The portrait toggles above are free — these are not.</p>
      ${HAIRCUT_STYLES.map(hs => {
        const fee = Math.round(eraUsdCost(hs.priceUsd, S.country, S.year));
        const afford = S.money.cash >= fee;
        return `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${esc(hs.label)}</strong>
              <span>${esc(formatMoney(fee, S.country))} · Looks +${hs.looks}${hs.charisma ? ` · Charisma +${hs.charisma}` : ''}${app.haircut && app.haircut.styleId === hs.id ? ' · ✓ Current cut' : ''}</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
              <button class="btn btn-sm ${afford ? 'btn-primary' : ''}" data-action="get-haircut" data-id="${hs.id}" ${afford ? '' : 'disabled'}>Get Cut</button>
              ${afford ? '' : lockReason('Not enough cash for this haircut', `Need ${formatMoney(fee - S.money.cash, S.country)} more`)}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="card">
      <div class="section-head">
        <h3>Style &amp; Outfits — Dressing That Moves Numbers</h3>
        <span class="muted">${app.outfit ? `Wearing: ${esc(app.outfit.label)} (${app.outfit.year})` : 'No outfit bought yet'}</span>
      </div>
      <p class="muted" style="margin-bottom:8px"></p>
      ${OUTFIT_STYLES.map(os => {
        const fee = Math.round(eraUsdCost(os.priceUsd, S.country, S.year));
        const afford = S.money.cash >= fee;
        return `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${esc(os.label)}</strong>
              <span>${esc(formatMoney(fee, S.country))} · Looks +${os.looks} · Charisma +${os.charisma}${app.outfit && app.outfit.styleId === os.id ? ' · ✓ Wearing now' : ''}</span>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
              <button class="btn btn-sm ${afford ? 'btn-primary' : ''}" data-action="buy-outfit" data-id="${os.id}" ${afford ? '' : 'disabled'}>Buy &amp; Wear</button>
              ${afford ? '' : lockReason('Not enough cash for this outfit', `Need ${formatMoney(fee - S.money.cash, S.country)} more`)}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderPetsSubtabHtml(S) {
  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('paw', 18)} Companion Animals, Stables &amp; Falconry (${(S.pets || []).length}/4)</h2>
        <span class="muted">Boosts daily joy &amp; lowers household stress</span>
      </div>
      ${(S.pets && S.pets.length > 0) ? `
        <div style="margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--line-soft)">
          <strong style="font-size:0.84rem;color:var(--brand-emerald)">Your Companions (${S.pets.length}):</strong>
          ${S.pets.map(pt => {
            const st = petStats(pt);
            const feedCost = petFeedCostLocal(S, pt);
            const vetCost = petVetCostLocal(S, pt);
            return `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(pt.name)} — ${esc(pt.species)}</strong>
                <span>Adopted in ${pt.adoptedYear} · Monthly Care &amp; Vet Food: <strong class="mono">${esc(formatMoney(Math.round(convertCurrency(pt.upkeepUsd || 25, 'usa', S.country, S.year)), S.country))}/mo</strong></span>
                <span class="muted">Health: <strong>${Math.round(st.health)}%</strong> · Happiness: <strong>${Math.round(st.happiness)}%</strong> · Obedience: <strong>${Math.round(st.obedience)}%</strong></span>
                <span style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">
                  ${S.money.cash < feedCost
                    ? `<span class="hud-pill">Feeding costs ${esc(formatMoney(feedCost, S.country))} — you hold ${esc(formatMoney(S.money.cash, S.country))}</span>`
                    : `<button class="btn btn-sm" data-action="pet-feed" data-id="${pt.id}">Feed (${esc(formatMoney(feedCost, S.country))})</button>`}
                  <button class="btn btn-sm" data-action="pet-play" data-id="${pt.id}">Play</button>
                  <button class="btn btn-sm" data-action="pet-train" data-id="${pt.id}">Train</button>
                  ${st.health >= 95
                    ? `<span class="hud-pill">${esc(pt.name)} is in perfect health — no vet visit needed</span>`
                    : S.money.cash < vetCost
                    ? `<span class="hud-pill">A vet visit costs ${esc(formatMoney(vetCost, S.country))} — you hold ${esc(formatMoney(S.money.cash, S.country))}</span>`
                    : `<button class="btn btn-sm" data-action="pet-vet" data-id="${pt.id}">Take to the Vet (${esc(formatMoney(vetCost, S.country))})</button>`}
                </span>
              </div>
            </div>`;
          }).join('')}
        </div>
      ` : `<p class="muted" style="margin-bottom:10px">No companion animals in your household yet. Adopt a cat, loyal dog, talking parrot, Arabian horse, or falcon below!</p>`}

      ${PET_CATALOG.map(spec => {
        const fee = Math.round(convertCurrency(spec.usd, 'usa', S.country, S.year));
        const upkeep = Math.round(convertCurrency(spec.upkeepUsd, 'usa', S.country, S.year));
        return `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${esc(spec.label)}</strong>
              <span>Adoption &amp; Vet Setup: <strong class="mono">${esc(formatMoney(fee, S.country))}</strong> · Upkeep: ${esc(formatMoney(upkeep, S.country))}/mo · +${spec.hap} Happiness</span>
            </div>
            <button class="btn btn-sm ${S.money.cash >= fee ? 'btn-primary' : ''}" data-action="adopt-pet" data-id="${spec.id}" ${(S.pets.length < 4 && S.money.cash >= fee) ? '' : 'disabled'}>Adopt</button>
            ${(S.pets.length < 4 && S.money.cash >= fee) ? '' : lockReason(S.pets.length >= 4 ? 'You already have 4 pets — the most you can keep' : 'Not enough cash to adopt', S.pets.length >= 4 ? '' : `Need ${formatMoney(fee - S.money.cash, S.country)} more — adoption fee ${formatMoney(fee, S.country)}`)}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderCarShowroomSubtabHtml(S, uiState) {
  const eraCars = CARS_MEGA_CATALOG.filter(c => carSoldInCountry(c, S.country) && c.yearFrom <= S.year && c.yearTo >= S.year);
  const q = String(uiState.carQuery || '').trim().toLowerCase();
  const clsFilter = uiState.carClass || 'all';
  const filtered = eraCars.filter(c => {
    if (clsFilter !== 'all' && c.class !== clsFilter) return false;
    if (q && !(`${c.brandName} ${c.model} ${c.body}`.toLowerCase().includes(q))) return false;
    return true;
  });

  const colorIdx = Number(uiState.carColorIdx || 0) % CAR_COLORS.length;
  const selColor = CAR_COLORS[colorIdx] || CAR_COLORS[0];
  const selTrim = CAR_TRIMS.find(t => t.id === uiState.carTrimId) || CAR_TRIMS[0];
  const previewCar = filtered[0] || eraCars[0] || CARS_MEGA_CATALOG[0];
  const licValid = S.drivingLicence?.valid && S.drivingLicence.expiresYear > S.year;

  return `
    ${renderEditorialBannerHtml(pickDynamicBanner(S, 'lifestyle', 'cars'), `${S.year} Automotive Gallery & 3D Showroom Turntable`)}
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('car', 18)} 3D Showroom & Traffic Licensing (${eraCars.length} Models in ${S.year})</h2>
        <button class="btn btn-sm ${licValid ? '' : 'btn-primary'}" data-action="get-licence">
          ${licValid ? `✓ Licence Valid (${S.drivingLicence.expiresYear})` : 'Pass Driving Test'}
        </button>
      </div>

      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:14px;background:var(--bg-canvas);padding:12px;border-radius:10px;margin-bottom:10px">
        ${renderCar3dTurntableHtml(previewCar, selColor.hex)}
        <div style="flex:1;min-width:210px">
          <strong>Showroom Preview: ${esc(previewCar.brandName)} ${esc(previewCar.model)}</strong>
          <div class="muted">Paint: <strong>${esc(selColor.label)}</strong> · Trim: <strong>${esc(selTrim.label)} (${selTrim.mult}×)</strong> · ${previewCar.hp} HP · ${esc(previewCar.body.toUpperCase())}</div>
          <div class="color-swatch-row" role="group" aria-label="Paint Color">
            ${CAR_COLORS.slice(0, 14).map((col, idx) => `
              <button type="button" class="color-swatch-btn ${idx === colorIdx ? 'active' : ''}" style="background:${col.hex}" title="${esc(col.label)}" data-action="pick-car-color" data-idx="${idx}"></button>
            `).join('')}
          </div>
          <select class="filter-select" data-filter="carTrimId" aria-label="Car Trim">
            ${CAR_TRIMS.map(tr => `<option value="${tr.id}" ${tr.id === selTrim.id ? 'selected' : ''}>Trim: ${esc(tr.label)} (${tr.mult}×)</option>`).join('')}
          </select>
        </div>
      </div>

      ${S.cars.length > 0 ? `
        <div style="margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--line-soft)">
          <strong style="font-size:0.84rem;color:var(--brand-emerald)">Your Garage (${S.cars.length}):</strong>
          ${S.cars.map(c => `
            <div class="item-row">
              <div style="display:flex;align-items:center;gap:10px">
                ${renderCarShowroomSvg(c, c.colorHex || '#1D3557', 96)}
                <div class="item-row-main">
                  <strong>${esc(c.colorName || '')} ${esc(c.name)}</strong>
                  <span>Resale: <strong class="mono">${esc(formatMoney(c.valueLocal, S.country))}</strong> · Upkeep: ${esc(formatMoney(c.monthlyUpkeep, S.country))}/mo</span>
                </div>
              </div>
              <button class="btn btn-sm" data-action="sell-car" data-id="${c.id}">Sell</button>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="catalog-filter-bar">
        <input type="search" class="filter-input" data-filter="carQuery" placeholder="Search Toyota, Mercedes, BMW, Porsche, BYD, Ferrari, Nissan..." value="${esc(uiState.carQuery || '')}">
        <select class="filter-select" data-filter="carClass" aria-label="Vehicle Class">
          <option value="all" ${clsFilter === 'all' ? 'selected' : ''}>All Classes</option>
          ${['econ', 'compact', 'mid', 'suv', 'exec', 'lux', 'sport', 'hyper', 'ev', 'truck'].map(cl => `<option value="${cl}" ${clsFilter === cl ? 'selected' : ''}>${cl.toUpperCase()}</option>`).join('')}
        </select>
      </div>

      ${filtered.slice(0, 26).map(car => {
        const dutyMult = (S.country === 'egy' && !car.ev && ['lux', 'exec', 'sport', 'hyper'].includes(car.class)) ? 1.75 : 1.0;
        const pLocal = Math.round(convertCurrency(car.priceUsd2026 * selTrim.mult * dutyMult, 'usa', S.country, S.year));
        const down25 = Math.round(pLocal * 0.25);
        return `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${esc(car.brandName)} ${esc(car.model)} (${esc(car.body.toUpperCase())} · ${car.hp} HP)</strong>
              <span>Cash: <strong class="mono">${esc(formatMoney(pLocal, S.country, true))}</strong> · 25% Auto Loan Down: ${esc(formatMoney(down25, S.country, true))}${dutyMult > 1 ? ' · [Customs Tariff]' : ''}</span>
            </div>
            <div style="display:flex;gap:5px">
              <button class="btn btn-sm btn-primary" data-action="buy-showroom-car" data-id="${car.id}" data-loan="0" ${(S.player.age >= 18 && S.money.cash >= pLocal) ? '' : 'disabled'}>Cash</button>
              ${S.player.age < 18 ? lockReason('Buying a car opens at 18', `You are ${S.player.age}`) : S.money.cash < pLocal ? lockReason('Not enough cash for this car', `Need ${esc(formatMoney(Math.round(pLocal - S.money.cash), S.country))} more`) : ''}
              <button class="btn btn-sm" data-action="buy-showroom-car" data-id="${car.id}" data-loan="1" ${(S.player.age >= 18 && S.money.cash >= down25) ? '' : 'disabled'}>Auto Loan</button>
              ${S.player.age < 18 ? lockReason('Buying a car opens at 18', `You are ${S.player.age}`) : S.money.cash < down25 ? lockReason('Not enough cash for the 25% down payment', `Need ${esc(formatMoney(Math.round(down25 - S.money.cash), S.country))} more`) : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderShoppingMallSubtabHtml(S, uiState) {
  const eraItems = SHOP_MEGA_CATALOG.filter(i => i.yearFrom <= S.year && i.yearTo >= S.year);
  const cats = ['all', ...new Set(eraItems.map(i => i.category))];
  const selCat = uiState.shopCat || 'all';
  const q = String(uiState.shopQuery || '').trim().toLowerCase();
  const filtered = eraItems.filter(i => {
    if (selCat !== 'all' && i.category !== selCat) return false;
    if (q && !(`${i.brand} ${i.name} ${i.category}`.toLowerCase().includes(q))) return false;
    return true;
  });
  const bnpl = BNPL_PROVIDERS[S.country] || BNPL_PROVIDERS.default;

  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>Shop</h2>
        <span class="hud-pill">${filtered.length} items · ${S.year}</span>
      </div>

      <div class="shop-balance">Cash <strong>${esc(formatMoney(S.money.cash,S.country))}</strong></div>
      ${S.inventory.length > 0 ? `
        <div style="margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--line-soft)">
          <strong style="font-size:0.83rem;color:var(--brand-emerald)">Owned Possessions & Collectibles (${S.inventory.length}):</strong>
          ${S.inventory.slice(0, 8).map(inv => `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(inv.name)} ${inv.appreciates ? '· ★ Appreciating Asset' : ''}</strong>
                <span>Resale Value: <strong class="mono">${esc(formatMoney(inv.valueLocal, S.country))}</strong></span>
              </div>
              <button class="btn btn-sm" data-action="sell-item" data-id="${inv.id}">Resell</button>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="catalog-filter-bar">
        <input type="search" class="filter-input" data-filter="shopQuery" placeholder="Find an item or brand" value="${esc(uiState.shopQuery || '')}">
        <select class="filter-select" data-filter="shopCat" aria-label="Shop Category">
          ${cats.map(ct => `<option value="${ct}" ${ct === selCat ? 'selected' : ''}>${ct.toUpperCase()}</option>`).join('')}
        </select>
      </div>

      <div class="shop-categories" aria-label="Categories">${cats.map(ct=>`<button class="shop-category ${ct===selCat?'selected':''}" data-action="shop-category" data-cat="${esc(ct)}">${shopCategoryIcon(ct,24)}<span>${esc(ct==='all'?'All':ct)}</span></button>`).join('')}</div>
      ${(S.shopWishlist || []).length > 0 ? `
        <div style="margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--line-soft)">
          <strong style="font-size:0.83rem;color:var(--brand-emerald)">Saved For Later — Your Wishlist (${S.shopWishlist.length}):</strong>
          ${S.shopWishlist.map(w => `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(w.name)}</strong>
                <span>${esc(formatMoney(w.priceLocal, S.country))} · ${S.money.cash >= w.priceLocal ? '✓ You can afford this now' : `Need ${esc(formatMoney(w.priceLocal - S.money.cash, S.country))} more`}</span>
              </div>
              <div style="display:flex;gap:5px">
                ${S.money.cash >= w.priceLocal ? `<button class="btn btn-sm btn-primary" data-action="buy-shop-item" data-id="${w.catalogId}" data-pay="cash">Buy Now</button>` : ''}
                <button class="btn btn-sm" data-action="remove-shop-wishlist" data-id="${w.catalogId}">Remove</button>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${filtered.slice(0, 28).map((it, idx) => {
        const pLocal = Math.max(5, Math.round(convertCurrency(it.priceUsd2026, 'usa', S.country, S.year)));
        const affordCash = S.money.cash >= pLocal;
        const wished = (S.shopWishlist || []).some(w => w.catalogId === it.id);
        const ownedSameCat = (S.inventory || []).find(inv => inv.category === it.category);
        const nextOther = filtered.find((f, j) => j !== idx && f.id !== it.id);
        const withRef = ownedSameCat ? `inv:${ownedSameCat.id}` : (nextOther ? nextOther.id : '');
        return `
          <article class="shop-product" data-shop-item="${esc(it.id)}">
            <div class="shop-product-head"><div class="shop-item-art shop-tone-${esc(it.category)}">${shopCategoryIcon(it.category,62)}</div><div><div class="shop-brand">${esc(it.brand)} · ${esc(it.category)}</div><h3>${esc(it.name)}</h3><div class="shop-price">${esc(formatMoney(pLocal,S.country))}</div>${it.appreciates?'<span class="shop-collectible">Collectible</span>':''}</div></div>
            <div class="shop-effects">+${it.hap} Mood${it.looks?` · +${it.looks} Looks`:''}</div>
            <div class="shop-primary-actions"><button class="btn btn-primary" data-action="buy-shop-item" data-id="${it.id}" data-pay="cash" ${affordCash?'':'disabled'}>Buy · ${esc(formatMoney(pLocal,S.country))}</button><button class="btn shop-save" data-action="save-shop-item" data-id="${it.id}" ${wished?'disabled':''}>${wished?'✓ Saved':'♡ Save'}</button></div>
            ${!affordCash?`<div class="muted">Need ${esc(formatMoney(pLocal-S.money.cash,S.country))} more</div>`:''}
            <details class="shop-options"><summary>Payment options &amp; compare</summary><div class="shop-more-actions">
              <span>Cash · paid now</span>
              ${S.creditCards.length?S.creditCards.map(cc=>`<div class="shop-credit-option"><span>${esc(cc.name)} · ${esc(formatMoney(Math.max(0,cc.limit-cc.balance),S.country))} available · ${((cc.apr||.24)*100).toFixed(1)}% APR</span><button class="btn btn-sm" data-action="buy-shop-item" data-id="${it.id}" data-pay="card" data-card-id="${cc.id}" ${(cc.limit-cc.balance)<pLocal||S.player.age<18?'disabled':''}>Use credit card</button></div>`).join(''):'<div>No credit card yet <button class="btn btn-sm" data-action="shop-finance" data-sub="cards">Cards</button></div>'}
              <button class="btn btn-sm" data-action="shop-finance" data-sub="banks">Bank loan</button><span class="muted">Apply in Finance, then buy with cash.</span>
              ${S.year>=bnpl.availableFrom?`<div>${esc(bnpl.name.split(' ')[0])} · ${bnpl.months} payments · ${esc(formatMoney(Math.round(pLocal*(bnpl.markup||1)/bnpl.months),S.country))} now · ${esc(formatMoney(Math.round(pLocal*(bnpl.markup||1)),S.country))} total <button class="btn btn-sm" data-action="buy-shop-item" data-id="${it.id}" data-pay="bnpl">Use installments</button></div>`:''}
              <button class="btn btn-sm" data-action="compare-shop-item" data-id="${it.id}" ${withRef?`data-with="${withRef}"`:''}>Compare</button><button class="btn btn-sm" data-action="ask-shop-item" data-id="${it.id}">Item details</button></div></details>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderTravelAndHajjSubtabHtml(S, uiState) {
  const q = String(uiState.vacQuery || '').trim().toLowerCase();
  const pilg = ALL_VACATIONS.filter(v => !!v.pilgrimage);
  const leisure = ALL_VACATIONS.filter(v => !v.pilgrimage && (!q || `${v.name} ${v.country || ''}`.toLowerCase().includes(q)));
  /* v2.13 Worker 2 — destination imagery. Decorative ink/watercolor scenes
     by region/look, NEVER a photo claiming to be a specific real place.
     Existing banners are reused where one fits; the 8 new *_ink.jpg scenes
     (europe_old_town, asia_temple_garden, tropical_island, desert_oasis,
     mountain_lake, north_america_skyline, safari_savanna, mediterranean_coast)
     cover the regions that had none. */
  const DEST_IMG_BY_ID = {
    north_coast: 'coastal_summer_chalet_ink.jpg', ras_el_hekma_summer: 'coastal_summer_chalet_ink.jpg',
    sharm: 'red_sea_beach_vacation_ink.jpg', hurghada: 'red_sea_beach_vacation_ink.jpg',
    dahab: 'red_sea_beach_vacation_ink.jpg', marsa_alam: 'red_sea_beach_vacation_ink.jpg',
    gouna: 'red_sea_beach_vacation_ink.jpg', el_gouna_kitesurf: 'red_sea_beach_vacation_ink.jpg',
    red_sea_ummahat: 'red_sea_beach_vacation_ink.jpg', jeddah: 'red_sea_beach_vacation_ink.jpg',
    alexandria: 'mediterranean_coast_ink.jpg', luxor_aswan: 'desert_oasis_ink.jpg',
    siwa: 'desert_oasis_ink.jpg', siwa_oasis: 'desert_oasis_ink.jpg',
    home: 'family_hearth_home_ink.jpg',
    turkey: 'turkey_istanbul_bosphorus_ink.jpg', antalya: 'mediterranean_coast_ink.jpg',
    dubai: 'city_gulf_skyline.jpg', abudhabi: 'city_gulf_skyline.jpg', doha: 'city_gulf_skyline.jpg',
    riyadh: 'city_gulf_skyline.jpg', beirut: 'mediterranean_coast_ink.jpg',
    alula: 'desert_oasis_ink.jpg', alula_hegira: 'desert_oasis_ink.jpg',
    muscat: 'desert_oasis_ink.jpg', salalah_khareef: 'mountain_lake_ink.jpg',
    marrakech: 'desert_oasis_ink.jpg', hatta_mountains: 'mountain_lake_ink.jpg',
    abha_asir: 'mountain_lake_ink.jpg',
    italy: 'europe_old_town_ink.jpg', france: 'europe_old_town_ink.jpg',
    spain: 'europe_old_town_ink.jpg', gbr: 'europe_old_town_ink.jpg',
    germany: 'europe_old_town_ink.jpg', amsterdam: 'europe_old_town_ink.jpg',
    vienna: 'europe_old_town_ink.jpg', prague: 'europe_old_town_ink.jpg',
    amalfi: 'mediterranean_coast_ink.jpg', amalfi_positano: 'mediterranean_coast_ink.jpg',
    riviera: 'mediterranean_coast_ink.jpg', ibiza: 'mediterranean_coast_ink.jpg',
    greece: 'mediterranean_coast_ink.jpg', lisbon: 'mediterranean_coast_ink.jpg',
    scotland: 'mountain_lake_ink.jpg', scottish_highlands: 'mountain_lake_ink.jpg',
    iceland: 'mountain_lake_ink.jpg', switzerland: 'switzerland_alps_lake_ink.jpg',
    japan: 'asia_temple_garden_ink.jpg', kyoto_ryokan: 'asia_temple_garden_ink.jpg',
    korea: 'asia_temple_garden_ink.jpg', thailand: 'asia_temple_garden_ink.jpg',
    chiangmai: 'asia_temple_garden_ink.jpg', india: 'asia_temple_garden_ink.jpg',
    vietnam: 'asia_temple_garden_ink.jpg', singapore: 'east_asia_skyline_ink.jpg',
    hokkaido: 'mountain_lake_ink.jpg', bali: 'tropical_island_ink.jpg',
    maldives: 'tropical_island_ink.jpg', maldives_honeymoon: 'tropical_island_ink.jpg',
    goa: 'tropical_island_ink.jpg', philippines: 'tropical_island_ink.jpg',
    usa_nyc: 'north_america_skyline_ink.jpg', usa_la: 'north_america_skyline_ink.jpg',
    usa_vegas: 'north_america_skyline_ink.jpg', usa_miami: 'north_america_skyline_ink.jpg',
    canada: 'north_america_skyline_ink.jpg', usa_hawaii: 'tropical_island_ink.jpg',
    mexico: 'tropical_island_ink.jpg', brazil: 'tropical_island_ink.jpg',
    peru: 'mountain_lake_ink.jpg', australia: 'coastal_summer_chalet_ink.jpg',
    new_zealand: 'mountain_lake_ink.jpg', fiji: 'tropical_island_ink.jpg',
    south_africa: 'mountain_lake_ink.jpg', kenya: 'safari_savanna_ink.jpg',
    tanzania: 'safari_savanna_ink.jpg', mauritius: 'tropical_island_ink.jpg'
  };
  const DEST_IMG_BY_REGION = {
    mena: 'desert_oasis_ink.jpg', europe: 'europe_old_town_ink.jpg', asia: 'asia_temple_garden_ink.jpg',
    north_america: 'north_america_skyline_ink.jpg', south_america: 'tropical_island_ink.jpg',
    oceania: 'tropical_island_ink.jpg', africa: 'safari_savanna_ink.jpg'
  };
  const destImgFor = (v) => v.pilgrimage ? 'pilgrimage_travel.jpg'
    : (DEST_IMG_BY_ID[v.id] || DEST_IMG_BY_REGION[v.region] || 'airport_departure_terminal_ink.jpg');
  const destImgHtml = (v) => `<img src="assets/banners/${destImgFor(v)}" alt="${esc(v.name)}" loading="lazy" style="width:72px;height:54px;object-fit:cover;border-radius:8px;flex-shrink:0">`;

  return `
    ${renderEditorialBannerHtml(pickDynamicBanner(S, 'lifestyle', 'travel'), (['muslim', 'islam'].includes(String(S.player?.religion || '').toLowerCase()) ? 'Pilgrimages, Airport Departures & World Destinations' : 'Airport Departures & World Destinations'))}
    ${(S.tripPlans || []).length > 0 ? `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>Your Trip Plans (${S.tripPlans.filter(p => p.status === 'planned').length} Planned)</h2>
        <span class="muted">Departures follow plan dates · Travel days are limited each month</span>
      </div>
      ${S.tripPlans.map(p => {const dest=ALL_VACATIONS.find(v=>v.id===p.destId);const q=dest?tripExecutionQuote(S,dest):null;return `
        <div class="item-row">
          <div class="item-row-main">
            <strong>${esc(p.name)} — ${p.departYear}/${String(p.departMonth).padStart(2, '0')} (${p.days} days)</strong>
            <span>Travel estimate: <strong class="mono">${esc(formatMoney(p.costLocal, S.country))}</strong>${q?' · Current total cash '+esc(formatMoney(q.total,S.country)):''} · ${p.status === 'taken' ? '✓ Trip taken' : 'Planned — papers & money below'}${p.visaNeeded ? ` · Visa needed: ${esc(p.visaLabel || '')}` : ' · No visa needed'}</span>
            ${(p.papers || []).map(pp => `<span>• ${esc(pp)}</span>`).join('')}
          </div>
          ${p.status === 'planned' ? `<button class="btn btn-sm btn-primary" data-action="take-trip" data-id="${p.destId}" ${q?.ok?'':'disabled'}>Take This Trip</button>${q&&!q.ok?'<span class="muted">'+esc(q.reason)+'</span>':''}` : `<span class="hud-pill">✓ Taken ${p.takenYear || ''}</span>`}
        </div>
      `;}).join('')}
    </div>
    ` : ''}

    ${S.tripLastCompare ? `
    <div class="card">
      <div class="section-head"><h3>Last Destination Comparison</h3></div>
      <p><strong>${esc(S.tripLastCompare.a.name)}</strong> — ${esc(formatMoney(S.tripLastCompare.a.costLocal, S.country))} · ${S.tripLastCompare.a.days} days · ${S.tripLastCompare.a.visaNeeded ? `visa needed: ${esc(S.tripLastCompare.a.visaLabel || '')}` : 'no visa needed'}<br>
      <strong>${esc(S.tripLastCompare.b.name)}</strong> — ${esc(formatMoney(S.tripLastCompare.b.costLocal, S.country))} · ${S.tripLastCompare.b.days} days · ${S.tripLastCompare.b.visaNeeded ? `visa needed: ${esc(S.tripLastCompare.b.visaLabel || '')}` : 'no visa needed'}<br>
      <span class="muted">${esc(S.tripLastCompare.a.costLocal <= S.tripLastCompare.b.costLocal ? S.tripLastCompare.a.name : S.tripLastCompare.b.name)} is the cheaper trip.</span></p>
    </div>
    ` : ''}

    <div class="card card-elevated">
      <div class="section-head">
        <h2>Official Nusuk Hajj & Umrah Pilgrimages</h2>
        <span class="hud-pill">${S.credentials.hajjCompleted ? '✓ Hajj Completed' : 'Hajj Unfulfilled'} · Umrah: ${S.credentials.umrahCount || 0}</span>
      </div>
      ${pilg.map(v => {
        const cost = v.pilgrimage === 'hajj'
          ? (S.country === 'sau' ? eraLocalCost(v.domesticSar || 9500, 'sau', S.year) : Math.round(convertCurrency(v.packageUsd || 8900, 'usa', S.country, S.year)))
          : (S.country === 'sau' ? eraLocalCost(1400, 'sau', S.year) : Math.round(convertCurrency(v.packageUsd || 1250, 'usa', S.country, S.year)));
        const planned = (S.tripPlans || []).some(p => p.destId === v.id && p.status === 'planned');
        const hajjDone = v.pilgrimage === 'hajj' && S.credentials.hajjCompleted;
        const execution=tripExecutionQuote(S,v);
        const afford = execution.ok;
        return `
          <div class="item-row" style="flex-wrap:wrap">
            ${destImgHtml(v)}
            <div class="item-row-main" style="flex:1;min-width:180px">
              <strong>${esc(v.name)}</strong>
              <span>Package: <strong class="mono">${esc(formatMoney(cost, S.country))}</strong> · Deep spiritual renewal & family honor</span>
              <span style="display:block">${execution.days} travel days · ${execution.daysLeft} left this month · Total cash ${esc(formatMoney(execution.total,S.country))}</span>
              ${tripLeaveImpact(S,v).unpaidDays?`<span style="display:block;margin-top:6px">${tripLeaveImpact(S,v).unpaidDays} unpaid leave days: ${esc(formatMoney(tripLeaveImpact(S,v).lostPay,S.country))} lost pay in addition to package cost.</span>`:""}
            </div>
            <div style="display:flex;gap:5px;align-items:flex-start;flex-wrap:wrap;width:100%;justify-content:flex-end">
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
                <button class="btn btn-primary btn-sm" data-action="take-trip" data-id="${v.id}" ${(afford && !hajjDone) ? '' : 'disabled'}>
                  ${hajjDone ? '✓ Completed' : 'Book Nusuk'}
                </button>
                ${(!afford && !hajjDone) ? lockReason(execution.reason, 'Advance the month or fund the full cost') : ''}
              </div>
              <button class="btn btn-sm" data-action="plan-trip" data-id="${v.id}" ${(planned || hajjDone) ? 'disabled' : ''}>${planned ? '✓ Planned' : 'Plan It'}</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="card">
      <div class="section-head">
        <h3>Domestic & World Vacations (${leisure.length} Destinations)</h3>
        <span class="muted">Calendar days spent traveling are limited each month</span>
      </div>
      <div class="catalog-filter-bar">
        <input type="search" class="filter-input" data-filter="vacQuery" placeholder="Search North Coast, Dahab, Aswan, Maldives, Tokyo, Paris, Alps..." value="${esc(uiState.vacQuery || '')}">
      </div>
      ${leisure.slice(0, 28).map((v, idx) => {
        const cost = tripCostLocal(S,v);
        const execution=tripExecutionQuote(S,v);
        const afford = execution.ok;
        const planned = (S.tripPlans || []).some(p => p.destId === v.id && p.status === 'planned');
        const nextDest = leisure[(idx + 1) % leisure.length];
        return `
          <div class="item-row" style="flex-wrap:wrap">
            ${destImgHtml(v)}
            <div class="item-row-main" style="flex:1;min-width:180px">
              <strong>${esc(v.name)} (${v.days_typical || 5} days)</strong>
              <span>Travel cost: <strong class="mono">${esc(formatMoney(cost, S.country))}</strong> · +12 Happiness, −18 Stress</span>
              <span style="display:block">${execution.days} travel days · ${execution.daysLeft} left this month · Total cash ${esc(formatMoney(execution.total,S.country))}</span>
              ${tripLeaveImpact(S,v).unpaidDays?`<span style="display:block;margin-top:6px">${tripLeaveImpact(S,v).unpaidDays} unpaid leave days: ${esc(formatMoney(tripLeaveImpact(S,v).lostPay,S.country))} lost pay in addition to travel cost.</span>`:""}
            </div>
            <div style="display:flex;gap:5px;align-items:flex-start;flex-wrap:wrap;width:100%;justify-content:flex-end">
              <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px">
                <button class="btn btn-sm ${afford ? 'btn-primary' : ''}" data-action="take-trip" data-id="${v.id}" ${afford ? '' : 'disabled'}>Travel</button>
                ${afford ? '' : lockReason(execution.reason, 'Advance the month or fund the full cost')}
              </div>
              <button class="btn btn-sm" data-action="plan-trip" data-id="${v.id}" ${planned ? 'disabled' : ''}>${planned ? '✓ Planned' : 'Plan It'}</button>
              <button class="btn btn-sm" data-action="compare-trip" data-id="${v.id}" ${nextDest && nextDest.id !== v.id ? `data-with="${nextDest.id}"` : ''}>Compare</button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderMedicalAndSurgeriesSubtabHtml(S) {
  const hospitals = getHospitalsFor(S.country, S.year);
  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('hospital', 18)} Hospitals, Diagnostics & Prescriptions</h2>
        <span class="hud-pill">${S.medical.conditions.length ? `${S.medical.conditions.length} Active Condition(s)` : 'Clear Bill of Health'}</span>
      </div>
      ${S.medical.conditions.map(cd => {
        if (!isSeriousCondition(cd.id)) {
          return `<div class="muted" style="margin-bottom:6px">• <strong>${esc(cd.label)}</strong> (since ${cd.sinceYear}) — ${cd.managed ? 'Managed' : 'Untreated'}</div>`;
        }
        const courseLock=cd.treatmentStatus==='treated'?'Condition controlled, ongoing care continues.':cd.lastTreatmentPeriod===S.year*12+S.month?'Course already recorded this month. Review next month.':'';
        const opts = treatmentOptions(S, cd);
        const priv = opts.find(o => o.care === 'private');
        const pub = opts.find(o => o.care === 'public');
        const status = cd.treatmentStatus === 'treated' ? 'Controlled with treatment'
          : cd.treatmentStatus === 'partial' ? 'Partly controlled — needs another round'
          : cd.treatmentStatus === 'failed' ? 'Treatment did not work — try another course'
          : 'Untreated';
        return `<div style="margin-bottom:10px;padding:8px;border:1px solid var(--line-strong);border-radius:8px">
          <div>• <strong>${esc(cd.label)}</strong>${cd.stage ? ` — stage ${esc(String(cd.stage))}` : ''} (since ${cd.sinceYear}) — <strong>${status}</strong></div>
          <div class="muted" style="font-size:0.78rem;margin:4px 0 6px">Private specialist: ${oddsInWords(priv.successProb)} (${esc(formatMoney(priv.cost, S.country))}). Public hospital: ${oddsInWords(pub.successProb)} (${esc(formatMoney(pub.cost, S.country))}).${cd.id === 'dementia' ? ' There is no cure for dementia — treatment slows the decline.' : ''}</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px">
            <button class="btn btn-primary btn-sm" data-action="treat-condition" data-id="${esc(cd.id)}" data-care="private" ${S.money.cash >= priv.cost && !courseLock ? '' : 'disabled'}>Treat (Private) — ${esc(formatMoney(priv.cost, S.country))}</button>
            ${courseLock?lockReason(courseLock):''}
            ${S.money.cash < priv.cost ? lockReason('Not enough cash for private treatment', `Need ${esc(formatMoney(Math.round(priv.cost - S.money.cash), S.country))} more`) : ''}
            <button class="btn btn-sm" data-action="treat-condition" data-id="${esc(cd.id)}" data-care="public" ${S.money.cash >= pub.cost && !courseLock ? '' : 'disabled'}>Treat (Public) — ${esc(formatMoney(pub.cost, S.country))}</button>
            ${courseLock?lockReason(courseLock):''}
            ${S.money.cash < pub.cost ? lockReason('Not enough cash for public treatment', `Need ${esc(formatMoney(Math.round(pub.cost - S.money.cash), S.country))} more`) : ''}
          </div>
        </div>`;
      }).join('')}
      <div class="muted" style="font-size:0.78rem;margin-bottom:6px">Fitness: <strong>${Math.round(S.skills?.fitness || 50)}/100</strong> — staying fit slows how fast your health falls after 50. Last full checkup: <strong>${S.medical.lastCheckupYear ? esc(String(S.medical.lastCheckupYear)) : 'never'}</strong> — regular checkups catch serious illness earlier, when it is easier to treat.</div>
      ${(() => { const cov = (S.career?.employed && S.career?.job) ? employerHealthCover(S) : null; const has = !!(S.medical.healthInsurance || S.insurance?.employerHealth); const staff = staffTreatmentEligible(S); return `<div class="muted" style="font-size:0.78rem;margin-bottom:6px">Health cover: <strong>${S.insurance?.health ? 'Private policy (you pay for it)' : cov?.covered ? esc(cov.label) : cov ? 'No cover from this job' : 'None'}</strong> — ${has ? 'your cover cuts treatment bills (a private policy cuts private treatment to about a quarter; an employer plan cuts it by about 45%).' : 'no cover — a serious illness is charged in full and can wipe out your savings.'}${staff ? ' Staff treatment at your own hospital cuts your own private treatment to about a quarter — the prices above already include that.' : ''}</div>`; })()}
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 12px">
        ${['gym', 'jog'].map(id => { const av = activityAvailability(S, id); return `<button class="btn btn-sm habit-btn" data-action="do-activity" data-id="${id}" ${av.ok ? '' : 'disabled'}>${id === 'gym' ? 'Hit the Gym (+fitness)' : 'Go for a Run (+fitness)'}${av.ok ? '' : lockReason(av.reason, '')}</button>`; }).join('')}
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 12px">
        <button class="btn btn-sm" data-action="visit-hospital" data-sector="public" ${S.medical.lastCheckupPeriod===S.year*12+S.month?'disabled':''}>Public Hospital (${esc(hospitals.find(h => h.sector === 'public')?.name || 'General')})</button>
        <button class="btn btn-primary btn-sm" data-action="visit-hospital" data-sector="private" ${S.medical.lastCheckupPeriod===S.year*12+S.month?'disabled':''}>Private Specialist (${esc(hospitals.find(h => h.sector === 'private')?.name || 'Specialist')})</button>
      </div>

      <p>Checkups · Screenings · Prescriptions <span title="Estimated effects, not medical advice." aria-label="Information">ⓘ</span></p><details><summary>Diagnostic Lab Screenings (${V1_MED_TESTS.length} Tests) & Pharmacy (${V1_MED_MEDICATIONS.length} Meds):</summary>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        ${[...(V1_MED_TESTS||[]).map(x=>({...x,kind:'test'})),...(V1_MED_MEDICATIONS||[]).filter(m=>(S.medical.conditions||[]).some(c=>(m.treats||[]).includes(c.id))).map(x=>({...x,kind:'med'}))].map(x=>{
          const fee=S.player.age<18?0:Math.max(x.kind==='test'?8:5,Math.round(convertCurrency(((x.kind==='test'?x.costEGP:x.monthlyEGP)||450)/50,'usa',S.country,S.year)));
          const used=S.medical.servicePeriods?.[`${x.kind}_${x.id}`]===S.year*12+S.month;
          const reason=used?'Completed this game month':S.money.cash<fee?'Not enough cash':'';
          return `<div><button class="btn btn-sm" data-action="med-diag" data-kind="${x.kind}" data-id="${x.id}" ${reason?'disabled':''}>${x.kind==='med'?'Rx: ':''}${esc(x.label)} · ${fee?esc(formatMoney(fee,S.country)):'Covered'}</button>${reason?lockReason(reason):''}</div>`;
        }).join('')}
      </div></details>
    </div>

    <div class="card">
      <div class="section-head">
        <h3>Surgical Procedures (${ALL_SURGERIES.length} catalog entries, incl. LASIK) & IVF Fertility</h3>
        <span class="muted">Corrective, Vision & Reproductive Medicine</span>
      </div>
      <div class="card" style="padding:10px">
        <strong>Fertility clinic</strong>
        <p class="muted">1 cycle/mo <span title="Requires an eligible co-resident couple; estimated outcome." aria-label="Information">ⓘ</span></p>
        ${V1_FERTILITY_TREATMENTS.map(ft=>`<div style="margin:8px 0"><button class="btn btn-sm" data-action="surgery-ivf" data-kind="ivf" data-id="${ft.id}" ${S.money.cash>=fertilityCostLocal(S,ft)?'':'disabled'}>${esc(ft.label)} · ${esc(formatMoney(fertilityCostLocal(S,ft),S.country))}</button>${S.money.cash<fertilityCostLocal(S,ft)?lockReason("Not enough cash for this clinic option",`Need ${formatMoney(fertilityCostLocal(S,ft)-S.money.cash,S.country)} more`):""}<div class="muted">${ft.successPct>0?`${Math.round(ft.successPct*100)}% game conception chance per cycle; no guarantee.`:'Assessment only, no conception attempt.'}</div></div>`).join('')}
      </div>
      ${ALL_SURGERIES.filter((sg,i,all)=>sg.id!=='ivf_icsi_cycle'&&all.findIndex(x=>x.id===sg.id)===i).map(sg => {
        const eligibility=surgeryEligibility(S,sg);
        const cost = eraLocalCost(Math.round(convertCurrency((sg.baseCostEGP || 35000) / 55.83, 'usa', S.country, 2026)), S.country, S.year);
        return `
          <div class="item-row" style="flex-wrap:wrap">
            <div class="item-row-main" style="min-width:180px;flex:1">
              <strong>${esc(sg.label)}</strong>
              <span>Est. Fee: <strong class="mono">${esc(formatMoney(cost, S.country))}</strong>${sg.looksBoost ? ` · +${sg.looksBoost} Looks` : ''} · ${sg.recoveryMonths||0} game months recovery${sg.partial?" · Ongoing care, not a guaranteed cure":""}</span>
            </div>
            <button class="btn btn-sm" data-action="surgery-ivf" data-kind="surgery" data-id="${sg.id}" ${S.money.cash >= cost && eligibility.ok ? '' : 'disabled'}>Book</button>
            ${!eligibility.ok?lockReason(eligibility.reason):''}
            ${S.money.cash < cost ? lockReason('Not enough cash for this procedure', `Need ${esc(formatMoney(Math.round(cost - S.money.cash), S.country))} more`) : ''}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderCourtsAndCrimeSubtabHtml(S) {
  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('gavel', 18)} Civil & Labor Courts</h2>
        <span class="hud-pill">${S.legal.criminalRecord ? '⚠ Criminal Record on File' : 'Clean Record'}</span>
      </div>
      ${(S.legal.civilLosses||[]).filter(x=>x.status!=='open').map(x=>`<p>Claim · ${x.status==='filed'?'Hearing pending · '+Math.max(0,x.dueAt-S.year*12-S.month)+' mo':x.status==='settled'?'Recovered '+esc(formatMoney(x.paidLocal,x.paidCountry)):x.status==='waived'?'Waived':'Reviewed · Collection unavailable'}</p>`).join('')}
      ${CIVIL_LAWSUITS.map(su => {
        const fee = Math.round(convertCurrency(su.lawyerFeeUsd, 'usa', S.country, S.year));
        const claim=civilClaimQuote(S,su.id);
        return `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${esc(su.label)}</strong>
              <span>Counsel Retainer: <strong class="mono">${esc(formatMoney(fee, S.country))}</strong> · ${claim.available?'Review 3 mo · Loss '+esc(formatMoney(claim.amount,S.country)):'No recorded dispute'}</span>${claim.available?'<span style="display:block" class="text-bad">'+esc(claim.collectionNote)+(claim.collectionAvailable?' · Frozen '+esc(formatMoney(claim.recoverableLocal,S.country)):'')+'</span>':''}
            </div>
            <button class="btn btn-primary btn-sm" data-action="file-lawsuit" data-id="${su.id}" ${S.money.cash >= fee&&claim.available ? '' : 'disabled'}>${claim.collectionAvailable?'File traced-funds claim':'Pay for review'}</button>
            ${!claim.available ? lockReason('Nothing to file', 'Your record shows no dispute of this kind.') : ''}
            ${claim.available && S.money.cash < fee ? lockReason('Not enough cash for the retainer', `Need ${esc(formatMoney(Math.round(fee - S.money.cash), S.country))} more`) : ''}
          </div>
        `;
      }).join('')}
    </div>

    <div class="card">
      <div class="section-head">
        <h3>Illicit Schemes & Criminal Risk (${V1_CRIMES.length} Offenses)</h3>
        <span class="muted text-bad">Conviction triggers firing, visa rejection & family shame!</span>
      </div>
      ${(V1_CRIMES || []).map(cr => `
        <div class="item-row">
          <div class="item-row-main">
            <strong>${esc(cr.label)}</strong>
            <span>Arrest Risk: <strong class="text-bad">${Math.round((cr.risk || 0.35) * 100)}%</strong></span>
          </div>
          <button class="btn btn-sm" data-action="commit-crime" data-id="${cr.id}" ${S.player.age >= (cr.minAge || 16) ? '' : 'disabled'}>Attempt</button>
          ${S.player.age < (cr.minAge || 16) ? lockReason(`This opens at ${cr.minAge || 16}`, `You are ${S.player.age}`) : ''}
        </div>
      `).join('')}
    </div>
  `;
}

/* ============================================================================
   TAB 7: PASSPORT & MIGRATION (Passports | Gulf Kafala & Iqama Mumayaza | Chancenkarte 6-Pt & Global Visas)
   ========================================================================== */
export function renderWorldTabHtml(S, uiState = {}) {
  ensureExtendedState(S);
  const isMinorW = (S.player?.age ?? 0) < 18; /* migration routes are adult decisions */
  const sub = isMinorW ? 'passports' : (uiState.worldSub || 'passports');
  const nav = isMinorW ? '' : renderSubtabs('world', [
    { id: 'passports', label: 'Passports & Legal Status' },
    { id: 'gulf', label: 'Gulf Kafala & Premium Residency' },
    { id: 'global', label: 'Chancenkarte (6-Pt), Study & Global Visas' }
  ], sub);

  const passBanner = renderEditorialBannerHtml(pickDynamicBanner(S, 'world', sub), 'ICAO Biometric Travel Documents, Consular Visa Foils & Global Mobility');
  if (sub === 'gulf') return passBanner + nav + renderGulfMigrationSubtabHtml(S, uiState);
  if (sub === 'global') return passBanner + nav + renderGlobalMigrationSubtabHtml(S,uiState);

  const rulesHere = SKILLED_MIGRATION_RULES[S.country];
  return `
    ${passBanner}
    ${nav}
    <div class="card card-elevated">
      <div class="section-head">
        <h2>${icon('passport', 18)} ICAO Doc 9303 Biometric Passports &amp; Border Stamps</h2>
        ${S.legal.travelBanInCountry ? `<span class="hud-pill text-bad">TRAVEL BAN (${esc(getCountry(S.legal.travelBanInCountry).name)})</span>` : `<span class="hud-pill">${S.legal.passports.filter(p=>p.expiresYear>S.year&&S.legal.citizenships.includes(p.country)).length} Valid Booklet(s)</span>`}
      </div>
      <div style="padding:12px;margin-bottom:12px;background:#edf3ec;border-radius:10px;font-size:.86rem;line-height:1.8"><strong>Living in ${esc(getCountry(S.country).name)}</strong><br>Citizenship: ${esc(S.legal.citizenships.map(c=>getCountry(c).name).join(', '))}<br>Status: ${esc(S.legal.residency.kind.replace(/_/g,' '))}<br>${esc(S.legal.residency.permitName||'')}${S.legal.residency.expiresYear?` · expires ${S.legal.residency.expiresMonth||12}/${S.legal.residency.expiresYear}`:''}<br>Moving does not grant a new nationality or passport.${S.education.university?.international||S.postgrad?.active?.international?'<br><strong>Leaving this country ends your full-time study here. Paid tuition is not refunded.</strong>':''}</div>
      ${renderPassportDocumentHtml(S)}
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${(S.player?.age ?? 0) < 18 ? '<span class="muted">Your parents handle your passport until you are 18.</span>' : '<button class="btn btn-navy btn-sm" data-action="renew-passport">Renew Biometric Passport</button>'}
        ${S.country !== S.homeCountry ? `<button class="btn btn-sm" data-action="return-home">Repatriate Permanently to ${esc(getCountry(S.homeCountry).name)}</button>` : ''}
      </div>
      ${(!S.legal.citizenships.includes(S.country)) ? `
        <div class="muted" style="margin-top:10px;padding-top:8px;border-top:1px solid var(--line-soft)">
          Legal Residence Accrued in ${esc(getCountry(S.country).name)}: <strong class="mono">${S.legal.residency.yearsInCountryLegally || 0} yr(s)</strong> ·
          ${rulesHere?.prYears
            ? `PR Track: ${rulesHere.prYears} yrs · Naturalization Citizenship: ${rulesHere.citizenshipYears} yrs`
            : `Gulf Law: Employer Iqama or Self-Sponsored Premium/Golden Visa (no years-based naturalization).`}
        </div>
      ` : ''}
    </div>

    ${S.player.age >= 18 ? `
      <div class="card">
        <div class="section-head">
          <h3>Consular Tourist &amp; Business Visa Desk (Biometric Vetting)</h3>
          <span class="muted">Evaluates bank solvency, employment/property ties &amp; clean record</span>
        </div>
        ${CONSULAR_TOURIST_VISAS.map(vs => {
          const fee = Math.round(convertCurrency(vs.feeUsd, 'usa', S.country, S.year));
          const reqBank = Math.round(convertCurrency(vs.minBankUsd, 'usa', S.country, S.year));
          const activeFoil = (S.legal.touristVisas || []).find(tv => tv.id === vs.id && tv.expiresYear > S.year);
          const exemptByPass = S.legal.citizenships.some(c => vs.covers.includes(c) || (S.legal.passports||[]).some(p=>p.country===c&&p.expiresYear>S.year&&['uae', 'deu', 'fra', 'ita', 'nld', 'gbr', 'usa', 'can', 'aus', 'jpn', 'sgp'].includes(c)));
          return `
            <div class="item-row">
              <div class="item-row-main">
                <strong>${esc(vs.regionLabel)} (${vs.validYears}-Yr Multi-Entry · ${esc(vs.ruleCode)})</strong>
                <span>Embassy Fee: <strong class="mono">${esc(formatMoney(fee, S.country))}</strong> · Min Bank Solvency: <strong class="mono">${esc(formatMoney(reqBank, S.country, true))}</strong> + Job/Uni/Property Ties</span>
              </div>
              <button class="btn btn-sm ${(activeFoil || exemptByPass) ? '' : 'btn-primary'}" data-action="apply-tourist-visa" data-id="${vs.id}" ${(activeFoil || exemptByPass || S.money.cash < fee) ? 'disabled' : ''}>
                ${exemptByPass ? '✓ Visa-Free Passport' : activeFoil ? `✓ Stamped (→ ${activeFoil.expiresYear})` : 'Submit Biometrics'}
              </button>
              ${(!activeFoil && !exemptByPass && S.money.cash < fee) ? lockReason('Not enough cash for the embassy fee', `Need ${esc(formatMoney(Math.round(fee - S.money.cash), S.country))} more`) : ''}
            </div>
          `;
        }).join('')}
      </div>
    ` : ''}
  `;
}

function renderGulfMigrationSubtabHtml(S, uiState) {
  if (S.player.age < 18) return `<div class="card"><p class="muted">Gulf work & residency channels unlock at age 18.</p></div>`;
  const gulfTarget = uiState.gulfTarget || 'uae';

  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h3>${icon('plane', 18)} Gulf Kafala Work Channels (Tax-Free Salaries)</h3>
        <div style="display:flex;gap:5px">
          <button class="btn btn-sm ${gulfTarget === 'uae' ? 'btn-navy' : ''}" data-action="set-gulf-target" data-dest="uae">UAE (AED)</button>
          <button class="btn btn-sm ${gulfTarget === 'sau' ? 'btn-navy' : ''}" data-action="set-gulf-target" data-dest="sau">Saudi Arabia (SAR)</button>
        </div>
      </div>
      ${GULF_ENTRY_CHANNELS.map(ch => {
        const fee = ch.upfrontFeeUsd2026 > 0 ? formatMoney(Math.round(convertCurrency(ch.upfrontFeeUsd2026, 'usa', S.country, S.year)), S.country) : 'No Fee';
        return `
          <div class="item-row">
            <div class="item-row-main">
              <strong>${esc(ch.label)} → ${gulfTarget === 'sau' ? 'Riyadh / Jeddah' : 'Dubai / Abu Dhabi'}</strong>
              <span>Upfront: <strong class="mono">${esc(fee)}</strong> · Pay Mult: ${ch.salaryMult > 0 ? `${ch.salaryMult}×` : 'Freelance Hustle'}${ch.scamRisk > 0 ? ` · ⚠ ${Math.round(ch.scamRisk * 100)}% Scam Risk` : ''}</span>
            </div>
            <button class="btn btn-primary btn-sm" data-action="apply-gulf" data-dest="${gulfTarget}" data-channel="${ch.id}" ${S.country === gulfTarget ? 'disabled' : ''}>Apply</button>
            ${S.country === gulfTarget ? lockReason('You already live here', 'Pick the other Gulf country above') : ''}
          </div>
        `;
      }).join('')}
    </div>

    <div class="card">
      <div class="section-head">
        <h3>Self-Sponsored Saudi Iqama Mumayaza & UAE 10-Year Golden Visa (2019+)</h3>
        <span class="muted">Zero Kafala · Full family & business freedom</span>
      </div>
      <div class="item-row">
        <div class="item-row-main">
          <strong>Saudi Permanent Premium Residency (800,000 SAR One-Time)</strong>
          <span>Lifetime self-sponsored Saudi residency (or buy 4M SAR real estate / earn 35k–80k SAR Special Talent!)</span>
        </div>
        <button class="btn btn-sm btn-primary" data-action="apply-premium-res" data-dest="sau" data-tier="permanent" ${S.year >= 2019 ? '' : 'disabled'}>Apply (800k SAR)</button>
        ${S.year < 2019 ? lockReason('Premium residency starts in 2019', `You are in ${S.year}`) : ''}
      </div>
      <div class="item-row">
        <div class="item-row-main">
          <strong>Saudi Annual Premium Residency (100,000 SAR / Year)</strong>
          <span>1-year renewable self-sponsored Iqama Mumayaza</span>
        </div>
        <button class="btn btn-sm" data-action="apply-premium-res" data-dest="sau" data-tier="annual" ${S.year >= 2019 ? '' : 'disabled'}>Apply (100k SAR)</button>
        ${S.year < 2019 ? lockReason('Premium residency starts in 2019', `You are in ${S.year}`) : ''}
      </div>
      <div class="item-row">
        <div class="item-row-main">
          <strong>UAE 10-Year Investor Golden Visa (2,000,000 AED Capital / Property)</strong>
          <span>Self-sponsored 10-year residency (also auto-granted at 30k+ AED/mo salary or 2M AED property!)</span>
        </div>
        <button class="btn btn-sm btn-primary" data-action="apply-premium-res" data-dest="uae" data-tier="golden" ${S.year >= 2019 ? '' : 'disabled'}>Apply (2M AED)</button>
        ${S.year < 2019 ? lockReason('Premium residency starts in 2019', `You are in ${S.year}`) : ''}
      </div>
    </div>
  `;
}

function renderStudyAbroadHtml(S,uiState){
 const dest=uiState.studyDest&&uiState.studyDest!==S.country?uiState.studyDest:COUNTRY_IDS.find(c=>c!==S.country);
 const unis=abroadUniversities(S,dest),uniId=unis.some(u=>u.id===uiState.studyUni)?uiState.studyUni:unis[0]?.id;
 const level=uiState.studyLevel||'bachelor',majorId=uiState.studyMajor||'cs',funding=uiState.studyFunding||'self';
 const q=studyAbroadQuote(S,dest,{uniId,level,majorId,funding});
 const field=(title,key,value,options)=>`<label style="display:grid;gap:5px;font-size:.84rem">${title}<select class="filter-select" data-filter="${key}" style="width:100%;max-width:100%">${options.map(o=>`<option value="${esc(o.id)}" ${o.id===value?'selected':''}>${esc(o.label)}</option>`).join('')}</select></label>`;
 return `<div class="card"><h3>Study abroad</h3><p class="muted"><span title="Estimated tuition and permit rules; no guaranteed admission or residency." aria-label="Information">ⓘ</span></p>
 <div style="display:grid;gap:10px;margin:14px 0">
 ${field('Country','studyDest',dest,COUNTRY_IDS.filter(c=>c!==S.country).map(c=>({id:c,label:getCountry(c).name})))}
 ${field('University','studyUni',uniId,unis.map(u=>({id:u.id,label:u.name})))}
 ${field('Level','studyLevel',level,ABROAD_LEVELS)}
 ${field('Subject','studyMajor',majorId,MAJORS.filter(m=>ABROAD_SUBJECTS.includes(m.id)).map(m=>({id:m.id,label:m.label})))}
 ${field('Funding','studyFunding',funding,[{id:'self',label:'My cash + savings'},{id:'parents',label:'Living parents’ actual savings'},{id:'scholarship',label:'Awarded game tuition scholarship'}])}</div>
 <p><strong>${q.years} years</strong> · ${esc(formatMoney(q.annualDest,dest))}/year · ${esc(q.feeStatus)}</p><p class="muted">${q.visaRequired?'Student permit required.':'You hold destination citizenship: no student visa or maintenance escrow.'} </p>
 <p class="muted">${level==='bachelor'?'First year prepaid; later tuition billed monthly or renewed by parents.':'Full course tuition prepaid; no further monthly tuition.'} Living costs billed monthly · No stipend</p>
 <div style="background:#f7f3e7;padding:12px;border-radius:10px;font-size:.84rem;line-height:1.8">Tuition due now: ${esc(formatMoney(q.tuitionDest,dest))}<br>Maintenance escrow: ${esc(formatMoney(q.blockedDest,dest))}${q.blockedDest?' (released over12months)':''}<br>Modelled travel/permit budget: ${esc(formatMoney(q.costsDest,dest))}<br><strong>Debit now: ${esc(formatMoney(q.totalPlayer,S.country))}</strong><br>Required liquid funds incl. first-year living buffer: ${esc(formatMoney(Math.max(q.totalPlayer,q.proofPlayer),S.country))}<br>Selected source holds: ${esc(formatMoney(q.available,S.country))}</div>

 ${!q.ok?`<p class="text-bad">${esc(q.reason)}</p>`:''}
 <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-primary" data-action="apply-study-abroad" data-dest="${dest}" data-uni="${uniId||''}" data-major="${majorId}" data-level="${level}" data-funding="${funding}" ${q.ok?'':'disabled'}>Fund & relocate to study</button>${q.ok?'':lockReason(q.reason)}
 <button class="btn btn-sm" data-action="apply-overseas-scholarship" data-dest="${dest}" data-level="${level}">Apply for game tuition award</button></div>
 <p>Tuition award · Score 85+ · Smarts 75+ · English</p></div>`;
}

function renderGlobalMigrationSubtabHtml(S,uiState={}) {
  if (S.player.age < 18) return `<div class="card"><p class="muted">Study-abroad and skilled visas unlock at age 18.</p></div>`;
  const ckPts = computeChancenkartePoints(S);
  const globalTargets = ['gbr', 'deu', 'can', 'usa', 'aus', 'nld', 'fra', 'sgp', 'jpn', 'ita'].filter(c => c !== S.country);

  return `
    <div class="card card-elevated">
      <div class="section-head">
        <h3>Germany Chancenkarte — Opportunity Card (June 2024+ · 6-Point System)</h3>
        <span class="hud-pill mono ${ckPts >= 6 ? 'text-good' : ''}">Your Score: ${ckPts} / 6 pts</span>
      </div>
      <p class="muted" style="margin-bottom:10px">
        Points breakdown: Recognized Degree (+4), Shortage STEM/Med (+1), 2–5+ Yrs Exp (+2/+3), Goethe German B2 (+3), IELTS C1 (+1), Age &lt;35 (+2). Grants 12 months in Germany to interview without a prior sponsor!
      </p>
      <button class="btn btn-primary btn-sm" data-action="apply-chancenkarte" ${(S.year >= 2024 && ckPts >= 6 && S.country !== 'deu') ? '' : 'disabled'}>
        ${S.year < 2024 ? 'Launches in 2024' : ckPts < 6 ? `Need ${6 - ckPts} More Point(s)` : 'Apply for German Chancenkarte →'}
      </button>
      ${S.country === 'deu' ? lockReason('You already live in Germany', 'No Opportunity Card needed') : ''}
    </div>

    ${renderStudyAbroadHtml(S,uiState)}

    <div class="card">
      <div class="section-head">
        <h3>${icon('world', 18)} Direct Skilled Worker Sponsorship (${globalTargets.length} Hubs)</h3>
        <span class="muted">Enforces UK £41,700 rule (w/ &lt;26 &amp; NHS discount) &amp; medical boards</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px">
        ${globalTargets.map(cid => {
          const co = getCountry(cid);
          const rl = SKILLED_MIGRATION_RULES[cid] || { prYears: 5 };
          return `
            <button class="btn" style="justify-content:space-between" data-action="apply-skilled-abroad" data-dest="${cid}">
              <span>${esc(co.flagCode)} ${esc(co.name)} (${rl.prYears || 5}y PR)</span>
              <span>→</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function renderBottomDockHtml(S) {
  if (S.gameOver) return '';
  const blocked = !!S.activeScene;
  const mainLabel = S.pacing === 'yearly'
    ? `Advance +1 Year (Age ${S.player.age + 1})`
    : `Next Month (${MONTH_NAMES[S.month % 12].slice(0, 3)})`;

  return `
    <div class="bottom-dock">
      <div class="bottom-dock-inner">
        <button type="button" class="advance-main-btn" data-action="advance-one" ${blocked ? 'disabled' : ''}>
          ${icon('plus', 18)}
          <span>${blocked ? 'Answer Open Decision Above First' : mainLabel}</span>
        </button>
        ${(S.pacing === 'monthly' && !blocked) ? `
          <button type="button" class="btn btn-navy" style="padding:13px 14px" data-action="fast-forward-year" title="Runs up to 12 months, one at a time, and stops at the first event that needs you">
            ${icon('fastforward', 17)}
            <span>Skip ahead</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/* The new-life preview shows one tile per choice, so each picture matches what
   is chosen: the birth country, the era the birth year falls in, and a family
   tile captioned with the chosen background. main.js patches it live as the
   form changes; the form itself is never re-rendered while the player edits. */
export function renderNewLifePreviewInnerHtml(d = {}) {
  const country = COUNTRIES[d.country] ? d.country : 'egy';
  const year = Number(d.birthYear) || 1998;
  const tier = FAMILY_TIERS[d.familyTier] ? d.familyTier : 'middle';
  const banner = { egy: 'cairo_nile_felucca_ink.jpg', che: 'switzerland_alps_lake_ink.jpg', swe: 'sweden_stockholm_archipelago_ink.jpg', tur: 'turkey_istanbul_bosphorus_ink.jpg', sau: 'city_gulf_skyline.jpg', uae: 'city_gulf_skyline.jpg', qat: 'city_gulf_skyline.jpg', kwt: 'city_gulf_skyline.jpg', jpn: 'east_asia_skyline_ink.jpg', sgp: 'east_asia_skyline_ink.jpg' }[country] || 'city_europe_west.jpg';
  const old = year <= 1985;
  const tile = (file, alt, cap) => `<figure style="margin:0;flex:1;min-width:88px"><img src="assets/banners/${file}" alt="${esc(alt)}" loading="eager" style="width:100%;height:74px;object-fit:cover;border-radius:8px"><figcaption class="muted" style="font-size:0.78rem;margin-top:2px">${esc(cap)}</figcaption></figure>`;
  return tile(banner, getCountry(country).name, getCountry(country).name)
    + tile(old ? 'era_vintage_street_ink.jpg' : 'era_modern_city_ink.jpg', old ? 'An older era street' : 'A modern city', `Born ${year}`)
    + tile('family_hearth_home_ink.jpg', FAMILY_TIERS[tier].label, FAMILY_TIERS[tier].label);
}

export function renderNewLifeModalHtml(defaults = {}) {
  const selCountry = defaults.country || 'egy';
  const selYear = defaults.birthYear || 1998;
  const selGender = defaults.gender || 'm';
  const selTier = defaults.familyTier || 'middle';
  const selAmbition = defaults.ambition || 'global_passport';
  const selFirst = defaults.firstName || '';
  const selFamily = defaults.familyName || '';
  const selSkin = String(defaults.skinToneIdx ?? '-1');
  const selFace = String(defaults.faceShapeIdx ?? '');
  /* v2.16 Worker 3 — theme control on the new-life modal: the player
     chooses their theme before they choose their life. The modal reuses
     renderThemeToggleHtml() — the exact same Light/Dark control as the
     header — so the two can never drift. It reads the theme from the
     theme store (getSavedTheme(): localStorage key
     world_life_2_theme, default light), never from a save — no life
     may exist yet. */
  /* v2.13 Worker 2 — new-life imagery (ink/watercolor, decorative only).
     Banner: a road at dawn, a life beginning. Choice previews: the chosen
     country's scene, both eras side by side (vintage street vs modern
     city, so the era choice looks different), and the family home. */

  return `
    <div class="modal-backdrop" id="new-life-modal">
      <div class="modal-sheet">
        ${renderEditorialBannerHtml('new_life_beginnings_ink.jpg', 'Begin a New Life — a road at dawn, a life ahead of you')}
        <div id="nl-preview" style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px">${renderNewLifePreviewInnerHtml({ country: selCountry, birthYear: selYear, familyTier: selTier })}</div>
        <div class="section-head">
          <h2>Begin a New Life</h2>
          <button class="btn btn-sm" data-action="close-new-life">Close</button>
        </div>
        <p class="muted">Choose where your life begins. Study, work, build relationships and live with the results. Laws, prices and institutions are simplified for play.</p>
        <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:4px">
          <span style="font-size:0.85rem"><strong>Theme:</strong></span>
          ${renderThemeToggleHtml()}
          <span class="muted" style="font-size:0.78rem">Applies to the whole game.</span>
        </div>

        <form id="new-life-form" class="form-grid">
          <div class="form-field">
            <label for="nl-country">Birth Country (${COUNTRY_IDS.length} available)</label>
            <select id="nl-country" name="country">
              ${COUNTRY_IDS.map(cid => {
                const c = COUNTRIES[cid];
                return `<option value="${cid}" ${cid === selCountry ? 'selected' : ''}>${esc(c.name)} (${c.currency})${c.tier === 1 ? ' ★ Deep' : ''}</option>`;
              }).join('')}
            </select>
          </div>

          <div class="form-field">
            <label for="nl-year">Birth Year (1965–2008)</label>
            <input id="nl-year" name="birthYear" type="number" min="1965" max="2008" value="${selYear}">
          </div>

          <div class="form-field">
            <label for="nl-gender">Gender</label>
            <select id="nl-gender" name="gender">
              <option value="m" ${selGender === 'm' ? 'selected' : ''}>Male</option>
              <option value="f" ${selGender === 'f' ? 'selected' : ''}>Female</option>
            </select>
          </div>

          <div class="form-field">
            <label for="nl-tier">Family Background</label>
            <select id="nl-tier" name="familyTier">
              ${Object.entries(FAMILY_TIERS).map(([k, v]) => `<option value="${k}" ${k === selTier ? 'selected' : ''}>${esc(v.label)}</option>`).join('')}
            </select>
          </div>

          <div class="form-field">
            <label for="nl-first">First Name (blank = authentic random)</label>
            <input id="nl-first" name="firstName" type="text" value="${esc(selFirst)}" autocomplete="off" placeholder="Auto-pick cultural name">
          </div>

          <div class="form-field">
            <label for="nl-family">Family Surname (blank = random)</label>
            <input id="nl-family" name="familyName" type="text" value="${esc(selFamily)}" autocomplete="off" placeholder="Auto-pick family surname">
          </div>

          <div class="form-field">
            <label for="nl-skin">Complexion</label>
            <select id="nl-skin" name="skinToneIdx">
              <option value="-1" ${selSkin === '-1' ? 'selected' : ''}>Authentic Regional Default</option>
              ${SKIN_PALETTES.map(sk => `<option value="${sk.id}" ${selSkin === String(sk.id) ? 'selected' : ''}>${esc(sk.label)}</option>`).join('')}
            </select>
          </div>

          <div class="form-field">
            <label for="nl-faceshape">Facial Bone Structure</label>
            <select id="nl-faceshape" name="faceShapeIdx">
              ${FACE_SHAPES.map(fs => `<option value="${fs.id}" ${selFace === String(fs.id) ? 'selected' : ''}>${esc(fs.label)}</option>`).join('')}
            </select>
          </div>

          <div class="form-field full">
            <label for="nl-ambition">Core Life Ambition</label>
            <select id="nl-ambition" name="ambition">
              ${Object.values(LIFE_AMBITIONS).map(a => `<option value="${a.id}" ${a.id === selAmbition ? 'selected' : ''}>${esc(a.label)} — ${esc(a.desc)}</option>`).join('')}
            </select>
          </div>

          <div class="form-field full" style="margin-top:6px;display:flex;flex-direction:row;gap:8px">
            <button type="submit" class="btn btn-primary" style="flex:1;padding:11px">Start This Life</button>
          </div>
        </form>
      </div>
    </div>
  `;
}
