import { lenderCreditScore } from './familyName.js';
import{reviewPersonalReceivables}from'./personalReceivables.js';
import { hasFortune, payFamilyAllowanceYear, familyPaysCarUpkeep } from './familyFortune.js';
import {closePlayerLease,reconcilePlayerLease,recordPlayerRentDue,tickPlayerRentalDamage} from './playerTenancy.js';
import{settleCompanyTrusts}from'./companyTrust.js';
import{settleNpcCompanyHoldings}from './companyEstate.js';
import{childFoodEquivalent,residentAdultChildren}from './custodyCosts.js';
import{propertyMarketYear}from './propertyMarketRisk.js';
import{flyingDutyStatus}from './dutyEligibility.js';
import{settleUSRetirement}from './usRetirement.js';
import {RURAL_CABIN} from '../data/ruralCabin.js';
import {settleChildSupportMonth} from './divorceModel.js';
import { monthlyUniversityTuition,settleFamilyUniversityMonth,settleChildCourses } from './educationFunding.js';
/* ============================================================================
   World Life 2.0 — Household Economy, Banking, Gold, Real Estate & Cars Engine
   Exact monthly accounting, progressive taxes, inflation-linked CDs, physical
   21K gold hedging, off-plan developer Aqsat, mortgages, and real debt laws.
   ========================================================================== */

import { clamp, rand } from '../core/rng.js';
import { nextId, recordJournal, walletMove, moveBalance, recordLedgerEntry, queueScene, FAMILY_TIERS } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import {
  eraLocalCost,
  eraSalary,
  convertCurrency,
  goldPricePerGram,
  eraDepositRates,
  computeMonthlyNetPay,
  computeOvertimePay,
  inflationRate,
  statutoryMinMonthlyGross,
} from '../data/economy.js';
import { getHousingFor, getCarsForYear, getBanksFor } from '../data/institutions.js';
import { SHOP_MEGA_CATALOG } from '../data/megaCarsAndShop.js';
import { GULF_SPONSOR_ARCHETYPES } from '../data/visasAndMarriage.js';
import { emitFact, rememberDeed } from './soulEngine.js';
import { closeBusiness, migrateBusinesses, applyWorkloadMonth } from './businessEngine.js';
/* v2.14 — the folded monthly P&L (manager + decisions + franchise +
   reinvest boost + harvest) lives in businessMonthly.js so the base
   computeBusinessMonth stays untouched for the worker verify scripts. */
import { computeBusinessMonthFull } from './businessMonthly.js';
/* v2.15 W3 — social energy: the monthly settlement refills the budget. */
import { refillSocialEnergy } from './socialEnergy.js'; /* v2.15 W3 */
import { tickManagerMonth } from './businessManager.js';
import { monthlyStaffTick, applyUnpaidWagesMorale } from './businessStaff.js';
/* v2.11 merge: remote-business repeat-rate tick (W4) + premises ticks (W3). */
import { tickRemoteBusinesses } from './businessLegacy.js';
import { tickBusinessPremisesMonth, applyPremisesYearlyDecay } from './businessPremises.js';
/* v2.15 W1 — landlord: the named tenant pays the rent (or doesn't),
   and the monthly tick runs condition, lease, eviction and damage. */
import { tickLandlordMonth, landlordRentForMonth, findTenant, endTenancy } from './propertyLandlord.js';
/* v2.15 W4 — era world events: house prices, salary, business revenue and
   the rate shift on savings, loans and mortgages. */
import { worldEventEffects, eraLoanRates, monthlyMortgagePayment } from './worldEvents.js';
/* v2.15 W2 — career market: the pension pot accrues in the settlement. */
import { accruePensionMonth, pensionSlipFor } from './careerMarket.js';

const LIFESTYLE_MULTS = {
  frugal: 0.74,
  comfortable: 1.00,
  generous: 1.45,
  lavish: 2.25
};

export function isCitizenOrPermanentInCurrentCountry(S) {
  // D9: this answers the TAX question (citizen/PR tax treatment), not the
  // WORK question — canLegallyWorkInCurrentCountry() in careerEducationEngine
  // answers that one, and the two deliberately differ (a work-visa holder
  // can work but is taxed as a non-resident). They share the same residency
  // record; they are not two answers to one question.
  return S.legal.citizenships.includes(S.country) || S.legal.residency.kind === 'permanent_resident';
}

/* Work-authorisation gate for PAY: salary (and business profit) is paid only
   while the player holds a status that allows work. Undocumented / grace
   players earn only the informal hustle income the visa tick pays. */
export function canLegallyEarnSalary(S) {
  const kind = S.legal.residency.kind;
  if (S.legal.citizenships.includes(S.country)) return true;
  return ['permanent_resident', 'work_visa', 'gulf_iqama', 'golden_visa', 'post_study_work', 'student_visa'].includes(kind);
}

export function hasValidResidenceForBanking(S) {
  // Opening NEW credit/accounts needs a valid residence; an existing account
  // keeps working (it is the player's own money). Grace/undocumented fail.
  const kind = S.legal.residency.kind;
  if (S.legal.citizenships.includes(S.country)) return true;
  return ['permanent_resident', 'work_visa', 'gulf_iqama', 'golden_visa', 'post_study_work', 'student_visa'].includes(kind);
}

/* ONE purchase choke-point: every buy function in the game routes its money
   through here (cash / card / BNPL / loan-down-payment). Behaviour (prices,
   gates, messages) stays in the caller; the money movement is here, once. */
export function purchase(S, amountLocal, label, method = 'cash', opts = {}) {
  const amt = Math.round(Number(amountLocal) || 0);
  if (!Number.isSafeInteger(amt)||amt<=0) return { ok: false, msg: 'Invalid finite amount.' };
  if (method === 'cash') {
    if (S.money.cash < amt) return { ok: false, msg: `Need ${formatMoney(amt, S.country)} in cash.` };
    walletMove(S, -amt, label, opts.category || 'general');
    return { ok: true, paid: amt };
  }
  if (method === 'card') {
    const card = opts.card;
    if (!card||(S.creditCards||[]).every(c=>c!==card)) return { ok: false, msg: 'Choose a card from your actual wallet.' };
    if ((card.limit - card.balance) < amt) return { ok: false, msg: 'Credit card limit insufficient.' };
    card.balance = Math.round(card.balance + amt);
    recordLedgerEntry(S, amt, `${label} (card: ${card.name})`, opts.category || 'lifestyle', 'card', card.balance);
    const cb = Math.round(amt * (card.cashbackRate || 0.01));
    if (cb > 0) walletMove(S, cb, `Card cashback on ${label}`, 'bank');
    return { ok: true, paid: 0, cardCharged: amt };
  }
  if (method === 'bnpl') {
    const bnpl = opts.bnpl; // { providerName, markup, months }
    if (!bnpl) return { ok: false, msg: 'No BNPL provider.' };
    if(!Number.isFinite(bnpl.markup??1)||(bnpl.markup??1)<1||!Number.isInteger(bnpl.months??4)||(bnpl.months??4)<2||(bnpl.months??4)>60)return{ok:false,msg:'Invalid installment terms.'};
    const totalFinanced = Math.round(amt * (bnpl.markup || 1.0));
    const firstSplit = Math.round(totalFinanced / (bnpl.months || 4));
    if (S.money.cash < firstSplit) return { ok: false, msg: `Need first split (${formatMoney(firstSplit, S.country)}).` };
    walletMove(S, -firstSplit, `First ${bnpl.providerName} split: ${label}`, opts.category || 'lifestyle');
    const plan = {
      id: nextId(S, 'bnpl'),
      label: `${bnpl.providerName}: ${label}`,
      monthlyPay: firstSplit,
      monthsLeft: (bnpl.months || 4) - 1,
      balanceRemaining: totalFinanced - firstSplit,
      missedMonths: 0
    };
    S.bnplPlans.push(plan);
    recordLedgerEntry(S, totalFinanced, `${label} (BNPL ${bnpl.providerName}, ${bnpl.months || 4} splits)`, opts.category || 'lifestyle', 'bnpl', plan.balanceRemaining);
    return { ok: true, paid: firstSplit, plan };
  }
  return { ok: false, msg: `Unknown payment method: ${method}` };
}

/* One import-duty rule for cars (was 1.65 in buyVehicle, 1.75 in the
   showroom, for the same rule). Non-EV luxury imports pay 1.75x in Egypt. */
export function carImportDutyMult(S, isLuxuryNonEv) {
  return (S.country === 'egy' && isLuxuryNonEv) ? 1.75 : 1.0;
}

/* ONE car-purchase core (D2): both catalogues price the car their own way,
   then finish here — licence gate, cash/loan, record, happiness, journal. */
export function finalizeCarPurchase(S, car, opts = {}) {
  const hasChauffeur = S.housing.staff.some(s => s.roleKey === 'driver');
  if ((!S.drivingLicence.valid || S.drivingLicence.expiresYear <= S.year) && !hasChauffeur) {
    return { ok: false, msg: 'Pass/renew your Driving Licence first (or hire a Private Chauffeur)!' };
  }
  const fullPrice = Math.round(car.fullPrice || 0);
  const monthlyUpkeep = Math.round(car.monthlyUpkeep || 0);
  if (opts.useAutoLoan) {
    if (S.year <= S.money.bankruptUntilYear) return { ok: false, msg: 'Auto loans blocked during active bankruptcy.' };
    const down = Math.round(fullPrice * 0.25);
    const paid = purchase(S, down, `25% Auto Down Payment: ${car.name}`, 'cash', { category: 'lifestyle' });
    if (!paid.ok) return { ok: false, msg: `Need 25% auto down payment (${formatMoney(down, S.country)}).` };
    const principal = fullPrice - down;
    // True cost: 24% flat markup over 48 months. The record now carries the
    // flat markup AND the matching effective APR (~12.9%) — the old record
    // claimed 11% while charging 1.24x, and the settlement loop then charged
    // interest on top of the markup as well. flatMarkup loans accrue no
    // further interest in the monthly loop (see settleHouseholdMonth §14).
    const monthlyLoan = Math.round((principal * 1.24) / 48);
    S.money.loans.push({
      id: nextId(S, 'carloan'),
      label: `Auto Loan: ${car.name}`,
      balance: Math.round(principal * 1.24),
      monthlyPayment: monthlyLoan,
      annualRate: 0.129,
      flatMarkup: 1.24,
      remainingMonths: 48,
      country: S.country,
      assetKind: 'car',
      missedMonths: 0
    });
  } else {
    const paid = purchase(S, fullPrice, `Purchased ${car.name}`, 'cash', { category: 'lifestyle' });
    if (!paid.ok) return { ok: false, msg: `Need ${formatMoney(fullPrice, S.country)} cash.` };
  }
  const owned = {
    id: nextId(S, 'car'),
    catalogId: car.catalogId,
    name: car.name,
    tier: car.tier,
    class: car.class,
    body: car.body,
    colorHex: car.colorHex,
    colorName: car.colorName,
    trimLabel: car.trimLabel,
    mods: [],
    boughtYear: S.year,
    valueLocal: Math.round(fullPrice * 0.88),
    monthlyUpkeep,
    condition: 100
  };
  // Link a financed car to its loan so a 3rd missed payment repossesses
  // THIS car (not a generic bankruptcy seizure of every luxury car).
  const carLoan = S.money.loans.find(l => l.assetKind === 'car' && !l.carId && l.label === `Auto Loan: ${car.name}`);
  if (carLoan) carLoan.carId = owned.id;
  S.cars.push(owned);
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + (car.happinessBoost ?? 4));
  if (car.tier === 'luxury' || car.tier === 'executive' || ['lux', 'exec', 'sport', 'hyper'].includes(car.class)) {
    emitFact(S, 'LUXURY_PURCHASE', { itemName: owned.name });
  }
  recordJournal(S, `Picked up the keys to a ${owned.name} (${formatMoney(fullPrice, S.country)}).`, 'lifestyle');
  return { ok: true, msg: `Bought ${owned.name}!`, car: owned };
}

/* ONE property-purchase core (D1): both catalogues price the home their own
   way, then finish here — down payment / cash, record, move-in, journal.
   `spec` carries the already-priced fields; `plan` is null (cash) or
   { months, nativeRemaining, nativeMonthlyInst, planKind }. */
export function finalizePropertyPurchase(S, spec, plan, opts = {}) {
  const downInPlayer = Math.round(spec.downInPlayerLocal || 0);
  if (plan) {
    if (S.year <= S.money.bankruptUntilYear) {
      return { ok: false, msg: 'Cannot sign installment/mortgage contracts during active bankruptcy.' };
    }
  }
  /* opts.gift: the family hands over a finished asset (the caller journals it and moved the value out of the estate): no player payment. */
  const paid = opts.gift ? { ok: true } : purchase(S, downInPlayer, plan ? `Down payment on ${spec.name}` : `Purchased ${spec.name} outright`, 'cash', { category: 'housing' });
  if (!paid.ok) return paid;
  const prop = {
    id: nextId(S, 'prop'),
    catalogId: spec.catalogId,
    name: spec.name,
    shape: spec.shape || 'apartment',
    finishing: spec.finishing || null,
    furnishedRooms: {},
    upgrades: [],
    country: spec.country,
    city: spec.city,
    tier: spec.tier,
    rooms: spec.rooms,
    areaM2: spec.areaM2,
    gardenM2:spec.gardenM2,poolM2:spec.poolM2,terraceM2:spec.terraceM2,courtyardM2:spec.courtyardM2,parkingM2:spec.parkingM2,footprintM2:spec.footprintM2,plotM2:spec.plotM2,outdoorAnnualNative:spec.outdoorAnnualNative||0,
    unitId: spec.unitId || null,
    styleId: spec.styleId || null,
    hasGarden: spec.hasGarden === true,
    hasPool: spec.hasPool === true,
    nativeValue: spec.nativeValue,
    valueLocal: Math.round(convertCurrency(spec.nativeValue, spec.country, S.country, S.year)),
    nativeMonthlyRent: spec.nativeMonthlyRent || 0,
    rentedOut: !(opts.moveIn !== false && spec.country === S.country),
    nativeInstallmentRemaining: plan ? plan.nativeRemaining : 0,
    installmentRemaining: plan ? Math.round(convertCurrency(plan.nativeRemaining, spec.country, S.country, S.year)) : 0,
    nativeMonthlyInstallment: plan ? plan.nativeMonthlyInst : 0,
    monthsLeft: plan ? plan.months : 0,
    missedMonths: 0
  };
  S.housing.properties.push(prop);
  if (opts.moveIn !== false && spec.country === S.country) {
    closePlayerLease(S);
    S.housing.mode = 'owned';
    S.housing.currentHomeId = prop.id;
    S.housing.currentHomeName = prop.name;
    S.housing.currentShape = prop.shape || 'apartment';
    S.housing.monthlyRent = 0;
  }
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + (spec.happinessBoost || 4));
  if (spec.tier === 'upscale' || spec.shape === 'villa' || spec.shape === 'mansion' || spec.shape === 'penthouse') {
    emitFact(S, 'LUXURY_PURCHASE', { itemName: prop.name });
  }
  if (opts.gift) return { ok: true, msg: `Received ${prop.name}.`, prop };
  if (plan) {
    recordJournal(S, `Signed a ${plan.planKind} on ${prop.name}: ${formatMoney(downInPlayer, S.country)} down, ${formatMoney(Math.round(convertCurrency(plan.nativeMonthlyInst, spec.country, S.country, S.year)), S.country)}/mo.`, 'milestone');
    return { ok: true, msg: `Signed ${plan.planKind} for ${prop.name}!`, prop };
  }
  recordJournal(S, `Purchased ${prop.name} outright for ${formatMoney(downInPlayer, S.country)}.`, 'milestone');
  return { ok: true, msg: `Bought ${prop.name}!`, prop };
}


/* Revalue properties & cars annually with local inflation / depreciation */
export function tickAssetsAnnually(S) {
  /* v2.11 W3: commercial premises condition decays −5/yr like cars. */
  for (const biz of (S.career?.businesses || [])) applyPremisesYearlyDecay(S, biz);
  for (const prop of S.housing.properties) {
    const pCountry = prop.country || S.country;
    const inf = inflationRate(pCountry, S.year) / 100;
    const market=propertyMarketYear(S,pCountry);
    const realGain=market.realChange;
    prop.lastMarketChange={year:S.year,realChange:realGain,label:market.label};
    prop.nativeValue = Math.round(prop.nativeValue * (1 + Math.max(-.30, inf + realGain)));
    if(prop.ruralCabin){const ratio=eraLocalCost(10000,pCountry,S.year)/eraLocalCost(10000,pCountry,S.year-1);prop.annualTaxNative=Math.round((prop.annualTaxNative||0)*ratio);prop.annualInsuranceNative=Math.round((prop.annualInsuranceNative||0)*ratio);}
    prop.nativeMonthlyRent = Math.round(prop.nativeMonthlyRent * (1 + Math.max(0, inf)));
    prop.valueLocal = Math.round(convertCurrency(prop.nativeValue, pCountry, S.country, S.year));
  }

  /* Residential rent is indexed once in January by household settlement. */

  for (const car of S.cars) {
    car.condition = clamp((car.condition ?? 95) - 5, 20, 100);
    const inf = Math.max(0, inflationRate(S.country, S.year) / 100);
    /* Cars depreciate ~10% in real terms per year, partially offset in nominal high-inflation regimes */
    car.valueLocal = Math.max(
      Math.round(eraLocalCost(800, S.country, S.year)),
      Math.round(car.valueLocal * (1 - 0.11 + inf * 0.65))
    );
  }
}

/* Missed-payment chain, shared by every debt in the one monthly loop:
   miss 1 -> late fee (capitalised into the balance + ledger line) + credit
   score hit; miss 2 -> warning scene; miss 3 -> repossession / foreclosure
   / collections of THAT asset. `canPay` counts cash + savings + the month's
   projected net, so the savings overdraft buffer still covers a tight month. */
function debtCanPay(S, netDelta, amount) {
  return (Number(S.money.cash) || 0) + (Number(S.money.savings) || 0) + netDelta >= amount;
}

function debtMissedWarning(S,key,title,text){queueScene(S,buildDebtWarningScene(S,{key:key+'_'+S.year+'_'+S.month,title,text}));}
export function buildDebtWarningScene(S,q){
 if(!q?.key||!q?.title||!q?.text)return null;
 return{key:q.key,category:'money',title:q.title,text:q.text,debtWarningSnapshot:q,choices:[{label:'Acknowledge warning · no payment',effect:st=>{st.money.debtWarningAcknowledgments??=[];if(!st.money.debtWarningAcknowledgments.includes(q.key))st.money.debtWarningAcknowledgments.push(q.key);}}]};
}
export function restoreDebtWarningScene(S,saved){
 const q=saved?.debtWarningSnapshot||(saved?.key?.startsWith('missed_')?{key:saved.key,title:saved.title,text:saved.text}:null);
 return q?buildDebtWarningScene(S,q):null;
}

/* v2.20 I3 — business-debt repayment. The settlement never had one:
   debtLocal only ever grew (miss 1 -> fee, miss 2 -> warning, miss 3
   -> closure), misses reset to 0 on any covered losing month while the
   debt still stood ("14,294 owed, 0 missed months"), and debtLocal was
   NEVER reduced. Two paths now pay it down, both inside the
   settlement's projection accounting (netDelta, never a direct
   walletMove here):
   - a profitable month pays its old debt from its own profit first;
   - a covered losing month pays from cash left after covering the
     loss, at most half of it, so the household keeps a buffer.
   Savings are never touched. When the debt reaches 0 the miss count
   and the debt clock reset with it — and only then. */
function repayBusinessDebtFromMonth(S, biz, summary, netDelta, maxRepay) {
  const debt = Math.round(Number(biz.debtLocal) || 0);
  if (debt <= 0) return { repaid: 0, netDelta };
  const repay = Math.max(0, Math.min(debt, Math.round(Number(maxRepay) || 0)));
  if (repay <= 0) return { repaid: 0, netDelta };
  biz.debtLocal = debt - repay;
  netDelta -= repay;
  summary.debt += repay;
  recordLedgerEntry(S, -repay, `Repaid business debt — ${biz.name} (${formatMoney(biz.debtLocal, S.country)} still owed)`, 'debt', 'loan', biz.debtLocal);
  if (biz.debtLocal <= 0) {
    biz.debtLocal = 0;
    biz.misses = 0;
    biz.debtSinceYear = null;
    biz.debtSinceMonth = null;
    recordJournal(S, `${biz.name} is clear of business debt — the last of it is paid off.`, 'money');
  }
  return { repaid: repay, netDelta };
}

/* v2.20 I3 — "Repay debt" button (the card's debt line): pay down a
   business's business debt from cash right now. Amount defaults to the
   whole debt; a smaller amount pays that much. Moves cash at once (a
   UI action, outside the settlement), reduces debtLocal, and clears
   the miss count and debt clock when the debt reaches 0. NOTE FOR THE
   COORDINATOR: wire one main.js branch — data-action="biz-repay-debt"
   -> repayBusinessDebt(S, findBusiness(S, btn.dataset.biz)) — this
   file only provides the function. */
export function repayBusinessDebt(S, bizRef, amount) {
  if (!S || !S.career) return { ok: false, msg: 'No business found.' };
  migrateBusinesses(S);
  const biz = (bizRef && typeof bizRef === 'object')
    ? bizRef
    : (S.career.businesses || []).find(b => b && b.id === bizRef);
  if (!biz) return { ok: false, msg: 'No business found.' };
  const debt = Math.round(Number(biz.debtLocal) || 0);
  if (debt <= 0) return { ok: false, msg: `${biz.name} owes no business debt.` };
  const cash = Math.max(0, Math.round(Number(S.money?.cash) || 0));
  const want = amount == null ? debt : Math.max(0, Math.round(Number(amount) || 0));
  const repay = Math.min(debt, cash, want);
  if (repay <= 0) {
    return { ok: false, msg: `Repaying ${biz.name}'s debt needs cash — you have ${formatMoney(cash, S.country)} in cash against ${formatMoney(debt, S.country)} owed.` };
  }
  walletMove(S, -repay, `Repaid business debt — ${biz.name}`, 'business');
  biz.debtLocal = debt - repay;
  recordLedgerEntry(S, -repay, `Repaid business debt — ${biz.name} (${formatMoney(biz.debtLocal, S.country)} still owed)`, 'debt', 'loan', biz.debtLocal);
  if (biz.debtLocal <= 0) {
    biz.debtLocal = 0;
    biz.misses = 0;
    biz.debtSinceYear = null;
    biz.debtSinceMonth = null;
    recordJournal(S, `Paid off the last of ${biz.name}'s business debt (${formatMoney(repay, S.country)}) — it owes nothing now.`, 'money');
    return { ok: true, repaid: repay, remaining: 0, msg: `Paid off ${biz.name}'s business debt in full (${formatMoney(repay, S.country)}).` };
  }
  recordJournal(S, `Repaid ${formatMoney(repay, S.country)} of ${biz.name}'s business debt — ${formatMoney(biz.debtLocal, S.country)} still owed.`, 'money');
  return { ok: true, repaid: repay, remaining: biz.debtLocal, msg: `Repaid ${formatMoney(repay, S.country)} of ${biz.name}'s business debt — ${formatMoney(biz.debtLocal, S.country)} still owed.` };
}


/* The recurring household items that used to be a SECOND monthly pass in
   tickMegaSystemsMonthly (D3) — staff, gamiya, insurance, pets, BNPL,
   cards, Nafis top-up, creator/clinic/syndicate income, solar savings.
   They now run inside the ONE settlement, before summary.net is computed,
   so lastMonthSummary is written once and its buckets sum to the net.
   Returns the net cash delta (added to netDelta by the caller). */
function settleRecurringHouseholdItems(S, summary, netDeltaAtEntry) {
  // Projection only — like sections 1-14 above, this function NEVER moves
  // cash itself. It adjusts summary + the returned delta; the per-bucket
  // walletMoves at the end of settleHouseholdMonth apply everything once.
  // (The old mega tick walletMoved immediately AND mutated the summary
  // afterwards — that double accounting is exactly what D3 removes.)
  let d = 0;
  const avail = () => (Number(S.money.cash) || 0) + (Number(S.money.savings) || 0) + netDeltaAtEntry + d;

  /* UAE Nafis private-sector Emirati salary top-up (2021+) */
  if (S.country === 'uae' && S.year >= 2021 && S.legal.citizenships.includes('uae') && S.career.employed && S.career.job) {
    const hasDeg = S.education.degrees.length > 0;
    const childCount = S.relations.childIds.filter(id => S.people[id]?.alive && S.people[id]?.age < 21).length;
    const nafisTopUp = eraSalary((hasDeg ? 6000 : 4000) + childCount * 800, 'uae', S.year);
    summary.income += nafisTopUp;
    if (Array.isArray(summary.incomeParts)) summary.incomeParts.push({ label: 'UAE Nafis salary top-up', amount: nafisTopUp });
    d += nafisTopUp;
  }

  /* Household staff wages */
  if (S.housing.staff.length > 0) {
    const staffBill = S.housing.staff.reduce((sum, st) => sum + (st.monthlyCostLocal || 0), 0);
    summary.housing += staffBill;
    d -= staffBill;
  }

  /* Solar rooftop savings — v2.9: resolve through resolveCurrentHome so a
     rented home is found too (was: owned-properties lookup, silent miss). */
  const curProp = resolveCurrentHome(S);
  if (curProp && Array.isArray(curProp.upgrades) && curProp.upgrades.includes('solar')) {
    const solarSave = eraLocalCost(getCountry(S.country).monthlyBasket2026.utilities * 0.4, S.country, S.year);
    summary.income += solarSave;
    if (Array.isArray(summary.incomeParts)) summary.incomeParts.push({ label: 'Solar panels — money saved on electricity', amount: solarSave });
    d += solarSave;
  }

  /* Gam'iya (ROSCA) monthly contribution & lump-sum payout */
  if (S.gamiya && S.gamiya.active) {
    const gm = S.gamiya;
    gm.currentMonth += 1;
    if (gm.currentMonth === gm.slotMonth && !gm.receivedPot) {
      gm.receivedPot = true;
      summary.income += gm.potTotal;
      if (Array.isArray(summary.incomeParts)) summary.incomeParts.push({ label: `Gam'iya payout — ${gm.name}`, amount: gm.potTotal });
      d += gm.potTotal;
      S.money.lastGamiyaPayout={amount:gm.potTotal,country:S.country,at:S.year*12+S.month,name:gm.name,narrated:false};
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 8);
      recordJournal(S, `Payout day! Collected your full ${formatMoney(gm.potTotal, S.country)} lump sum from the ${gm.name}.`, 'milestone');
    }
    gm.paidTotal??=gm.monthlyContribution;gm.arrears??=0;gm.contributionHistory??=[];
    const sharePaid=avail()>=gm.monthlyContribution?gm.monthlyContribution:0;
    gm.contributionHistory.push({year:S.year,month:S.month,due:gm.monthlyContribution,paid:sharePaid});
    if (sharePaid>0) {
      gm.paidTotal+=sharePaid;
      summary.living += sharePaid;
      d -= sharePaid;
    } else {
      S.money.creditScore = clamp(S.money.creditScore - 22, 300, 850);
      for (const fid of [...S.relations.friendIds, ...S.relations.siblingIds].slice(0, 3)) {
        const fp = S.people[fid];
        if (fp && fp.alive) rememberDeed(S, fp, 'broke_promise', `Missed monthly share in ${gm.name}.`, { trust: -15, respect: -14, resentment: 18 });
      }
      gm.arrears+=gm.monthlyContribution;
      recordJournal(S, `Missed your monthly ${gm.name} share — word spread quickly through the circle, hurting your reputation!`, 'relationship');
    }
    if (gm.currentMonth >= gm.totalMonths) {
      if(gm.arrears>0)S.money.loans.push({id:nextId(S,'circledebt'),label:'Unpaid savings circle shares',balance:gm.arrears,monthlyPayment:Math.ceil(gm.arrears/12),annualRate:0,remainingMonths:12,country:S.country,missedMonths:0});
      S.money.gamiyaHistory??=[];S.money.gamiyaHistory.push({...gm,endedYear:S.year,endedMonth:S.month});
      S.gamiya = null;
      if(!gm.arrears)S.money.creditScore = clamp(S.money.creditScore + 12, 300, 850);
    }
  }

  /* Creator channel income, home-clinic fees, syndicate pension */
  if (S.creatorChannel && S.creatorChannel.monthlyIncomeLocal > 0) {
    summary.income += S.creatorChannel.monthlyIncomeLocal;
    if (Array.isArray(summary.incomeParts)) summary.incomeParts.push({ label: 'Creator channel income', amount: S.creatorChannel.monthlyIncomeLocal });
    d += S.creatorChannel.monthlyIncomeLocal;
  }
  /* v2.9: resolve through resolveCurrentHome so a rented home is found too
     (was: owned-properties lookup, silent miss for every renter). */
  const livedProp = resolveCurrentHome(S);
  if (livedProp && Array.isArray(livedProp.remodeledRooms) && livedProp.remodeledRooms.includes('private_clinic') &&
      S.education.degrees.some(dg => ['medicine', 'dentistry', 'pharmacy', 'law', 'engineering', 'architecture'].includes(dg))) {
    const clinicIncome = eraSalary(getCountry(S.country).annualSalaryTiers2026.mid / 36, S.country, S.year);
    summary.income += clinicIncome;
    if (Array.isArray(summary.incomeParts)) summary.incomeParts.push({ label: 'Private clinic income', amount: clinicIncome });
    d += clinicIncome;
  }
  if (S.syndicate?.registered && S.career.retired) {
    const synPen = eraLocalCost(getCountry(S.country).monthlyBasket2026.foodAdult * 0.45, S.country, S.year);
    summary.income += synPen;
    if (Array.isArray(summary.incomeParts)) summary.incomeParts.push({ label: 'Syndicate pension', amount: synPen });
    d += synPen;
  }

  /* Monthly insurance premiums & pet care */
  const cBasket = getCountry(S.country).monthlyBasket2026;
  let insTotal = 0;
  if (S.insurance?.health) insTotal += eraLocalCost(cBasket.foodAdult * 0.22, S.country, S.year);
  if (S.insurance?.auto && S.cars.length > 0) insTotal += eraLocalCost(cBasket.transport * 0.45, S.country, S.year);
  if (S.insurance?.home) insTotal += eraLocalCost(cBasket.utilities * 0.28, S.country, S.year);
  if (insTotal > 0 && avail() >= insTotal) {
    summary.living += insTotal;
    d -= insTotal;
  }
  if (S.pets && S.pets.length > 0) {
    const petCost = S.pets.reduce((sum, pt) => sum + Math.round(convertCurrency(pt.upkeepUsd || 25, 'usa', S.country, S.year)), 0);
    if (avail() >= petCost) {
      summary.living += petCost;
      d -= petCost;
    }
    if (S.month === 6) {
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + Math.min(6, S.pets.length * 2));
      S.player.vitals.stress = clamp(S.player.vitals.stress - 3);
    }
  }

  /* BNPL splits — same missed-payment chain as every other debt (D14) */
  const activeBnpl = [];
  for (const plan of S.bnplPlans) {
    if (plan.balanceRemaining == null) plan.balanceRemaining = Math.round(plan.monthlyPay * plan.monthsLeft);
    if (plan.missedMonths == null) plan.missedMonths = 0;
    if(plan.balanceRemaining<=0)continue;
    const splitDue=Math.min(plan.balanceRemaining,plan.monthlyPay);
    if (avail() >= splitDue) {
      summary.debt += splitDue;
      d -= splitDue;
      plan.balanceRemaining = Math.max(0, plan.balanceRemaining - splitDue);
      plan.monthsLeft -= 1;
      plan.missedMonths = 0;
      if(plan.balanceRemaining>0){plan.monthsLeft=Math.max(1,plan.monthsLeft);activeBnpl.push(plan);}
    } else {
      plan.missedMonths += 1;
      const fee = Math.max(10, Math.round(plan.monthlyPay * 0.10));
      plan.balanceRemaining = Math.round(plan.balanceRemaining + fee);
      recordLedgerEntry(S, fee, `Late fee on ${plan.label} (miss ${plan.missedMonths})`, 'debt', 'bnpl', plan.balanceRemaining);
      S.money.creditScore = clamp(S.money.creditScore - 12, 300, 850);
      if (plan.missedMonths === 2) {
        debtMissedWarning(S, `missed_bnpl_${plan.id}`, `Second Missed BNPL Split — ${plan.label}`,
          `You have missed two ${plan.label} splits. One more and the plan is cancelled and the balance sent to collections as a loan.`);
      } else if (plan.missedMonths >= 3) {
        S.money.loans.push({ id: nextId(S, 'loan'), label: `Cancelled BNPL balance: ${plan.label}`, balance: plan.balanceRemaining, monthlyPayment: Math.max(10, Math.round(plan.balanceRemaining / 12)), annualRate: 0.24, remainingMonths: 12, country: S.country, missedMonths: 0 });
        recordJournal(S, `${plan.label} was cancelled after 3 missed splits — the remaining ${formatMoney(plan.balanceRemaining, S.country)} became a collections loan.`, 'money');
        continue;
      }
      activeBnpl.push(plan);
    }
  }
  S.bnplPlans = activeBnpl;

  /* Credit cards — interest is now a ledger line (was a silent balance
     mutation); a missed minimum runs the same fee/score/warning/limit-cut
     chain as every other debt. */
  for (const cc of S.creditCards) {
    if (cc.balance > 0) {
      const interest = Math.round(cc.balance * ((cc.apr || 0.24) / 12));
      if (interest > 0) {
        cc.balance += interest;
        recordLedgerEntry(S, interest, `Card interest (${cc.name})`, 'debt', 'card', cc.balance);
      }
      const minDue = Math.min(cc.balance,Math.max(10, Math.round(cc.balance * 0.05)));
      if (cc.missedMonths == null) cc.missedMonths = 0;
      if (avail() >= minDue) {
        summary.debt += minDue;
        d -= minDue;
        cc.balance = Math.max(0, cc.balance - minDue);
        cc.missedMonths = 0;
        if (cc.balance === 0) S.money.creditScore = clamp(S.money.creditScore + 8, 300, 850);
      } else {
        cc.missedMonths += 1;
        const fee = Math.max(25, Math.round(cc.balance * 0.05));
        cc.balance = Math.round(cc.balance + fee);
        recordLedgerEntry(S, fee, `Late fee on ${cc.name} (miss ${cc.missedMonths})`, 'debt', 'card', cc.balance);
        S.money.creditScore = clamp(S.money.creditScore - 15, 300, 850);
        if (cc.missedMonths === 2) {
          debtMissedWarning(S, `missed_card_${cc.id}`, `Second Missed Card Payment — ${cc.name}`,
            `You have missed two minimum payments on ${cc.name}. One more and the bank cuts your limit and raises your APR.`);
        } else if (cc.missedMonths >= 3 && !cc.limitCutApplied) {
          cc.limitCutApplied = true;
          cc.limit = Math.max(100, Math.round(cc.limit * 0.5));
          cc.apr = Math.round(((cc.apr || 0.24) + 0.06) * 1000) / 1000;
          cc.missedMonths = 0;
          S.money.creditScore = clamp(S.money.creditScore - 20, 300, 850);
          recordJournal(S, `After 3 missed minimums, ${cc.name} cut your limit to ${formatMoney(cc.limit, S.country)} and raised your APR to ${Math.round(cc.apr * 100)}% (penalty APR).`, 'money');
        }
      }
    }
  }
  return d;
}

/* Settle one adult month (18+ ONLY) — transparent, penny-exact, zero ghost charges */
export function settleHouseholdMonth(S) {
  reviewPersonalReceivables(S);
  if(S)reconcilePlayerLease(S);
  /* v2.15 W3 — the monthly settlement refills social energy. Placed
     before the under-18 early return, so the refill is the settlement's
     own job, not an adult-only afterthought (childhood turns refill in
     gameLoop's yearly branch, which has no monthly settlement). */
  if (S) refillSocialEnergy(S); /* v2.15 W3 */
  if (!S || S.player.age < 18) return;

  const cObj = getCountry(S.country);
  const summary = { income: 0, tax: 0, housing: 0, living: 0, debt: 0, support: 0, net: 0, incomeParts: [], payrollDeductions: 0, businessTax: 0 };
  let netDelta = 0;
  /* v2.15 W2 — this month's pension amounts, captured in §1 from the
     pay that actually landed and accrued into the pot at the end of
     the settlement (see the block after the v2.14 manager tick). */
  let pensionAccrual = null;
  /* v2.15 W4 — what the world is doing to this country's money this
     month (1 / 0 when nothing is active, so the settlement is untouched
     in quiet years). Read once here, used by salary (§1), business (§3)
     and savings (§7) below. */
  const wEff = worldEventEffects(S, S.country);
  /* v2.7 — every income line names its source in plain words. addIncome is
     the only way income enters the summary: the label is what the monthly
     statement and the ledger show, so a schoolboy never sees a bare
     "salary" and no amount ever arrives from nowhere. */
  const addIncome = (amt, label) => {
    const a = Math.round(Number(amt) || 0);
    if (a <= 0) return 0;
    summary.income += a;
    summary.incomeParts.push({ label, amount: a });
    return a;
  };

  /* 1. EMPLOYMENT SALARY — paid only while the player may legally work.
     Undocumented / grace-period players earn NO salary this month (the visa
     tick pays only informal hustle cash); the fact is journalled once until
     status is valid again. */
  const legallyEmployed = canLegallyEarnSalary(S);
  if (!legallyEmployed && (S.career.employed || S.career.business) && !S.money._salaryWithheldNoted) {
    S.money._salaryWithheldNoted = true;
    recordJournal(S, `With no valid work authorisation in ${cObj.name}, your employer cannot legally pay you this month — salary is withheld until your status is regularised.`, 'visa');
  }
  if (legallyEmployed) S.money._salaryWithheldNoted = false;
  if (legallyEmployed && S.career.employed && S.career.job) {
    const job = S.career.job;
    /* A dated statutory minimum wage (see STATUTORY_MIN_WAGE_ROWS) lifts any
       saved job paid below it. Only dated legal rows trigger this; the
       game-indexed extension past the last row does not rewrite saved jobs. */
    {
      const legalFloor = statutoryMinMonthlyGross(S.country, S.year, { datedOnly: true, month: S.month });
      const frac = (job.employmentFraction === 0.45 || /^part-time/i.test(job.title || '')) ? 0.45 : 1;
      const need = Math.round(legalFloor * frac);
      if (need > 0 && Number(job.monthlyGross) < need) {
        job.monthlyGross = need;
        recordJournal(S, `The legal minimum wage now applies to your job, and your pay was raised to ${formatMoney(need, S.country)} a month.`, 'money');
      }
    }
    /* v2.8: overtime pays the REAL per-country overtime rate (20 extra hours
       at that country's multiplier on the hourly rate) — not a flat +15%
       for every job in every country. computeOvertimePay is the one source. */
    const duty=flyingDutyStatus(S);
    if(duty.grounded&&!job.groundedNoted){job.groundedNoted=true;recordJournal(S,'Flying duties suspended: renew the overdue medical and simulator checks under Train & Licences. Employer assigns temporary ground duty at 50% base pay in this simplified game policy; no flying overtime. This pay policy is not a real airline contract.','career');}
    if(!duty.grounded)job.groundedNoted=false;
    const overtimeGross = !duty.grounded&&job.workMode === 'overtime' ? computeOvertimePay(job, S.country) : 0;
    /* v2.15 W4 — a world event moves pay while it lasts: a crisis cuts it,
       an oil boom lifts it. The payslip still runs on the adjusted gross,
       so tax and social insurance follow the real pay. */
    const salaryMult = wEff.salary;
    const gross = Math.round((job.monthlyGross*duty.payFraction + overtimeGross) * salaryMult);
    const isCit = isCitizenOrPermanentInCurrentCountry(S);
    const pay = computeMonthlyNetPay(gross, S.country, S.year, isCit);

    /* Check Exploitative Gulf Sponsor delayed wage risk */
    let paidThisMonth = true;
    if (S.legal.residency.kind === 'gulf_iqama' && S.legal.residency.sponsorArchetype) {
      const arch = GULF_SPONSOR_ARCHETYPES[S.legal.residency.sponsorArchetype];
      if (arch && rand(S) > arch.paysOnTimeChance) {
        paidThisMonth = false;
        S.player.vitals.stress = clamp(S.player.vitals.stress + 7);
        recordJournal(S, `${job.employer} delayed monthly payroll again — HR promised "next week."`, 'money');
      }
    }

    if (paidThisMonth && pay.net > 0) {
      /* v2.15 W4 — the ledger line says so plainly when pay is cut or
         lifted by a world event, naming the event. */
      const salaryNote = salaryMult !== 1
        ? ` — pay at ${Math.round(salaryMult * 100)}% while ${wEff.activeNames.join(', ')} lasts`
        : '';
      netDelta += addIncome(pay.net, `Salary — ${job.employer} (${job.title})${duty.grounded?' [ground duty, 50% base pay]':''}${salaryNote}`);
      summary.tax += (pay.incomeTax + pay.socialSecurity);
      summary.payrollDeductions += (pay.incomeTax + pay.socialSecurity);
      /* v2.15 W2 — pension: this month's contribution is taken from the
         payslip of the pay that actually landed (gross after any
         world-event pay move), so the pot never records money that was
         not paid. Accrued into the pot at the end of the settlement. */
      pensionAccrual = pensionSlipFor(gross, S.country, S.year, isCit);
    }
  }

  /* 2. MILITARY CONSCRIPTION STIPEND */
  if (S.legal.military.status === 'active_duty') {
    const stip = eraSalary(cObj.conscription?.monthlyStipend2026 || 2500, S.country, S.year);
    netDelta += addIncome(stip, 'Military conscription stipend');
  }

  /* v2.11 W1 — per-business P&L lines collected here so the apply stage
     below can post them as THREE separate ledger lines per business
     (revenue in, costs out, tax out) instead of burying costs in the
     one monthly living lump. */
  let bizSettleCosts = 0;
  let bizSettlePLs = [];
  /* Severance already paid out of personal cash by W2's fireAllStaff
     during a miss-3 closure (its own ledger lines, moved at once) —
     kept out of the generic debt lump below so it is never paid twice. */
  let bizSettleSeverancePaid = 0;

  /* 3. SMALL BUSINESS MONTHLY P&L (v2.11 W1) — every business pays its
     own P&L into the ledger, REAL (Verdant's P&L is fake: its
     restaurant's -$115k/yr and Pawn Shop's $7k/mo running costs NEVER
     hit personal cash — ours do, every pound of revenue, rent, wages,
     other costs and tax):
       revenue in (its own income line, naming the business),
       costs out (rent + wages + other, broken out in the label),
       tax out (the country's own income-tax brackets on profit).
     Net = revenue - costs - tax, and the profit that lands is NET of
     tax (landing it gross, untaxed, was a bug). A business losing money
     for months in a row is tracked in monthsLosing; a month the
     household cannot cover runs the debt chain — miss 1 -> late fee
     capitalised into biz.debtLocal, miss 2 -> warning scene,
     miss 3 -> closure/repossession (salvage paid, staff fired).
     Business profit is paid only while the player may legally work,
     like salary (see §1). */
  if (legallyEmployed) {
    migrateBusinesses(S);
    for (const biz of [...(S.career.businesses || [])]) {
      /* v2.15 W4 — the world-event revenue factor goes in as the one
         multiplier input; businessMonthly.js does nothing else with it. */
      /* v2.17 W2 — a dead business settles nothing (the fold returns a
         zero P&L anyway; this only avoids noise in the settlement). */
      if (biz.dead) continue;
      if(biz.estateTrust){if(S.player.age<18)continue;delete biz.estateTrust;}
      const pl = computeBusinessMonthFull(S, biz, { worldRevenueMult: wEff.businessRevenue });
      if (pl.net >= 0) {
        biz.monthsLosing = 0;
        netDelta += pl.net;
        const debtFirst=repayBusinessDebtFromMonth(S,biz,summary,netDelta,pl.net);netDelta=debtFirst.netDelta;pl.debtRepaid=debtFirst.repaid;
        const distributable=Math.max(0,pl.net-debtFirst.repaid);pl.distributable=distributable;const retained=Math.round(distributable*(biz.familyRetention||0));if(retained>0){biz.retainedCash=(biz.retainedCash||0)+retained;netDelta-=retained;summary.living+=retained;pl.familyRetained=retained;}
        const investorPct=biz.tech?.investorShare??biz.enterprise?.investorShare??null;pl.investorDistribution=investorPct==null?Math.round((pl.investorDistribution||0)*(distributable-retained)/Math.max(1,pl.net)):Math.round((distributable-retained)*investorPct/100);
        const familyPool=distributable-retained;for(const co of biz.familyCoOwners||[]){const distribution=Math.round(familyPool*co.equityPercent/100),person=S.people[co.personId];netDelta-=distribution;summary.living+=distribution;if(person){person.career??={};person.career.savingsLocal=(person.career.savingsLocal||0)+convertCurrency(distribution,S.country,person.residenceCountry||S.country,S.year);}recordLedgerEntry(S,-distribution,'Family company dividend','family','business',0);}
        const formerShares=(biz.divorceCoOwners||[]).reduce((n,c)=>n+(c.equityPercent||0),0);
        if(formerShares>0){const distribution=Math.round(familyPool*formerShares/100);netDelta-=distribution;summary.living+=distribution;for(const co of biz.divorceCoOwners){const person=S.people[co.personId];if(person){person.career??={};person.career.savingsLocal=(person.career.savingsLocal||0)+convertCurrency(distribution*(co.equityPercent/formerShares),S.country,person.residenceCountry||S.country,S.year);}}recordLedgerEntry(S,-distribution,'Divorce business co-owner profit distribution','family','business',0);}
        pl.coOwnerDistribution=Math.round(familyPool*formerShares/100)+(biz.familyCoOwners||[]).reduce((n,c)=>n+Math.round(familyPool*c.equityPercent/100),0);pl.ownerCash=familyPool-pl.coOwnerDistribution-(pl.investorDistribution||0);
        if(pl.investorDistribution>0){netDelta-=pl.investorDistribution;summary.living+=pl.investorDistribution;recordLedgerEntry(S,-pl.investorDistribution,`Startup investor profit share — ${biz.name}`,'business','business',0);}
        addIncome(pl.revenue, `Business revenue — ${biz.name}`);
        summary.living += pl.costs;
        summary.tax += pl.tax;
        summary.businessTax += pl.tax;
        bizSettleCosts += pl.costs;
        bizSettlePLs.push(pl);
        /* v2.20 I3 — a profitable month pays its old debt from its own
           profit first. Misses reset only when the debt is gone (the
           helper does it); a profitable month with debt still standing
           keeps its miss count — the old unconditional reset hid the
           debt ("14,294 owed, 0 missed months"). */
        if((biz.debtLocal||0)<=0)biz.misses=0;
      } else {
        /* v2.21 — a staged company that has not opened yet cannot earn: its preparation months are a startup cost, not a losing streak (the streak feeds the failing-business flag and staff morale). */
        biz.monthsLosing = (biz.enterprise && biz.enterprise.stage && biz.enterprise.stage !== 'trading') ? 0 : (biz.monthsLosing || 0) + 1;
        const shortfall = Math.abs(pl.net);
        const avail = (Number(S.money.cash) || 0) + (Number(S.money.savings) || 0) + netDelta + (pl.fundingUsed||0);
        if (avail >= shortfall) {
          /* Household covers the loss this month — the money really moves. */
          netDelta += pl.net+(pl.fundingUsed||0);
          if(pl.fundingUsed>0)addIncome(pl.fundingUsed,`Company reserve used — ${biz.name}`);
          addIncome(pl.revenue, `Business revenue — ${biz.name}`);
          summary.living += pl.costs;
          summary.tax += pl.tax;
          summary.businessTax += pl.tax;
          bizSettleCosts += pl.costs;
          bizSettlePLs.push(pl);
          /* v2.20 I3 — a covered losing month does NOT reset the miss
             count while debt still stands. Cash left after covering
             the loss pays the debt down (at most half of it, so the
             household keeps a buffer). Misses reset only when the
             debt reaches 0. */
          if ((Number(biz.debtLocal) || 0) > 0) {
            const cashAfterLoss = (Number(S.money.cash) || 0) + netDelta;
            const r = repayBusinessDebtFromMonth(S, biz, summary, netDelta, Math.floor(Math.max(0, cashAfterLoss) / 2));
            netDelta = r.netDelta;
          }
          if ((Number(biz.debtLocal) || 0) <= 0) biz.misses = 0;
        } else {
          /* Cannot cover it: the bills go unpaid and become business
             debt. Revenue still lands (money earned is money earned);
             the unpaid costs + late fee are capitalised into
             biz.debtLocal, never silently frozen (Verdant's startup
             froze silently for 5 years when its runway expired — no
             bankruptcy, no dialog. That failure mode is not repeated). */
          biz.misses = (biz.misses || 0) + 1;
          const fee = Math.max(10, Math.round(pl.costs * 0.05));
          /* v2.20 I3 — the debt clock starts the first month the debt
             appears, so the card can say when it began ("from 1 missed
             month (June 2022)"). */
          if (!((Number(biz.debtLocal) || 0) > 0)) {
            biz.debtSinceYear = S.year;
            biz.debtSinceMonth = S.month;
          }
          biz.debtLocal = Math.round((biz.debtLocal || 0) + Math.max(0,pl.costs-(pl.fundingUsed||0)) + fee);
          netDelta += pl.revenue;
          addIncome(pl.revenue, `Business revenue — ${biz.name}`);
          applyUnpaidWagesMorale(biz); /* W2: unpaid wages sink team morale −10 */
          recordLedgerEntry(S, pl.costs, `Unpaid ${biz.name} costs — added to business debt (miss ${biz.misses})`, 'debt', 'loan', biz.debtLocal);
          recordLedgerEntry(S, fee, `Late fee on ${biz.name} unpaid costs (miss ${biz.misses})`, 'debt', 'loan', biz.debtLocal);
          S.money.creditScore = clamp(S.money.creditScore - 12, 300, 850);
          const catchUpActive = Number(biz.fate?.bankCatchUpUntil) >= S.year * 12 + S.month;
          /* One warning per missed-bill streak, whatever the bank's catch-up window says: the window pauses closure, it never removes the warning. The streak is identified by the month the debt began. */
          const streak = `${biz.debtSinceYear}-${biz.debtSinceMonth}`;
          biz.fate ??= {};
          const warned = biz.fate.closureWarnedStreak === streak;
          if (biz.misses === 2 && !warned) {
            biz.fate.closureWarnedStreak = streak;
            debtMissedWarning(S, `missed_biz_${biz.id}`, `Second Missed Business Payment — ${biz.name}`,
              `${biz.name} has missed two months of its bills (${formatMoney(biz.debtLocal, S.country)} now owed). ${catchUpActive ? 'Your bank\'s catch-up window pauses closure for now, but it ends soon. ' : ''}One more missed month once the pause is over and the business will be closed and sold for salvage — repay the bills if you have the cash: use the Repay debt button on the business card (Career, Enterprises).`);
          } else if (catchUpActive) {
            recordJournal(S, `${biz.name} remains open under its catch-up agreement. Bills and late fees still add to the debt.`, 'money');
          } else if (biz.misses >= 3 && !warned) {
            /* The window ended with the streak never warned about: warn now and close only if the next month is missed too. */
            biz.fate.closureWarnedStreak = streak;
            biz.misses = 2;
            debtMissedWarning(S, `missed_biz_${biz.id}_final_${S.year}_${S.month}`, `Final Warning — ${biz.name}`,
              `The catch-up window for ${biz.name} has ended and ${formatMoney(biz.debtLocal, S.country)} is still owed. Miss one more month and the business will be closed and sold for salvage — repay the bills if you have the cash: use the Repay debt button on the business card (Career, Enterprises).`);
          } else if (biz.misses >= 3) {
            const closed = closeBusiness(S, biz, '3 missed monthly payments', { viaSettlement: true });
            if (closed.ok && closed.salvage > 0) {
              netDelta += closed.salvage;
              addIncome(closed.salvage, `Salvage sale — ${biz.name} (closed after 3 missed payments)`);
            }
            /* Severance already left personal cash inside fireAllStaff:
               count it in the month's net and debt bucket here, and keep
               it out of the generic debt lump below (paid once, not twice). */
            const paidSev = closed.severancePaid || 0;
            if (paidSev > 0) {
              netDelta -= paidSev;
              summary.debt += paidSev;
              bizSettleSeverancePaid += paidSev;
            }
          }
        }
      }
      /* v2.14 §2 — harvest policy: the manager takes cash out of the
         business's capital (pl.harvestOut, already deducted from
         biz.capitalInvested by the monthly fold). Posted only when the
         business did not miss its bills this month — unpaid bills
         come first. */
      if ((S.career.businesses || []).includes(biz) && (biz.misses || 0) === 0 && (pl.harvestOut || 0) > 0) {
        netDelta += pl.harvestOut;
        addIncome(pl.harvestOut, `Harvest cash out — ${biz.name}`);
      }
      /* W2's monthly staff tick: a low-morale employee (morale < 25)
         may quit on their own — only for businesses still standing
         after this month's P&L. */
      if ((S.career.businesses || []).includes(biz)) {
        monthlyStaffTick(S, biz);
        /* v2.11 W3: rented lease countdown — months left on the lease. */
        tickBusinessPremisesMonth(S, biz);
      }
    }
    /* Workload (v2.11 W1, Verdant finding): a business takes time.
       Over 50 hrs/week total -> "Stretched", +5 stress/month and
       job performance −2/month; a part-time business alongside a job
       also costs −2 performance/month. Applied once a month, here. */
    applyWorkloadMonth(S);
    /* v2.11 W4: remote businesses lose 0.02 repeat rate/month while
       the player is abroad. No money moves here — revenue ×0.7 and the
       manager's wage are already in computeBusinessMonth. */
    tickRemoteBusinesses(S);
  }

  /* 4. RETIREMENT PENSION */
  settleUSRetirement(S);
  if (S.career.retired && S.career.monthlyPension > 0) {
    netDelta += addIncome(S.career.monthlyPension, 'Retirement pension');
  }

  /* 5. PARENTAL UNIVERSITY POCKET ALLOWANCE (Strictly ages out at 23 or graduation!) */
  if (S.money.parentalAllowanceActive) {
    if (S.player.age >= 23 || (!S.education.university && S.education.stage !== 'graduated_high')) {
      S.money.parentalAllowanceActive = false;
    } else if (S.education.university && S.country === S.homeCountry) {
      const dad = S.relations.fatherId ? S.people[S.relations.fatherId] : null;
      const mom = S.relations.motherId ? S.people[S.relations.motherId] : null;
      const parentAlive = (dad && dad.alive) || (mom && mom.alive);
      if (parentAlive) {
        const tierMult = FAMILY_TIERS[S.familyTier]?.salaryMult || 1.0;
        const pocketScale = clamp(0.42 + tierMult * 0.45, 0.55, 2.85);
        const pocket = eraLocalCost(cObj.monthlyBasket2026.foodAdult * pocketScale, S.country, S.year);
        netDelta += addIncome(pocket, 'Pocket money from your parents (university)');
      }
    }
  }

  /* 6. BLOCKED ACCOUNT MONTHLY RELEASE (Sperrkonto in Germany / GIC in Canada) */
  if (S.legal.blockedAccount && S.legal.blockedAccount.country === S.country && S.legal.blockedAccount.balanceLocal > 0) {
    const rel = Math.min(S.legal.blockedAccount.balanceLocal, S.legal.blockedAccount.monthlyReleaseLocal);
    S.legal.blockedAccount.balanceLocal -= rel;
    S.legal.blockedAccount.balanceInPlayerLocal = S.legal.blockedAccount.balanceLocal;
    netDelta += addIncome(rel, `${S.legal.blockedAccount.kind} monthly release`);
    if (S.legal.blockedAccount.balanceLocal <= 0) {
      recordJournal(S, `Your ${S.legal.blockedAccount.kind} released its final monthly installment.`, 'money');
      S.legal.blockedAccount = null;
    }
  }

  /* 7. BANK SAVINGS & CERTIFICATES OF DEPOSIT (SHAHADAT) INTEREST */
  const rates = eraDepositRates(S.country, S.year);
  /* v2.15 W4 — a world event moves the rate: the 2008 crisis cut rates,
     so savings earn less that year; Egypt's 2024 float raised them. */
  const savRate = Math.max(0.001, rates.savings + wEff.rateShift);
  if (S.money.savings > 0) {
    const savYield = Math.round((S.money.savings * (savRate / 12)) * 100) / 100;
    if (savYield > 0) {
      moveBalance(S, 'savings', savYield, 'Bank savings interest', 'bank');
      S.money.savingsInterestTotal = Math.round(((Number(S.money.savingsInterestTotal) || 0) + savYield) * 100) / 100;
    }
  }
  const activeCerts = [];
  for (const cd of S.money.certificates) {
    const monthlyCoupon = Math.round(cd.principal * (cd.annualRate / 12));
    netDelta += addIncome(monthlyCoupon, `Bank certificate interest — ${cd.bankName}`);
    if (S.year > cd.maturityYear || (S.year === cd.maturityYear && S.month >= cd.maturityMonth)) {
      netDelta += addIncome(cd.principal, `Bank certificate matured — ${cd.bankName} (principal back)`);
      recordJournal(S, `Your ${cd.bankName} certificate matured, returning ${formatMoney(cd.principal, S.country)} principal to your account.`, 'money');
    } else {
      activeCerts.push(cd);
    }
  }
  S.money.certificates = activeCerts;

  /* 8. RENTAL INCOME & PROPERTY INSTALLMENTS (AQSAT / MORTGAGES) */
  for (const prop of S.housing.properties) {
    prop.valueLocal = Math.round(convertCurrency(prop.nativeValue, prop.country, S.country, S.year));
    /* v2.15 W1 — landlord tick for every property (condition decay,
       market value, lease / eviction / damage / tenant search); it
       never moves cash — money it discovers arrives as pendingMoves
       and is posted below through the settlement's own buckets. */
    tickLandlordMonth(S, prop);
    if (prop.rentedOut && prop.id !== S.housing.currentHomeId) {
      const ll = landlordRentForMonth(S, prop);
      if (ll) {
        if (ll.amount > 0) netDelta += addIncome(ll.amount, ll.label);
        if (ll.voidCost > 0) {
          netDelta -= ll.voidCost;
          summary.housing += ll.voidCost;
        }
        for (const mv of (ll.pending || [])) {
          if (mv.bucket === 'income' && mv.amount > 0) {
            netDelta += addIncome(mv.amount, mv.label);
          } else if (mv.bucket === 'housing') {
            netDelta += mv.amount;
            summary.housing += -mv.amount;
          }
        }
      } else {
        const rentInLocal = Math.round(convertCurrency(prop.nativeMonthlyRent * 0.88, prop.country, S.country, S.year));
        netDelta += addIncome(rentInLocal, `Rent from ${prop.name}`);
      }
    }
    if (prop.monthsLeft > 0 && prop.nativeMonthlyInstallment > 0) {
      if (!Number.isFinite(prop.nativeInstallmentRemaining)) {
        prop.nativeInstallmentRemaining = Number.isFinite(prop.installmentRemaining)
          ? Math.round(convertCurrency(prop.installmentRemaining,S.country,prop.country,S.year))
          : prop.nativeMonthlyInstallment*prop.monthsLeft;
      }
      const nativeDue = Math.min(prop.nativeMonthlyInstallment, Math.max(0,prop.nativeInstallmentRemaining));
      const instLocal = Math.round(convertCurrency(nativeDue, prop.country, S.country, S.year));
      /* v2.18 W2 — a payment holiday granted by the bank after a job
         loss (careerConsequences: prop.paymentHolidayUntil, a month
         index): no instalment is due while it lasts, and no missed
         payment is recorded — the months are added at the end. */
      const holidayUntil = Number(prop.paymentHolidayUntil) || 0;
      const nowIdx = (Number(S.year) || 0) * 12 + (Number(S.month) || 1);
      if (holidayUntil >= nowIdx) {
        /* Holiday month: nothing due, nothing missed, monthsLeft
           untouched — the term simply runs longer. */
      } else if (debtCanPay(S, netDelta, instLocal)) {
        netDelta -= instLocal;
        summary.housing += instLocal;
        prop.monthsLeft -= 1;
        prop.missedMonths = 0;
        prop.nativeInstallmentRemaining = Math.max(0, prop.nativeInstallmentRemaining - nativeDue);
        prop.installmentRemaining = Math.round(convertCurrency(prop.nativeInstallmentRemaining, prop.country, S.country, S.year));
        if (prop.nativeInstallmentRemaining <= 0) {
          prop.monthsLeft = 0;
          prop.nativeInstallmentRemaining = 0;
          prop.installmentRemaining = 0;
          recordJournal(S, `Paid off the final installment on ${prop.name}! You now hold clear 100% title.`, 'milestone');
        } else {
          prop.monthsLeft = Math.max(1,prop.monthsLeft);
        }
      } else {
        // Missed instalment: late fee capitalised, score hit, warning, then
        // foreclosure of THIS property (auctioned at 70% of value).
        prop.missedMonths = (prop.missedMonths || 0) + 1;
        const feeLocal = Math.max(10, Math.round(instLocal * 0.05));
        const feeNative = Math.round(convertCurrency(feeLocal, S.country, prop.country, S.year));
        prop.nativeInstallmentRemaining = (prop.nativeInstallmentRemaining || 0) + feeNative;
        prop.installmentRemaining = Math.round(convertCurrency(prop.nativeInstallmentRemaining, prop.country, S.country, S.year));
        recordLedgerEntry(S, feeLocal, `Late fee on ${prop.name} instalment (miss ${prop.missedMonths})`, 'debt', 'loan', prop.installmentRemaining);
        S.money.creditScore = clamp(S.money.creditScore - 12, 300, 850);
        if (prop.missedMonths === 2) {
          debtMissedWarning(S, `missed_inst_${prop.id}`, `Second Missed Instalment — ${prop.name}`,
            `You have missed two monthly instalments on ${prop.name}. One more missed payment and the lender will foreclose and auction the property.`);
        } else if (prop.missedMonths >= 3) {
          const auctionValue = Math.round(prop.valueLocal * 0.70);
          const shortfall = Math.max(0, prop.installmentRemaining - auctionValue);
          const surplus = Math.max(0, auctionValue - prop.installmentRemaining);
          S.housing.properties = S.housing.properties.filter(x => x.id !== prop.id);
          if (S.housing.currentHomeId === prop.id) {
            S.housing.currentHomeId = null;
            S.housing.mode = 'rent';
            S.housing.currentHomeName = `${S.city} Leased Apartment`;
            S.housing.monthlyRent = eraLocalCost(getCountry(S.country).monthlyBasket2026.rentStandard, S.country, S.year);
          }
          if (surplus > 0) walletMove(S, surplus, `Foreclosure auction surplus: ${prop.name}`, 'housing');
          if (shortfall > 0) {
            S.money.loans.push({ id: nextId(S, 'loan'), label: `Foreclosure shortfall: ${prop.name}`, balance: shortfall, monthlyPayment: Math.max(10, Math.round(shortfall / 24)), annualRate: 0.18, remainingMonths: 24, country: S.country, missedMonths: 0 });
          }
          recordJournal(S, `The lender foreclosed on ${prop.name} after 3 missed instalments and auctioned it for ${formatMoney(auctionValue, S.country)}.${shortfall > 0 ? ` The ${formatMoney(shortfall, S.country)} shortfall became a court debt.` : ''}`, 'money');
        }
      }
    }
  }

  /* 9. SPOUSE CONTRIBUTION — every split, one ledger, no double-count.
     RULE (v2.9): a co-resident working spouse's pay reaches the household
     ledger under EVERY split; what the spouse keeps stays theirs.
       traditional_provider — spouse puts in 25%, keeps 75% (the player is
         the provider; the spouse's pay is mostly theirs).
       shared_50_50        — spouse puts in 55%, keeps 45%.
       proportional         — spouse puts in 40%, keeps 60%.
     The ledger line names all three numbers (earns / keeps / puts in) and
     the split, so the split is visible, not implied.
     NO DOUBLE-COUNT: the yearly NPC tick (soulEngine tickNpcAutonomyYearly)
     credits the spouse's own savings with saveRate x 12 x FULL monthly
     income. Money already paid into the household must not also pile up in
     the spouse's savings, so each month we take contrib x saveRate back out
     of the spouse's savings (same saveRate rule as the tick: 6% when
     materialism > 70, else 16%). Over a year the spouse's savings then grow
     by saveRate x 12 x (income - contrib) — exactly what they kept. */
  const coResidentSpouses = S.relations.spouseIds
    .map(id => S.people[id])
    .filter(sp => sp && sp.alive && sp.relationshipProgress?.stage!=='separated' && sp.residenceCountry === S.country);

  for (const sp of coResidentSpouses) {
    const spIncome = Number(sp.career?.monthlyIncomeLocal) || 0;
    if (spIncome <= 0) continue;
    const split = S.marriage.householdSplit || 'traditional_provider';
    const share = split === 'shared_50_50' ? 0.55 : split === 'proportional' ? 0.40 : 0.25;
    const splitLabel = split === 'shared_50_50' ? 'shared 50/50' : split === 'proportional' ? 'proportional' : 'traditional provider';
    const contrib = Math.round(spIncome * share);
    const kept = spIncome - contrib;
    if (contrib > 0) {
      netDelta += addIncome(contrib, `Spouse income — ${sp.firstName} earns ${formatMoney(spIncome, S.country)}/mo, keeps ${formatMoney(kept, S.country)}, puts ${formatMoney(contrib, S.country)} in the shared pot (${splitLabel})`);
      /* Anti-double-count (see rule above): the spouse's own savings must
         only grow on the income they kept, not on the share already paid
         into the household ledger this month. */
      if (sp.career) {
        const saveRate = (sp.traits?.materialism || 0) > 70 ? 0.06 : 0.16;
        sp.career.savingsLocal = Math.max(0, Math.round((Number(sp.career.savingsLocal) || 0) - contrib * saveRate));
      }
    }
  }

  /* 10. HOUSING RENT */
  if (S.housing.mode === 'rent' && S.housing.monthlyRent > 0) {
    if(S.month===1&&S.housing.rentIndexedYear!==S.year){
      const oldRent=S.housing.monthlyRent;
      const ratio=eraLocalCost(10000,S.country,S.year)/eraLocalCost(10000,S.country,S.year-1);
      S.housing.monthlyRent=Math.round(oldRent*ratio);S.housing.rentIndexedYear=S.year;
      recordJournal(S,`Annual game rent index: ${formatMoney(oldRent,S.country)} to ${formatMoney(S.housing.monthlyRent,S.country)}/month, following the game price basket. Not a local tenancy-law model.`,'housing');
    }
    tickPlayerRentalDamage(S);
    const credit=S.housing.repairCredit;
    const applied=credit&&credit.country===S.country&&credit.homeId===S.housing.currentHomeId?Math.min(S.housing.monthlyRent,Math.max(0,Number(credit.amount)||0)):0;
    if(credit){if(applied>0){credit.amount-=applied;recordJournal(S,`Applied ${formatMoney(applied,S.country)} game repair credit against rent.`,'housing');}if(credit.amount<=0||credit.country!==S.country||credit.homeId!==S.housing.currentHomeId)S.housing.repairCredit=null;}
    const rentRecord=recordPlayerRentDue(S,S.housing.monthlyRent-applied,S.money.cash+netDelta+Math.max(0,S.money.savings||0));
    netDelta -= S.housing.monthlyRent-applied-(rentRecord?.unpaid||0);
    summary.housing += S.housing.monthlyRent-applied-(rentRecord?.unpaid||0);
    summary.rentArrearsAdded=rentRecord?.unpaid||0;
  }

  if(S.housing.mode==='parents'&&S.player.age>=24){
    const board=eraLocalCost(cObj.monthlyBasket2026.rentModest*.35,S.country,S.year);
    netDelta-=board;summary.housing+=board;
    S.housing.familyBoardMonthly=board;
  }

  for(const p of S.housing.properties||[])if(p.ruralCabin){
    const costs=(Number(p.annualTaxNative)||0)+(Number(p.annualInsuranceNative)||0)+(Number(p.nativeValue)||0)*(p.maintenanceRate||.03);
    const monthly=Math.round(convertCurrency(costs/12,p.country,S.country,S.year));netDelta-=monthly;summary.housing+=monthly;
  }

  /* 11. HOUSEHOLD LIVING BASKET (Food, Utilities, Transport/Car, Kids, Lifestyle) */
  const coResidentKids = S.relations.childIds
    .map(id => S.people[id])
    .filter(ch => ch && ch.alive && ch.age < 19 && ch.residenceCountry === S.country && ch.householdWith!=='ex_spouse' && (!ch.householdWith||ch.householdWith==='player'));

  const livingWithParentsFree = S.housing.mode === 'parents' && S.player.age < 24 && coResidentSpouses.length === 0;
  const lifeMult = LIFESTYLE_MULTS[S.money.lifestyleMode] || 1.0;

  let monthlyLiving = 0;
  if (livingWithParentsFree) {
    monthlyLiving = eraLocalCost((cObj.monthlyBasket2026.transport + cObj.monthlyBasket2026.phoneInternet) * lifeMult, S.country, S.year);
  } else {
    const adults = 1 + coResidentSpouses.length + residentAdultChildren(S).length;
    const baseFood = cObj.monthlyBasket2026.foodAdult * adults + cObj.monthlyBasket2026.foodChild * childFoodEquivalent(S);
    const baseUtil = S.housing.mode === 'parents' ? cObj.monthlyBasket2026.utilities * 0.5 : cObj.monthlyBasket2026.utilities;
    const baseTrans = S.cars.length > 0 ? 0 : cObj.monthlyBasket2026.transport;
    monthlyLiving = eraLocalCost((baseFood + baseUtil + baseTrans + cObj.monthlyBasket2026.phoneInternet) * lifeMult, S.country, S.year);
  }

  for (const car of S.cars) {
    { const up = Math.round(car.monthlyUpkeep || 0); if (!(car.familyCoversUpkeep && familyPaysCarUpkeep(S, up))) monthlyLiving += up; } /* family-covered upkeep comes out of the fund, never from nowhere */
  }

  // The funding shown before enrollment is the funding used for billing.
  settleFamilyUniversityMonth(S);
  monthlyLiving += monthlyUniversityTuition(S);
  monthlyLiving += settleChildCourses(S);
  monthlyLiving += (S.housing.properties||[]).reduce((n,p)=>n+Math.round(convertCurrency((p.outdoorAnnualNative||0)/12,p.country,S.country,S.year)),0);

  netDelta -= monthlyLiving;
  summary.living += monthlyLiving;

  /* 12. SAUDI EXPAT DEPENDENT LEVY (400 SAR/mo per dependent from July 2017+) */
  if (
    S.country === 'sau' &&
    S.year >= 2017 &&
    S.legal.residency.kind === 'gulf_iqama' &&
    !S.legal.citizenships.includes('sau')
  ) {
    const depCount = coResidentSpouses.filter(sp => !sp.citizenships.includes('sau')).length + coResidentKids.length;
    if (depCount > 0) {
      const levy = depCount * 400; // Statutory 400 SAR/mo per dependent
      netDelta -= levy;
      summary.support += levy;
    }
  }

  const childSupport=settleChildSupportMonth(S,Math.max(0,S.money.cash+netDelta));
  netDelta+=childSupport.incoming-childSupport.outgoing;
  summary.support+=childSupport.outgoing;
  if(childSupport.incoming)addIncome(childSupport.incoming,'Child support received (game order)');

  /* 13. REMITTANCES TO PARENTS BACK HOME */
  if (S.money.remittanceMonthlyLocal > 0) {
    const dad = S.relations.fatherId ? S.people[S.relations.fatherId] : null;
    const mom = S.relations.motherId ? S.people[S.relations.motherId] : null;
    const recipient = (mom && mom.alive) ? mom : (dad && dad.alive ? dad : null);
    if (recipient && S.money.cash + netDelta >= S.money.remittanceMonthlyLocal) {
      netDelta -= S.money.remittanceMonthlyLocal;
      summary.support += S.money.remittanceMonthlyLocal;
      /* v2.16 W2 — Family Provider: this month's amount actually sent
         home, in EGP at this month's rate. The Saudi dependent levy
         above is a government fee, not money sent home, so it is never
         counted here. */
      S.money.remittedHomeEgpTotal = (Number(S.money.remittedHomeEgpTotal) || 0)
        + Math.round(convertCurrency(S.money.remittanceMonthlyLocal, S.country, 'egy', S.year));
      recipient.career.savingsLocal += Math.round(convertCurrency(S.money.remittanceMonthlyLocal, S.country, recipient.residenceCountry, S.year));
      if (S.month === 6) {
        rememberDeed(S, recipient, 'helped_money', `Sent steady monthly support all year.`, { affection: 6, respect: 6, resentment: -8 });
      }
    }
  }

  /* 14. PERSONAL / CAR LOANS — one loop, one missed-payment chain (D14).
     A flat-markup loan (auto loan: balance already includes the 1.24x
     markup) accrues NO further interest; a rate loan accrues monthly. */
  const remainingLoans = [];
  for (const loan of S.money.loans) {
    if(loan.deferredEducation&&(S.education.university||(loan.deferredPostgrad&&S.postgrad?.active))){remainingLoans.push(loan);continue;}
    const scheduledInterest=loan.flatMarkup||loan.inCollections?0:Math.round(loan.balance*((loan.annualRate||0)/12));
    const payAmt = Math.min(loan.balance+scheduledInterest,loan.amortizedTerm&&loan.remainingMonths===1?loan.balance+scheduledInterest:loan.monthlyPayment);
    if (loan.inCollections) {
      // In collections: frozen balance, no interest, still payable.
      if (debtCanPay(S, netDelta, payAmt)) {
        netDelta -= payAmt;
        summary.debt += payAmt;
        if(loan.creditorPersonId&&S.people[loan.creditorPersonId]){const p=S.people[loan.creditorPersonId];p.career??={};p.career.savingsLocal=(p.career.savingsLocal||0)+convertCurrency(payAmt,S.country,p.residenceCountry||S.country,S.year);}
        loan.balance = Math.max(0, Math.round(loan.balance - payAmt));
        loan.missedMonths = 0;
        if (loan.balance <= 0) {
          recordJournal(S, `Cleared collections debt in full: ${loan.label}.`, 'money');
          S.money.creditScore = clamp(S.money.creditScore + 10, 300, 850);
          continue;
        }
      }
      remainingLoans.push(loan);
      continue;
    }
    if (!debtCanPay(S, netDelta, payAmt)) {
      loan.missedMonths = (loan.missedMonths || 0) + 1;
      const fee = Math.max(10, Math.round(payAmt * 0.05));
      loan.balance = Math.round(loan.balance + fee);
      recordLedgerEntry(S, fee, `Late fee on ${loan.label} (miss ${loan.missedMonths})`, 'debt', 'loan', loan.balance);
      S.money.creditScore = clamp(S.money.creditScore - 12, 300, 850);
      if (loan.missedMonths === 2) {
        debtMissedWarning(S, `missed_loan_${loan.id}`, `Second Missed Payment — ${loan.label}`,
          `You have missed two payments on ${loan.label}. One more and the lender moves to repossession / collections.`);
      } else if (loan.missedMonths >= 3) {
        if (loan.assetKind === 'car' && loan.carId) {
          const car = S.cars.find(c => c.id === loan.carId);
          if (car) {
            S.cars = S.cars.filter(c => c.id !== loan.carId);
            const auction=Math.max(0,Math.round((car.valueLocal||0)*.70));
            const owed=loan.balance;
            loan.balance=Math.max(0,owed-auction);
            const surplus=Math.max(0,auction-owed);
            if(surplus>0)walletMove(S,surplus,`Repossession auction surplus: ${car.name}`,'car');
            recordJournal(S, `The bank repossessed your ${car.name} after 3 missed payments. Game auction recovered ${formatMoney(auction,S.country)}.${loan.balance>0?` ${formatMoney(loan.balance,S.country)} remains owed in collections.`:` The loan is cleared.${surplus>0?' Surplus returned to you.':''}`}`, 'money');
            if(loan.balance<=0)continue;
            loan.assetKind=null;loan.carId=null;
          }
        }
        loan.inCollections = true;
        S.money.creditScore = clamp(S.money.creditScore - 30, 300, 850);
        recordJournal(S, `${loan.label} was sent to collections after 3 missed payments — the balance is frozen, your credit score fell sharply, and collectors will pursue it.`, 'money');
      }
      remainingLoans.push(loan);
      continue;
    }
    netDelta -= payAmt;
    summary.debt += payAmt;
    loan.missedMonths = 0;
    if(loan.creditorPersonId&&S.people[loan.creditorPersonId]){const p=S.people[loan.creditorPersonId];p.career??={};p.career.savingsLocal=(p.career.savingsLocal||0)+convertCurrency(payAmt,S.country,p.residenceCountry||S.country,S.year);}
    // Interest accrues on the PRE-payment balance for rate loans only.
    const interest = loan.flatMarkup ? 0 : Math.round(loan.balance * ((loan.annualRate || 0) / 12));
    if (interest > 0) recordLedgerEntry(S, interest, `Interest on ${loan.label}`, 'debt', 'loan', loan.balance);
    loan.balance = Math.max(0, Math.round(loan.balance - payAmt + interest));
    if(loan.balance<=0&&loan.narrativeKind){S.money.narrativeLoanHistory??=[];S.money.narrativeLoanHistory.push({...loan,settled:true});}
    loan.remainingMonths -= 1;
    if (loan.balance > 0) {
      loan.remainingMonths=Math.max(1,loan.remainingMonths);
      remainingLoans.push(loan);
    } else {
      recordJournal(S, `Cleared loan in full: ${loan.label}.`, 'money');
      S.money.creditScore = clamp(S.money.creditScore + 18, 300, 850);
    }
  }
  S.money.loans = remainingLoans;

  /* Recurring household items (D3) — the second monthly pass, now inside the
     ONE settlement, so lastMonthSummary is written once and reconciles. */
  netDelta += settleRecurringHouseholdItems(S, summary, netDelta);

  /* APPLY NET MONTHLY SETTLEMENT */
  summary.net = Math.round(netDelta);
  S.money.lastMonthSummary = summary;

  /* Overdraft buffer from bank savings before going negative */
  if (S.money.cash + summary.net < 0 && S.money.savings > 0) {
    const shortfall = Math.abs(S.money.cash + summary.net);
    const pull = Math.min(S.money.savings, shortfall);
    moveBalance(S, 'savings', -pull, 'Automatic transfer from bank savings to cover bills', 'bank');
    walletMove(S, pull, 'Automatic transfer from bank savings to cover bills', 'bank');
  }

  // Per-bucket ledger lines instead of one monthly lump (D3): the ledger
  // now shows income / housing / living / debt / support separately, and
  // the buckets sum exactly to summary.net. (Tax is informational — net pay
  // is already net of tax, so it is not moved again.)
  // v2.7: income is written as one ledger line PER SOURCE, each naming the
  // source in plain words — never a bare "Monthly income" lump.
  if (summary.incomeParts.length > 0) {
    for (const part of summary.incomeParts) walletMove(S, part.amount, `${part.label} (${S.month}/${S.year})`, 'monthly_settlement');
  } else if (summary.income) {
    walletMove(S, summary.income, `Monthly income (${S.month}/${S.year})`, 'monthly_settlement');
  }
  /* v2.11 W1 — the business P&L's other two lines, one per business:
     costs out (rent + wages + other, broken out) and tax out. Revenue
     already landed above as its own income line, so each business shows
     THREE ledger lines a month and the profit that lands is net of tax.
     The generic living lump below excludes these costs (they are paid
     here, not twice). */
  for (const pl of bizSettlePLs) {
    if (pl.costs > 0) {
      /* v2.20 I3 (fix-5 label hunk) — the ledger line breaks out every
         component costs now contains, including the head-office /
         regional-manager lines and the two subtractive lines, so the
         label and the total agree with the card's rows. */
      walletMove(S, -pl.costs, `Business costs — ${pl.name} (rent ${formatMoney(pl.rent, S.country)} + wages ${formatMoney(pl.wages, S.country)} + other ${formatMoney(pl.other, S.country)}${pl.remote > 0 ? ` + remote management ${formatMoney(pl.remote, S.country)}` : ''}${pl.manager > 0 ? ` + manager ${formatMoney(pl.manager, S.country)}` : ''}${pl.reinvest > 0 ? ` + growth reinvestment ${formatMoney(pl.reinvest, S.country)}` : ''}${pl.headOffice > 0 ? ` + head office ${formatMoney(pl.headOffice, S.country)}` : ''}${pl.regionalManager > 0 ? ` + regional manager ${formatMoney(pl.regionalManager, S.country)}` : ''}${pl.staffSavings > 0 ? ` − staff savings ${formatMoney(pl.staffSavings, S.country)}` : ''}${pl.supplyChainSaving > 0 ? ` − supply-chain saving ${formatMoney(pl.supplyChainSaving, S.country)}` : ''}) (${S.month}/${S.year})`, 'monthly_settlement');
    }
    if (pl.tax > 0) {
      walletMove(S, -pl.tax, `${pl.taxLabel} — ${pl.name} (${S.month}/${S.year})`, 'monthly_settlement');
    }
  }
  if (summary.housing) walletMove(S, -summary.housing, `Monthly housing (${S.month}/${S.year})`, 'monthly_settlement');
  if (summary.living - bizSettleCosts) walletMove(S, -(summary.living - bizSettleCosts), `Monthly living costs (${S.month}/${S.year})`, 'monthly_settlement');
  if (summary.debt - bizSettleSeverancePaid) walletMove(S, -(summary.debt - bizSettleSeverancePaid), `Monthly debt payments (${S.month}/${S.year})`, 'monthly_settlement');
  if (summary.support) walletMove(S, -summary.support, `Monthly family support (${S.month}/${S.year})`, 'monthly_settlement');

  settleCompanyTrusts(S);
  settleNpcCompanyHoldings(S);

  /* v2.14 §2 — manager monthly tick (loyalty, asks, skimming, quitting).
     AFTER the walletMoves above: skim money and bonuses move cash at
     once, so they must not run inside the settlement's netDelta
     accounting. Only businesses WITH a manager tick here; the unmanaged
     counter is owned by W1's tickBusinessCapacityMonth (via
     applyWorkloadMonth in §3), never here. */
  if (legallyEmployed) {
    for (const biz of [...(S.career.businesses || [])]) {
      if (biz.manager) tickManagerMonth(S, biz);
    }
  }

  /* v2.15 W2 — pension pot: this month's contributions land in the pot.
     The employee part is money already deducted from pay (the payslip's
     pension line) and the employer part is the employer's money — neither
     moves cash here. The USA 401(k) employee part is real cash out of
     the account, so it moves (with its own ledger line) inside
     accruePensionMonth. */
  if (pensionAccrual) accruePensionMonth(S, pensionAccrual);

  /* GAME DESIGN credit limit (new lives only, S.rules.creditLimit): nobody can borrow without end. Cash may run to 12 months of
     living costs below zero. Past that, creditors stop lending and the player goes without: the excess is not added to the debt,
     and health, happiness and stress take a hit each month it happens. Old saves carry no flag and are unchanged. */
  if (S.rules?.creditLimit) {
    const monthlyLiving = Math.max(0, Number(summary.living) - Number(bizSettleCosts || 0));
    const cap = Math.round(monthlyLiving * 12);
    if (cap > 0) S.money.creditCap = cap; /* read by the option builder to lock luxuries at the limit */
    if (cap > 0 && S.money.cash < -cap) {
      const unpaid = Math.round((-cap - S.money.cash) * 100) / 100;
      walletMove(S, unpaid, 'Credit limit reached: costs you went without are not added to the debt', 'credit_limit');
      /* GAME DESIGN: the health hit stops at a floor of 35. Below that, the people around you cover the basics so the slide ends, but happiness and stress keep taking the hit. */
      const CREDIT_HEALTH_FLOOR = 35;
      if (S.player.vitals.health > CREDIT_HEALTH_FLOOR) S.player.vitals.health = Math.max(CREDIT_HEALTH_FLOOR, clamp(S.player.vitals.health - 3));
      else if ((S.money.creditHelpNoteTurn ?? -99) + 12 <= S.turn) {
        S.money.creditHelpNoteTurn = S.turn;
        recordJournal(S, 'You are still at the limit. Relatives and friends cover the basics, so your health stops falling, but nothing gets better until you earn or sell something.', 'money');
      }
      S.player.vitals.happiness = clamp(S.player.vitals.happiness - 4);
      S.player.vitals.stress = clamp(S.player.vitals.stress + 5);
      if ((S.money.creditLimitNoteTurn ?? -99) + 12 <= S.turn) {
        S.money.creditLimitNoteTurn = S.turn;
        recordJournal(S, `You are ${formatMoney(cap, S.country)} in debt, the most lenders will allow. Past that you go without: skipped meals, unpaid bills, no repairs. It is wearing you down until you earn or sell something. Game limit: 12 months of living costs.`, 'money');
      }
    }
  }

  /* 15. REAL INSOLVENCY, EVICTION & BANKRUPTCY CONSEQUENCES */
  if (S.money.cash < 0||summary.rentArrearsAdded>0) {
    S.money.creditScore = clamp(S.money.creditScore - 12, 300, 850);
    S.player.vitals.stress = clamp(S.player.vitals.stress + 6);

    // Explicit lease evidence wins over unrelated food/debt insolvency.
    const rentMissed=S.housing.playerLease?.status==='active'?summary.rentArrearsAdded>0:S.money.cash<0;
    if(S.housing.mode==='rent'&&!rentMissed)S.money.missedRentMonths=0;
    if (S.housing.mode === 'rent'&&rentMissed) {
      S.money.missedRentMonths += 1;
      if (S.money.missedRentMonths >= 3) {
        S.money.missedRentMonths = 0;
        const oldHome = S.housing.currentHomeName;
        closePlayerLease(S,{disputed:true});
        S.housing.evictionCount = (Number(S.housing.evictionCount) || 0) + 1;
        const again = S.housing.evictionCount > 1;
        S.housing.lastEviction = { year: S.year, month: S.month, from: oldHome, again };
        if (S.country === S.homeCountry) {
          S.housing.mode = 'parents';
          S.housing.currentHomeName = 'Family Home (After Eviction)';
          S.housing.monthlyRent = 0;
          recordJournal(S, again ? `Three more months of unpaid rent, and you lost the lease at ${oldHome}. You went back to family again.` : `After 3 months of unpaid rent, your landlord terminated your lease at ${oldHome}. You packed up and moved back in with family.`, 'money');
        } else {
          const sharedRoom = eraLocalCost(cObj.monthlyBasket2026.rentModest * 0.55, S.country, S.year);
          S.housing.currentHomeName = 'Shared Bedspace / Room';
          S.housing.monthlyRent = sharedRoom;
          /* Already in the cheapest shared room and losing it again: the room and rent are unchanged, so the line is told once a year, not every quarter. */
          const repeatSameRoom = again && oldHome === 'Shared Bedspace / Room';
          S.housing.lastEviction.quiet = !!(repeatSameRoom && S.housing.repeatEvictionNoteYear === S.year);
          if (!S.housing.lastEviction.quiet) {
            if (repeatSameRoom) S.housing.repeatEvictionNoteYear = S.year;
            recordJournal(S, again ? `Evicted again, from ${oldHome}. The arrears piled up before the shared room was paid for, and you took another one at ${formatMoney(sharedRoom, S.country)}/month.` : `Evicted from ${oldHome} for rent arrears — you downgraded into a cramped shared room (${formatMoney(sharedRoom, S.country)}/mo).`, 'money');
          }
        }
        S.player.vitals.happiness = clamp(S.player.vitals.happiness - 14);
      }
    }

    /* Gulf unpaid debt travel ban realism */
    if ((S.country === 'sau' || S.country === 'uae') && S.money.cash < -eraLocalCost(cObj.monthlyBasket2026.rentStandard * 3, S.country, S.year)) {
      S.legal.travelBanInCountry = S.country;
    }

    /* Formal Bankruptcy Relief Card — ONLY if deeply insolvent AND not already in active 7-year bankruptcy! (Fixes D4/D5!) */
    const severeThreshold = -eraLocalCost(cObj.monthlyBasket2026.rentStandard * 4, S.country, S.year);
    if (S.money.cash <= severeThreshold && S.year > S.money.bankruptUntilYear && (S.cooldowns.formal_bankruptcy_filing||0)<=S.turn) {
      queueScene(S, buildInsolvencyScene(S));
    }
  } else {
    S.money.missedRentMonths = 0;
    if (S.legal.travelBanInCountry === S.country && S.money.loans.length === 0) {
      S.legal.travelBanInCountry = null;
    }
    if (S.month === 12 && S.year > S.money.bankruptUntilYear) {
      S.money.creditScore = clamp(S.money.creditScore + 8, 300, 850);
    }
  }
}

/* ============================================================================
   v2.7 — CHILD POCKET MONEY & EVENT SHOP PURCHASES
   ========================================================================== */

/* The one pocket-money rule for children (ages 6–17). Before v2.7 there was
   NO minor income system at all: the monthly settlement skipped under-18s,
   yet a schoolboy could still end up with cash from one-off events and no
   line anywhere said where it came from. Now a child with a living parent
   gets a named yearly allowance, paid once per yearly turn (see
   settleChildAllowanceYear, called from the yearly branch of
   advanceSingleTurn). The amount is a share of the country's monthly food
   basket for one adult, scaled by family wealth — richer, more generous
   families give more — and the Finance tab shows the rule itself. Under 6:
   parents buy everything directly, no pocket money. No living parent: no
   allowance (nothing is invented). At 18 the adult settlement takes over,
   including the university pocket allowance in §5 above. */
const CHILD_POCKET_SHARE = { struggling: 0.06, working: 0.10, middle: 0.18, upper_middle: 0.35, wealthy: 0.70, very_wealthy: 0.70 };

export function childPocketMoneyMonthly(S) {
  if (!S || !S.player) return 0;
  if (S.player.age < 6 || S.player.age >= 18) return 0;
  const dad = S.relations?.fatherId ? S.people[S.relations.fatherId] : null;
  const mom = S.relations?.motherId ? S.people[S.relations.motherId] : null;
  if (!((dad && dad.alive) || (mom && mom.alive))) return 0;
  const share = CHILD_POCKET_SHARE[S.familyTier] ?? 0.18;
  return eraLocalCost(getCountry(S.country).monthlyBasket2026.foodAdult * share, S.country, S.year);
}

export function settleChildAllowanceYear(S) {
  if (S && S.player && S.player.age >= 6 && S.player.age < 18 && hasFortune(S)) { const paid = payFamilyAllowanceYear(S); if (paid != null) return paid; }
  const monthly = childPocketMoneyMonthly(S);
  if (monthly <= 0) return 0;
  const annual = Math.round(monthly * 12);
  walletMove(S, annual, `Pocket money from your parents (${formatMoney(monthly, S.country)}/month × 12)`, 'allowance');
  if (!S.money._allowanceExplained) {
    S.money._allowanceExplained = true;
    const tierLabel = (FAMILY_TIERS[S.familyTier]?.label || 'your family').toLowerCase();
    recordJournal(S, `Your parents give you ${formatMoney(monthly, S.country)} a month as pocket money — a ${tierLabel} household gives this much, and it rises if the family does better. It is yours to spend or save; your parents still cover housing, food and school.`, 'money');
  }
  return annual;
}

/* v2.7 — the ONE way an event choice buys a durable thing. Finds the
   cheapest shop-catalogue item matching the predicate that was actually on
   sale in this year, prices it the same way the Shopping Mall does
   (convertCurrency on the catalogue's 2026 USD price — never a made-up
   local number), charges it through the ledger, and puts the item in the
   player's owned possessions, so it exists afterwards and can be resold.
   secondHand: half the catalogue price, labelled as such. Returns
   { ok, priceLocal, item, msg } — callers must check ok and must gate the
   choice with `available` on cash, so the button never promises a purchase
   the player cannot pay for. */
export function cheapestShopItem(S, predicate) {
  const year = S?.year ?? 2026;
  const matches = SHOP_MEGA_CATALOG.filter(it =>
    !String(it.id).endsWith('_sig') && it.yearFrom <= year && it.yearTo >= year && predicate(it));
  if (!matches.length) return null;
  matches.sort((a, b) => a.priceUsd2026 - b.priceUsd2026);
  return matches[0];
}

export function shopItemPriceLocal(S, item, { secondHand = false } = {}) {
  if (!item) return 0;
  const usd = Number(item.priceUsd2026 || 0) * (secondHand ? 0.5 : 1);
  return Math.max(5, Math.round(convertCurrency(usd, 'usa', S.country, S.year)));
}

export function buyShopItemForEvent(S, item, { secondHand = false, label = null } = {}) {
  if (!item) return { ok: false, priceLocal: 0, item: null, msg: 'No matching item in the shop catalogue.' };
  const priceLocal = shopItemPriceLocal(S, item, { secondHand });
  const itemLabel = `${item.brand} ${item.name}${secondHand ? ' (second-hand)' : ''}`;
  const paid = purchase(S, priceLocal, label || `Bought ${itemLabel} (shop catalogue)`, 'cash', { category: 'lifestyle' });
  if (!paid.ok) return { ok: false, priceLocal, item, msg: paid.msg };
  if (!Array.isArray(S.inventory)) S.inventory = [];
  S.inventory.unshift({
    id: nextId(S, 'inv'),
    catalogId: item.id,
    name: itemLabel,
    category: item.category,
    boughtYear: S.year,
    valueLocal: secondHand ? priceLocal : Math.round(priceLocal * 0.6),
    appreciates: !!item.appreciates
  });
  if (S.inventory.length > 60) S.inventory.length = 60;
  return { ok: true, priceLocal, item, msg: `Bought ${itemLabel} for ${formatMoney(priceLocal, S.country)}.` };
}

/* ============================================================================
   DIRECT PLAYER FINANCIAL, GOLD, REAL ESTATE & VEHICLE ACTIONS
   ========================================================================== */

export function depositToSavings(S, amount) {
  const amt = Math.floor(Number(amount) || 0);
  if (amt <= 0 || S.money.cash < amt) return { ok: false, msg: 'Insufficient cash.' };
  walletMove(S, -amt, `Deposited into ${S.money.bankName || 'bank'} savings`, 'bank');
  moveBalance(S, 'savings', amt, `Deposited into ${S.money.bankName || 'bank'} savings`, 'bank');
  // v2.7 savings provenance: the Banks tab shows where the balance came from.
  S.money.savingsDepositsTotal = Math.round(((Number(S.money.savingsDepositsTotal) || 0) + amt) * 100) / 100;
  return { ok: true, msg: `Deposited ${formatMoney(amt, S.country)}.` };
}

export function withdrawFromSavings(S, amount) {
  const amt = Math.floor(Number(amount) || 0);
  if (amt <= 0 || S.money.savings < amt) return { ok: false, msg: 'Insufficient savings balance.' };
  moveBalance(S, 'savings', -amt, `Withdrew from ${S.money.bankName || 'bank'} savings`, 'bank');
  walletMove(S, amt, `Withdrew from ${S.money.bankName || 'bank'} savings`, 'bank');
  S.money.savingsWithdrawalsTotal = Math.round(((Number(S.money.savingsWithdrawalsTotal) || 0) + amt) * 100) / 100;
  return { ok: true, msg: `Withdrew ${formatMoney(amt, S.country)}.` };
}

export function buyBankCertificate(S, amount, termYears = 1) {
  const amt = Math.floor(Number(amount) || 0);
  if(!Number.isInteger(termYears)||termYears<1||termYears>10)return{ok:false,msg:'Certificate term must be1to10whole years.'};
  if (!hasValidResidenceForBanking(S)) return { ok: false, msg: 'Opening a new bank product requires a valid residence status — regularise your visa first.' };
  if (amt <= 0 || S.money.cash < amt) return { ok: false, msg: 'Insufficient cash for certificate.' };
  const rates = eraDepositRates(S.country, S.year);
  /* v2.15 W4 — a certificate opened while a world event is moving rates
     pays that moved rate for its whole term (the rate is locked at
     opening, like a real certificate). */
  const baseCdRate = termYears >= 3 ? rates.cd3Yr : rates.cd1Yr;
  const annualRate = Math.max(0.001, Number((baseCdRate + worldEventEffects(S, S.country).rateShift).toFixed(4)));
  { const paid = purchase(S, amt, `Opened ${termYears}-Year Bank Certificate (${(annualRate * 100).toFixed(1)}% APY)`, 'cash', { category: 'bank' }); if (!paid.ok) return paid; }
  S.money.certificates.push({
    id: nextId(S, 'cd'),
    bankName: S.money.bankName || 'National Bank',
    principal: amt,
    annualRate,
    maturityYear: S.year + termYears,
    maturityMonth: S.month,
    country: S.country
  });
  recordJournal(S, `Locked ${formatMoney(amt, S.country)} in a ${termYears}-year ${S.money.bankName || 'bank'} certificate yielding ${(annualRate * 100).toFixed(1)}%/yr paid monthly.`, 'money');
  return { ok: true, msg: `Certificate opened at ${(annualRate * 100).toFixed(1)}%/yr.` };
}

export function buyGold21k(S, grams) {
  const g=Number(grams);
  if(!Number.isSafeInteger(g)||g<=0)return{ok:false,msg:'Enter a positive whole number of grams.'};
  const pricePerG = goldPricePerGram(S.country, S.year, 21);
  const totalCost = Math.round(g * pricePerG);
  const paid = purchase(S, totalCost, `Purchased ${g}g of 21K gold (${formatMoney(pricePerG, S.country)}/g)`, 'cash', { category: 'investment' });
  if (!paid.ok) return { ok: false, msg: `Need ${formatMoney(totalCost, S.country)} for ${g}g of 21K gold.` };
  S.money.goldGrams21k += g;
  recordJournal(S, `Bought ${g}g of 21K gold for ${formatMoney(totalCost, S.country)} as an inflation & currency hedge.`, 'money');
  return { ok: true, msg: `Bought ${g}g 21K gold.` };
}

export function sellGold21k(S, grams) {
  const g=Number(grams);
  if(!Number.isSafeInteger(g)||g<=0)return{ok:false,msg:'Enter a positive whole number of grams.'};
  if(g>S.money.goldGrams21k)return{ok:false,msg:'Not enough gold for this order.'};
  if (g <= 0) return { ok: false, msg: 'No gold to sell.' };
  const pricePerG = goldPricePerGram(S.country, S.year, 21);
  const proceeds = Math.round(g * pricePerG * 0.985); // 1.5% dealer spread
  S.money.goldGrams21k -= g;
  walletMove(S, proceeds, `Sold ${g}g of 21K gold`, 'investment');
  recordJournal(S, `Sold ${g}g of 21K gold at the bullion market for ${formatMoney(proceeds, S.country)}.`, 'money');
  return { ok: true, msg: `Sold ${g}g for ${formatMoney(proceeds, S.country)}.` };
}

/* v2.12 — the gates every personal loan passes (staff or standard): the
   bank checks age, residence, bankruptcy, credit score and the active-loan
   cap. Returns an error message or null. */
export function personalLoanGates(S) {
  if (S.player.age < 21) return 'Must be at least 21 for bank credit.';
  if (!hasValidResidenceForBanking(S)) return 'New bank credit requires a valid residence status — regularise your visa first.';
  if (S.year <= S.money.bankruptUntilYear) return `Bankruptcy flag blocks new credit until ${S.money.bankruptUntilYear}.`;
  if (lenderCreditScore(S) < 560) return `Credit score (${S.money.creditScore}) is too low for approval.`;
  if (S.money.loans.length >= 2) return 'Maximum active personal loans reached.';
  return null;
}

function bookLoanAtRate(S, amount, years, annualRate, label) {
  const amt = Math.round(Number(amount));
  if (!Number.isFinite(amt)||amt<=0||amt>Number.MAX_SAFE_INTEGER)return{ok:false,msg:'Invalid finite loan amount.'};
  if(!Number.isInteger(years)||years<1||years>30)return{ok:false,msg:'Choose a whole term from1to30years.'};
  const months = years * 12;
  const r = annualRate / 12;
  const monthlyPayment = Math.max(1,Math.ceil(r===0?amt/months:(amt*r)/(1-Math.pow(1+r,-months))));

  S.money.loans.push({
    id: nextId(S, 'loan'),
    label: `${label} (${years}y)`,
    balance: amt,
    monthlyPayment,
    annualRate,
    remainingMonths: months,
    amortizedTerm:true,
    country: S.country,
    missedMonths: 0
  });
  walletMove(S, amt, `Loan disbursement (${S.money.bankName || 'Bank'})`, 'bank');
  recordJournal(S, `Took a ${formatMoney(amt, S.country)} bank loan at ${(annualRate * 100).toFixed(1)}% (${formatMoney(monthlyPayment, S.country)}/mo for ${years} years).`, 'money');
  return { ok: true, msg: `Approved for ${formatMoney(amt, S.country)}.` };
}

export function takePersonalLoan(S, amount, years = 3) {
  const gate = personalLoanGates(S);
  if (gate) return { ok: false, msg: gate };
  const rates = eraDepositRates(S.country, S.year);
  /* v2.15 W4 — a new loan is priced at the rate of its year, moved by
     any world event active now (cheap in 2009, dear in 1981). A loan
     already taken keeps the rate it was booked at. */
  const annualRate = Number((rates.cd1Yr + 0.055 + worldEventEffects(S, S.country).rateShift).toFixed(4));
  return bookLoanAtRate(S, amount, years, annualRate, `${S.money.bankName || 'Bank'} Personal Loan`);
}

/* v2.12 — the staff loan: the same loan, at the staff rate from
   staffLoanTerms (the bank's own 1-year deposit rate, no markup). The
   rate is passed in by the caller, which read it from staffLoanTerms, so
   the Work tab, the Bank tab and this booking can never disagree about
   the number. Refused when the player is not bank staff, when the rate
   is not actually a staff rate (at or above the standard rate), or when
   any personal-loan gate fails. The loan is a normal loan record — it is
   repaid, missed and repossessed through the same monthly loan tick as
   every other loan. */
export function takeStaffLoan(S, amount, years = 3, staffRate) {
  const gate = personalLoanGates(S);
  if (gate) return { ok: false, msg: gate };
  /* The industry gate lives in staffLoanTerms (careerEducationEngine) —
     the handler and the Bank tab check it first. This is the same rule
     restated on the job record alone, so a direct call can never book a
     staff loan for a non-bank job: the finance tracks are 'finance'
     (core) and the V1 banking tracks 'business' and 'investment' — no
     other track carries a finance / banking industry. */
  const FINANCE_TRACKS = new Set(['finance', 'business', 'investment']);
  if (!S.career?.employed || !S.career?.job || !FINANCE_TRACKS.has(S.career.job.track)) return { ok: false, msg: 'Staff loans are only for bank staff.' };
  const rates = eraDepositRates(S.country, S.year);
  const standardRate = Number((rates.cd1Yr + 0.055).toFixed(4));
  const rate = Number(staffRate);
  if (!(rate > 0) || rate >= standardRate) return { ok: false, msg: 'That is not a staff rate — staff borrow below the standard rate.' };
  return bookLoanAtRate(S, amount, years, rate, `${S.money.bankName || 'Bank'} Staff Loan`);
}

/* v2.9 item 9 — ONE resolver for the home the player lives in. Owned homes
   live in S.housing.properties; rented homes live only as a catalogue id in
   S.housing.currentHomeId (rentHousingUnit sets it, but the settlement used
   to look it up in owned properties and silently miss for every renter).
   Returns the owned property record, or a rented-home record built from the
   catalogue unit (with the actual rent paid and the landlord — the catalogue
   names no landlord, so a rented unit reports 'Private landlord'), or null
   when the player has no current home id (living with parents / employer
   housing). Read-only: never mutates S. */
export function resolveCurrentHome(S) {
  if (!S || !S.housing || !S.housing.currentHomeId) return null;
  const owned = (S.housing.properties || []).find(pr => pr.id === S.housing.currentHomeId);
  if (owned) return owned;
  const item = getHousingFor(S.country, S.year).find(h => h.id === S.housing.currentHomeId);
  if (item) {
    return {
      ...item,
      tenure: 'rented',
      monthlyRent: Number(S.housing.monthlyRent) || 0,
      landlord: item.landlord || 'Private landlord'
    };
  }
  /* Catalogue lookup missed (e.g. rented abroad, then moved country) — the
     lease itself is still real: fall back to what the housing record knows. */
  if (S.housing.mode === 'rent') {
    return {
      id: S.housing.currentHomeId,
      name: S.housing.currentHomeName || 'Rented home',
      country: S.country,
      tenure: 'rented',
      monthlyRent: Number(S.housing.monthlyRent) || 0,
      landlord: 'Private landlord'
    };
  }
  return null;
}

export function rentalMoveInQuote(S, item) {
  const monthlyRent = Math.round(eraLocalCost(item.monthlyRent2026, S.country, S.year) * worldEventEffects(S, S.country).housePrice);
  // New explicit leases: one setup fee, one refundable deposit, one rent reserve.
  return { monthlyRent, moveInFee: monthlyRent, deposit:monthlyRent, cashRequired: monthlyRent * 3 };
}

export function rentHousingUnit(S, catalogId) {
  const kind = S.legal.residency.kind;
  if ((kind === 'grace_period' || kind === 'undocumented') && !S.legal.citizenships.includes(S.country)) {
    return { ok: false, msg: 'Landlords here require a valid residence permit — your status is expired, so no new lease can be signed until it is regularised.' };
  }
  const list = getHousingFor(S.country, S.year);
  const item = list.find(h => h.id === catalogId);
  if (!item) return { ok: false, msg: 'Property unavailable.' };

  const { monthlyRent, moveInFee, deposit, cashRequired } = rentalMoveInQuote(S, item);
  if(S.housing.playerLease?.status==='active'&&S.housing.playerLease.homeId===item.id)return{ok:false,msg:'Already leasing this home.'};
  if (S.money.cash < cashRequired) {
    return { ok: false, msg: `Need ${formatMoney(cashRequired, S.country)} cash: ${formatMoney(moveInFee, S.country)} non-refundable setup fee, one refundable deposit and one month rent reserve. Rent is billed on the next monthly turn.` };
  }

  closePlayerLease(S);
  walletMove(S, -moveInFee, `Non-refundable move-in fee for ${item.name}`, 'housing');
  walletMove(S,-deposit,`Refundable rental deposit for ${item.name}`,'housing');
  S.housing.playerLease={id:nextId(S,'lease'),homeId:item.id,name:item.name,country:S.country,deposit,status:'active',startedAt:S.year*12+S.month,landlord:`Landlord of ${item.name}`};
  S.housing.mode = 'rent';
  S.housing.currentHomeId = item.id;
  S.housing.currentHomeName = item.name;
  S.housing.monthlyRent = monthlyRent;
  S.housing.rentIndexedYear = S.year;
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + item.happinessBoost);
  recordJournal(S, `Signed a lease on ${item.name} for ${formatMoney(monthlyRent, S.country)}/month.`, 'milestone');
  return { ok: true, msg: `Moved into ${item.name}!` };
}

export function buyProperty(S, catalogId, countryId = S.country, useInstallments = false, moveIn = true) {
  const targetCountry = countryId || S.country;
  const list = getHousingFor(targetCountry, S.year);
  const item = list.find(h => h.id === catalogId);
  if (!item) return { ok: false, msg: 'Property not found.' };

  const nativePrice = Math.round(eraLocalCost(item.price2026, targetCountry, S.year) * worldEventEffects(S, targetCountry).housePrice);
  const nativeRentYield = Math.round(eraLocalCost(item.monthlyRent2026, targetCountry, S.year) * worldEventEffects(S, targetCountry).housePrice);

  if (!useInstallments) {
    const costInPlayerLocal = Math.round(convertCurrency(nativePrice, targetCountry, S.country, S.year));
    return finalizePropertyPurchase(S, {
      catalogId: item.id,
      name: item.name,
      country: targetCountry,
      city: item.city,
      tier: item.tier,
      rooms: item.rooms,
      nativeValue: nativePrice,
      nativeMonthlyRent: nativeRentYield,
      downInPlayerLocal: costInPlayerLocal,
      happinessBoost: item.happinessBoost + 4
    }, null, { moveIn });
  }

  const downPct = item.offPlanAvailable ? (item.downPaymentPct || 0.10) : 0.20;
  const years = item.offPlanAvailable ? (item.installmentYears || 7) : 15;
  const nativeDown = Math.round(nativePrice * downPct);
  const downInPlayerLocal = Math.round(convertCurrency(nativeDown, targetCountry, S.country, S.year));
  const months = years * 12;
  /* v2.15 W4 — a bank mortgage is priced at the real rate for the era:
     the same house costs far more per month when it is bought in a
     high-rate year (1981 America) than in a low-rate year (2009). A
     developer Aqsat stays a flat developer markup — no bank rate in it. */
  let nativeRemaining;
  let nativeMonthlyInst;
  let planKind;
  if (item.offPlanAvailable) {
    nativeRemaining = Math.round((nativePrice - nativeDown) * 1.18);
    nativeMonthlyInst = Math.round(nativeRemaining / months);
    planKind = `${years}-year developer Aqsat`;
  } else {
    const loanRates = eraLoanRates(targetCountry, S.year);
    nativeMonthlyInst = monthlyMortgagePayment(nativePrice - nativeDown, years, loanRates.mortgageRate);
    nativeRemaining = Math.round(nativeMonthlyInst * months);
    planKind = `${years}-year mortgage at ${(loanRates.mortgageRate * 100).toFixed(1)}%/yr`;
  }
  return finalizePropertyPurchase(S, {
    catalogId: item.id,
    name: item.name,
    country: targetCountry,
    city: item.city,
    tier: item.tier,
    rooms: item.rooms,
    nativeValue: nativePrice,
    nativeMonthlyRent: nativeRentYield,
    downInPlayerLocal,
    happinessBoost: item.happinessBoost + 4
  }, { months, nativeRemaining, nativeMonthlyInst, planKind }, { moveIn });
}

export function moveIntoOwnedProperty(S, propId) {
  const prop = S.housing.properties.find(p => p.id === propId);
  if (!prop || prop.country !== S.country) return { ok: false, msg: 'Property is in another country.' };
  /* v2.15 W1 — moving in ends the tenancy: the tenant leaves and the
     deposit is settled against any real damage. */
  if (prop.landlord && prop.landlord.tenant) endTenancy(S, prop, 'you moved in');
  prop.rentedOut = false;
  closePlayerLease(S);
  S.housing.mode = 'owned';
  S.housing.currentHomeId = prop.id;
  S.housing.currentHomeName = prop.name;
  S.housing.monthlyRent = 0;
  recordJournal(S, `Moved into your owned home: ${prop.name}.`, 'life');
  return { ok: true, msg: `Now living in ${prop.name}.` };
}

export function togglePropertyRental(S, propId) {
  const prop = S.housing.properties.find(p => p.id === propId);
  if (!prop) return { ok: false, msg: 'Property not found.' };
  if (prop.id === S.housing.currentHomeId && S.housing.mode === 'owned') {
    return { ok: false, msg: 'Move out first before renting out the home you live in.' };
  }
  if(prop.ruralCabin)return{ok:false,msg:'This rural getaway is personal-use only in the simplified model.'};
  prop.rentedOut = !prop.rentedOut;
  /* v2.15 W1 — listing it finds a named tenant at once (deposit
     posted now, at the player's own action); taking it off the
     market ends the tenancy and settles the deposit. */
  if (prop.rentedOut && prop.tenantMode !== 'short_term') {
    const found = findTenant(S, prop, { postNow: true });
    return { ok: true, msg: `Listed ${prop.name} for tenant rental income. ${found.msg}` };
  }
  if (!prop.rentedOut && prop.landlord && prop.landlord.tenant) {
    const ended = endTenancy(S, prop, 'you took it off the rental market');
    return { ok: true, msg: `Took ${prop.name} off the rental market. ${ended.msg || ''}` };
  }
  return { ok: true, msg: prop.rentedOut ? `Listed ${prop.name} for tenant rental income.` : `Took ${prop.name} off the rental market.` };
}

export function buyVehicle(S, carCatalogId, opts = {}) {
  if (S.player.age < 18) return { ok: false, msg: 'Must be 18+ to purchase and register a car.' };
  const avail = getCarsForYear(S.year);
  const carItem = avail.find(c => c.id === carCatalogId);
  if (!carItem) return { ok: false, msg: 'Model not sold in this era.' };

  const localPrice = Math.round(convertCurrency(carItem.priceUsd2026, 'usa', S.country, S.year));
  const isLuxuryNonEv = carItem.tier === 'luxury' || carItem.tier === 'executive';
  const finalPrice = Math.round(localPrice * carImportDutyMult(S, isLuxuryNonEv));
  const monthlyUpkeep = Math.round(convertCurrency(carItem.monthlyUpkeepUsd2026, 'usa', S.country, S.year));

  return finalizeCarPurchase(S, {
    catalogId: carItem.id,
    name: carItem.name,
    tier: carItem.tier,
    body: carItem.body,
    fullPrice: finalPrice,
    monthlyUpkeep,
    happinessBoost: carItem.prestige >= 8 ? 8 : 4
  }, { useAutoLoan: !!opts.useAutoLoan });
}

export function sellVehicle(S, carId) {
  const idx = S.cars.findIndex(c => c.id === carId);
  if (idx < 0) return { ok: false, msg: 'Vehicle not found.' };
  const [car] = S.cars.splice(idx, 1);
  const proceeds = Math.max(1, Math.round(car.valueLocal));
  walletMove(S, proceeds, `Sold ${car.name}`, 'lifestyle');
  recordJournal(S, `Sold your ${car.name} for ${formatMoney(proceeds, S.country)}.`, 'money');
  return { ok: true, msg: `Sold ${car.name} for ${formatMoney(proceeds, S.country)}.` };
}

/* Cleanly convert liquid money when migrating countries while preserving native property holdings! */
export function convertFinancesOnCountryMove(S, fromCountry, toCountry) {
  if (fromCountry === toCountry) return;
  // FX is a balance change like any other: every converted balance writes a
  // ledger line (was: silent in-place rewrites, invisible to the ledger).
  // v2.9 B9: routed through walletMove / moveBalance, so the minor floor
  // (cash never below 0 for under-18s) and the "only moveBalance assigns
  // savings" rule hold here too. Identical result: the converted value is
  // always >= 0, so neither floor ever binds on an FX move, and the ledger
  // line keeps the same label, category and amount. A zero-delta conversion
  // writes no line (walletMove skips zero moves).
  const fxMove = (account, oldVal, newVal, label) => {
    const d = Math.round((newVal - oldVal) * 100) / 100;
    if (d === 0) return;
    if (account === 'cash') walletMove(S, d, label, 'fx');
    else moveBalance(S, 'savings', d, label, 'fx');
    if (S.ledger?.[0]?.category === 'fx') S.ledger[0].currency = getCountry(toCountry).currency; /* the balance after a conversion is in the new currency, and the line says so */
  };
  { const o = S.money.cash, n = convertCurrency(o, fromCountry, toCountry, S.year); fxMove('cash', o, n, `Currency conversion, cash: ${formatMoney(o, fromCountry)} became ${formatMoney(n, toCountry)} (a change of currency, not a cost)`); }
  { const o = S.money.savings, n = convertCurrency(o, fromCountry, toCountry, S.year); fxMove('savings', o, n, `Currency conversion, savings: ${formatMoney(o, fromCountry)} became ${formatMoney(n, toCountry)} (a change of currency, not a cost)`); }
  S.money.remittanceMonthlyLocal = Math.round(convertCurrency(S.money.remittanceMonthlyLocal, fromCountry, toCountry, S.year));
  for(const key of ['statePensionMonthly','privateDrawdownMonthly'])if(Number.isFinite(S.career[key]))S.career[key]=Math.max(0,Math.round(convertCurrency(S.career[key],fromCountry,toCountry,S.year)));
  S.career.monthlyPension=Math.max(0,Math.round(convertCurrency(S.career.monthlyPension||0,fromCountry,toCountry,S.year)));
  const pension=S.career.market?.pension;
  if(pension){
    for(const key of ['pot','employeeTotal','employerTotal','growthTotal'])pension[key]=Math.max(0,Math.round(convertCurrency(pension[key]||0,fromCountry,toCountry,S.year)));
    if(pension.paidOut)for(const key of ['pot','monthlyTopUp','remaining'])pension.paidOut[key]=Math.max(0,Math.round(convertCurrency(pension.paidOut[key]||0,fromCountry,toCountry,S.year)));
    for(const row of pension.history||[])for(const key of ['employee','employer','growth','pot'])if(Number.isFinite(row[key]))row[key]=Math.round(convertCurrency(row[key],fromCountry,toCountry,S.year));
  }


  for(const couple of S.marriage?.couples||[])for(const key of ['mahrPrompt','mahrPromptPaid','mahrDeferred','mahrDeferredPaid','qaimaValueLocal'])if(Number.isFinite(couple.money?.[key]))couple.money[key]=Math.round(convertCurrency(couple.money[key],fromCountry,toCountry,S.year));
  for(const contract of S.marriage?.contracts||[])for(const key of ['mahrPrompt','mahrPromptPaid','mahrDeferred','mahrDeferredPaid','qaimaValueLocal'])if(Number.isFinite(contract[key]))contract[key]=Math.round(convertCurrency(contract[key],fromCountry,toCountry,S.year));

  /* Liquidate certificates cleanly on international bank move (without penalty) */
  for (const cd of S.money.certificates) {
    const valNew = Math.round(convertCurrency(cd.principal, cd.country || fromCountry, toCountry, S.year));
    moveBalance(S, 'savings', valNew, `Certificate liquidated on move (${cd.bankName})`, 'bank');
  }
  S.money.certificates = [];

  for (const loan of S.money.loans) {
    loan.balance = Math.round(convertCurrency(loan.balance, fromCountry, toCountry, S.year));
    loan.monthlyPayment = Math.round(convertCurrency(loan.monthlyPayment, fromCountry, toCountry, S.year));
    loan.country = toCountry;
  }

  /* Cars stay behind / sold cleanly when moving overseas (except overland Gulf <-> Gulf) */
  const bothGulf = ['sau', 'uae'].includes(fromCountry) && ['sau', 'uae'].includes(toCountry);
  if (!bothGulf && S.cars.length > 0) {
    let carSaleNew = 0;
    for (const car of S.cars) {
      carSaleNew += Math.round(convertCurrency(car.valueLocal, fromCountry, toCountry, S.year));
    }
    const count = S.cars.length;
    S.cars = [];
    if (carSaleNew > 0) {
      // v2.9 B9: car-sale proceeds go through walletMove (was: direct cash
      // assignment + manual ledger line) — same ledger line, minor floor held.
      walletMove(S, carSaleNew, `Sold ${count > 1 ? 'vehicles' : 'car'} before relocating abroad`, 'lifestyle');
      recordJournal(S, `Sold your ${count > 1 ? 'vehicles' : 'car'} before relocating abroad (+${formatMoney(carSaleNew, toCountry)}).`, 'money');
    }
  } else {
    for (const car of S.cars) {
      car.valueLocal = Math.round(convertCurrency(car.valueLocal, fromCountry, toCountry, S.year));
      car.monthlyUpkeep = Math.round(convertCurrency(car.monthlyUpkeep, fromCountry, toCountry, S.year));
    }
  }

  /* Update primary bank to a real bank in the destination country */
  const newBanks = getBanksFor(toCountry, S.year);
  if (newBanks.length) {
    S.money.bankId = newBanks[0].id;
    S.money.bankName = newBanks[0].name;
  }

  /* Re-express property valuations in new local currency while keeping nativeValue intact! */
  for (const prop of S.housing.properties) {
    prop.valueLocal = Math.round(convertCurrency(prop.nativeValue, prop.country, toCountry, S.year));
    prop.installmentRemaining = Math.round(convertCurrency(prop.nativeInstallmentRemaining || 0, prop.country, toCountry, S.year));
    if (prop.country !== toCountry && prop.id === S.housing.currentHomeId) {
      prop.rentedOut = true; // Automatically rent out your owned home back home while living abroad!
    }
  }

  /* FX-Convert ALL Extended Assets & Liabilities (Zero 50x Currency Drift Bug!) */
  for (const pos of (S.investments || [])) {
    pos.valueLocal = Math.max(1, Math.round(convertCurrency(pos.valueLocal, fromCountry, toCountry, S.year)));
    pos.costBasisLocal = Math.max(1, Math.round(convertCurrency(pos.costBasisLocal || pos.valueLocal, fromCountry, toCountry, S.year)));
  }
  for (const inv of (S.inventory || [])) {
    inv.valueLocal = Math.max(1, Math.round(convertCurrency(inv.valueLocal, fromCountry, toCountry, S.year)));
  }
  for (const cc of (S.creditCards || [])) {
    cc.limit = Math.max(100, Math.round(convertCurrency(cc.limit, fromCountry, toCountry, S.year)));
    cc.balance = Math.max(0, Math.round(convertCurrency(cc.balance, fromCountry, toCountry, S.year)));
  }
  for (const bp of (S.bnplPlans || [])) {
    bp.balanceRemaining=Math.max(0,Math.round(convertCurrency(bp.balanceRemaining??bp.monthlyPay*bp.monthsLeft,fromCountry,toCountry,S.year)));
    bp.monthlyPay = Math.max(1, Math.round(convertCurrency(bp.monthlyPay, fromCountry, toCountry, S.year)));
  }
  for (const lnd of (S.housing.lands || [])) {
    lnd.valueLocal = Math.round(convertCurrency(lnd.nativeValue || lnd.valueLocal, lnd.country || fromCountry, toCountry, S.year));
    if (lnd.buildProject) {
      if(lnd.buildProject.remainingDrawPlayer!=null)lnd.buildProject.remainingDrawPlayer=Math.max(0,Math.round(convertCurrency(lnd.buildProject.remainingDrawPlayer,fromCountry,toCountry,S.year)));
      lnd.buildProject.monthlyDrawPlayer = Math.max(1, Math.round(convertCurrency(lnd.buildProject.monthlyDrawPlayer, fromCountry, toCountry, S.year)));
    }
  }
  if (S.housing.gehazInvestedLocal > 0) {
    S.housing.gehazInvestedLocal = Math.round(convertCurrency(S.housing.gehazInvestedLocal, fromCountry, toCountry, S.year));
  }
  if (S.gamiya && S.gamiya.active) {
    S.gamiya.monthlyContribution = Math.max(5, Math.round(convertCurrency(S.gamiya.monthlyContribution, fromCountry, toCountry, S.year)));
    for(const key of ['paidTotal','arrears'])if(Number.isFinite(S.gamiya[key]))S.gamiya[key]=Math.round(convertCurrency(S.gamiya[key],fromCountry,toCountry,S.year));
    for(const row of S.gamiya.contributionHistory||[])for(const key of ['due','paid'])row[key]=Math.round(convertCurrency(row[key],fromCountry,toCountry,S.year));
    S.gamiya.potTotal = Math.max(50, Math.round(convertCurrency(S.gamiya.potTotal, fromCountry, toCountry, S.year)));
  }
  if (S.creatorChannel && S.creatorChannel.monthlyIncomeLocal > 0) {
    S.creatorChannel.monthlyIncomeLocal = Math.max(5, Math.round(convertCurrency(S.creatorChannel.monthlyIncomeLocal, fromCountry, toCountry, S.year)));
  }
  S.housing.staff = [];
}

export function buyRuralCabin(S){
  if(S.player.age<18)return{ok:false,msg:'Property ownership opens at18.'};
  if(S.country!=='usa')return{ok:false,msg:'The rural cabin listing is available while living in the USA.'};
  const price=eraLocalCost(RURAL_CABIN.price2026,'usa',S.year);
  const result=finalizePropertyPurchase(S,{catalogId:RURAL_CABIN.id,name:RURAL_CABIN.name,shape:'cabin',country:'usa',city:'Rural Pennsylvania',tier:'modest',rooms:3,areaM2:109,nativeValue:price,nativeMonthlyRent:0,downInPlayerLocal:price},null,{moveIn:false});
  if(result.ok){result.prop.rentedOut=false;result.prop.ruralCabin=true;result.prop.styleId=RURAL_CABIN.id;result.prop.annualTaxNative=eraLocalCost(RURAL_CABIN.tax2026,'usa',S.year);result.prop.annualInsuranceNative=eraLocalCost(RURAL_CABIN.insurance2026,'usa',S.year);result.prop.maintenanceRate=.03;recordJournal(S,'Purchased a rural getaway, not a rental-income machine. Cabin property tax, insurance and maintenance are charged monthly. Prices and costs are game estimates, not a current quote.','housing');}
  return result;
}

export function buildInsolvencyScene(S){
 return{key:'formal_bankruptcy_filing',category:'money',title:'Cash Shortfall Relief',text:`Cash: ${formatMoney(S.money.cash,S.country)}. Game relief covers only this negative cash balance, with a seven-year new-credit block. Existing loans, cards, property installments, assets and legal restrictions remain. This is not local bankruptcy law.`,choices:[{label:'Use game relief · seven-year credit block',available:()=>S.money.cash<0&&S.year>S.money.bankruptUntilYear,effect:st=>applyCashShortfallRelief(st)},{label:'Keep debts and sell assets or earn cash',effect:st=>{st.cooldowns.formal_bankruptcy_filing=st.turn+12;recordJournal(st,'Declined game cash relief. Existing obligations remain.','money');}}]};
}
export function applyCashShortfallRelief(S){if(S.money.cash>=0||S.year<=S.money.bankruptUntilYear)return{ok:false};const amount=-S.money.cash;S.money.bankruptUntilYear=S.year+7;S.money.creditScore=Math.min(S.money.creditScore,410);walletMove(S,amount,'Game cash shortfall relief, seven-year new-credit block','bank');S.money.reliefHistory??=[];const receipt={id:nextId(S,'relief'),amount,country:S.country,year:S.year,creditBlockedUntilYear:S.money.bankruptUntilYear};S.money.reliefHistory.push(receipt);recordJournal(S,'Game relief covered the negative cash balance. All existing debts, assets and legal restrictions remain.','money');return{ok:true,receipt};}
