import {recordMarriageAssets,settleGameDivorce,divorceChildren,divorceBuyoutRequired} from './divorceModel.js';
/* ============================================================================
   World Life 2.0 — Cultural Courtship, Marriage Contracts, Children & Divorce
   Authentic Egypt (Fatiha, Shabka, Qa'ima, Mahr, Khula), Saudi/UAE (Wali,
   Premarital Genetic Screening, Mixed-Marriage Tasreeh, Polygamy Crisis), and
   Western (Cohabitation, Prenups, Equitable Division, Jus Soli Birthright).
   ========================================================================== */

import { rand, randInt, pick, chance, clamp } from '../core/rng.js';
import {
  createPerson, nextId, recordJournal, walletMove, queueScene, moveBalance,
  deriveUnionType, newCoupleRecord, getCoupleForSpouse, setCoupleStage,
  syncCoupleToLegacy, closeCouple
} from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraLocalCost, eraSalary, goldPricePerGram, convertCurrency } from '../data/economy.js';
import { getMarriageProfile } from '../data/visasAndMarriage.js';
import { V1_CHILD_NURSERIES, V1_CHILD_ACTIVITIES } from '../data/megaCareerEduMedical.js';
import { rememberDeed, emitFact, closeMarriageWithoutCouple } from './soulEngine.js';

/* v2.12 — ONE place that decides whether meeting someone new would open
   an additional-spouse path. Read entirely from the country's own marriage
   profile for this era (polygamyAllowedForMuslimMen) plus who the player
   is — no country names in code, and the view and the engine can never
   disagree about it again. Returns { married, allowed, spouses,
   firstSpouse }: married = already has a living spouse; allowed = the
   law permits this player another spouse now (and how many they already
   have is under the four-spouse ceiling). When married and not allowed,
   meeting someone new is not offered at all. */
export function additionalSpousePath(S, prof) {
  const spouses = (S.relations.spouseIds || []).map(id => S.people[id]).filter(p => p && p.alive);
  if (spouses.length === 0) return { married: false, allowed: false, spouses, firstSpouse: null };
  const allowed = !!(prof.polygamyAllowedForMuslimMen && S.player.gender === 'm' && S.player.religion === 'muslim' && spouses.length < 4);
  return { married: true, allowed, spouses, firstSpouse: spouses[0] };
}

export function introducePartnerProspect(S, channel = 'social') {
  if (S.player.age < 18) return { ok: false, msg: 'Wait until adulthood (18+) for serious courtship.' };

  const prof = getMarriageProfile(S.country, S.year);
  const alreadyMarriedCount = S.relations.spouseIds.length;

  if (alreadyMarriedCount > 0) {
    const path = additionalSpousePath(S, prof);
    if (!path.allowed) {
      return { ok: false, msg: 'You are already married (polygamy is not legally recognized here).' };
    }
  }
  if (S.relations.partnerId && S.people[S.relations.partnerId]?.alive) {
    return { ok: false, msg: `You are already seeing ${S.people[S.relations.partnerId].fullName}.` };
  }

  const targetGender = S.player.gender === 'm' ? 'f' : 'm';
  /* Channel determines nationality & traditionalism */
  const partnerCountry = channel === 'family_intro'
    ? S.homeCountry
    : (S.country !== S.homeCountry && chance(S, 0.55) ? S.country : S.homeCountry);

  const pCountryObj = getCountry(partnerCountry);
  const partnerAge = Math.max(18, S.player.age + (S.player.gender === 'm' ? randInt(S, -4, 1) : randInt(S, -1, 5)));
  const used = Object.values(S.people).map(p => p.firstName);

  const basePay = eraSalary(pCountryObj.annualSalaryTiers2026.entry / 12, S.country, S.year);
  const partnerWorks = chance(S, partnerCountry === 'sau' && S.year < 2017 ? 0.32 : 0.72);

  const partner = createPerson(S, {
    gender: targetGender,
    age: partnerAge,
    role: 'partner',
    relationLabel: channel === 'family_intro' ? 'Prospective Match (Salonat/Family)' : 'Romantic Partner',
    nationality: partnerCountry,
    citizenships: [partnerCountry],
    residenceCountry: S.country,
    city: S.city,
    excludeNames: used,
    traits: channel === 'family_intro' ? { traditionalism: randInt(S, 62, 92) } : undefined,
    jobTitle: partnerWorks ? pick(S, ['Pharmacist', 'Architect', 'Teacher', 'Financial Analyst', 'Software Designer', 'Physician']) : 'Graduate',
    monthlyIncomeLocal: partnerWorks ? Math.round(basePay * (0.9 + rand(S) * 0.7)) : 0,
    savingsLocal: Math.round(basePay * randInt(S, 2, 10)),
    affection: channel === 'family_intro' ? 58 : 70,
    trust: 62,
    respect: 64,
    chemistry: randInt(S, 55, 94)
  });

  S.people[partner.id] = partner;
  S.relations.partnerId = partner.id;
  // ONE couple record, opened at "dating" — the union type is derived now
  // from the country's own profile (see deriveUnionType) and re-confirmed
  // at the wedding; no second record is created at engagement or wedding.
  const couple = newCoupleRecord(S, 'player', partner.id, {
    stage: 'dating',
    unionType: deriveUnionType(prof, S.player, partner, S.year),
    country: S.country
  });
  S.marriage.couples.push(couple);
  syncCoupleToLegacy(S, couple);

  /* Also create Partner's Father (Wali / Father-in-law) so negotiations feel like talking to a real person! */
  const wali = createPerson(S, {
    gender: 'm',
    familyName: partner.familyName,
    age: partner.age + randInt(S, 26, 35),
    role: 'in_law',
    relationLabel: `${partner.firstName}'s Father`,
    nationality: partnerCountry,
    residenceCountry: partnerCountry === S.country ? S.country : partnerCountry,
    city: partnerCountry === S.country ? S.city : pCountryObj.cities[0],
    excludeNames: [...used, partner.firstName],
    jobTitle: pick(S, ['Retired Civil Engineer', 'Senior Merchant', 'Ministry Advisor', 'Hospital Consultant', 'School Director']),
    affection: 52,
    respect: S.career.employed ? 64 : 42,
    trust: 55
  });
  partner.waliId = wali.id;
  S.people[wali.id] = wali;
  if (!S.relations.inLawIds.includes(wali.id)) S.relations.inLawIds.push(wali.id);

  const introText = channel === 'family_intro'
    ? `Through family introductions, you met ${partner.fullName} (age ${partner.age}, ${partner.career.title.toLowerCase()}) alongside her father ${wali.fullName} (${wali.traitTags.join(' · ')}).`
    : `You hit it off with ${partner.fullName} (age ${partner.age}, ${partner.career.title.toLowerCase()}, ${partner.traitTags.join(' · ')}) in ${S.city}.`;

  recordJournal(S, introText, 'relationship');
  return { ok: true, msg: `Met ${partner.fullName}!`, partner };
}

export function moveInTogetherCohabitation(S) {
  const partner = S.relations.partnerId ? S.people[S.relations.partnerId] : null;
  if (!partner || !partner.alive) return { ok: false, msg: 'No active partner.' };

  const prof = getMarriageProfile(S.country, S.year);
  if (!prof.cohabitationAllowedNow) {
    return { ok: false, msg: `Unmarried cohabitation is not legally/socially permitted in ${getCountry(S.country).name} in ${S.year}. Propose formal engagement instead.` };
  }
  if (S.housing.mode === 'parents') {
    return { ok: false, msg: 'Rent or buy your own apartment on the Wealth & Home screen before moving in together.' };
  }

  partner.relationLabel = 'Live-In Partner';
  S.marriage.householdSplit = 'shared_50_50';
  rememberDeed(S, partner, 'visited', `Moved in together at ${S.housing.currentHomeName}.`, { affection: 10, trust: 8 });
  recordJournal(S, `${partner.fullName} moved into ${S.housing.currentHomeName} with you, sharing household bills.`, 'relationship');
  return { ok: true, msg: `Moved in with ${partner.firstName}!` };
}

/* Propose Formal Engagement — Enforces Country Customs, Wali Vetting, Medical Screening & Mixed-Marriage Permits! */
export function proposeEngagement(S, tierChoice = 'standard', signQaima = true) {
  const partner = S.relations.partnerId ? S.people[S.relations.partnerId] : null;
  if (!partner || !partner.alive) return { ok: false, msg: 'Meet a partner first.' };

  const prof = getMarriageProfile(S.country, S.year);
  const wali = partner.waliId ? S.people[partner.waliId] : null;

  /* 1. Saudi / UAE Mixed-Nationality Marriage Permit (Tasreeh Zawaj) Check! */
  const playerIsLocalCit = S.legal.citizenships.includes(S.country);
  const partnerIsLocalCit = partner.citizenships.includes(S.country);
  if (prof.mixedMarriagePermitRequired && (playerIsLocalCit !== partnerIsLocalCit)) {
    const minCitAge = prof.mixedMarriageMinCitizenAge || 25;
    const citAge = playerIsLocalCit ? S.player.age : partner.age;
    if (citAge < minCitAge) {
      return {
        ok: false,
        msg: `Ministry Mixed-Marriage Permit (Tasreeh Zawaj) in ${getCountry(S.country).name} requires the citizen spouse to be at least age ${minCitAge} (currently ${citAge}).`
      };
    }
    if (S.legal.criminalRecord) {
      return { ok: false, msg: 'Ministry rejected mixed-marriage clearance due to criminal record.' };
    }
  }

  /* 2. Traditional Father / Wali Vetting in Egypt, Saudi & UAE (Wired with Reputation, Hajj, Property Deed & Integrity!) */
  if (['egy', 'sau', 'uae'].includes(S.country) && S.player.gender === 'm' && wali && wali.alive) {
    if ((S.values?.integrity ?? 60) < 28 && wali.traits.traditionalism >= 60) {
      return {
        ok: false,
        msg: `${wali.firstName} hesitated after asking around the neighborhood about your reputation — build community Integrity & Reputation first.`
      };
    }
    const ownsLocalHome = S.housing.properties.some(p => p.country === S.country);
    const highStanding = (S.reputation || 55) >= 75 || !!S.credentials?.hajjCompleted || ownsLocalHome;
    if (!S.career.employed && !S.career.business && !ownsLocalHome && S.money.cash < eraLocalCost(getCountry(S.country).annualSalaryTiers2026.mid, S.country, S.year)) {
      return {
        ok: false,
        msg: `${wali.firstName} (${partner.firstName}'s father) refused Al-Fatiha: "Stabilize your job, enterprise, or home deed before asking for my daughter’s hand."`
      };
    }
    if (S.country === 'egy' && S.legal.military.applicable && ['deferred_minor', 'active_duty'].includes(S.legal.military.status)) {
      return {
        ok: false,
        msg: `${wali.firstName} insisted you clarify or finish your military service certificate first.`
      };
    }
    if (S.country === 'egy' && !signQaima && wali.traits.traditionalism >= (highStanding ? 78 : 52)) {
      return {
        ok: false,
        msg: `${wali.firstName} refused flatly: "In our family, no Katb Ketab happens without signing the Qa'ima household list to protect my daughter's rights."`
      };
    }
  }

  /* 3. Calculate Shabka (Gold) + Prompt/Deferred Mahr Costs */
  const tierKey = ['modest', 'standard', 'generous'].includes(tierChoice) ? tierChoice : 'standard';
  const groomPaysCustom = S.player.gender === 'm';

  let shabkaGrams = 0;
  let shabkaCost = 0;
  if (prof.hasShabkaGold) {
    shabkaGrams = prof.shabkaGramsTiers[tierKey] || 40;
    shabkaCost = Math.round(shabkaGrams * goldPricePerGram(S.country, S.year, 21));
  }

  let mahrPrompt = 0;
  let mahrDeferred = 0;
  if (prof.hasMahr) {
    mahrPrompt = eraLocalCost(prof.mahrPrompt2026[tierKey] || 50000, S.country, S.year);
    mahrDeferred = eraLocalCost(prof.mahrDeferred2026[tierKey] || 80000, S.country, S.year);
  }

  /* Western engagement ring if no Shabka */
  const ringCost = (!prof.hasShabkaGold && groomPaysCustom)
    ? eraLocalCost((getCountry(S.country).monthlyBasket2026.rentStandard || 1500) * (tierKey === 'generous' ? 2.5 : tierKey === 'standard' ? 1.2 : 0.45), S.country, S.year)
    : 0;

  const medicalFee = prof.medicalRequiredNow
    ? eraLocalCost(getCountry(S.country).healthcare.checkup2026, S.country, S.year)
    : 0;

  const upfrontPlayerCost = (groomPaysCustom ? (shabkaCost + ringCost) : 0) + medicalFee;
  if (S.money.cash < upfrontPlayerCost) {
    return {
      ok: false,
      msg: `Need ${formatMoney(upfrontPlayerCost, S.country)} in cash for ${prof.hasShabkaGold ? `${shabkaGrams}g 21K gold Shabka` : 'engagement ring'}${medicalFee ? ' + premarital medical screening' : ''}.`
    };
  }

  if (upfrontPlayerCost > 0) {
    walletMove(S, -upfrontPlayerCost, `Engagement (${prof.hasShabkaGold ? `${shabkaGrams}g Shabka` : 'Ring'}${medicalFee ? ' & Medical Screening' : ''})`, 'family');
  }

  /* Premarital Genetic Screening realism in Saudi / UAE / Egypt */
  let medicalNote = '';
  if (prof.medicalRequiredNow) {
    medicalNote = ' Mandatory premarital genetic & blood screening came back clear.';
  }

  const gehazAlready = Number(S.housing?.gehazInvestedLocal || 0);
  const baseQaima = Math.round(convertCurrency(eraLocalCost(420000, 'egy', S.year), 'egy', S.country, S.year));
  const qaimaVal = (prof.hasQaimaList && signQaima)
    ? Math.max(baseQaima, gehazAlready + shabkaCost)
    : 0;

  // Advance THE couple record to "engaged" (no new record) and price the
  // mahr on it: promised amounts live in couple.money; nothing is "paid"
  // until the wedding charges it (see celebrateWedding).
  let couple = getCoupleForSpouse(S, partner.id);
  if (!couple) {
    couple = newCoupleRecord(S, 'player', partner.id, {
      stage: 'dating',
      unionType: deriveUnionType(prof, S.player, partner, S.year),
      country: S.country
    });
    S.marriage.couples.push(couple);
  }
  couple.money.mahrPrompt = mahrPrompt;
  couple.money.mahrDeferred = mahrDeferred;
  couple.money.shabkaGrams = shabkaGrams;
  couple.money.qaimaSigned = !!(prof.hasQaimaList && signQaima);
  couple.money.qaimaValueLocal = qaimaVal;
  couple.money.prenupSigned = false;
  couple.money.regime = prof.propertyRegime || null;
  setCoupleStage(S, couple, 'engaged');
  syncCoupleToLegacy(S, couple);

  partner.relationLabel = 'Fiancé(e)';
  rememberDeed(S, partner, 'proud_moment', `Celebrated engagement (${tierKey} tier).`, {
    affection: tierKey === 'generous' ? 14 : 9,
    trust: 10
  });
  if (wali) {
    rememberDeed(S, wali, 'proud_moment', `Agreed terms respectfully during engagement.`, { respect: 12, trust: 10 });
  }

  recordJournal(
    S,
    `Officially engaged to ${partner.fullName}!${prof.hasShabkaGold && groomPaysCustom ? ` Presented ${shabkaGrams}g of 21K gold Shabka.` : ''}${medicalNote}`,
    'milestone'
  );
  return { ok: true, msg: `Engaged to ${partner.fullName}!` };
}

export function toggleEngagementPrenup(S) {
  if (!S.marriage.engagement) return { ok: false, msg: 'Must be engaged first.' };
  const prof = getMarriageProfile(S.country, S.year);
  if (prof.hasMahr) return { ok: false, msg: 'In Sharia marriage contracts, financial terms are governed by Mahr & separate-property law rather than Western prenups.' };

  const partner = S.people[S.marriage.engagement.partnerId];
  const couple = partner ? getCoupleForSpouse(S, partner.id) : null;
  if (!S.marriage.engagement.prenupSigned) {
    if (partner && partner.traits.warmth > 75 && partner.traits.pride > 70) {
      partner.rel.affection = clamp(partner.rel.affection - 6);
    }
    S.marriage.engagement.prenupSigned = true;
    if (couple) {
      couple.money.prenupSigned = true;
      syncCoupleToLegacy(S, couple);
    }
    recordJournal(S, `Drafted and signed a formal prenuptial asset agreement with ${partner?.firstName || 'your partner'}.`, 'family');
    return { ok: true, msg: 'Prenup signed.' };
  } else {
    S.marriage.engagement.prenupSigned = false;
    if (couple) {
      couple.money.prenupSigned = false;
      syncCoupleToLegacy(S, couple);
    }
    return { ok: true, msg: 'Prenup torn up.' };
  }
}

/* Household settings the UI used to write directly — now engine functions. */
export function setTryingForBaby(S, value) {
  S.marriage.tryingForBaby = !!value;
  return { ok: true, msg: S.marriage.tryingForBaby ? 'Now trying for a baby!' : 'Paused family planning.' };
}

export function cycleHouseholdSplit(S) {
  const order = ['traditional_provider', 'shared_50_50', 'proportional'];
  S.marriage.householdSplit = order[(order.indexOf(S.marriage.householdSplit) + 1) % order.length];
  return { ok: true, msg: `Household split: ${S.marriage.householdSplit.replaceAll('_', ' ')}.` };
}

/* THE one pregnancy writer (D4): the monthly tick and the IVF clinic both
   open a pregnancy through here, so there is exactly one record and one shape. */
export function startPregnancy(S, motherId, opts = {}) {
  if (S.marriage.pregnancy) return { ok: false, msg: 'Already expecting.' };
  const couple = opts.coupleId
    ? S.marriage.couples.find(c => c.id === opts.coupleId)
    : (motherId && motherId !== 'player' ? getCoupleForSpouse(S, motherId) : getActiveCoupleForPlayer(S));
  S.marriage.pregnancy = {
    motherId,
    conceptionTurn: S.turn,
    dueMonths: 9,
    babyCount: opts.babyCount || 1,
    coupleId: couple ? couple.id : null
  };
  return { ok: true };
}

function getActiveCoupleForPlayer(S) {
  return (S.marriage.couples || []).find(c =>
    c && c.partners && c.partners.includes('player') &&
    (c.stage === 'married' || c.stage === 'engaged')
  ) || null;
}

/* Complete Wedding Ceremony & Sign Marriage Contract! */
export function celebrateWedding(S, venueId = null, opts = {}) {
  const eng = S.marriage.engagement;
  if (!eng) return { ok: false, msg: 'Get engaged first before celebrating the wedding.' };
  const partner = S.people[eng.partnerId];
  if (!partner || !partner.alive) return { ok: false, msg: 'Fiancé(e) unavailable.' };

  const prof = getMarriageProfile(S.country, S.year);
  const cObj = getCountry(S.country);

  /* Marital Housing Requirement in Egypt, Saudi & UAE! */
  if (['egy', 'sau', 'uae'].includes(S.country) && S.housing.mode === 'parents') {
    return {
      ok: false,
      msg: `Independent marital housing is required before the wedding in ${cObj.name} — rent or buy an apartment on the Wealth & Home screen first!`
    };
  }

  const venue = prof.venues2026.find(v => v.id === venueId) || prof.venues2026[0];
  const venueCost = eraLocalCost(venue.cost, S.country, S.year);
  const mahrPromptDue = S.player.gender === 'm' ? (eng.mahrPrompt || 0) : 0;
  const rawFurnishNeed = S.housing.mode !== 'parents'
    ? Math.round(eraLocalCost(cObj.monthlyBasket2026.rentStandard * 2.5, S.country, S.year) * (1 - (prof.gehazBrideSharePct || 0.3)))
    : 0;
  /* Causal Gehaz Chain: rooms already furnished on your 3D Home Blueprint reduce remaining setup cost! */
  const gehazCredit = Number(S.housing?.gehazInvestedLocal || 0);
  const furnishCost = Math.max(0, rawFurnishNeed - gehazCredit);

  const totalDue = venueCost + mahrPromptDue + furnishCost;
  if (S.money.cash < totalDue) {
    /* Itemise the total so the parts visibly add up to it — each part is
       already inside the total, not extra on top of it. Zero parts are
       left out rather than printed as (0). */
    const parts = [`venue ${Math.round(venueCost).toLocaleString('en-US')}`];
    if (mahrPromptDue > 0) parts.push(`prompt Mahr ${Math.round(mahrPromptDue).toLocaleString('en-US')}`);
    if (furnishCost > 0) parts.push(`Gehaz setup ${Math.round(furnishCost).toLocaleString('en-US')}`);
    return {
      ok: false,
      msg: `Need ${formatMoney(totalDue, S.country)} in total: ${parts.join(' + ')}.`
    };
  }

  // Charge each part on its own ledger line — the ledger can now tell mahr
  // from venue from furniture, and the prompt mahr is recorded as PAID.
  walletMove(S, -venueCost, `Wedding venue: ${venue.label}`, 'family');
  if (mahrPromptDue > 0) {
    walletMove(S, -mahrPromptDue, `Prompt Mahr paid to ${partner.firstName}`, 'family');
  }
  if (furnishCost > 0) {
    walletMove(S, -furnishCost, 'Marital home setup (Gehaz)', 'family');
  }

  /* Authentic Noqta / Wedding Cash Envelope Gifts from Family & Circle! */
  const warmCircle = Object.values(S.people).filter(p => p && p.alive && p.id !== 'player' && (p.rel?.affection || 0) >= 55).length;
  const noqtaPct = Math.min(0.45, 0.20 + warmCircle * 0.03 + rand(S) * 0.08);
  const noqtaCash = Math.round(venueCost * noqtaPct);
  if (noqtaCash > 0) {
    const giftWord = ['egy', 'sau', 'uae'].includes(S.country) ? 'Noqta cash envelopes' : 'wedding gift envelopes';
    walletMove(S, noqtaCash, `Received ${giftWord} from ${warmCircle + 25} guests`, 'family');
  }
  /* If female bride in Mahr jurisdiction, prompt Mahr enters her personal/wallet savings! */
  if (S.player.gender === 'f' && prof.hasMahr && eng.mahrPrompt > 0) {
    walletMove(S, eng.mahrPrompt, `Received Prompt Mahr (${partner.firstName})`, 'family');
  }

  const existingFirstWives = S.relations.spouseIds.map(id => S.people[id]).filter(w => w && w.alive);

  partner.role = 'spouse';
  partner.relationLabel = partner.gender === 'f' ? 'Wife' : 'Husband';
  partner.residenceCountry = S.country;
  partner.city = S.city;

  // Advance THE couple record to "married": union type is the caller's
  // explicit type when given, else the profile-derived default — never a
  // country name in code. Prompt mahr is now recorded as PAID (or, for a
  // female player, as received); the deferred mahr stays OWED until divorce.
  let couple = getCoupleForSpouse(S, partner.id);
  if (!couple) {
    couple = newCoupleRecord(S, 'player', partner.id, { stage: 'engaged', country: S.country });
    S.marriage.couples.push(couple);
  }
  couple.unionType = opts.unionType || deriveUnionType(prof, S.player, partner, S.year);
  couple.country = S.country;
  couple.money.mahrPrompt = eng.mahrPrompt || 0;
  couple.money.mahrPromptPaid = S.player.gender === 'm' ? mahrPromptDue : (eng.mahrPrompt || 0);
  couple.money.mahrDeferred = eng.mahrDeferred || 0;
  couple.money.mahrDeferredPaid = 0;
  couple.money.shabkaGrams = eng.shabkaGrams || 0;
  couple.money.qaimaSigned = !!eng.qaimaSigned;
  couple.money.qaimaValueLocal = eng.qaimaValueLocal || 0;
  couple.money.prenupSigned = !!eng.prenupSigned;
  couple.money.regime = prof.propertyRegime || couple.money.regime || null;
  couple.geography.a = { country: S.country, city: S.city, residency: S.legal.residency.kind, visa: null };
  couple.geography.b = { country: partner.residenceCountry || S.country, city: partner.city || S.city, residency: null, visa: null };
  couple.geography.plan.liveCountry = S.country;
  couple.geography.plan.liveCity = S.city;
  recordMarriageAssets(S,couple);
  setCoupleStage(S, couple, 'married');
  syncCoupleToLegacy(S, couple);
  // The compat contract (created by the sync) carries the venue for the UI.
  const contract = S.marriage.contracts.find(c => c.id === couple.contractId) || {};
  contract.venueLabel = venue.label;
  S.marriage.householdSplit = ['egy', 'sau', 'uae'].includes(S.country) ? 'traditional_provider' : 'shared_50_50';

  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 16);
  rememberDeed(S, partner, 'proud_moment', `Married at ${venue.label}.`, { affection: 18, trust: 14, respect: 12, weight: 3 });
  emitFact(S, 'MARRIED', { spouseName: partner.fullName, venue: venue.label });

  recordJournal(
    S,
    `Married ${partner.fullName} at ${venue.label}!${noqtaCash > 0 ? ` Guests gifted ${formatMoney(noqtaCash, S.country)} in ${['egy', 'sau', 'uae'].includes(S.country) ? 'Noqta' : 'wedding'} envelopes.` : ''}${contract.mahrDeferred > 0 ? ` Contract recorded ${formatMoney(contract.mahrDeferred, S.country)} deferred Mahr${contract.qaimaSigned ? ` and a ${formatMoney(contract.qaimaValueLocal, S.country)} Qa'ima list` : ''}.` : ''}`,
    'milestone'
  );

  /* Mandatory First-Wife Crisis Scene when entering a Polygamous Marriage! */
  if (existingFirstWives.length > 0) {
    const firstWife = existingFirstWives[0];
    rememberDeed(S, firstWife, 'insulted', `Took a second wife (${partner.fullName}).`, {
      affection: -38, trust: -35, resentment: 55, weight: 4
    });

    queueScene(S, {
      key: `polygamy_reaction_${firstWife.id}_${S.year}`,
      category: 'family',
      speakerId: firstWife.id,
      title: `${firstWife.firstName} Learns of Your Second Marriage`,
      text: `Word of your marriage contract with ${partner.fullName} reaches ${firstWife.fullName} immediately (under personal status notification rules). Furious and heartbroken, she confronts you that evening.`,
      choices: [
        {
          label: 'Grant the statutory divorce she demands and pay her full contract rights',
          effect: (st) => {
            initiateDivorce(st, firstWife.id, 'spouse_demanded_over_polygamy');
          }
        },
        {
          label: `Guarantee ${firstWife.firstName} an independent household & generous monthly allowance`,
          effect: (st) => {
            const monthlyStip = eraLocalCost(cObj.monthlyBasket2026.rentStandard, st.country, st.year);
            walletMove(st, -monthlyStip * 2, `Separate household settlement for ${firstWife.firstName}`, 'family');
            firstWife.rel.resentment = clamp(firstWife.rel.resentment - 12);
            recordJournal(st, `${firstWife.firstName} remained married for the household's stability after securing separate living guarantees, though deep distance remained.`, 'relationship');
          }
        }
      ]
    }, true);
  }

  return { ok: true, msg: `Married ${partner.fullName}!`, contract };
}

/* Monthly Pregnancy, Birth (with Jus Soli vs Jus Sanguinis Citizenship Logic!) & Marital Health */
export function tickMarriageAndFamilyMonthly(S) {
  const livingSpouses = S.relations.spouseIds.map(id => S.people[id]).filter(p => p && p.alive);

  /* 1. Active 9-Month Pregnancy Countdown */
  if(S.marriage.pregnancy&&S.marriage.pregnancy.motherId!=='player'&&!S.people[S.marriage.pregnancy.motherId]?.alive){
    S.marriage.pregnancy=null;S.marriage.tryingForBaby=false;
    recordJournal(S,'The pregnancy ended after the mother died. The family needs time to grieve.','health');
  }
  if (S.marriage.pregnancy) {
    S.marriage.pregnancy.dueMonths -= 1;
    if (S.marriage.pregnancy.dueMonths <= 0) {
      const motherSpouse = S.marriage.pregnancy.motherId==='player'?S.player:S.people[S.marriage.pregnancy.motherId];
      S.marriage.pregnancy = null;
      S.marriage.tryingForBaby = false;
      deliverNewbornChild(S, motherSpouse);
    }
  } else if (S.marriage.tryingForBaby && livingSpouses.length > 0) {
    const coResSpouse = livingSpouses.find(sp => sp.residenceCountry === S.country && sp.gender!==S.player.gender && sp.age>=18);
    if (coResSpouse && S.player.age>=18) {
      const femAge = S.player.gender === 'f' ? S.player.age : coResSpouse.age;
      if (femAge < 46) {
        const baseFert = femAge < 32 ? 0.18 : femAge < 38 ? 0.11 : femAge < 42 ? 0.05 : 0.02;
        if (chance(S, baseFert * (S.medical.fertilityScore / 85))) {
          startPregnancy(S, S.player.gender === 'f' ? 'player' : coResSpouse.id);
          recordJournal(S, `Wonderful news — you and ${coResSpouse.firstName} are expecting a baby in 9 months!`, 'milestone');
        }
      }
    }
  }

  /* 2. Realistic Marital Strain Check (ONLY when genuine strain exists — zero timer decay on happy marriages!) */
  if (S.month === 11 && livingSpouses.length > 0) {
    for (const sp of livingSpouses) {
      const separatedAbroad = sp.residenceCountry !== S.country;
      const severeDebt = S.money.cash < 0;
      if (separatedAbroad) {
        sp.rel.resentment = clamp(sp.rel.resentment + 7);
        sp.rel.affection = clamp(sp.rel.affection - 4);
      }
      if (severeDebt && sp.traits.materialism >= 62) {
        sp.rel.resentment = clamp(sp.rel.resentment + 8);
      }
      if (!separatedAbroad && !severeDebt && sp.rel.resentment < 30) {
        /* Healthy co-resident marriages gently deepen trust over years together */
        sp.rel.trust = clamp(sp.rel.trust + 1);
        sp.rel.affection = clamp(sp.rel.affection + 1);
      }

      /* Crisis warning if resentment > 75 and affection < 30 */
      if (sp.rel.resentment >= 76 && sp.rel.affection <= 32) {
        queueScene(S, {
          key: `marital_crisis_${sp.id}_${S.year}`,
          category: 'family',
          speakerId: sp.id,
          title: `Breaking Point Between You and ${sp.firstName}`,
          text: `Years of accumulated resentment come to a head. ${sp.fullName} sits across from you: "We cannot keep pretending everything is fine in this marriage."`,
          choices: [
            {
              label: 'Commit to counseling, clear grievances & prioritize the household',
              effect: (st) => {
                sp.rel.resentment = clamp(sp.rel.resentment - 28);
                sp.rel.affection = clamp(sp.rel.affection + 14);
                st.player.vitals.stress = clamp(st.player.vitals.stress - 8);
                recordJournal(st, `You and ${sp.firstName} had a raw, overdue reckoning and worked to repair your marriage.`, 'relationship');
              }
            },
            {
              label: 'Agree to end the marriage and settle divorce terms',
              effect: (st) => {
                initiateDivorce(st, sp.id, 'mutual_breakdown');
              }
            }
          ]
        });
      }
    }
  }
}

function deliverNewbornChild(S, otherParent) {
  const cObj = getCountry(S.country);
  const gender = chance(S, 0.5) ? 'm' : 'f';
  /* Culturally accurate surname: father's surname in Arab/Western tradition */
  const childSurname = S.player.gender === 'm'
    ? S.player.familyName
    : (otherParent && otherParent.id !== 'player' ? otherParent.familyName : S.player.familyName);

  const used = Object.values(S.people).map(p => p.firstName);

  /* Authentic Citizenship Law at Birth!
     - USA & Canada grant Jus Soli birthright citizenship automatically!
     - UK/Germany/Australia grant local citizenship if a parent is Citizen or PR!
     - Saudi/UAE/Egypt transmit citizenship primarily by descent (Jus Sanguinis)! */
  const babyCitizenships = new Set(S.legal.citizenships);
  if (otherParent && Array.isArray(otherParent.citizenships)) {
    for (const c of otherParent.citizenships) babyCitizenships.add(c);
  }
  if (S.country === 'usa' || S.country === 'can' || S.country === 'bra') {
    babyCitizenships.add(S.country); // Jus Soli birthright!
  } else if (
    ['gbr', 'deu', 'aus', 'fra', 'nld'].includes(S.country) &&
    (S.legal.citizenships.includes(S.country) || S.legal.residency.kind === 'permanent_resident')
  ) {
    babyCitizenships.add(S.country);
  }

  const baby = createPerson(S, {
    gender,
    familyName: childSurname,
    age: 0,
    birthYear: S.year,
    birthMonth: S.month,
    role: 'child',
    relationLabel: gender === 'f' ? 'Daughter' : 'Son',
    nationality: [...babyCitizenships][0] || S.homeCountry,
    citizenships: [...babyCitizenships],
    residenceCountry: S.country,
    city: S.city,
    skinToneIdx: S.player.appearance.skinToneIdx,
    affection: 88,
    trust: 85,
    respect: 75
  });

  const privDeliveryCost = Math.round(eraLocalCost(cObj.healthcare.checkup2026 * 5, S.country, S.year) * (1 - cObj.healthcare.publicCoveragePct * 0.6));
  if (S.money.cash >= privDeliveryCost) {
    walletMove(S, -privDeliveryCost, `Maternity & hospital delivery for ${baby.firstName}`, 'medical');
  }

  baby.parentIds=['player',otherParent?.id].filter(Boolean);
  S.people[baby.id] = baby;
  S.relations.childIds.push(baby.id);
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 18);
  emitFact(S, 'NEW_BABY', { childName: baby.fullName });

  const jusSoliNote = (S.country === 'usa' || S.country === 'can') && !S.legal.citizenships.includes(S.country)
    ? ` Born in ${cObj.name}, ${baby.firstName} automatically acquired birthright ${cObj.adjective} citizenship!`
    : '';

  recordJournal(
    S,
    `Your ${baby.relationLabel.toLowerCase()} ${baby.fullName} was born healthy in ${S.city}!${jusSoliNote}`,
    'milestone'
  );
  return baby;
}

/* Authentic Divorce & Khula Settlement (Mahr Mu'akhkhar, Qa'ima, UK 2022 No-Fault, Prenup/50-50 Split) */
export function initiateDivorce(S, spouseId = null, mode = 'standard', options = {}) {
  const targetId = spouseId || S.relations.spouseIds[0];
  const spouse = targetId ? S.people[targetId] : null;
  if (!spouse || !S.relations.spouseIds.includes(targetId)) return { ok: false, msg: 'No active spouse.' };
  if(options.assetMode==='buyout'&&S.money.cash+S.money.savings<divorceBuyoutRequired(S,targetId))return{ok:false,msg:'Not enough liquid cash for the game asset buyout and settlement. Save more or choose sale.'};
  if(!options.confirmed){
    const children=divorceChildren(S,targetId);
    queueScene(S,{key:`divorce_plan_${targetId}_${S.year}_${S.month}`,divorcePlan:{spouseId:targetId,mode,assetMode:options.assetMode},category:'family',title:'Divorce settlement and children',text:'Simplified game model, not local family law. Without a prenup, post-wedding properties (including foreign homes), cars and liquid gains are split 50/50 after debts; Choose sale, or negotiate keeping home/car titles through a funded buyout. 50/50 is a game agreement, not the law everywhere. Recorded premarital assets remain separate. Old marriages without an inventory treat existing property/cars as shared. Legal fees apply. Investment gains, new business equity and funded private-pension growth are split in kind. Pre-existing business equity and public pension rights are not divided; mixed funds and detailed tax/court orders remain unmodelled. Existing mahr obligations are settled separately. Child support lasts to 18, while unpaid arrears remain owed, custody does not delete a parent or child. Infidelity is not a financial penalty.',choices:[...((children.length?['shared','player','spouse','contest']:['shared']).map(c=>({label:c==='contest'?'Contest custody (higher legal fees; game best-interest review)':`Proceed: ${children.length?c+' custody':'asset settlement, no minor children'}`,effect:st=>initiateDivorce(st,targetId,mode,{confirmed:true,assetMode:options.assetMode||'sell',custody:c==='contest'?'shared':c,contested:c==='contest'})}))),{label:'Pause, do not file',effect:()=>{}}]},true);
    return {ok:true,msg:'Review the game settlement and custody choice.'};
  }

  const couple = getCoupleForSpouse(S, spouse.id);
  const contract = S.marriage.contracts.find(c => c.spouseId === spouse.id && c.active) || {};
  const prof = getMarriageProfile((couple && couple.country) || contract.country || S.country, S.year);
  // Money truth lives on the couple record: promised vs PAID. Divorce and
  // widowhood settle ONLY the owed remainder (deferred - deferredPaid).
  const mahrPrompt = (couple ? couple.money.mahrPrompt : contract.mahrPrompt) || 0;
  const mahrPromptPaid = (couple ? couple.money.mahrPromptPaid : contract.mahrPromptPaid) || 0;
  const mahrDeferred = (couple ? couple.money.mahrDeferred : contract.mahrDeferred) || 0;
  const mahrDeferredPaid = (couple ? couple.money.mahrDeferredPaid : contract.mahrDeferredPaid) || 0;
  const mahrDeferredOwed = Math.max(0, mahrDeferred - mahrDeferredPaid);
  const qaimaSigned = couple ? !!couple.money.qaimaSigned : !!contract.qaimaSigned;
  const qaimaVal = couple ? (couple.money.qaimaValueLocal || 0) : (contract.qaimaValueLocal || 0);
  const prenupSigned = couple ? !!couple.money.prenupSigned : !!contract.prenupSigned;

  const pullFromSavings = (amountNeeded) => {
    if (amountNeeded > S.money.cash && S.money.savings > 0) {
      const pull = Math.min(S.money.savings, amountNeeded - S.money.cash);
      moveBalance(S, 'savings', -pull, 'Savings withdrawal for divorce settlement', 'bank');
      walletMove(S, pull, 'Savings withdrawal for divorce settlement', 'bank');
    }
  };

  /* Egyptian / Arab Khula Option (Wife-initiated waiver of financial rights, >= 2000 in Egypt) */
  if (mode === 'khula') {
    if (prof.khulaAvailableFromYear && S.year < prof.khulaAvailableFromYear) {
      return { ok: false, msg: `Statutory Khula was not enacted in ${getCountry(prof.country).name} until ${prof.khulaAvailableFromYear}.` };
    }
    // Khula returns only the prompt mahr actually received/paid, and waives
    // the deferred remainder (which is why mahrDeferredPaid stays as-is).
    const returnPrompt = S.player.gender === 'f' ? mahrPromptPaid : 0;
    if (returnPrompt > 0 && S.money.cash >= returnPrompt) {
      walletMove(S, -returnPrompt, `Returned prompt Mahr under Khula decree`, 'family');
      if (couple) couple.money.mahrPromptPaid = 0;
    } else if (S.player.gender === 'm' && mahrPromptPaid > 0) {
      // Wife-initiated Khula: she returns the prompt mahr the husband paid.
      walletMove(S, mahrPromptPaid, `Prompt Mahr returned under Khula decree (${spouse.firstName})`, 'family');
      if (couple) couple.money.mahrPromptPaid = 0;
    }
    recordJournal(S, `Finalized a court Khula divorce from ${spouse.fullName}, waiving deferred Mahr to dissolve the marriage cleanly.`, 'milestone');
  } else if (prof.hasMahr) {
    /* Talaq / Standard Sharia Personal Status Settlement — remainder only */
    const qaimaValSettle = qaimaSigned ? qaimaVal : 0;
    const iddahMaint = eraLocalCost(getCountry(S.country).monthlyBasket2026.rentModest * 3, S.country, S.year);
    if (S.player.gender === 'm') {
      const owed = mahrDeferredOwed + Math.round(qaimaValSettle * 0.5) + iddahMaint;
      pullFromSavings(owed);
      walletMove(S, -owed, `Divorce settlement (deferred Mahr remainder${qaimaSigned ? ', Qa\'ima' : ''} & Iddah) to ${spouse.firstName}`, 'family');
      if (couple) couple.money.mahrDeferredPaid = mahrDeferred;
      recordJournal(
        S,
        `Divorced ${spouse.fullName}. Settled ${formatMoney(owed, S.country)} covering the deferred Mahr remainder${qaimaSigned ? ', Qa\'ima furnishings,' : ''} and statutory maintenance.`,
        'milestone'
      );
    } else {
      const received = mahrDeferredOwed + iddahMaint;
      walletMove(S, received, `Received deferred Mahr remainder & maintenance settlement from ${spouse.firstName}`, 'family');
      if (couple) couple.money.mahrDeferredPaid = mahrDeferred;
      recordJournal(S, `Divorced ${spouse.fullName} and collected ${formatMoney(received, S.country)} in deferred Mahr remainder and maintenance.`, 'milestone');
    }
  } else {
    // Asset division is handled by the explicit game settlement below.
  }
  settleGameDivorce(S,spouse,couple,{...options,prenup:prenupSigned});

  // Close THE couple record (divorced); the legacy lists follow from it.
  if (couple) {
    closeCouple(S, couple, 'divorced');
  } else {
    /* v2.9 — no live couple record: rebuild it from the legacy contract
       and close it properly (stage history + legacy status + contract). */
    closeMarriageWithoutCouple(S, spouse, 'divorced');
  }
  S.player.vitals.happiness = clamp(S.player.vitals.happiness - 12);
  return { ok: true, msg: `Divorced ${spouse.firstName}.` };
}

/* Child Nurseries (Ages 0–5) & After-School Enrichment Clubs (Ages 5–17) from V1 */
export function enrollChildInProgram(S, childId, kind, progId) {
  const ch = S.people[childId];
  if (!ch || !ch.alive || !S.relations.childIds.includes(childId)) return { ok: false, msg: 'Child not found.' };

  if (kind === 'nursery') {
    if (ch.age > 5) return { ok: false, msg: `${ch.firstName} is past nursery age (${ch.age}). Choose an enrichment club instead!` };
    const nurs = (V1_CHILD_NURSERIES || []).find(n => n.id === progId) || V1_CHILD_NURSERIES[0];
    const cost = Math.max(25, Math.round(convertCurrency((nurs?.costEGP || 15000) / 50, 'usa', S.country, S.year)));
    if (S.money.cash < cost) return { ok: false, msg: `Need ${formatMoney(cost, S.country)} for ${nurs.label}.` };
    walletMove(S, -cost, `${nurs.label} tuition for ${ch.firstName}`, 'family');
    ch.vitals.smarts = clamp(ch.vitals.smarts + 4);
    ch.vitals.happiness = clamp(ch.vitals.happiness + 5);
    ch.rel.affection = clamp(ch.rel.affection + 5);
    recordJournal(S, `Enrolled ${ch.firstName} in ${nurs.label} (${formatMoney(cost, S.country)}).`, 'family');
    return { ok: true, msg: `Enrolled ${ch.firstName} in ${nurs.label}!` };
  }

  const act = (V1_CHILD_ACTIVITIES || []).find(a => a.id === progId) || V1_CHILD_ACTIVITIES[0];
  if (ch.age < 4 || ch.age >= 18) return { ok: false, msg: `Enrichment clubs are for children aged 4–17.` };
  const cost = Math.max(15, Math.round(convertCurrency(((act?.monthlyEGP || 1500) * 6) / 50, 'usa', S.country, S.year)));
  if (S.money.cash < cost) return { ok: false, msg: `Need ${formatMoney(cost, S.country)} for ${act.label}.` };
  walletMove(S, -cost, `${act.label} term for ${ch.firstName}`, 'family');
  ch.vitals.smarts = clamp(ch.vitals.smarts + (act.smarts || 2));
  ch.vitals.health = clamp(ch.vitals.health + (act.health || 3));
  ch.vitals.happiness = clamp(ch.vitals.happiness + (act.happiness || 5));
  rememberDeed(S, ch, 'proud_moment', `Supported ${act.label} lessons.`, { affection: 7, respect: 5 });
  recordJournal(S, `Signed ${ch.firstName} up for ${act.label} (+skills & confidence).`, 'family');
  return { ok: true, msg: `${ch.firstName} joined ${act.label}!` };
}

/* ============================================================================
   v2.12 W5 — Children verbs (item 6). The audit counted ONE verb on this
   screen (child-program, 14x — nursery/club enrolment). These four are
   DISTINCT data-actions; each moves a number on the child record or money.
   Time cost is a once-per-turn limit per child ("this month").
   ========================================================================== */
function childOncePerTurn(S, key, child) {
  if (!S.cooldowns) S.cooldowns = {};
  if ((S.cooldowns[key] || 0) > S.turn) return `${child.firstName} already had your full attention this month.`;
  S.cooldowns[key] = S.turn + 1;
  return null;
}
export function childOutingCostLocal(S) {
  return Math.max(5, Math.round(eraLocalCost(getCountry(S.country).monthlyBasket2026.foodAdult * 0.35, S.country, S.year)));
}

/* Play with a child: happiness up for the child and for you, stress down. */
export function playWithChild(S, childId) {
  const ch = S.people[childId];
  if (!ch || !ch.alive || !S.relations.childIds.includes(childId)) return { ok: false, msg: 'Child not found.' };
  const used = childOncePerTurn(S, `child_play_${ch.id}`, ch);
  if (used) return { ok: false, msg: used };
  ch.vitals.happiness = clamp(ch.vitals.happiness + 6);
  ch.rel.affection = clamp(ch.rel.affection + 3);
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 3);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 3);
  recordJournal(S, `You spent a proper afternoon playing with ${ch.firstName} — running, laughing, no phone in hand.`, 'family');
  return { ok: true, msg: `Played with ${ch.firstName} (+6 Happiness)!` };
}

/* Teach a child: smarts up — but only if your own smarts are up to it. */
export function teachChild(S, childId) {
  const ch = S.people[childId];
  if (!ch || !ch.alive || !S.relations.childIds.includes(childId)) return { ok: false, msg: 'Child not found.' };
  if (ch.age < 4) return { ok: false, msg: `${ch.firstName} is too young for lessons yet.` };
  if ((S.player.vitals.smarts || 0) < 50) {
    return { ok: false, msg: `Your own Smarts are ${Math.round(S.player.vitals.smarts || 0)}% — teach needs 50%+. Study or read first, then teach.` };
  }
  const used = childOncePerTurn(S, `child_teach_${ch.id}`, ch);
  if (used) return { ok: false, msg: used };
  ch.vitals.smarts = clamp(ch.vitals.smarts + 5);
  ch.rel.affection = clamp(ch.rel.affection + 3);
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 2);
  recordJournal(S, `You sat with ${ch.firstName} and taught properly — books, questions, patience (+5 Smarts).`, 'family');
  return { ok: true, msg: `Taught ${ch.firstName} (+5 Smarts)!` };
}

/* Take a child out: costs real money, happiness up. Only from age 4. */
export function takeChildOut(S, childId) {
  const ch = S.people[childId];
  if (!ch || !ch.alive || !S.relations.childIds.includes(childId)) return { ok: false, msg: 'Child not found.' };
  if (ch.age < 4) return { ok: false, msg: `${ch.firstName} is too young for outings — wait until age 4.` };
  if(ch.residenceCountry!==S.country)return{ok:false,msg:'Your child lives abroad. An in-person outing requires being in the same country.'};
  const used=childOncePerTurn(S,`child_outing_${ch.id}`,ch);if(used)return{ok:false,msg:used};
  const cost = childOutingCostLocal(S);
  if (S.money.cash < cost) return { ok: false, msg: `A day out with ${ch.firstName} costs ${formatMoney(cost, S.country)} — you hold ${formatMoney(S.money.cash, S.country)}.` };
  walletMove(S, -cost, `Day out with ${ch.firstName}`, 'family');
  ch.vitals.happiness = clamp(ch.vitals.happiness + 8);
  ch.vitals.health = clamp(ch.vitals.health + 2);
  ch.rel.affection = clamp(ch.rel.affection + 4);
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 4);
  recordJournal(S, `You took ${ch.firstName} out for a proper day — fresh air, treats, and time together (${formatMoney(cost, S.country)}).`, 'family');
  return { ok: true, msg: `A day out with ${ch.firstName} (+8 Happiness)!` };
}

/* Help with homework: school performance (smarts) up — only while the
   child is in school (ages 6–17). */
export function helpChildWithHomework(S, childId) {
  const ch = S.people[childId];
  if (!ch || !ch.alive || !S.relations.childIds.includes(childId)) return { ok: false, msg: 'Child not found.' };
  if (ch.age < 6) return { ok: false, msg: `${ch.firstName} is not in school yet — homework help starts at 6.` };
  if (ch.age >= 18) return { ok: false, msg: `${ch.firstName} has finished school — no homework left to help with.` };
  const used = childOncePerTurn(S, `child_hw_${ch.id}`, ch);
  if (used) return { ok: false, msg: used };
  ch.vitals.smarts = clamp(ch.vitals.smarts + 4);
  ch.rel.affection = clamp(ch.rel.affection + 2);
  ch.homeworkHelped = (ch.homeworkHelped || 0) + 1;
  recordJournal(S, `You sat with ${ch.firstName} over the homework until it made sense (+4 Smarts).`, 'family');
  return { ok: true, msg: `Helped ${ch.firstName} with homework (+4 Smarts)!` };
}

export function restoreDivorceDecision(S,saved){
  if(!saved?.divorcePlan)return null;
  const shadow={...S,activeScene:null,sceneQueue:[],sceneCounts:{},titleCounts:{},cooldowns:{}};
  initiateDivorce(shadow,saved.divorcePlan.spouseId,saved.divorcePlan.mode,{assetMode:saved.divorcePlan.assetMode});
  return shadow.activeScene?{...saved,...shadow.activeScene}:null;
}

export function supportChildAfterSeparation(S,childId,kind){
  const ch=S.people[childId];
  if(!ch?.alive||!S.relations.childIds.includes(childId))return{ok:false,msg:'Child not found.'};
  if(!['visit','gift','education'].includes(kind))return{ok:false,msg:'Choose a child-support action.'};
  if(kind==='visit'&&ch.residenceCountry!==S.country)return{ok:false,msg:'Your child lives abroad. Travel and cross-border visitation are not modelled here; gifts and education funding are still available.'};
  const cost=kind==='visit'?0:eraLocalCost(getCountry(S.country).monthlyBasket2026.foodAdult*(kind==='gift'?.25:1),S.country,S.year);
  if(S.money.cash<cost)return{ok:false,msg:`Need ${formatMoney(cost,S.country)} for ${kind}.`};
  const used=childOncePerTurn(S,`child_support_${childId}_${kind}`,ch);if(used)return{ok:false,msg:used};
  if(cost)walletMove(S,-cost,`${kind==='gift'?'Gift for':'Education savings for'} ${ch.firstName}`,'family');
  if(kind==='education'){
    ch.educationFund??={balance:0,country:S.country};
    ch.educationFund.balance+=convertCurrency(cost,S.country,ch.educationFund.country,S.year);
    recordJournal(S,`Added ${formatMoney(cost,S.country)} to ${ch.firstName}'s separate education fund. It is the child's asset, not your spendable cash. Future university withdrawals are not modelled yet.`,'family');
  }else{ch.rel.affection=clamp(ch.rel.affection+4);ch.vitals.happiness=clamp(ch.vitals.happiness+5);recordJournal(S,kind==='visit'?`Spent time with ${ch.firstName} under the recorded game custody arrangement.`:`Bought ${ch.firstName} a gift for ${formatMoney(cost,S.country)}. This does not replace child support.`,'family');}
  return{ok:true,msg:kind==='education'?`Education fund increased by ${formatMoney(cost,S.country)}.`:kind==='visit'?`Visited ${ch.firstName}.`:`Gift delivered to ${ch.firstName}; support order unchanged.`};
}
