/* ============================================================================
   World Life Complete Edition — 30-Life Coherence + Mega-Systems Integration Suite
   Verifies ZERO defects across D1–D11, determinism, 3D Compound & Room Gehaz ->
   Qa'ima chain, Land Construction -> Finished Property chain, 1,111-Car Showroom,
   BNPL/Cards, Global Markets, Licensing Boards, Chancenkarte, Hajj, and Dynasty!
   ========================================================================== */

import { createNewLifeState } from '../src/core/schema.js';
import { advanceSingleTurn, resolveActiveSceneChoice } from '../src/core/gameLoop.js';
import { listAvailableJobs, applyForJob, uniSupportsMajor } from '../src/systems/careerEducationEngine.js';
import { introducePartnerProspect, proposeEngagement, celebrateWedding } from '../src/systems/marriageFamilyEngine.js';
import { rentHousingUnit, buyGold21k } from '../src/systems/economyEngine.js';
import { applyGulfWorkChannel, applyStudyAbroad, hasValidPassport, renewPassport } from '../src/systems/visaMigrationEngine.js';
import { getHousingFor } from '../src/data/institutions.js';
import { interactWithPerson } from '../src/systems/soulEngine.js';
import { buildLegacySummary, continueAsChild, triggerPlayerDeath } from '../src/systems/healthDirectorEngine.js';
import {
  buyCompoundOrDistrictUnit,
  furnishPropertyRoom,
  installPropertyUpgrade,
  purchaseLandPlot,
  startCustomConstructionOnLand,
  buyShowroomCar,
  purchaseShopCatalogItem,
  openCreditCard,
  investInMarketAsset,
  payAnnualZakat,
  sitExamOrLicensingBoard,
  applyGermanChancenkarte,
  takeVacationOrPilgrimage,
  joinGamiyaCircle,
  registerProfessionalSyndicate,
  enrollPostgraduateProgram,
  growCreatorOrExpertChannel,
  adoptCompanionPet,
  toggleInsurancePolicy,
  setEstateWillPlan,
  renovateProperty,
  sellOwnedProperty,
  togglePropertyTenantMode,
  setWeeklyTimeFocus,
  applyConsularTouristVisa,
  setPropertyFacadePalette,
  remodelPropertyRoomPurpose,
  expandPropertyFootprint,
  customizePlayerAppearance
} from '../src/systems/completeLifeSystems.js';
import { buildHome3DSceneFaces, buildCar3DSceneFaces } from '../src/ui/liveCanvas3d.js';
import { renderArchitecturalFloorplanSvg, renderAllPropertyFloorsHtml } from '../src/ui/visualEngine3d.js';
import { renderPassportDocumentHtml } from '../src/ui/documents.js';
import { renderSocialConstellationSvg } from '../src/ui/editorialSketches.js';
import { renderPortraitSvg } from '../src/ui/portraits.js';

/* The player can only press an available choice, so the harness does the same.
   (Index 0 can be unavailable, for example when cash is short.) */
function firstAvailableChoice(S) {
  const ch = S.activeScene?.choices || [];
  const i = ch.findIndex((c) => typeof c.available !== 'function' || c.available(S));
  return i < 0 ? 0 : i;
}

// print was never defined: the checks ran, then the report line crashed. Define it (console.log), checks untouched.
const print = (...a) => console.log(...a);

/* 1. Determinism Check */
function runSimpleLife(seed) {
  const s = createNewLifeState({ seed, country: 'egy', birthYear: 1986, familyTier: 'middle', gender: 'm' });
  for (let step = 0; step < 120 && !s.gameOver; step++) {
    advanceSingleTurn(s);
    if (s.activeScene) resolveActiveSceneChoice(s, 0);
  }
  return JSON.stringify({
    year: s.year,
    month: s.month,
    cash: s.money.cash,
    journalTop: s.journal.slice(0, 5).map(j => j.text)
  });
}

if (runSimpleLife(7) !== runSimpleLife(7)) {
  throw new Error('DETERMINISM FAILED: Seed 7 diverged between runs!');
}

/* 1B. Verify All 11 3D Building Models (Roof + Cutaway), 3D Cars & All 11 Distinct CAD Floorplans */
const ALL_SHAPES = ['studio', 'apartment', 'duplex', 'penthouse', 'townhouse', 'twin_house', 'villa', 'chalet', 'mansion', 'commercial', 'land'];
const cadTitles = new Set();
for (const sh of ALL_SHAPES) {
  const facesRoof = buildHome3DSceneFaces({ shape: sh, finishing: 'super_lux', viewMode: 'elevation', timeOfDay: 'sunset', furnishedRooms: { living: 'Lux', bedroom: 'Lux', kitchen: 'Lux' }, hasPool: true, hasSolar: true, parkedCarColor: '#C84B31' });
  const facesCut = buildHome3DSceneFaces({ shape: sh, finishing: 'super_lux', viewMode: 'cutaway', furnishedRooms: { living: 'Lux', bedroom: 'Lux', kitchen: 'Lux' } });
  const facesExp = buildHome3DSceneFaces({ shape: sh, finishing: 'super_lux', viewMode: 'exploded', furnishedRooms: { living: 'Lux', bedroom: 'Lux', kitchen: 'Lux' } });
  if (facesRoof.length < 5 || facesCut.length < 5 || facesExp.length < 5) throw new Error('3D geometry empty for ' + sh);
  const cadSvg = renderArchitecturalFloorplanSvg(sh, 'super_lux', { living: 'Italian Sofa', bedroom: 'King Suite' }, 220, 0, 'prop_x', { cyanotype: true, showMep: true });
  if (/undefined|NaN/.test(cadSvg)) throw new Error('CAD floorplan leak on ' + sh);
  const m = cadSvg.match(/aria-label="([^"]+)"/);
  if (m) cadTitles.add(m[1]);
}
if (cadTitles.size !== 11) throw new Error('Expected 11 distinct CAD floorplan blueprints, got ' + cadTitles.size);
for (const mf of ['duplex', 'townhouse', 'twin_house', 'villa', 'mansion']) {
  const gf = renderArchitecturalFloorplanSvg(mf, 'super_lux', { living: 'Lux' }, 260, 0, 'prop_test');
  const f1 = renderArchitecturalFloorplanSvg(mf, 'super_lux', { bedroom: 'Lux' }, 260, 1, 'prop_test');
  const t0 = gf.match(/aria-label="([^"]+)"/)?.[1];
  const t1 = f1.match(/aria-label="([^"]+)"/)?.[1];
  if (!t0 || !t1 || t0 === t1) throw new Error('Multi-floor CAD GF vs 1F identical for ' + mf);
  /* Since 7e64eed the plan is an informational drawing: tapping a room opens its
     info (room-info), and furnishing is bought from the room cards with their
     real prices, never from a blind tap on the drawing. */
  if (gf.includes('data-action="furnish-room"')) throw new Error('CAD plan must not buy furnishing by a blind tap on ' + mf);
  if (!/data-action="room-info"[^>]*data-room="[^"]+"[^>]*data-m2=/.test(gf)) throw new Error('Room-info tap missing on CAD ' + mf);
}
const villaAllFloors = renderAllPropertyFloorsHtml('villa', 'super_lux', { living: 'Lux', bedroom: 'Lux' }, 420, 'prop_test');
if (!villaAllFloors.includes('A-101') || !villaAllFloors.includes('A-102') || !villaAllFloors.includes('A-103')) {
  throw new Error('Villa multi-floor dossier must simultaneously display all 3 floors (A-101, A-102, A-103)!');
}
// DESIGN CHANGE (v2.2, Elsayed's decision 2026-11-19): the design reversed —
// the ink/watercolor illustrations are back in the game by the owner's choice,
// so the kinship constellation now embeds ink portraits instead of initials
// avatars. This check asserts portraits ARE present and deterministic —
// an open design change, not a weakening.
{
  const skState = createNewLifeState({ seed: 4242, country: 'egy', birthYear: 1990, familyTier: 'middle', gender: 'm' });
  const constellation = renderSocialConstellationSvg(skState);
  if (/undefined|NaN/.test(constellation)) throw new Error('Constellation leak!');
  if (!/assets\/portraits\//.test(constellation) || !/<image/i.test(constellation)) {
    throw new Error('Constellation does not embed ink portrait images!');
  }
  const avA = renderPortraitSvg(skState.player, 64);
  const avB = renderPortraitSvg(skState.player, 64);
  if (avA !== avB || !avA.includes('wl-portrait-ink') || !/assets\/portraits\//.test(avA)) throw new Error('Ink portrait not deterministic!');
}
for (const body of ['sedan', 'suv', 'pickup', 'hatch', 'coupe']) {
  if (buildCar3DSceneFaces({ body, paintHex: '#B42318' }).length < 80) {
    throw new Error('High-detail 3D Car faces too low on ' + body);
  }
}
if (uniSupportsMajor('American University in Cairo', 'medicine')) throw new Error('AUC should NEVER offer MBBS Medicine!');

/* 2. Deep Causal Chains Integration Test */
{
  const S = createNewLifeState({ seed: 909, country: 'egy', birthYear: 1998, familyTier: 'wealthy', gender: 'm' });
  while (S.player.age < 26) {
    advanceSingleTurn(S);
    if (S.activeScene) resolveActiveSceneChoice(S, firstAvailableChoice(S));
  }
  S.money.cash += 120000000;
  S.player.vitals.smarts = 92;

  /* Buy Compound Unit + Furnish Rooms -> Verify Gehaz -> Qa'ima & Wedding chain! */
  const buyRes = buyCompoundOrDistrictUnit(S, { country: 'egy', devId: 'egy_madinaty', unitId: 'egy_standalone', finishId: 'super_lux', planId: 'cash' });
  if (!buyRes.ok) throw new Error('Compound purchase failed: ' + buyRes.msg);
  const propId = S.housing.properties[0].id;
  furnishPropertyRoom(S, propId, 'living', 'luxury');
  furnishPropertyRoom(S, propId, 'bedroom', 'luxury');
  furnishPropertyRoom(S, propId, 'kitchen', 'luxury');
  /* Since 37b0631 a pool and a wing share the plot's garden, so the wing is built first. */
  const expRes = expandPropertyFootprint(S, propId);
  if (!expRes.ok || !S.housing.properties[0].hasExtension) throw new Error('Wing extension failed: ' + expRes.msg);
  installPropertyUpgrade(S, propId, 'solar');
  installPropertyUpgrade(S, propId, 'pool');
  setPropertyFacadePalette(S, propId, 'najdi_sandstone');
  remodelPropertyRoomPurpose(S, propId, 'creator_studio');
  remodelPropertyRoomPurpose(S, propId, 'private_clinic');
  customizePlayerAppearance(S, 'faceShapeIdx', 1);
  customizePlayerAppearance(S, 'irisIdx', 2);
  customizePlayerAppearance(S, 'beardStyleIdx', 3);
  customizePlayerAppearance(S, 'eyewearIdx', 1);
  customizePlayerAppearance(S, 'wardrobeIdx', 0);
  if (!S.player.appearance.tailored) throw new Error('Bespoke tailoring did not register!');
  if (!(S.housing.gehazInvestedLocal > 0)) throw new Error('Gehaz credit did not accumulate from 3D room furnishing!');

  /* Licence + 3D Showroom Car + Credit Card + BNPL Shop + Stock + Zakat + Hajj */
  S.drivingLicence.valid = true;
  S.drivingLicence.expiresYear = S.year + 10;
  const carRes = buyShowroomCar(S, 'car_0', 'luxury', 2, false);
  if (!carRes.ok) throw new Error('Showroom car purchase failed: ' + carRes.msg);

  openCreditCard(S, 'cib_classic');
  const shopRes = purchaseShopCatalogItem(S, 'sh_10', 'bnpl');
  if (!shopRes.ok && S.year >= 2018) throw new Error('BNPL shop failed: ' + shopRes.msg);

  const invRes = investInMarketAsset(S, 'idx_sp500', 100000);
  if (!invRes.ok) throw new Error('Stock invest failed: ' + invRes.msg);

  const zakRes = payAnnualZakat(S);
  if (!zakRes.ok) throw new Error('Zakat payment failed: ' + zakRes.msg);

  if (!hasValidPassport(S)) renewPassport(S);
  const schengenRes = applyConsularTouristVisa(S, 'schengen_c');
  if (!schengenRes.ok) throw new Error('Consular Schengen visa failed: ' + schengenRes.msg);
  const passHtml = renderPassportDocumentHtml(S);
  if (!passHtml.includes('P&lt;EGY') || !passHtml.includes('GLOBAL MOBILITY') || !passHtml.includes('SCHENGEN')) {
    throw new Error('ICAO Doc 9303 MRZ or Schengen stamp missing on passport!');
  }
  const hajjRes = takeVacationOrPilgrimage(S, 'hajj_nusuk_std');
  if (!hajjRes.ok || !S.credentials.hajjCompleted) throw new Error('Nusuk Hajj failed: ' + hajjRes.msg);

  /* Land Purchase -> Custom Villa Construction -> Month-by-Month Completion -> +28% Equity Property! */
  const landRes = purchaseLandPlot(S, 'land_nc_5th');
  if (!landRes.ok) throw new Error('Land purchase failed: ' + landRes.msg);
  const buildRes = startCustomConstructionOnLand(S, S.housing.lands[0].id, 'villa', 'super_lux');
  if (!buildRes.ok) throw new Error('Land custom construction failed: ' + buildRes.msg);
  const propsBefore = S.housing.properties.length;
  for (let m = 0; m < 14; m++) {
    advanceSingleTurn(S);
    if (S.activeScene) resolveActiveSceneChoice(S, firstAvailableChoice(S));
  }
  if (S.housing.properties.length <= propsBefore) {
    throw new Error('Land construction did not complete into a finished property!');
  }
  const builtProp = S.housing.properties[S.housing.properties.length - 1];
  builtProp.conditionPct = 78;
  const renRes = renovateProperty(S, builtProp.id);
  if (!renRes.ok || builtProp.conditionPct !== 100) throw new Error('Property renovation failed: ' + renRes.msg);
  togglePropertyTenantMode(S, builtProp.id);
  if (builtProp.tenantMode !== 'short_term') throw new Error('Short-term holiday let toggle failed');
  const flipRes = sellOwnedProperty(S, builtProp.id);
  if (!flipRes.ok) throw new Error('Fix-and-flip property sale failed: ' + flipRes.msg);
  setWeeklyTimeFocus(S, 'mastery_iq');

  /* Medical Licensing + Syndicate + Gam'iya + Postgrad + Creator + Chancenkarte Check */
  S.education.degrees = ['medicine'];
  S.career.yearsExperience = 4;
  if (!S.syndicate.registered) {
    const synRes = registerProfessionalSyndicate(S);
    if (!synRes.ok) throw new Error('Syndicate registration failed: ' + synRes.msg);
  }

  const gamRes = joinGamiyaCircle(S, 'wedding', 'early');
  if (!gamRes.ok) throw new Error('Gam\'iya join failed: ' + gamRes.msg);
  advanceSingleTurn(S); // Month 2 -> Early slot collects full 10x pot!
  if (S.activeScene) resolveActiveSceneChoice(S, firstAvailableChoice(S));
  if (!S.gamiya?.receivedPot) throw new Error('Early Gam\'iya pot did not pay out in Month 2!');

  const pgRes = enrollPostgraduateProgram(S, 'masters_mba');
  if (!pgRes.ok) throw new Error('Postgrad enrollment failed: ' + pgRes.msg);
  growCreatorOrExpertChannel(S, 'medical_edu');
  if (!(S.creatorChannel.followers > 0)) throw new Error('Creator channel did not gain followers!');

  /* Pets, Insurance, Wasta/Family Meal, and Estate Will (Wasiyyah + Sharia 2:1 Al-Fara'id) */
  const petRes = adoptCompanionPet(S, 'cat_mau', 'Mishmish');
  if (!petRes.ok || S.pets.length !== 1) throw new Error('Pet adoption failed: ' + petRes.msg);
  toggleInsurancePolicy(S, 'health');
  toggleInsurancePolicy(S, 'auto');
  toggleInsurancePolicy(S, 'home');
  if (!S.insurance.health || !S.insurance.auto || !S.insurance.home) throw new Error('Insurance toggle failed');
  const willRes = setEstateWillPlan(S, 25);
  if (!willRes.ok || S.willPlan.charityPct !== 25) throw new Error('Will Wasiyyah failed: ' + willRes.msg);

  const dad = S.people[S.relations.fatherId];
  if (dad && dad.alive) {
    dad.rel.respect = 80;
    dad.rel.trust = 80;
    interactWithPerson(S, dad.id, 'family_meal');
    const wRes = interactWithPerson(S, dad.id, 'wasta_referral');
    if (!wRes.ok) throw new Error('Wasta referral failed: ' + wRes.msg);
  }

  sitExamOrLicensingBoard(S, 'language', 'ielts_academic');
  sitExamOrLicensingBoard(S, 'board', 'lic_uk_plab');
  if (!S.credentials.licenses.includes('lic_uk_plab')) throw new Error('PLAB board failed');
  const ckRes = applyGermanChancenkarte(S);
  if (!ckRes.ok || S.country !== 'deu') throw new Error('Chancenkarte failed: ' + ckRes.msg);
  if (S.investments.length && S.investments[0].valueLocal > 15000) {
    throw new Error('Cross-border FX bug: 100k EGP stock stayed un-converted in EUR (' + S.investments[0].valueLocal + ')!');
  }
}

/* 3. 30-Life Full Simulation Matrix (birth -> age 52) */
const COUNTRIES_MATRIX = ['egy', 'sau', 'uae', 'gbr', 'usa', 'deu', 'can', 'egy', 'sau', 'uae', 'jpn', 'ind', 'bra', 'fra', 'aus'];
const TIERS = ['struggling', 'working', 'middle', 'upper_middle', 'wealthy'];

const defects = {
  D1_minorNegativeCashOrDebt: 0,
  D2_parentAsksMinorOrBrokeHelp: 0,
  D3_eventSpam3Plus: 0,
  D4_duplicateSceneSameYear: 0,
  D5_repeatBankruptcyDuringWindow: 0,
  D6_ignoredExtremeVitalsStreak: 0,
  D7_contradictedMedicalSinceYear: 0,
  D8_zeroFriendsByAge25: 0,
  D9_rawCodeLeakInJournal: 0,
  D11_adultBillOfferedToMinor: 0
};

let marriagesCompleted = 0;
let migrationsCompleted = 0;
let childrenBorn = 0;

for (let i = 0; i < 30; i++) {
  const country = COUNTRIES_MATRIX[i % COUNTRIES_MATRIX.length];
  const birthYear = 1965 + ((i * 7) % 42);
  const tier = TIERS[i % TIERS.length];
  const gender = i % 3 === 0 ? 'f' : 'm';
  const style = i % 4;

  const S = createNewLifeState({
    seed: 1000 + i * 37,
    country,
    birthYear,
    familyTier: tier,
    gender,
    ambition: style === 1 || style === 2 ? 'global_passport' : 'balanced'
  });

  const seenTitleCount = {};
  const seenTitleInYear = {};
  let zeroHappyYears = 0;
  let criticalHealthYears = 0;
  let lastCheckedAge = -1;

  while (!S.gameOver && S.player.age < 52) {
    advanceSingleTurn(S);

    if (S.player.age < 18) {
      if (S.money.cash < 0 || S.money.loans.length > 0) defects.D1_minorNegativeCashOrDebt++;
      if (S.activeScene) {
        const txt = (S.activeScene.title + ' ' + S.activeScene.text).toLowerCase();
        if (/bankruptcy|creditors|landlord demands|loan/.test(txt)) defects.D11_adultBillOfferedToMinor++;
      }
    }

    if (S.activeScene) {
      const sig = S.activeScene.title;
      seenTitleCount[sig] = (seenTitleCount[sig] || 0) + 1;
      if (seenTitleCount[sig] >= 4) defects.D3_eventSpam3Plus++;

      const yrSig = `${S.year}::${sig}`;
      seenTitleInYear[yrSig] = (seenTitleInYear[yrSig] || 0) + 1;
      if (seenTitleInYear[yrSig] >= 2) defects.D4_duplicateSceneSameYear++;

      if (S.activeScene.key === 'formal_bankruptcy_filing' && S.year <= S.money.bankruptUntilYear) {
        defects.D5_repeatBankruptcyDuringWindow++;
      }

      resolveActiveSceneChoice(S, firstAvailableChoice(S));
    }

    if (S.player.age !== lastCheckedAge) {
      lastCheckedAge = S.player.age;
      if (S.player.age === 25 && S.relations.friendIds.length === 0) defects.D8_zeroFriendsByAge25++;

      if (S.player.vitals.happiness === 0) zeroHappyYears++;
      else zeroHappyYears = 0;
      if (zeroHappyYears >= 5) defects.D6_ignoredExtremeVitalsStreak++;

      if (S.player.vitals.health <= 10) criticalHealthYears++;
      else criticalHealthYears = 0;
      if (criticalHealthYears >= 3) defects.D6_ignoredExtremeVitalsStreak++;

      for (const cond of S.medical.conditions) {
        if (cond.sinceYear > S.year) defects.D7_contradictedMedicalSinceYear++;
      }

      if (style !== 3 && S.player.age >= 22) {
        if (style === 2 && S.player.age === 22 && S.country === 'egy' && S.money.cash > 900000) {
          const ab = applyStudyAbroad(S, 'deu', 'cs');
          if (ab.ok) migrationsCompleted++;
        }

        if (!S.career.employed && !S.education.university && S.legal.military.status !== 'active_duty') {
          const jobs = listAvailableJobs(S).filter(j => j.qualifiedByDegree && !j.missingBoard);
          if (jobs.length) applyForJob(S, jobs[0]);
        }

        if (style === 1 && S.player.age >= 26 && !['sau', 'uae'].includes(S.country) && S.career.yearsExperience >= 2) {
          if (!hasValidPassport(S)) renewPassport(S);
          const gm = applyGulfWorkChannel(S, i % 2 === 0 ? 'uae' : 'sau', 'direct_portal');
          if (gm.ok) migrationsCompleted++;
        }

        if (S.player.age >= 26 && S.housing.mode === 'parents') {
          const hList = getHousingFor(S.country, S.year);
          if (hList.length) rentHousingUnit(S, hList[0].id);
        }

        if (S.player.age >= 27 && S.relations.spouseIds.length === 0) {
          if (!S.relations.partnerId) {
            introducePartnerProspect(S, country === 'sau' || country === 'egy' ? 'family_intro' : 'social');
          }
          if (S.relations.partnerId && !S.marriage.engagement) {
            proposeEngagement(S, 'modest', true);
          }
          if (S.marriage.engagement) {
            const wed = celebrateWedding(S);
            if (wed.ok) {
              marriagesCompleted++;
              S.marriage.tryingForBaby = true;
            }
          }
        }

        if (S.player.age === 35 && S.money.cash > 0) {
          buyGold21k(S, 5);
        }
      }
    }
  }

  for (const entry of S.journal) {
    if (/undefined|NaN|\[object Object\]|Situation records repaired/.test(entry.text)) {
      defects.D9_rawCodeLeakInJournal++;
    }
  }

  childrenBorn += S.relations.childIds.length;

  if (S.relations.childIds.length > 0 && marriagesCompleted === 1) {
    triggerPlayerDeath(S, 'test legacy verification');
    const summary = buildLegacySummary(S);
    const nextGen = continueAsChild(S, S.relations.childIds[0]);
    if (!nextGen || nextGen.generation !== 2 || !summary.fullName) {
      throw new Error('Continue-as-Child generational handoff failed!');
    }
  }
}

/* 4. 68-Year Multi-Decade Story Variety & Zero Burnout-Spam Audit */
let minDistinctScenes68Yr = 999;
for (const ctry of ['egy', 'sau', 'usa', 'gbr']) {
  const S68 = createNewLifeState({ seed: 777, country: ctry, birthYear: 1968, familyTier: 'middle', gender: 'm' });
  const titles = [];
  while (!S68.gameOver && S68.player.age < 68) {
    advanceSingleTurn(S68);
    if (S68.activeScene) {
      titles.push(S68.activeScene.title);
      resolveActiveSceneChoice(S68, firstAvailableChoice(S68));
    }
  }
  const distinct = new Set(titles).size;
  if (distinct < minDistinctScenes68Yr) minDistinctScenes68Yr = distinct;
  const burnoutCount = titles.filter(t => /Burnout|Exhaustion|Medical Recovery/i.test(t)).length;
  if (burnoutCount > 5) {
    throw new Error(`Excessive burnout scenes (${burnoutCount}) in 68-yr ${ctry} run!`);
  }
  if (distinct < 16) {
    throw new Error(`Too few distinct story scenes (${distinct}) across 68 years in ${ctry}!`);
  }
}

const totalDefects = Object.values(defects).reduce((a, b) => a + b, 0);
print('SIM_RESULTS: ' + JSON.stringify({
  livesSimulated: 30,
  minDistinctScenes68Yr,
  deepCausalChainsVerified: true,
  determinismVerified: true,
  marriagesCompleted,
  childrenBorn,
  migrationsCompleted,
  totalDefects,
  defects
}, null, 2));

if (totalDefects > 0) {
  throw new Error('COHERENCE DEFECTS FOUND: ' + totalDefects);
}
