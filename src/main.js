import{branchAction}from'./systems/companyBranches.js';
import{migrateCompanyModel}from './systems/companyMigration.js';
import{changeFamilyRota}from './systems/companyRota.js';
import{familyShareAction,familyCouncil}from './systems/companyOwnership.js';
import{buyoutDivorceShares}from'./systems/companyDivorceShares.js';
import{hireFamily,hireFamilyManager}from'./systems/companyFamily.js';
import{equipmentAction}from'./systems/companyEquipment.js';
import{customCloudQuote,serverAction}from'./systems/companyServers.js';
import{techBase}from'./systems/techStartup.js';
import{inputAction}from './systems/companyInputUI.js';
import{catalogAction}from './systems/companyCatalog.js';
import{growthAction}from './systems/companyGrowth.js';
import{operatingBase}from './systems/companyOperatingContent.js';
import{operatingAction}from './systems/companyOperatingContent.js';
import{companyAction}from './systems/companyLifecycle.js';
import{techAction}from './systems/techStartup.js';
import{openInternationalBusiness}from './systems/businessInternational.js';
import{launchBusinessProduct}from './systems/businessProducts.js';
import{improveBusiness}from './systems/businessImprovements.js';
import{toggleEmployeeBenefit}from './systems/businessBenefits.js';
import{answerEmployeeRequest,manageEmployee}from './systems/businessPeople.js';
import{answerPeopleDecision}from './systems/peopleAutonomy.js';
import{answerSpouseDecision}from './systems/spouseAutonomy.js';
import{relationshipAction}from './systems/relationshipProgression.js';
import{enrollChildCourse}from './systems/educationFunding.js';
import{requestSupportReview}from './systems/divorceModel.js';
import {buyRuralCabin} from './systems/economyEngine.js';
import {supportChildAfterSeparation} from './systems/marriageFamilyEngine.js';
/* ============================================================================
   World Life Complete Edition — Master UI & Action Controller (src/main.js)
   Clean event-delegated loop wiring all 7 tabs, sub-tabs, 3D visuals & catalogs.
   ========================================================================== */

import { createNewLifeState, ensureExtendedState, queueScene, createSaveGoal, setJournalReaction } from './core/schema.js';
import {
  advanceSingleTurn,
  fastForwardTurns,
  resolveActiveSceneChoice,
  saveGameToStorage,
  loadGameFromStorage
} from './core/gameLoop.js';
import { getCountry, formatMoney } from './data/countries.js';
import { eraLocalCost, convertCurrency } from './data/economy.js';
import { getUniversitiesFor } from './data/institutions.js';
import { interactWithPerson, fulfillPromise, callPerson, visitPerson, openGiftScene, openAskHelpScene, openConversationScene } from './systems/soulEngine.js';
import {
  depositToSavings,
  withdrawFromSavings,
  buyBankCertificate,
  buyGold21k,
  sellGold21k,
  takePersonalLoan,
  takeStaffLoan,
  repayBusinessDebt,
  rentHousingUnit,
  buyProperty,
  moveIntoOwnedProperty,
  togglePropertyRental,
  buyVehicle,
  sellVehicle
} from './systems/economyEngine.js';
import {
  enrollInUniversity,
  chooseSchool,
  changeSchool,
  setTrack,
  setStudyEffort,
  hireTutor,
  joinClub,
  applyScholarship,
  applyInternship,
  applyToUniversity,
  listAvailableJobs,
  applyForJob,
  checkJobApplication,
  staffLoanTerms,
  buildJobInterviewScene,
  requestRaiseOrPromotion,
  resignCurrentJob,
  retireFromCareer,
  launchSmallBusiness,
  expandSmallBusiness,
  sellSmallBusiness,
  setBusinessMode
} from './systems/careerEducationEngine.js';
import {
  setWorkMode,
  takeOnWork,
  trainQualify,
  askForMore,
  requestTransfer,
  requestLeave,
  applyPromotion,
  peopleAtWork,
  requestResign,
  walkOut
} from './systems/careerActions.js';
import {
  renewPassport,
  transitionResidency,
  applyStudyAbroad,
  applyOverseasScholarship,
  applyGulfWorkChannel,
  applyDirectSkilledVisa,
  applyPremiumOrGoldenResidency,
  sponsorFamilyReunification,
  returnToHomeCountry,
  recordRelocationBusinessDecision
} from './systems/visaMigrationEngine.js';
import {
  setBusinessHeir,
  setWillPrimaryHeir
} from './systems/businessLegacy.js';
import {
  introducePartnerProspect,
  moveInTogetherCohabitation,
  proposeEngagement,
  toggleEngagementPrenup,
  celebrateWedding,
  initiateDivorce,
  enrollChildInProgram,
  playWithChild,
  teachChild,
  takeChildOut,
  helpChildWithHomework,
  setTryingForBaby,
  cycleHouseholdSplit
} from './systems/marriageFamilyEngine.js';
import {
  visitHospitalCheckup,
  runDiagnosticTestOrMed,
  continueAsChild
} from './systems/healthDirectorEngine.js';
/* v2.13 Worker 1 — evaluate achievements after each advance / scene / action. */
import { evaluateProgress } from './systems/progressEngine.js';
import { runDiseaseTreatment } from './systems/mortalityModel.js';
import {
  findBusiness,
  hireBusinessEmployee,
  fireBusinessEmployee
} from './systems/businessStaff.js';
/* v2.17 W3 §4: train / promote actions for business staff. */
import {
  trainBusinessEmployee,
  promoteBusinessEmployee
} from './systems/businessRoles.js';
import {
  takeBusinessLoan,
  payExtraOnBusinessLoan
} from './systems/businessLoans.js';
/* v2.11 W3: business premises handlers (rent / run from home / repair /
   rent review) — see businessPremises.js. */
import {
  rentBusinessPremises,
  setBusinessHomePremises,
  repairBusinessPremises,
  reviewBusinessRent,
  acceptBusinessRentReview,
  declineBusinessRentReview
} from './systems/businessPremises.js';
/* v2.14 — manager (W2), per-industry decisions (W3), buying + branches
   (W4), exits + cash (W5). The dispatch below wires the 24 new
   data-actions from the business card render helpers. */
import {
  hireManager,
  fireManager,
  setManagerPolicy,
  promoteStaffToManager,
  answerManagerAsk,
  investigateEmbezzlement,
  sueManager,
  takeOverBusiness
} from './systems/businessManager.js';
import { applyDecision } from './systems/businessDecisions.js';
/* v2.18 W1 (§1) — real work inside the job: resolving a piece of work. */
import { resolveCareerWork } from './systems/careerWork.js';
import {
  orderStock,
  setPrice,
  chooseSupplier,
  setOvertime,
  giveDayOff,
  spendMarketing,
  maintainPremises,
  opsExpandBusiness,
  moveBusiness,
  opsWithdrawCash,
  opsReinvestCash,
  opsPayDownDebt
} from './systems/businessOperations.js';
import {
  findForSaleListing,
  buyBusinessDueDiligence,
  buyBusiness
} from './systems/businessAcquisitions.js';
import {
  openBranch,
  sellBranch,
  closeBranch
} from './systems/businessBranches.js';
import {
  tradeSaleOffer,
  negotiateTradeSale,
  acceptTradeSale,
  managementBuyout,
  ipoBusiness,
  franchiseBusiness,
  revokeFranchise,
  withdrawBusinessCash,
  reinvestBusinessCash
} from './systems/businessExits.js';
/* v2.15 W1 — landlord: named tenants, deposits, damage, leases, market. */
import {
  findTenant,
  giveTenantTime,
  startEviction,
  renewLease,
  maintainProperty,
  fixDamage,
  settleDeposit,
  endTenancy
} from './systems/propertyLandlord.js';
import {
  buyCompoundOrDistrictUnit,
  upgradePropertyFinishing,
  furnishPropertyRoom,
  furnishingOptions,
  furnishingStyleKey,
  installPropertyUpgrade,
  toggleHouseholdStaff,
  purchaseLandPlot,
  startCustomConstructionOnLand,
  obtainOrRenewDrivingLicence,
  buyShowroomCar,
  purchaseShopCatalogItem,
  resellInventoryItem,
  saveShopItemForLater,
  removeShopWishlist,
  compareShopItems,
  askShopkeeperAboutItem,
  planTrip,
  compareTrips,
  cardLimitBenefit,
  payWithCard,
  useCardPerk,
  getHaircut,
  buyOutfit,
  openCreditCard,
  payCreditCard,
  investInMarketAsset,
  liquidateMarketAsset,
  sendInternationalRemittance,
  payAnnualZakat,
  sitExamOrLicensingBoard,
  applyGermanChancenkarte,
  undergoSurgeryOrFertility,
  takeVacationOrPilgrimage,
  doDailyActivity,
  launchCivilLawsuit,
  commitRiskyCrime,
  takeSideOrStudentGig,
  joinGamiyaCircle,
  registerProfessionalSyndicate,
  enrollPostgraduateProgram,
  growCreatorOrExpertChannel,
  adoptCompanionPet,
  feedPet,
  playWithPet,
  trainPet,
  takePetToVet,
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
} from './systems/completeLifeSystems.js';
/* v2.15 W2 — career market: headhunter offers, pension opt-out/in,
   mentor advice/introductions, rival moves, and the pension pot payout
   at retirement. The dispatch below wires the cm-* data-actions from
   the Career tab's career-market sections. */
import {
  acceptHeadhunterOffer,
  declineHeadhunterOffer,
  negotiateWithOffer,
  optOutPension,
  optInPension,
  askMentor,
  askMentorAdvice,
  askMentorIntroduction,
  rivalAction,
  payOutPensionPot
} from './systems/careerMarket.js';
import {
  mountAllLive3DCanvases
} from './ui/liveCanvas3d.js';
import {
  renderHudHtml,
  renderNavTabsHtml,
  renderLifeTabHtml,
  renderEducationTabHtml,
  renderPeopleTabHtml,
  renderWorkTabHtml,
  renderRealEstateTabHtml,
  renderFinanceTabHtml,
  renderLifestyleTabHtml,
  renderWorldTabHtml,
  renderBottomDockHtml,
  renderNewLifeModalHtml,
  eraClassForYear,
  recordFinanceHistorySnapshot,
  /* v2.16 W1 — light/dark theme: the saved theme is the source of truth. */
  getSavedTheme,
  saveTheme
} from './ui/views.js';
/* Turn result card: after every advance / decision, say what changed. */
import { snapshotTurn, buildTurnResult, renderTurnResultCardHtml } from './ui/turnResult.js';
import {
  resolveFurnishTarget,
  migrateFurnishedRoomsToNumbers
} from './ui/planRoomLookup.js';

// Supplied source may not include the optional art pack. Hide failed art
// instead of exposing broken icons or repeating the caption as alt text.
if (typeof document !== 'undefined') document.addEventListener('error', event => {
  const img = event.target;
  if (!(img instanceof HTMLImageElement) && !(img instanceof SVGImageElement)) return;
  img.hidden = true;
  img.style.display = 'none';
  const banner = img.closest('.editorial-banner');
  if (banner) banner.classList.add('art-unavailable');
}, true);

let S = loadGameFromStorage();
const firstSession = !S;
if (!S) {
  S = createNewLifeState({
    seed: 20261118,
    country: 'egy',
    birthYear: 1998,
    familyTier: 'middle',
    gender: 'm',
    ambition: 'global_passport'
  });
  saveGameToStorage(S);
}
ensureExtendedState(S);

const uiState = {
  activeTab: 'life',
  peopleSub: 'circle',
  workSub: 'jobs',
  reSub: 'myhome',
  finSub: 'cashflow',
  lifeSub: 'cars',
  worldSub: 'passports',
  showNewLifeModal: firstSession,
  propMarket: 'local',
  gulfTarget: 'uae',
  vis3dTilt: 0,
  vis3dNight: false,
  vis3dCutaway: false,
  archViewMode: 'elevation',
  solarTime: 'noon',
  cadCyanotype: false,
  cadShowMep: false,
  cadFloor: -1,
  previewShape: null,
  reUnitId: 'apt_m',
  reFinishId: 'standard',
  rePlanId: 'cash',
  reQuery: '',
  reCompare: [],
  reAffordableOnly: false,
  roomDetail: null,
  jobQuery: '',
  jobOnlyQualified: false,
  ledgerFilter: 'all',
  journalType: 'all',
  journalQuery: '',
  journalYear: 'all',
  bizQuery: '',
  carQuery: '',
  carClass: 'all',
  carColorIdx: 0,
  carTrimId: 'base',
  shopQuery: '',
  shopCat: 'all',
  vacQuery: '',
  toastMsg: '',
  toastTimer: null
};

function showToast(msg) {
  if (!msg) return;
  uiState.toastMsg = msg;
  const el = document.getElementById('toast-mount');
  if (el) {
    el.innerHTML = `<div class="toast-banner" role="status">${msg}</div>`;
    clearTimeout(uiState.toastTimer);
    uiState.toastTimer = setTimeout(() => {
      if (el) el.innerHTML = '';
    }, 3000);
  }
}

export function renderApp(preserveFilterKey = null, caretPos = null) {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('app');
  if (!root || !S) return;
  const openPanels=[...root.querySelectorAll('details[data-panel][open]')].map(e=>e.dataset.panel);
  ensureExtendedState(S);
  // v2.16 W1 — light/dark theme: apply the saved theme (light by default)
  // to #app AND to <html> (so the page background follows) before the
  // first render. The era class composes with it, it does not replace it.
  const theme = getSavedTheme();
  root.dataset.theme = theme;
  if (typeof document !== 'undefined' && document.documentElement) document.documentElement.dataset.theme = theme;
  // v2.13 W4 — era skin: one class on the app root, driven by S.year only.
  for (const c of ['era-1960s', 'era-1970s', 'era-1980s', 'era-1990s', 'era-2000s', 'era-2010s', 'era-2020s']) root.classList.remove(c);
  root.classList.add(eraClassForYear(S.year));
  recordFinanceHistorySnapshot(S); // v2.13 W4: one net-worth snapshot per year

  let tabContent = '';
  if (uiState.activeTab === 'life') tabContent = renderLifeTabHtml(S, uiState);
  else if (uiState.activeTab === 'education') tabContent = renderEducationTabHtml(S, uiState);
  else if (uiState.activeTab === 'people') tabContent = renderPeopleTabHtml(S, uiState);
  else if (uiState.activeTab === 'work') tabContent = renderWorkTabHtml(S, uiState);
  else if (uiState.activeTab === 'realestate') tabContent = renderRealEstateTabHtml(S, uiState);
  else if (uiState.activeTab === 'finance') tabContent = renderFinanceTabHtml(S, uiState);
  else if (uiState.activeTab === 'lifestyle') tabContent = renderLifestyleTabHtml(S, uiState);
  else if (uiState.activeTab === 'world') tabContent = renderWorldTabHtml(S, uiState);
  else tabContent = renderLifeTabHtml(S, uiState);

  root.innerHTML = `
    <div class="app-shell">
      ${renderHudHtml(S, uiState.statFlash)}
      ${renderNavTabsHtml(S, uiState.activeTab)}
      <main id="main-content">${renderTurnResultCardHtml(S, uiState)}${tabContent}</main>
    </div>
    ${renderBottomDockHtml(S)}
    ${uiState.showNewLifeModal ? renderNewLifeModalHtml({ country: S.homeCountry, birthYear: 1998, gender: S.player.gender }) : ''}
  `;

  for(const panel of root.querySelectorAll('details[data-panel]'))if(openPanels.includes(panel.dataset.panel))panel.open=true;
  if (preserveFilterKey) {
    const inp = root.querySelector(`[data-filter="${preserveFilterKey}"]`);
    if (inp && inp.tagName === 'INPUT') {
      inp.focus();
      try {
        const pos = caretPos != null ? caretPos : inp.value.length;
        inp.setSelectionRange(pos, pos);
      } catch (_) {}
    }
  }

  if (!preserveFilterKey && uiState.activeTab === 'life' && S.activeScene) {
    requestAnimationFrame(() => {
      const scene = root.querySelector('.decision-focus .scene-card');
      if (scene) {
        scene.scrollIntoView({ block: 'start', behavior: 'auto' });
        scene.focus({ preventScroll: true });
      }
    });
  }
  mountAllLive3DCanvases();
}

function handleActionResult(res) {
  /* v2.20 I1 — a launch that left a job behind says so in the toast:
     the consequence travels on the result (res.leftJob, the employer
     name), never silently. No launch path sets it today — a
     full-time self-run launch while employed is refused instead —
     but any path that ever does must carry it here. */
  if (res && res.msg) showToast(res.leftJob ? `${res.msg} You left your job at ${res.leftJob} to run it.` : res.msg);
  try { evaluateProgress(S); } catch (_) {}
  saveGameToStorage(S);
  renderApp();
}

if (typeof document !== 'undefined') {
  document.addEventListener('input', (e) => {
    const el = e.target;
    if(el?.dataset?.resource){const panel=el.closest('.custom-cloud'),values=['cpu','storage','bandwidth'].map(key=>panel.querySelector('[data-resource='+key+']').value),q=customCloudQuote(Number(panel.dataset.base),...values);panel.querySelector('[data-cloud-quote]').textContent=q?formatMoney(q.monthly,panel.dataset.currency):'Enter valid whole units';return;}
    if (!el || !el.dataset || !el.dataset.filter) return;
    if (el.tagName !== 'INPUT') return;
    const key = el.dataset.filter;
    uiState[key] = el.value;
    renderApp(key, el.selectionStart);
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (!el || !el.dataset || !el.dataset.filter) return;
    if (el.tagName !== 'SELECT') return;
    const key = el.dataset.filter;
    uiState[key] = el.value;
    renderApp();
  });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if(action==='zoom-floorplan'){
      const svg=btn.closest('.readable-floor')?.querySelector('svg.architectural-plan');
      if(!svg)return;
      const dialog=document.createElement('dialog');dialog.style.cssText='width:96vw;max-width:1100px;padding:12px;background:#faf8f0;border-radius:12px';
      const close=document.createElement('button');close.textContent='Close plan';close.className='btn';close.onclick=()=>dialog.close();dialog.append(close);
      const panel=document.createElement('div');panel.style.cssText='overflow:auto;max-height:80vh';const copy=svg.cloneNode(true);copy.style.width='950px';copy.style.maxWidth='none';panel.append(copy);dialog.append(panel);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();return;
    }
    /* ---- NAVIGATION & SUB-TABS ---- */
    if (action === 'switch-tab') {
      uiState.activeTab = btn.dataset.tab || 'life';
      renderApp();
      return;
    }

    /* ---- v2.16 W1 — LIGHT/DARK THEME TOGGLE ---- */
    if (action === 'toggle-theme') {
      // Each toggle button names its theme (data-theme="light"|"dark");
      // with no name given, flip from the saved theme.
      const next = btn.dataset.theme === 'light' || btn.dataset.theme === 'dark'
        ? btn.dataset.theme
        : (getSavedTheme() === 'dark' ? 'light' : 'dark');
      saveTheme(next);
      renderApp();
      return;
    }

    if (action === 'switch-subtab') {
      const tab = btn.dataset.tab;
      const sub = btn.dataset.sub;
      if (tab === 'people') uiState.peopleSub = sub;
      else if (tab === 'work') uiState.workSub = sub;
      else if (tab === 'realestate') uiState.reSub = sub;
      else if (tab === 'finance') uiState.finSub = sub;
      else if (tab === 'lifestyle') uiState.lifeSub = sub;
      else if (tab === 'world') uiState.worldSub = sub;
      renderApp();
      return;
    }

    if (action === 'set-ledger-filter') {
      uiState.ledgerFilter = btn.dataset.filter || 'all';
      renderApp();
      return;
    }

    /* ---- v2.12 JOURNAL CONTROLS ---- */
    if (action === 'set-journal-filter') {
      uiState.journalType = btn.dataset.filter || 'all';
      renderApp();
      return;
    }

    if (action === 'journal-react') {
      handleActionResult(setJournalReaction(S, btn.dataset.id, btn.dataset.reaction));
      return;
    }

    if (action === 'open-new-life') {
      uiState.showNewLifeModal = true;
      renderApp();
      return;
    }

    if (action === 'close-new-life') {
      uiState.showNewLifeModal = false;
      renderApp();
      return;
    }

    /* ---- ARCHITECTURAL WORKSTATION & CAD SHEET A-101 CONTROLS ---- */
    if (action === 'set-arch-view') {
      uiState.archViewMode = btn.dataset.mode || 'elevation';
      renderApp();
      return;
    }

    if (action === 'set-solar-time') {
      uiState.solarTime = btn.dataset.tod || 'noon';
      renderApp();
      return;
    }

    if (action === 'toggle-cad-cyan') {
      uiState.cadCyanotype = !uiState.cadCyanotype;
      renderApp();
      return;
    }

    if (action === 'toggle-cad-mep') {
      uiState.cadShowMep = !uiState.cadShowMep;
      renderApp();
      return;
    }

    if (action === 'set-cad-floor') {
      uiState.cadFloor = Number(btn.dataset.fl ?? -1);
      renderApp();
      return;
    }

    if (action === 'preview-shape') {
      uiState.previewShape = btn.dataset.shape || 'apartment';
      uiState.cadFloor = -1;
      renderApp();
      return;
    }

    if (action === 'apply-tourist-visa') {
      handleActionResult(applyConsularTouristVisa(S, btn.dataset.id));
      return;
    }

    if (action === 'open-appearance-studio') {
      uiState.activeTab = 'lifestyle';
      uiState.lifeSub = 'appearance';
      renderApp();
      return;
    }

    if (action === 'edit-appearance') {
      handleActionResult(customizePlayerAppearance(S, btn.dataset.field, btn.dataset.val));
      return;
    }

    /* v2.12 W6: haircuts & outfits — priced choices with real effects. */
    if (action === 'get-haircut') {
      handleActionResult(getHaircut(S, btn.dataset.id));
      return;
    }

    if (action === 'buy-outfit') {
      handleActionResult(buyOutfit(S, btn.dataset.id));
      return;
    }

    if (action === 'set-facade') {
      handleActionResult(setPropertyFacadePalette(S, btn.dataset.pid, btn.dataset.fid));
      return;
    }

    if (action === 'remodel-room') {
      handleActionResult(remodelPropertyRoomPurpose(S, btn.dataset.pid, btn.dataset.rid));
      return;
    }

    if (action === 'expand-prop') {
      handleActionResult(expandPropertyFootprint(S, btn.dataset.pid));
      return;
    }

    if (action === 'set-time-focus') {
      handleActionResult(setWeeklyTimeFocus(S, btn.dataset.id));
      return;
    }

    /* v2.11 W1: business core handlers */

    if (action === 'launch-business') {
      /* v2.20 I1 — the launch row's run-by choice and picked manager
         travel with the click: runBy 'manager' + the candidate record
         (the engine hires nobody by itself — the record on the button
         is the manager who runs it), and the duplicate confirmation
         for a second business of a type already owned. */
      const runBy = btn.dataset.runby === 'manager' ? 'manager' : 'self';
      const manager = runBy === 'manager' && btn.dataset.mgrName
        ? {
          name: btn.dataset.mgrName,
          skill: Number(btn.dataset.mgrSkill) || 50,
          wage: Number(btn.dataset.mgrWage) || 0,
          loyalty: Number(btn.dataset.mgrLoyalty) || 60,
          personId: btn.dataset.mgrPerson || null
        }
        : null;
      handleActionResult(launchSmallBusiness(S, btn.dataset.type, '', {
        mode: btn.dataset.mode || 'part_time',
        runBy,
        ...(manager ? { manager } : {}),
        ...(btn.dataset.allowDup === '1' ? { allowDuplicate: true } : {})
      }));
      return;
    }

    /* v2.20 I1 — launch-row choices: who runs it, which manager from
       the shortlist, and opening a second business of a type already
       owned. Each only sets uiState and re-renders; the launch button
       is what spends the money. */
    if (action === 'biz-launch-runby') {
      uiState[`bizRunBy_${btn.dataset.type}`] = btn.dataset.runby === 'manager' ? 'manager' : 'self';
      if (btn.dataset.runby !== 'manager') uiState[`bizLaunchMgr_${btn.dataset.type}`] = null;
      renderApp();
      return;
    }

    if (action === 'biz-launch-pick-manager') {
      uiState[`bizLaunchMgr_${btn.dataset.type}`] = {
        name: btn.dataset.name || 'Manager',
        skill: Number(btn.dataset.skill) || 50,
        wage: Number(btn.dataset.wage) || 0,
        loyalty: Number(btn.dataset.loyalty) || 60,
        personId: btn.dataset.person || null
      };
      renderApp();
      return;
    }

    if (action === 'biz-launch-clear-manager') {
      uiState[`bizLaunchMgr_${btn.dataset.type}`] = null;
      renderApp();
      return;
    }

    if (action === 'biz-launch-dup') {
      uiState[`bizAllowDup_${btn.dataset.type}`] = true;
      renderApp();
      return;
    }

    if (action === 'expand-business') {
      handleActionResult(expandSmallBusiness(S, btn.dataset.biz));
      return;
    }

    if (action === 'sell-business') {
      handleActionResult(sellSmallBusiness(S, btn.dataset.biz));
      return;
    }

    if (action === 'biz-mode') {
      handleActionResult(setBusinessMode(S, btn.dataset.biz, btn.dataset.mode || 'part_time'));
      return;
    }

    /* v2.11 W2: business staff + loan handlers */
    if (action === 'biz-hire') {
      handleActionResult(hireBusinessEmployee(S, findBusiness(S, btn.dataset.biz), btn.dataset.role,btn.dataset.tier));
      return;
    }

    if (action === 'biz-fire') {
      handleActionResult(fireBusinessEmployee(S, findBusiness(S, btn.dataset.biz), btn.dataset.staff));
      return;
    }

    /* v2.17 W3 §4: train / promote a staff member (businessRoles.js). */
    if (action === 'biz-train') {
      handleActionResult(trainBusinessEmployee(S, findBusiness(S, btn.dataset.biz), btn.dataset.staff));
      return;
    }

    if (action === 'biz-promote') {
      handleActionResult(promoteBusinessEmployee(S, findBusiness(S, btn.dataset.biz), btn.dataset.staff, btn.dataset.role));
      return;
    }

    if (action === 'biz-loan-take') {
      /* Empty data-biz = a launch loan (no business yet); do not fall back
         to the first existing business. */
      const loanBiz = btn.dataset.biz ? findBusiness(S, btn.dataset.biz) : null;
      handleActionResult(takeBusinessLoan(S, loanBiz, Number(btn.dataset.amount) || 0, { typeId: btn.dataset.type || undefined }));
      return;
    }

    if (action === 'biz-loan-extra') {
      handleActionResult(payExtraOnBusinessLoan(S, findBusiness(S, btn.dataset.biz), Number(btn.dataset.amount) || 0));
      return;
    }

    /* v2.11 W3: business premises handlers */
    if (action === 'biz-premises-rent') {
      handleActionResult(rentBusinessPremises(S, findBusiness(S, btn.dataset.biz), btn.dataset.unit));
      return;
    }

    if (action === 'biz-premises-home') {
      handleActionResult(setBusinessHomePremises(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-premises-repair') {
      handleActionResult(repairBusinessPremises(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-premises-review') {
      handleActionResult(reviewBusinessRent(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-premises-review-accept') {
      handleActionResult(acceptBusinessRentReview(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-premises-review-decline') {
      handleActionResult(declineBusinessRentReview(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'renovate-prop') {
      handleActionResult(renovateProperty(S, btn.dataset.id));
      return;
    }

    /* v2.15 W1 — landlord actions (named tenants, deposits, damage,
       leases, maintenance). Every one states its cost and effect
       before the player commits — the cost is on the button. */
    if (action === 'landlord-find-tenant') {
      handleActionResult(findTenant(S, (S.housing?.properties || []).find(p => p.id === btn.dataset.id), { postNow: true }));
      return;
    }

    if (action === 'landlord-give-time') {
      handleActionResult(giveTenantTime(S, btn.dataset.id));
      return;
    }

    if (action === 'landlord-evict') {
      handleActionResult(startEviction(S, btn.dataset.id));
      return;
    }

    if (action === 'landlord-renew') {
      handleActionResult(renewLease(S, btn.dataset.id, btn.dataset.mode || 'same', 5));
      return;
    }

    if (action === 'landlord-maintain') {
      handleActionResult(maintainProperty(S, btn.dataset.id));
      return;
    }

    if (action === 'landlord-fix-damage') {
      handleActionResult(fixDamage(S, btn.dataset.id, btn.dataset.damage, btn.dataset.mode || 'full'));
      return;
    }

    if (action === 'landlord-deposit') {
      handleActionResult(settleDeposit(S, btn.dataset.id, btn.dataset.choice || 'keep'));
      return;
    }

    if (action === 'landlord-end-tenancy') {
      const prop = (S.housing?.properties || []).find(p => p.id === btn.dataset.id);
      handleActionResult(prop ? endTenancy(S, prop, 'you ended the tenancy') : { ok: false, msg: 'Property not found.' });
      return;
    }

    if (action === 'sell-prop') {
      handleActionResult(sellOwnedProperty(S, btn.dataset.id));
      return;
    }

    if (action === 'toggle-tenant-mode') {
      handleActionResult(togglePropertyTenantMode(S, btn.dataset.id));
      return;
    }

    if (action === 'adopt-pet') {
      handleActionResult(adoptCompanionPet(S, btn.dataset.id));
      return;
    }

    /* v2.12 W5 — Pets verbs (item 6). */
    if (action === 'pet-feed') {
      handleActionResult(feedPet(S, btn.dataset.id));
      return;
    }

    if (action === 'pet-play') {
      handleActionResult(playWithPet(S, btn.dataset.id));
      return;
    }

    if (action === 'pet-train') {
      handleActionResult(trainPet(S, btn.dataset.id));
      return;
    }

    if (action === 'pet-vet') {
      handleActionResult(takePetToVet(S, btn.dataset.id));
      return;
    }

    if (action === 'toggle-insurance') {
      handleActionResult(toggleInsurancePolicy(S, btn.dataset.key));
      return;
    }

    if (action === 'set-will') {
      handleActionResult(setEstateWillPlan(S, Number(btn.dataset.pct || 0)));
      return;
    }

    /* v2.11 W4: business relocation + will handlers */
    if (action === 'biz-set-heir') {
      /* data-person is the heir; data-biz (when present) names the heir
         for that one business card, otherwise it sets the will's primary
         heir (will screen). */
      const personId = btn.dataset.person;
      if (!personId) {
        showToast('Choose a person to name as heir.');
        return;
      }
      if (btn.dataset.biz) {
        const biz = findBusiness(S, btn.dataset.biz);
        handleActionResult(biz ? setBusinessHeir(S, biz, personId) : { ok: false, msg: 'That business is no longer yours.' });
      } else {
        handleActionResult(setWillPrimaryHeir(S, personId));
      }
      return;
    }

    if (action === 'biz-relocate-keep' || action === 'biz-relocate-sell' || action === 'biz-relocate-close') {
      /* The relocation decision scenes call recordRelocationBusinessDecision
         directly from their effects; these buttons are the same decision
         from any card the coordinator renders them on. */
      const decision = action === 'biz-relocate-keep' ? 'keep' : action === 'biz-relocate-sell' ? 'sell' : 'close';
      handleActionResult(recordRelocationBusinessDecision(S, btn.dataset.biz, decision));
      return;
    }

    /* v2.14 — manager, decisions, buying, branches, exits, cash. */
    if (action === 'biz-hire-manager') {
      const biz = findBusiness(S, btn.dataset.biz);
      if (!biz) { showToast('That business is no longer yours.'); return; }
      /* The shortlist renders the candidate on the button's dataset:
         name / skill / wage / loyalty (+ personId when the candidate is
         a real person record). The button is the source of truth for
         the offer the player accepted. */
      const candidate = {
        name: btn.dataset.name || 'Manager',
        skill: Number(btn.dataset.skill) || 50,
        wage: Number(btn.dataset.wage) || 0,
        loyalty: Number(btn.dataset.loyalty) || 60,
        personId: btn.dataset.person || null
      };
      handleActionResult(hireManager(S, biz, candidate));
      return;
    }

    /* v2.20 I3 — the card's Repay debt button: pay the business's
       unpaid debt down from cash (a profitable month also pays it
       from its own profit in the settlement). */
    if (action === 'biz-repay-debt') {
      handleActionResult(repayBusinessDebt(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-fire-manager') {
      handleActionResult(fireManager(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-manager-policy') {
      handleActionResult(setManagerPolicy(S, findBusiness(S, btn.dataset.biz), btn.dataset.policy));
      return;
    }

    if (action === 'biz-promote-manager') {
      handleActionResult(promoteStaffToManager(S, findBusiness(S, btn.dataset.biz), btn.dataset.staff));
      return;
    }

    if (action === 'biz-manager-ask') {
      handleActionResult(answerManagerAsk(S, findBusiness(S, btn.dataset.biz), btn.dataset.ask, btn.dataset.accept === 'yes'));
      return;
    }

    if (action === 'biz-investigate') {
      handleActionResult(investigateEmbezzlement(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-sue-manager') {
      handleActionResult(sueManager(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-take-over') {
      handleActionResult(takeOverBusiness(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-decision') {
      handleActionResult(applyDecision(S, findBusiness(S, btn.dataset.biz), btn.dataset.decision));
      return;
    }

    /* v2.17 W4 §5 — operating menu actions (businessOperations.js). */
    if (action === 'biz-ops-stock-order') {
      handleActionResult(orderStock(S, findBusiness(S, btn.dataset.biz), Number(btn.dataset.qty) || 0));
      return;
    }
    if (action === 'biz-ops-price') {
      handleActionResult(setPrice(S, findBusiness(S, btn.dataset.biz), btn.dataset.item, btn.dataset.dir));
      return;
    }
    if (action === 'biz-ops-supplier') {
      handleActionResult(chooseSupplier(S, findBusiness(S, btn.dataset.biz), btn.dataset.supplier));
      return;
    }
    if (action === 'biz-ops-overtime') {
      handleActionResult(setOvertime(S, findBusiness(S, btn.dataset.biz), btn.dataset.staff));
      return;
    }
    if (action === 'biz-ops-dayoff') {
      handleActionResult(giveDayOff(S, findBusiness(S, btn.dataset.biz), btn.dataset.staff));
      return;
    }
    if (action === 'biz-ops-market') {
      handleActionResult(spendMarketing(S, findBusiness(S, btn.dataset.biz), btn.dataset.channel));
      return;
    }
    if (action === 'biz-ops-repair') {
      handleActionResult(maintainPremises(S, findBusiness(S, btn.dataset.biz)));
      return;
    }
    if (action === 'biz-ops-expand') {
      handleActionResult(opsExpandBusiness(S, findBusiness(S, btn.dataset.biz)));
      return;
    }
    if (action === 'biz-ops-move') {
      handleActionResult(moveBusiness(S, findBusiness(S, btn.dataset.biz), btn.dataset.city));
      return;
    }
    if (action === 'biz-ops-withdraw') {
      const menu = btn.closest('.biz-ops-menu');
      const inp = menu ? menu.querySelector('input[data-ops-cash="withdraw"]') : null;
      handleActionResult(opsWithdrawCash(S, findBusiness(S, btn.dataset.biz), inp ? Number(inp.value) || 0 : 0));
      return;
    }
    if (action === 'biz-ops-reinvest') {
      const menu = btn.closest('.biz-ops-menu');
      const inp = menu ? menu.querySelector('input[data-ops-cash="reinvest"]') : null;
      handleActionResult(opsReinvestCash(S, findBusiness(S, btn.dataset.biz), inp ? Number(inp.value) || 0 : 0));
      return;
    }
    if (action === 'biz-ops-paydebt') {
      handleActionResult(opsPayDownDebt(S, findBusiness(S, btn.dataset.biz), Number(btn.dataset.amount) || 0));
      return;
    }

    if (action === 'biz-buy-diligence') {
      const listing = findForSaleListing(S, btn.dataset.listing);
      handleActionResult(listing ? buyBusinessDueDiligence(S, listing.id) : { ok: false, msg: 'That listing is gone.' });
      return;
    }

    if (action === 'biz-buy') {
      const listing = findForSaleListing(S, btn.dataset.listing);
      handleActionResult(listing ? buyBusiness(S, listing.id, { mode: 'part_time' }) : { ok: false, msg: 'That listing is gone.' });
      return;
    }

    if (action === 'biz-branch-open') {
      /* v2.17 W2 — the branch button carries data-branch-type; pass it
         through so a kiosk opens as a kiosk, not as a shop. */
      handleActionResult(openBranch(S, findBusiness(S, btn.dataset.biz), btn.dataset.city, { branchType: btn.dataset.branchType || 'shop' }));
      return;
    }

    if (action === 'biz-branch-sell') {
      handleActionResult(sellBranch(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-branch-close') {
      handleActionResult(closeBranch(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-trade-offer') {
      handleActionResult(tradeSaleOffer(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-trade-negotiate') {
      handleActionResult(negotiateTradeSale(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-trade-accept') {
      handleActionResult(acceptTradeSale(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-mbo') {
      handleActionResult(managementBuyout(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-ipo') {
      handleActionResult(ipoBusiness(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-franchise') {
      handleActionResult(franchiseBusiness(S, findBusiness(S, btn.dataset.biz)));
      return;
    }

    if (action === 'biz-revoke-franchise') {
      handleActionResult(revokeFranchise(S, findBusiness(S, btn.dataset.biz), btn.dataset.franchisee));
      return;
    }

    if (action === 'biz-withdraw-cash') {
      const biz = findBusiness(S, btn.dataset.biz);
      const amount = Number(btn.closest('.biz-cash-section')?.querySelector('input[data-cash-amount="withdraw"]')?.value) || 0;
      handleActionResult(biz ? withdrawBusinessCash(S, biz, amount) : { ok: false, msg: 'That business is no longer yours.' });
      return;
    }

    if (action === 'biz-reinvest-cash') {
      const biz = findBusiness(S, btn.dataset.biz);
      const amount = Number(btn.closest('.biz-cash-section')?.querySelector('input[data-cash-amount="reinvest"]')?.value) || 0;
      handleActionResult(biz ? reinvestBusinessCash(S, biz, amount) : { ok: false, msg: 'That business is no longer yours.' });
      return;
    }

    if (action === 'join-gamiya') {
      handleActionResult(joinGamiyaCircle(S, btn.dataset.tier || 'standard', btn.dataset.slot || 'early'));
      return;
    }

    if (action === 'register-syndicate') {
      handleActionResult(registerProfessionalSyndicate(S));
      return;
    }

    if (action === 'enroll-postgrad') {
      handleActionResult(enrollPostgraduateProgram(S, btn.dataset.tier || 'masters_mba'));
      return;
    }

    if (action === 'grow-creator') {
      handleActionResult(growCreatorOrExpertChannel(S, btn.dataset.niche || 'tech_finance'));
      return;
    }

    /* ---- TURN ADVANCEMENT & SCENES ---- */
    if (action === 'advance-one') {
      const before = snapshotTurn(S);
      const res = advanceSingleTurn(S);
      try { evaluateProgress(S); } catch (_) {}
      uiState.turnResult = buildTurnResult(S, before, S.pacing === 'monthly' ? 'month' : 'year');
      if (res.pausedForScene || res.gameOver) uiState.activeTab = 'life';
      renderApp();
      return;
    }

    if (action === 'fast-forward-year') {
      const before = snapshotTurn(S);
      const res = fastForwardTurns(S, 12);
      try { evaluateProgress(S); } catch (_) {}
      uiState.turnResult = buildTurnResult(S, before, 'fastforward', res.stepsRun);
      if (res.pausedForScene || S.gameOver) uiState.activeTab = 'life';
      renderApp();
      return;
    }

    if (action === 'choose-scene') {
      const idx = Number(btn.dataset.idx || 0);
      const before = snapshotTurn(S);
      const choiceResult = resolveActiveSceneChoice(S, idx);
      if (!choiceResult.ok) {
        const reason = choiceResult.reason === 'circumstances_changed'
          ? 'That situation has changed. No choice was made.'
          : choiceResult.reason === 'missing_effect'
            ? 'This older saved decision could not be restored. Load a backup or start a new life.'
            : 'That choice is not available right now. Choose another option.';
        showToast(reason);
        renderApp();
        return;
      }
      try { evaluateProgress(S); } catch (_) {}
      uiState.turnResult = buildTurnResult(S, before, 'choice');
      renderApp();
      return;
    }

    if (action === 'dismiss-turn-result') {
      uiState.turnResult = null;
      renderApp();
      return;
    }

    if (action === 'continue-as-child') {
      const nextGen = continueAsChild(S, btn.dataset.id);
      if (nextGen) {
        S = nextGen;
        uiState.activeTab = 'life';
        saveGameToStorage(S);
        showToast(`Continuing dynasty as ${S.player.fullName}!`);
        renderApp();
      }
      return;
    }

    if (action === 'do-activity') {
      /* Snapshot before, build a turn-result-style card after, so a habit
         shows exactly what it did (numbers per stat) instead of a bare
         toast. The changed HUD bars also flash via uiState.statFlash. */
      const beforeAct = snapshotTurn(S);
      const res = doDailyActivity(S, btn.dataset.id);
      if (res && res.ok) {
        const r = buildTurnResult(S, beforeAct, 'choice');
        r.title = res.actLabel ? `${res.actLabel} — what it did` : 'Habit — what it did';
        if (Array.isArray(res.deltas) && res.deltas.length) {
          r.vitalDeltas = res.deltas.map(d => ({ label: d.label, delta: d.delta }));
        }
        uiState.turnResult = r;
        uiState.statFlash = [...new Set((res.deltas || []).map(d => d.key))];
      }
      handleActionResult(res);
      uiState.statFlash = null;
      return;
    }

    if (action === 'pay-zakat') {
      handleActionResult(payAnnualZakat(S));
      return;
    }

    /* ---- PEOPLE, COURTSHIP, MARRIAGE & CHILDREN ---- */
    if (action === 'npc-interact') {
      handleActionResult(interactWithPerson(S, btn.dataset.id, btn.dataset.kind));
      return;
    }

    /* v2.12 W5 — Circle verbs (item 6): distinct actions, not npc-interact kinds. */
    if (action === 'npc-call') {
      handleActionResult(callPerson(S, btn.dataset.id));
      return;
    }

    if (action === 'npc-visit') {
      handleActionResult(visitPerson(S, btn.dataset.id));
      return;
    }

    if (action === 'npc-gift' || action === 'npc-ask-help' || action === 'npc-talk') {
      const open = action === 'npc-gift' ? openGiftScene : action === 'npc-ask-help' ? openAskHelpScene : openConversationScene;
      const r = open(S, btn.dataset.id);
      if (r.ok) uiState.activeTab = 'life'; // the scene waits on the Timeline tab
      handleActionResult(r);
      return;
    }

    if (action === 'fulfill-promise') {
      const person = S.people[btn.dataset.id];
      const r = fulfillPromise(S, person, btn.dataset.pid);
      showToast(r.ok ? 'Promise honored!' : r.reason);
      saveGameToStorage(S);
      renderApp();
      return;
    }

    if (action === 'meet-partner') {
      handleActionResult(introducePartnerProspect(S, btn.dataset.channel));
      return;
    }

    if (action === 'cohabit') {
      handleActionResult(moveInTogetherCohabitation(S));
      return;
    }

    if (action === 'propose-engagement') {
      handleActionResult(proposeEngagement(S, btn.dataset.tier, btn.dataset.qaima === '1'));
      return;
    }

    if (action === 'toggle-prenup') {
      handleActionResult(toggleEngagementPrenup(S));
      return;
    }

    if (action === 'celebrate-wedding') {
      const r = celebrateWedding(S, btn.dataset.venue);
      if (S.activeScene) uiState.activeTab = 'life';
      handleActionResult(r);
      return;
    }

    if (action === 'toggle-baby') {
      const r = setTryingForBaby(S, !S.marriage.tryingForBaby);
      showToast(r.msg);
      saveGameToStorage(S);
      renderApp();
      return;
    }

    if (action === 'cycle-split') {
      cycleHouseholdSplit(S);
      saveGameToStorage(S);
      renderApp();
      return;
    }

    if (action === 'reunify-family') {
      handleActionResult(sponsorFamilyReunification(S));
      return;
    }

    if (action === 'divorce') {
      uiState.activeTab='life';
      handleActionResult(initiateDivorce(S, null, btn.dataset.mode,{assetMode:btn.dataset.assets||'sell'}));
      return;
    }

    if(action==='child-support-action'){handleActionResult(supportChildAfterSeparation(S,btn.dataset.cid,btn.dataset.kind));return;}
    if (action === 'child-program') {
      handleActionResult(enrollChildInProgram(S, btn.dataset.cid, btn.dataset.kind, btn.dataset.pid));
      return;
    }

    /* v2.12 W5 — Children verbs (item 6). */
    if (action === 'child-play') {
      handleActionResult(playWithChild(S, btn.dataset.cid));
      return;
    }

    if (action === 'child-teach') {
      handleActionResult(teachChild(S, btn.dataset.cid));
      return;
    }

    if (action === 'child-outing') {
      handleActionResult(takeChildOut(S, btn.dataset.cid));
      return;
    }

    if (action === 'child-homework') {
      handleActionResult(helpChildWithHomework(S, btn.dataset.cid));
      return;
    }

    /* ---- CAREER, EDUCATION, LICENSING BOARDS, VENTURES & GIGS ---- */
    if (action === 'toggle-job-qual') {
      uiState.jobOnlyQualified = !uiState.jobOnlyQualified;
      renderApp();
      return;
    }

    /* ---- EDUCATION (v2.5) ---- */
    if (action === 'choose-school') {
      handleActionResult(chooseSchool(S, btn.dataset.id));
      return;
    }

    if (action === 'change-school') {
      handleActionResult(changeSchool(S, btn.dataset.id));
      return;
    }

    if (action === 'set-track') {
      handleActionResult(setTrack(S, btn.dataset.id));
      return;
    }

    if (action === 'set-effort') {
      handleActionResult(setStudyEffort(S, btn.dataset.effort));
      return;
    }

    if (action === 'hire-tutor') {
      handleActionResult(hireTutor(S));
      return;
    }

    if (action === 'join-club') {
      handleActionResult(joinClub(S, btn.dataset.id));
      return;
    }

    if (action === 'apply-scholarship') {
      handleActionResult(applyScholarship(S, btn.dataset.id));
      return;
    }

    if (action === 'apply-internship') {
      handleActionResult(applyInternship(S, btn.dataset.id));
      return;
    }

    if(action==='education-withdraw-confirm'){
      const u=S.education.university;if(!u)return;
      S.education.history=S.education.history||[];S.education.history.push({kind:'withdrawn',name:u.name,majorLabel:u.majorLabel,year:S.year});S.education.university=null;S.education.stage='completed';if(u.international&&S.legal.residency.kind==='student_visa')transitionResidency(S,'grace_period',{permitName:'Study withdrawn ·60-day game grace period',graceMonthsLeft:2});handleActionResult({ok:true,msg:'You left the degree. Prior tuition is not refunded.'});return;
    }
    if (action === 'apply-university') {
      handleActionResult(applyToUniversity(S, btn.dataset.uid, btn.dataset.major,btn.dataset.funding||'auto'));
      return;
    }

    if (action === 'enroll-local-uni') {
      handleActionResult(applyToUniversity(S,btn.dataset.uid,btn.dataset.major||'business'));return;
    }
    if (action === 'sit-exam') {
      handleActionResult(sitExamOrLicensingBoard(S, btn.dataset.kind, btn.dataset.id));
      return;
    }

    if (action === 'apply-job') {
      /* v2.8 §5 — applying is a process: hard gates refuse plainly at once,
         anything that passes goes to a real interview scene on the Timeline
         tab, and the scene's choices resolve through the same interview
         scorer applyForJob uses. If a scene cannot be queued, fall back to
         the immediate path so the application is never silently lost. */
      const jobs = listAvailableJobs(S);
      const chosen = jobs[Number(btn.dataset.idx || 0)];
      if (!chosen) return;
      const pre = checkJobApplication(S, chosen);
      if (!pre.ok) {
        handleActionResult(pre);
        return;
      }
      if (queueScene(S, buildJobInterviewScene(S, chosen))) {
        saveGameToStorage(S);
        showToast(`Interview at ${chosen.employer} — open the Timeline tab to answer.`);
        renderApp();
      } else {
        handleActionResult(applyForJob(S, chosen));
      }
      return;
    }

    if (action === 'set-workmode') {
      handleActionResult(setWorkMode(S, btn.dataset.mode || 'normal'));
      return;
    }

    if (action === 'job-takeon') {
      handleActionResult(takeOnWork(S, btn.dataset.kind));
      return;
    }

    if (action === 'job-train') {
      handleActionResult(trainQualify(S, btn.dataset.kind, btn.dataset.id || null));
      return;
    }

    if (action === 'job-ask') {
      handleActionResult(askForMore(S, btn.dataset.kind));
      return;
    }

    if (action === 'job-transfer') {
      handleActionResult(requestTransfer(S));
      return;
    }

    if (action === 'job-leave') {
      handleActionResult(requestLeave(S, btn.dataset.kind));
      return;
    }

    if (action === 'job-promote') {
      handleActionResult(applyPromotion(S));
      return;
    }

    if (action === 'job-people') {
      handleActionResult(peopleAtWork(S, btn.dataset.act, btn.dataset.pid));
      return;
    }

    if (action === 'job-resign-notice') {
      handleActionResult(requestResign(S));
      return;
    }

    if (action === 'job-walkout') {
      handleActionResult(walkOut(S));
      return;
    }

    if (action === 'ask-raise') {
      handleActionResult(requestRaiseOrPromotion(S));
      return;
    }

    if (action === 'resign-job') {
      handleActionResult(resignCurrentJob(S));
      return;
    }

    if (action === 'retire') {
      /* v2.15 W2 — the pension pot pays out at retirement: it becomes a
         monthly top-up on top of the state pension (pot / 240 months),
         on the same monthlyPension the settlement pays. */
      const r = retireFromCareer(S);
      if (r.ok) {
        const potOut = payOutPensionPot(S);
        if (potOut.monthlyTopUp > 0) S.career.monthlyPension = (S.career.monthlyPension || 0) + potOut.monthlyTopUp;
      }
      handleActionResult(r);
      return;
    }

    /* v2.15 W2 — career market actions (Career tab). */
    if (action === 'cm-offer-accept') {
      handleActionResult(acceptHeadhunterOffer(S));
      return;
    }

    if (action === 'cm-offer-decline') {
      handleActionResult(declineHeadhunterOffer(S));
      return;
    }

    if (action === 'cm-offer-negotiate') {
      handleActionResult(negotiateWithOffer(S));
      return;
    }

    if (action === 'cm-pension-optout') {
      handleActionResult(optOutPension(S));
      return;
    }

    if (action === 'cm-pension-optin') {
      handleActionResult(optInPension(S));
      return;
    }

    /* v2.18 W1 (§1) — real work inside the job: the player resolves a
       piece of work by choosing hard / corner / help / difficult. */
    if (action === 'career-work') {
      handleActionResult(resolveCareerWork(S, btn.dataset.choice));
      return;
    }

    if (action === 'cm-mentor-ask') {
      handleActionResult(askMentor(S, btn.dataset.pid));
      return;
    }

    if (action === 'cm-mentor-advice') {
      handleActionResult(askMentorAdvice(S));
      return;
    }

    if (action === 'cm-mentor-intro') {
      handleActionResult(askMentorIntroduction(S));
      return;
    }

    if (action === 'cm-rival-collaborate' || action === 'cm-rival-compete' || action === 'cm-rival-undermine') {
      const kind = action === 'cm-rival-collaborate' ? 'collaborate' : action === 'cm-rival-compete' ? 'compete' : 'undermine';
      handleActionResult(rivalAction(S, kind));
      return;
    }

    if (action === 'expand-biz') {
      handleActionResult(expandSmallBusiness(S));
      return;
    }

    if (action === 'sell-biz') {
      handleActionResult(sellSmallBusiness(S));
      return;
    }

    if (action === 'side-gig') {
      handleActionResult(takeSideOrStudentGig(S, btn.dataset.kind, Number(btn.dataset.idx || 0)));
      return;
    }

    /* ---- REAL ESTATE, 3D BLUEPRINT ROOMS, UPGRADES, STAFF & LAND ---- */
    if (action === 'set-prop-market') {
      uiState.propMarket = btn.dataset.mkt === 'home' ? 'home' : 'local';
      renderApp();
      return;
    }

    if(action==='choose-property-style'){
      uiState.reUnitId=btn.dataset.unit;
      renderApp();
      return;
    }

    if(action==='people-decision'){handleActionResult(answerPeopleDecision(S,btn.dataset.id,btn.dataset.accept==='yes'));return;}
    if(action==='spouse-decision'){handleActionResult(answerSpouseDecision(S,btn.dataset.spouse,btn.dataset.accept==='yes'));return;}
    if(action==='relationship-step'){handleActionResult(relationshipAction(S,btn.dataset.spouse,btn.dataset.step));return;}
    if(action==='child-course'){handleActionResult(enrollChildCourse(S,btn.dataset.cid));return;}
    if(action==='support-review'){handleActionResult(requestSupportReview(S,btn.dataset.id));return;}
    if(action==='buy-rural-cabin'){handleActionResult(buyRuralCabin(S));return;}
    if (action === 'buy-compound-unit') {
      handleActionResult(buyCompoundOrDistrictUnit(S, {
        country: btn.dataset.country || S.country,
        devId: btn.dataset.dev,
        unitId: btn.dataset.unit || uiState.reUnitId || 'apt_m',
        finishId: uiState.reFinishId || 'standard',
        planId: uiState.rePlanId || 'cash'
      }));
      return;
    }

    if (action === 'upgrade-finish') {
      handleActionResult(upgradePropertyFinishing(S, btn.dataset.pid, btn.dataset.fid));
      return;
    }

    if (action === 'furnish-room') {
      /* The dossier and the Std/Lux buttons send the room NUMBER (e.g. 105).
         Resolve it to the real room on the pictured home's own plan first:
         never furnish the wrong room, never fall back to another property,
         never charge for a preview. The shape actually pictured is the
         Explorer preview shape when one is picked, else the home's shape. */
      const picturedShape = S.housing.properties.find(p => p.id === btn.dataset.pid)?.shape || null;
      const target = resolveFurnishTarget(S.housing.properties, btn.dataset.pid, picturedShape, btn.dataset.room);
      if (!target.ok) {
        handleActionResult({ ok: false, msg: target.msg });
        return;
      }
      const { prop, room } = target;
      const quality = btn.dataset.q || 'standard';
      const res = furnishPropertyRoom(S, prop.id, room.key, quality);
      if (res && res.ok) {
        /* New writes store the room NUMBER (old generic-key entries are
           migrated to their numbers, so old saves keep working). */
        prop.furnishedRooms = migrateFurnishedRoomsToNumbers(prop.furnishedRooms, prop.shape);
        res.msg = `Furnished room ${room.no} (${room.name}) in ${prop.name}!`;
        handleActionResult(res);
        return;
      }
      if (res && !res.ok && /^Need /.test(res.msg || '')) {
        /* Could not afford it: name the price, the room, and the cheapest
           real option for this room in plain words. The cheapest price
           comes from furnishingOptions — the same list the choices show —
           never a flat number. (Budget is the cheapest style, so the
           cheapest style is worked out live rather than assumed.) */
        const priceMatch = res.msg.match(/^Need (.+?) to furnish/);
        const price = priceMatch ? priceMatch[1] : '';
        const cheapest = furnishingOptions(S, prop, room.key)
          .reduce((a, b) => (!a || b.priceLocal < a.priceLocal ? b : a), null);
        if (cheapest && furnishingStyleKey(quality) !== cheapest.key) {
          res.msg = `Need ${price} to furnish room ${room.no} (${room.name}) as ${quality}. Cheapest is ${cheapest.styleName} at ${formatMoney(Math.round(cheapest.priceLocal), S.country)} — try that button for this room instead.`;
        } else {
          res.msg = `Need ${price} to furnish room ${room.no} (${room.name}).`;
        }
        handleActionResult(res);
        return;
      }
      handleActionResult(res);
      return;
    }

    /* v2.12 item 4b — a hallway / guest toilet / open void is not a room
       you furnish, but tapping it now opens its real record (number,
       name, size, floor, what it is) on the Real Estate tab instead of
       a bare info message. */
    if (action === 'room-info') {
      uiState.roomDetail = {
        key: btn.dataset.room || '',
        no: btn.dataset.no || '',
        name: btn.dataset.name || '',
        m2: Number(btn.dataset.m2 || 0),
        floor: btn.dataset.floor || ''
      };
      renderApp();
      return;
    }

    if (action === 'close-room-detail') {
      uiState.roomDetail = null;
      renderApp();
      return;
    }

    /* v2.12 item 1 — a listing the player cannot afford is a plan:
       save-for-this (whole listing price) and set-a-goal (the deposit
       that unlocks the buy) both create a staged goal in S.goals. A
       plot has no deposit, so its set-a-goal is the same full-price
       goal as save-for-this. */
    if (action === 'save-for-listing') {
      const kind = btn.dataset.kind === 'land' ? 'land' : 'compound';
      const full = Number(btn.dataset.full || 0);
      const down = Number(btn.dataset.down || 0);
      const deposit = btn.dataset.mode === 'deposit' && down > 0 && down < full;
      handleActionResult(createSaveGoal(S, {
        kind,
        refId: btn.dataset.ref || '',
        label: btn.dataset.name || (kind === 'land' ? 'this plot' : 'this home'),
        target: deposit ? down : full,
        deposit
      }));
      return;
    }

    /* v2.12 item 1 — view cheaper: only the listings whose down payment
       (compounds) or deed price (lands) fits cash + savings + loan
       capacity. A plain toggle, not a dead filter. */
    if (action === 'toggle-affordable-only') {
      uiState.reAffordableOnly = !uiState.reAffordableOnly;
      renderApp();
      return;
    }

    /* v2.12 item 1 — compare: pick up to two listings; the table above
       the catalogue shows them side by side (price, size, location,
       running costs). Picking a third drops the oldest. */
    if (action === 'compare-listing') {
      const key = `${btn.dataset.kind === 'land' ? 'land' : 'compound'}:${btn.dataset.ref || ''}`;
      const list = Array.isArray(uiState.reCompare) ? [...uiState.reCompare] : [];
      const at = list.indexOf(key);
      if (at >= 0) {
        list.splice(at, 1);
        showToast('Removed from comparison.');
      } else {
        if (list.length >= 2) {
          list.shift();
          showToast('Comparing the two latest picks — the oldest was dropped.');
        }
        list.push(key);
      }
      uiState.reCompare = list;
      renderApp();
      return;
    }

    if (action === 'clear-compare') {
      uiState.reCompare = [];
      renderApp();
      return;
    }

    if (action === 'install-upgrade') {
      handleActionResult(installPropertyUpgrade(S, btn.dataset.pid, btn.dataset.upg));
      return;
    }

    if (action === 'toggle-staff') {
      handleActionResult(toggleHouseholdStaff(S, btn.dataset.role));
      return;
    }

    if (action === 'buy-land') {
      handleActionResult(purchaseLandPlot(S, btn.dataset.id));
      return;
    }

    if (action === 'start-land-build') {
      handleActionResult(startCustomConstructionOnLand(S, btn.dataset.lid, btn.dataset.ptype || 'villa', 'super_lux'));
      return;
    }

    if (action === 'rent-home') {
      handleActionResult(rentHousingUnit(S, btn.dataset.id));
      return;
    }

    if (action === 'buy-prop') {
      const useInst = btn.dataset.inst === '1';
      const mktCountry = btn.dataset.country || S.country;
      handleActionResult(buyProperty(S, btn.dataset.id, mktCountry, useInst, mktCountry === S.country));
      return;
    }

    if (action === 'move-into-prop') {
      handleActionResult(moveIntoOwnedProperty(S, btn.dataset.id));
      return;
    }

    if (action === 'toggle-rent-prop') {
      handleActionResult(togglePropertyRental(S, btn.dataset.id));
      return;
    }

    /* ---- FINANCE, BANKS, 3D CREDIT CARDS, GOLD VAULT, MARKETS & HAWALA ---- */
    if (action === 'set-lifestyle') {
      S.money.lifestyleMode = btn.dataset.mode || 'comfortable';
      saveGameToStorage(S);
      renderApp();
      return;
    }

    if (action === 'set-remit') {
      S.money.remittanceMonthlyLocal = Number(btn.dataset.amt || 0);
      showToast(S.money.remittanceMonthlyLocal > 0 ? 'Monthly parent remittance updated.' : 'Monthly remittance paused.');
      saveGameToStorage(S);
      renderApp();
      return;
    }

    if (action === 'switch-bank') {
      S.money.bankName = btn.dataset.name;
      showToast(`Switched primary banking to ${S.money.bankName}.`);
      saveGameToStorage(S);
      renderApp();
      return;
    }

    if (action === 'bank-deposit') {
      const amt = Math.floor(S.money.cash * Number(btn.dataset.pct || 0.5));
      handleActionResult(depositToSavings(S, amt));
      return;
    }

    if (action === 'bank-withdraw') {
      handleActionResult(withdrawFromSavings(S, S.money.savings));
      return;
    }

    if (action === 'buy-cd') {
      const cObj = getCountry(S.country);
      const amt = eraLocalCost(cObj.monthlyBasket2026.rentStandard * 2, S.country, S.year);
      handleActionResult(buyBankCertificate(S, amt, 1));
      return;
    }

    if (action === 'take-loan') {
      handleActionResult(takePersonalLoan(S, Number(btn.dataset.amt || 0), 3));
      return;
    }

    /* v2.12 — the staff loan: the rate comes from staffLoanTerms (the
       bank's own deposit rate), so the button, the Work tab perk line
       and the booked loan all name the same number. */
    if (action === 'take-staff-loan') {
      const terms = staffLoanTerms(S);
      if (!terms.eligible) {
        handleActionResult({ ok: false, msg: 'Staff loans are only for bank staff.' });
        return;
      }
      handleActionResult(takeStaffLoan(S, Number(btn.dataset.amt || 0), 3, terms.staffRate));
      return;
    }

    if (action === 'open-card') {
      handleActionResult(openCreditCard(S, btn.dataset.id));
      return;
    }

    if (action === 'pay-card') {
      handleActionResult(payCreditCard(S, btn.dataset.id, btn.dataset.full === '1'));
      return;
    }

    /* v2.12 W6: real uses for a held card. */
    if (action === 'card-limit') {
      handleActionResult(cardLimitBenefit(S, btn.dataset.id));
      return;
    }

    if (action === 'card-pay') {
      handleActionResult(payWithCard(S, btn.dataset.id, btn.dataset.item));
      return;
    }

    if (action === 'card-use-perk') {
      handleActionResult(useCardPerk(S, btn.dataset.id, btn.dataset.item));
      return;
    }

    if (action === 'buy-gold') {
      handleActionResult(buyGold21k(S, Number(btn.dataset.grams || 10)));
      return;
    }

    if (action === 'sell-gold') {
      handleActionResult(sellGold21k(S, Number(btn.dataset.grams || 10)));
      return;
    }

    if (action === 'buy-asset') {
      handleActionResult(investInMarketAsset(S, btn.dataset.id, Number(btn.dataset.amt || 0)));
      return;
    }

    if (action === 'sell-asset') {
      handleActionResult(liquidateMarketAsset(S, btn.dataset.id));
      return;
    }

    if (action === 'send-remittance') {
      handleActionResult(sendInternationalRemittance(S, btn.dataset.ch, Number(btn.dataset.amt || 0)));
      return;
    }

    /* ---- LIFESTYLE: 3D CARS, SHOPPING, HAJJ/TRAVEL, MEDICAL & COURTS ---- */
    if (action === 'get-licence') {
      handleActionResult(obtainOrRenewDrivingLicence(S));
      return;
    }

    if (action === 'pick-car-color') {
      uiState.carColorIdx = Number(btn.dataset.idx || 0);
      renderApp();
      return;
    }

    if (action === 'buy-showroom-car') {
      handleActionResult(buyShowroomCar(
        S,
        btn.dataset.id,
        uiState.carTrimId || 'base',
        Number(uiState.carColorIdx || 0),
        btn.dataset.loan === '1'
      ));
      return;
    }

    if (action === 'buy-car') {
      handleActionResult(buyVehicle(S, btn.dataset.id));
      return;
    }

    if (action === 'sell-car') {
      handleActionResult(sellVehicle(S, btn.dataset.id));
      return;
    }

    if(action==='biz-international'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(openInternationalBusiness(S,biz,btn.dataset.country));return;}
    if(action==='biz-product-launch'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(launchBusinessProduct(S,biz,btn.dataset.product));return;}
    if(action==='biz-improve'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(improveBusiness(S,biz,btn.dataset.kind));return;}
    if(action==='biz-benefit'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);const emp=biz?.staff?.find(e=>e.id===btn.dataset.staff);handleActionResult(toggleEmployeeBenefit(S,biz,emp,btn.dataset.benefit));return;}
    if(action==='biz-staff-action'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);const emp=biz?.staff?.find(e=>e.id===btn.dataset.staff);handleActionResult(manageEmployee(S,biz,emp,btn.dataset.kind));return;}
    if(action==='biz-staff-request'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);const emp=biz?.staff?.find(e=>e.id===btn.dataset.staff);handleActionResult(answerEmployeeRequest(S,biz,emp,btn.dataset.accept==='yes'));return;}
    if(action==='biz-sector'){uiState.bizSector=btn.dataset.sector;renderApp();return;}
    if(action==='biz-employee'){uiState.bizEmployee=btn.dataset.staff;renderApp();return;}
    if(action==='input-choice'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(inputAction(S,biz,btn.dataset.kind,btn.dataset.input,btn.dataset.value));return;}
    if(action==='catalog-choice'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(catalogAction(S,biz,btn.dataset.kind,btn.dataset.item,btn.dataset.value));return;}
    if(action==='branch-choice'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(branchAction(S,biz,btn.dataset.kind,btn.dataset.index,btn.dataset.value));return;}if(action==='growth-choice'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(growthAction(S,biz,btn.dataset.kind,btn.dataset.value,operatingBase(S,biz)));return;}
    if(action==='operating-choice'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(operatingAction(S,biz,btn.dataset.kind,btn.dataset.value));return;}
    if(action==='company-action'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(companyAction(S,biz,btn.dataset.kind,btn.dataset.value));return;}
    if(action==='divorce-share-buyout'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(buyoutDivorceShares(S,biz,btn.dataset.person,Number(btn.dataset.amount)));return;}
    if(action==='company-migrate'){const b=(S.career.businesses||[]).find(x=>x.id===btn.dataset.biz);handleActionResult(migrateCompanyModel(S,b));return;}
    if(action==='family-rota'){const b=(S.career.businesses||[]).find(x=>x.id===btn.dataset.biz);handleActionResult(changeFamilyRota(S,b,btn.dataset.employee,btn.dataset.hours));return;}
    if(action==='family-share'){const b=(S.career.businesses||[]).find(x=>x.id===btn.dataset.biz);handleActionResult(familyShareAction(S,b,btn.dataset.kind,btn.dataset.person,btn.dataset.pct,btn.dataset.amount));return;}
    if(action==='family-council'){const b=(S.career.businesses||[]).find(x=>x.id===btn.dataset.biz);handleActionResult(familyCouncil(S,b,btn.dataset.kind));return;}
    if(action==='family-manager'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(hireFamilyManager(S,biz,btn.dataset.person,btn.dataset.switch==='yes'));return;}
    if(action==='family-hire'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(hireFamily(S,biz,btn.dataset.person,btn.dataset.role,btn.dataset.switch==='yes',Number(btn.dataset.hours||40)));return;}
    if(action==='equipment-choice'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(equipmentAction(S,biz,btn.dataset.kind,btn.dataset.type,btn.dataset.tier,operatingBase(S,biz)));return;}
    if(action==='server-choice'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(serverAction(S,biz,btn.dataset.kind,btn.dataset.kind==='custom-cloud'?JSON.stringify(Object.fromEntries([...btn.closest('.custom-cloud').querySelectorAll('[data-resource]')].map(el=>[el.dataset.resource,el.value]))):btn.dataset.value,techBase(S,biz)));return;}
    if(action==='tech-action'){const biz=(S.career.businesses||[]).find(b=>b.id===btn.dataset.biz);handleActionResult(techAction(S,biz,btn.dataset.kind,btn.dataset.value));return;}
    if(action==='biz-tab'){uiState.bizTab=btn.dataset.area;renderApp();return;}
    if(action==='biz-company'){uiState.bizCompany=btn.dataset.biz;uiState.bizTab='overview';renderApp();return;}
    if(action==='biz-desk'){uiState.bizDesk=btn.dataset.desk;renderApp();return;}
    if(action==='shop-finance'){uiState.activeTab='finance';uiState.finSub=btn.dataset.sub||'banks';renderApp();return;}
    if(action==='shop-category'){uiState.shopCat=btn.dataset.cat;renderApp();return;}
    if (action === 'buy-shop-item') {
      handleActionResult(purchaseShopCatalogItem(S, btn.dataset.id, btn.dataset.pay || 'cash', {cardId:btn.dataset.cardId||null}));
      return;
    }

    /* v2.12 W6: shop verbs 2–4 — compare, save for later, ask, remove. */
    if (action === 'compare-shop-item') {
      handleActionResult(compareShopItems(S, btn.dataset.id, btn.dataset.with || null));
      return;
    }

    if (action === 'save-shop-item') {
      handleActionResult(saveShopItemForLater(S, btn.dataset.id));
      return;
    }

    if (action === 'remove-shop-wishlist') {
      handleActionResult(removeShopWishlist(S, btn.dataset.id));
      return;
    }

    if (action === 'ask-shop-item') {
      handleActionResult(askShopkeeperAboutItem(S, btn.dataset.id));
      return;
    }

    if (action === 'sell-item') {
      handleActionResult(resellInventoryItem(S, btn.dataset.id));
      return;
    }

    if (action === 'take-trip') {
      handleActionResult(takeVacationOrPilgrimage(S, btn.dataset.id));
      return;
    }

    /* v2.12 W6: plan it (creates the plan record), compare destinations. */
    if (action === 'plan-trip') {
      handleActionResult(planTrip(S, btn.dataset.id));
      return;
    }

    if (action === 'compare-trip') {
      handleActionResult(compareTrips(S, btn.dataset.id, btn.dataset.with || null));
      return;
    }

    if (action === 'visit-hospital') {
      handleActionResult(visitHospitalCheckup(S, btn.dataset.sector || 'public'));
      return;
    }

    if (action === 'treat-condition') {
      handleActionResult(runDiseaseTreatment(S, btn.dataset.id, btn.dataset.care || 'public'));
      return;
    }

    if (action === 'med-diag') {
      handleActionResult(runDiagnosticTestOrMed(S, btn.dataset.kind, btn.dataset.id));
      return;
    }

    if (action === 'surgery-ivf') {
      handleActionResult(undergoSurgeryOrFertility(S, btn.dataset.kind, btn.dataset.id));
      return;
    }

    if (action === 'file-lawsuit') {
      handleActionResult(launchCivilLawsuit(S, btn.dataset.id));
      return;
    }

    if (action === 'commit-crime') {
      handleActionResult(commitRiskyCrime(S, btn.dataset.id));
      return;
    }

    /* ---- PASSPORT, GULF KAFALA, IQAMA MUMAYAZA & CHANCENKARTE ---- */
    if (action === 'renew-passport') {
      handleActionResult(renewPassport(S));
      return;
    }

    if (action === 'return-home') {
      handleActionResult(returnToHomeCountry(S));
      return;
    }

    if (action === 'set-gulf-target') {
      uiState.gulfTarget = btn.dataset.dest || 'uae';
      renderApp();
      return;
    }

    if (action === 'apply-gulf') {
      handleActionResult(applyGulfWorkChannel(S, btn.dataset.dest, btn.dataset.channel));
      return;
    }

    if (action === 'apply-premium-res') {
      handleActionResult(applyPremiumOrGoldenResidency(S, btn.dataset.dest, btn.dataset.tier));
      return;
    }

    if (action === 'apply-chancenkarte') {
      handleActionResult(applyGermanChancenkarte(S));
      return;
    }

    if(action==='apply-overseas-scholarship'){handleActionResult(applyOverseasScholarship(S,btn.dataset.dest,btn.dataset.level));return;}
    if (action === 'apply-study-abroad') {
      handleActionResult(applyStudyAbroad(S, btn.dataset.dest, btn.dataset.major || 'cs',{uniId:btn.dataset.uni,level:btn.dataset.level,funding:btn.dataset.funding}));
      return;
    }

    if (action === 'apply-skilled-abroad') {
      handleActionResult(applyDirectSkilledVisa(S, btn.dataset.dest));
      return;
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target && e.target.id === 'new-life-form') {
      e.preventDefault();
      const fd = new FormData(e.target);
      const country = String(fd.get('country') || 'egy');
      const birthYear = Number(fd.get('birthYear') || 1998);
      const gender = String(fd.get('gender') || 'm');
      const familyTier = String(fd.get('familyTier') || 'middle');
      const firstName = String(fd.get('firstName') || '').trim();
      const familyName = String(fd.get('familyName') || '').trim();
      const ambition = String(fd.get('ambition') || 'global_passport');
      const skinToneIdx = Number(fd.get('skinToneIdx') ?? -1);
      const faceShapeIdx = Number(fd.get('faceShapeIdx') ?? 0);

      // The seed itself comes from one OS-entropy draw (crypto), then the
      // whole life runs on the seeded RNG from that seed — the only
      // unseeded draw in the game. The seed is stored on the save, so a
      // life is reproducible from its save file.
      const seedDraw = new Uint32Array(1);
      globalThis.crypto.getRandomValues(seedDraw);
      S = createNewLifeState({
        seed: (seedDraw[0] % 900000000) + 10000,
        country,
        birthYear,
        gender,
        familyTier,
        firstName: firstName || undefined,
        familyName: familyName || undefined,
        ambition
      });
      ensureExtendedState(S);
      if (skinToneIdx >= 0) S.player.appearance.skinToneIdx = skinToneIdx;
      S.player.appearance.faceShapeIdx = faceShapeIdx;
      uiState.showNewLifeModal = false;
      uiState.activeTab = 'life';
      saveGameToStorage(S);
      showToast(`Welcome to the world, ${S.player.fullName}!`);
      renderApp();
    }
  });

  // v2.16 W1 — apply the saved theme to <html> at boot, before the first
  // render, so the page never flashes the wrong theme (renderApp also
  // sets it on #app on every render).
  if (typeof document !== 'undefined' && document.documentElement) {
    document.documentElement.dataset.theme = getSavedTheme();
  }
  renderApp();
}
