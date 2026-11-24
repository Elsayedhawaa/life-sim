import{inheritNpcCompanies}from './companyEstate.js';
import{personMind,canContactPerson}from './personMind.js';
/* ============================================================================
   World Life 2.0 — Causal Soul, Memory, Promise & Domino Reaction Engine
   Every NPC is a persistent human with personality sliders, career/wealth,
   shared memories, tracked promises, life autonomy, and trait-driven reactions.
   ========================================================================== */

import { rand, randInt, pick, chance, clamp, hashSeed } from '../core/rng.js';
import { createPerson, nextId, recordJournal, walletMove, queueScene, computeNetWorthLocal, newCoupleRecord, getCoupleForSpouse, closeCouple } from '../core/schema.js';
import { getCountry, formatMoney, COUNTRY_IDS } from '../data/countries.js';
import { getMarriageProfile } from '../data/visasAndMarriage.js';
import { SHOP_MEGA_CATALOG } from '../data/megaCarsAndShop.js';
import { eraSalary, eraLocalCost, convertCurrency, goldPricePerGram } from '../data/economy.js';
/* v2.15 W3 — social energy + friendship decay (src/systems/socialEnergy.js).
   This file charges the energy and stamps the contact; the budget and the
   drift rules live there, so the number on the button and the number
   charged are never two different numbers. */
import { energyCostFor, checkSocialEnergy, spendSocialEnergy, noteSocialContact, tickFriendshipDrift } from './socialEnergy.js';
/* v2.15 W5 — memories are capped at 5 per person (oldest small memory
   forgotten, defining memories never dropped); see npcMemory.js. */
import { pruneMemories } from './npcMemory.js';

export function getAllKnownLivingPeople(S) {
  return Object.values(S.people).filter(p => p && p.alive && p.id !== 'player');
}

export function rememberDeed(S, person, kind, summary, impact = {}) {
  if (!person || !person.rel) return;
  person.rel.memories.unshift({
    id: nextId(S, 'mem'),
    year: S.year,
    month: S.month,
    turn: S.turn,
    kind, // helped_money | refused_help | visited | broke_promise | kept_promise | gift | neglected | supported_crisis | insulted | proud_moment
    summary,
    weight: impact.weight || 1
  });
  /* v2.15 W5 — a person keeps at most 5 memories; the oldest small
     one is forgotten, a defining one never is (pruneMemories). */
  pruneMemories(person);

  if (impact.affection) person.rel.affection = clamp(person.rel.affection + impact.affection);
  if (impact.respect) person.rel.respect = clamp(person.rel.respect + impact.respect);
  if (impact.trust) person.rel.trust = clamp(person.rel.trust + impact.trust);
  if (impact.resentment != null) person.rel.resentment = clamp(person.rel.resentment + impact.resentment);
}

export function createPromise(S, person, kind, description, amountLocal = 0, monthsDue = 12) {
  if (!person || !person.rel) return null;
  const dueYear = S.year + Math.max(1, Math.round(monthsDue / 12));
  const dueMonth = S.month;
  const p = {
    id: nextId(S, 'prom'),
    kind, // money_help | visit_home | buy_home | career_step
    description,
    amountLocal: Math.round(amountLocal),
    currencyCountry: S.country,
    createdYear: S.year,
    dueYear,
    dueMonth,
    status: 'open' // open | kept | broken
  };
  person.rel.promises.push(p);
  rememberDeed(S, person, 'made_promise', `You promised: "${description}" (by ${dueYear}).`, { trust: 4, affection: 3 });
  return p;
}

export function fulfillPromise(S, person, promiseId) {
  if (!person) return { ok: false, reason: 'Person not found.' };
  const pr = person.rel.promises.find(x => x.id === promiseId && x.status === 'open');
  if (!pr) return { ok: false, reason: 'No open promise found.' };

  if (pr.amountLocal > 0) {
    const costNow = Math.round(convertCurrency(pr.amountLocal, pr.currencyCountry || S.country, S.country, S.year));
    if (S.money.cash < costNow) {
      return { ok: false, reason: `Need ${formatMoney(costNow, S.country)} in cash to fulfill this promise.` };
    }
    walletMove(S, -costNow, `Kept promise to ${person.firstName}: ${pr.description}`, 'family');
    person.career.savingsLocal += Math.round(convertCurrency(costNow, S.country, person.residenceCountry, S.year));
  }

  pr.status = 'kept';
  rememberDeed(S, person, 'kept_promise', `You kept your word: ${pr.description}.`, {
    trust: 22,
    respect: 16,
    affection: 14,
    resentment: -25,
    weight: 3
  });
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 5);
  recordJournal(S, `You honored your promise to ${person.fullName} (${pr.description}). Their trust in you deepened visibly.`, 'relationship');
  return { ok: true };
}

/* Emit a structured world fact so NPCs react causally instead of randomly */
export function emitFact(S, type, payload = {}) {
  if (!S) return;
  const fact = {
    id: nextId(S, 'fact'),
    turn: S.turn,
    year: S.year,
    month: S.month,
    type,
    ...payload
  };
  S.facts.unshift(fact);
  if (S.facts.length > 60) S.facts.length = 60;
  evaluateImmediateFactRipples(S, fact);
}

function evaluateImmediateFactRipples(S, fact) {
  const father = S.relations.fatherId ? S.people[S.relations.fatherId] : null;
  const mother = S.relations.motherId ? S.people[S.relations.motherId] : null;

  if (fact.type === 'GRADUATED_UNI') {
    for (const p of [father, mother]) {
      if (p && p.alive) {
        rememberDeed(S, p, 'proud_moment', `Watched you graduate in ${fact.majorLabel}.`, {
          affection: 8,
          respect: p.traits.pride > 60 ? 16 : 10,
          resentment: -6
        });
      }
    }
  }

  if (fact.type === 'LUXURY_PURCHASE' && (S.player?.age ?? 0) >= 18) {
    /* Check if anyone holds an open unpaid money promise from you! */
    for (const p of getAllKnownLivingPeople(S)) {
      const openMoneyProm = p.rel.promises.find(pr => pr.status === 'open' && pr.amountLocal > 0);
      if (openMoneyProm) {
        rememberDeed(
          S,
          p,
          'broke_promise',
          `Saw you buy ${fact.itemName} while still owing your promise (${openMoneyProm.description}).`,
          { trust: -20, respect: -14, resentment: 28, affection: -10, weight: 3 }
        );
        queueScene(S, {
          key: `confront_lux_promise_${p.id}_${S.year}`,
          category: 'relationship',
          speakerId: p.id,
          title: `${p.firstName} Notices Your New ${fact.itemName}`,
          text: `${p.fullName} (${p.relationLabel}) hears about your ${fact.itemName}. Their voice is tight: "You told me to wait when I needed ${openMoneyProm.description} — yet you had plenty set aside for yourself."`,
          choices: [
            {
              label: () => {
                const need = Math.round(convertCurrency(openMoneyProm.amountLocal, openMoneyProm.currencyCountry || S.country, S.country, S.year));
                return `Pay what you promised right now (${formatMoney(need, S.country)})`;
              },
              available: () => {
                const need = Math.round(convertCurrency(openMoneyProm.amountLocal, openMoneyProm.currencyCountry || S.country, S.country, S.year));
                return S.money.cash >= need;
              },
              effect: (st) => {
                fulfillPromise(st, p, openMoneyProm.id);
              }
            },
            {
              label: 'Apologize and ask for a few more months',
              effect: (st) => {
                p.rel.trust = clamp(p.rel.trust - 8);
                p.rel.resentment = clamp(p.rel.resentment + 10);
                recordJournal(st, `You apologized to ${p.firstName} over the ${fact.itemName}, but the awkwardness lingered between you.`, 'relationship');
              }
            },
            {
              label: '"It’s my money — I don’t owe explanations"',
              effect: (st) => {
                openMoneyProm.status = 'broken';
                rememberDeed(st, p, 'broke_promise', `Told them off after buying ${fact.itemName}.`, {
                  affection: -22, trust: -25, respect: -15, resentment: 35
                });
                recordJournal(st, `You snapped back at ${p.firstName}. The broken promise left a cold rift.`, 'relationship');
              }
            }
          ]
        });
        break;
      }
    }
  }

  if (fact.type === 'MIGRATED') {
    const destName = getCountry(fact.to).name;
    if (mother && mother.alive && mother.residenceCountry !== fact.to) {
      rememberDeed(S, mother, 'moved_away', `You moved abroad to ${destName}.`, { affection: 4, respect: 8 });
    }
    if (father && father.alive && father.residenceCountry !== fact.to) {
      rememberDeed(S, father, 'moved_away', `You relocated to ${destName}.`, { respect: 10 });
    }
  }
}

/* Organic Social Casting — ensures school, uni, work, and cities feel populated by real people! */
export function ensureSocialCast(S) {
  const age = S.player.age;

  /* Age 7: Primary school classmates (fixes D8/H5: 0 friends bug!) */
  if (age === 7 && S.relations.friendIds.length === 0) {
    const used = Object.values(S.people).map(p => p.firstName);
    const bestie = createPerson(S, {
      gender: S.player.gender,
      age: 7,
      role: 'friend',
      relationLabel: 'Childhood Friend',
      nationality: S.country,
      residenceCountry: S.country,
      city: S.city,
      excludeNames: used,
      traits: { warmth: randInt(S, 65, 92), reliability: randInt(S, 60, 88) },
      affection: 72,
      trust: 70,
      respect: 62
    });
    S.people[bestie.id] = bestie;
    S.relations.friendIds.push(bestie.id);
    used.push(bestie.firstName);

    const rival = createPerson(S, {
      gender: S.player.gender,
      age: 7,
      role: 'classmate',
      relationLabel: 'School Classmate',
      nationality: S.country,
      residenceCountry: S.country,
      city: S.city,
      excludeNames: used,
      traits: { ambition: randInt(S, 72, 95), pride: randInt(S, 65, 90) },
      affection: 48,
      trust: 50,
      respect: 58
    });
    S.people[rival.id] = rival;
    S.relations.friendIds.push(rival.id);

    recordJournal(
      S,
      `At ${S.education.schoolName || 'primary school'}, you hit it off with ${bestie.fullName} and ended up sharing a desk row with competitive classmate ${rival.fullName}.`,
      'relationship'
    );
  }

  /* Age 15: High school friend */
  if (age === 15 && S.relations.friendIds.length < 3) {
    const used = Object.values(S.people).map(p => p.firstName);
    const hsFriend = createPerson(S, {
      gender: chance(S, 0.75) ? S.player.gender : (S.player.gender === 'm' ? 'f' : 'm'),
      age: 15,
      role: 'friend',
      relationLabel: 'High-School Friend',
      nationality: S.country,
      residenceCountry: S.country,
      city: S.city,
      excludeNames: used,
      affection: 64,
      trust: 62,
      respect: 60
    });
    S.people[hsFriend.id] = hsFriend;
    S.relations.friendIds.push(hsFriend.id);
    recordJournal(S, `Secondary school got serious; ${hsFriend.fullName} became part of your regular study circle.`, 'relationship');
  }
}

export function spawnUniversityPeer(S, uniName, majorLabel) {
  const used = Object.values(S.people).map(p => p.firstName);
  const peer = createPerson(S, {
    gender: chance(S, 0.55) ? S.player.gender : (S.player.gender === 'm' ? 'f' : 'm'),
    age: S.player.age,
    role: 'friend',
    relationLabel: 'University Peer',
    nationality: S.country,
    residenceCountry: S.country,
    city: S.city,
    excludeNames: used,
    degree: S.education.university?.majorId || null,
    universityName: uniName,
    affection: 62,
    trust: 60,
    respect: 65
  });
  S.people[peer.id] = peer;
  S.relations.friendIds.push(peer.id);
  recordJournal(S, `During orientation at ${uniName} (${majorLabel}), you connected with fellow student ${peer.fullName}.`, 'relationship');
  return peer;
}

export function spawnWorkplaceCast(S, employerName, track, monthlyGross) {
  const used = Object.values(S.people).map(p => p.firstName);
  const boss = createPerson(S, {
    age: Math.max(S.player.age + 6, randInt(S, 33, 54)),
    role: 'boss',
    relationLabel: `Manager at ${employerName}`,
    nationality: (S.country === 'sau' || S.country === 'uae') && chance(S, 0.55) ? S.country : S.country,
    residenceCountry: S.country,
    city: S.city,
    excludeNames: used,
    jobTitle: 'Department Manager',
    employer: employerName,
    track,
    monthlyIncomeLocal: Math.round(monthlyGross * 1.85),
    savingsLocal: Math.round(monthlyGross * 18),
    affection: 52,
    respect: 58,
    trust: 56
  });
  S.people[boss.id] = boss;
  S.relations.bossId = boss.id;
  used.push(boss.firstName);

  const colleague = createPerson(S, {
    age: Math.max(21, S.player.age + randInt(S, -2, 5)),
    role: 'colleague',
    relationLabel: `Colleague at ${employerName}`,
    nationality: S.country,
    residenceCountry: S.country,
    city: S.city,
    excludeNames: used,
    jobTitle: S.career.job?.title || 'Specialist',
    employer: employerName,
    track,
    monthlyIncomeLocal: Math.round(monthlyGross * rand(S) * 0.3 + monthlyGross * 0.85),
    savingsLocal: Math.round(monthlyGross * 5),
    affection: 56,
    respect: 56,
    trust: 55
  });
  S.people[colleague.id] = colleague;
  if (!S.relations.colleagueIds.includes(colleague.id)) {
    S.relations.colleagueIds.unshift(colleague.id);
    if (S.relations.colleagueIds.length > 4) S.relations.colleagueIds.length = 4;
  }
  return { boss, colleague };
}

/* ============================================================================
   v2.10 — NPC Autonomy: NPCs live their own lives (marry, have children,
   move, divorce, leave home, change jobs). Every change is visible: a
   journal line at minimum, a scene for the close ones. All gated by the
   NPC's own traits / age / country / era (the v2.5 "appropriate" rule).
   NPC marriages live on the person objects themselves (spouseIds,
   maritalStatus, spouseBond) — NEVER on the player-centric couple
   records or S.relations.spouseIds, which belong to the player's own
   marriage. Mortality is NOT touched here (v2.9 probe: median 77).
   ========================================================================== */

/* v2.10 — NPC autonomy has its OWN seeded RNG stream (S.npcRng, derived
   from the life seed exactly like the mortality stream), so a new system
   never shifts the game's main stream: every seeded roll downstream
   (including the coherence suite's PLAB board) lands exactly where it
   did before this round. All npc* helpers below draw from it, never
   from rand()/chance()/pick(). */
function npcRand(S) {
  if (!S) throw new Error('npcRand() called without a game state.');
  if (typeof S.npcRng !== 'number') {
    S.npcRng = hashSeed(String(S.seed ?? 'world-life-2') + ':npc-autonomy');
  }
  let t = (S.npcRng = (S.npcRng + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function npcChance(S, p) { return npcRand(S) < p; }
function npcRandInt(S, min, max) {
  const lo = Math.ceil(Math.min(min, max));
  const hi = Math.floor(Math.max(min, max));
  return lo + Math.floor(npcRand(S) * (hi - lo + 1));
}
function npcPick(S, list) {
  if (!Array.isArray(list) || !list.length) return null;
  return list[Math.floor(npcRand(S) * list.length)];
}
/* Create a person using ONLY the NPC stream: createPerson draws names,
   traits, vitals and appearance from the state it is handed, and takes
   its ids from S.seq — so hand it a stand-in carrying the NPC stream
   and write back the advanced stream and id counter. The main stream
   never moves, and ids stay unique. */
function npcCreatePerson(S, opts = {}) {
  const standIn = { ...S, rngState: (typeof S.npcRng === 'number' ? S.npcRng : hashSeed(String(S.seed ?? 'world-life-2') + ':npc-autonomy')) };
  const person = createPerson(standIn, opts);
  S.npcRng = standIn.rngState;
  S.seq = standIn.seq;
  return person;
}

const NPC_AUTONOMY_ROLES = new Set(['sibling', 'child', 'friend', 'classmate', 'colleague', 'nephew', 'niece', 'grandchild', 'in-law']);
const NPC_CAREER_CHANGE_TITLES = ['Teacher', 'Accountant', 'Shop Manager', 'Driver', 'Nurse', 'Sales Representative', 'Project Manager', 'Engineer', 'Operations Coordinator', 'Graduate Specialist'];

/* Plain words for who this person is to the player. */
function npcKinWord(person) {
  if (person.role === 'sibling') return person.gender === 'f' ? 'sister' : 'brother';
  if (person.role === 'child') return person.gender === 'f' ? 'daughter' : 'son';
  if (person.role === 'father') return 'father';
  if (person.role === 'mother') return 'mother';
  if (person.role === 'nephew') return 'nephew';
  if (person.role === 'niece') return 'niece';
  if (person.role === 'grandchild') return person.gender === 'f' ? 'granddaughter' : 'grandson';
  return (person.relationLabel || 'friend').toLowerCase();
}

/* Make sure the NPC-side marriage fields exist and agree with each other.
   A spouse who died is dropped silently — the death already has its own
   journal line — and the survivor becomes widowed, free to remarry. */
function npcEnsureMarital(S, person) {
  if (!Array.isArray(person.spouseIds)) person.spouseIds = person.spouseId ? [person.spouseId] : [];
  if (person.spouseId && !person.spouseIds.includes(person.spouseId)) person.spouseIds.unshift(person.spouseId);
  const before = person.spouseIds.length;
  person.spouseIds = person.spouseIds.filter(id => S.people[id] && S.people[id].alive);
  if (person.spouseIds.length < before && person.maritalStatus === 'married' && person.spouseIds.length === 0) {
    person.maritalStatus = 'widowed';
  }
  person.spouseId = person.spouseIds[0] || null;
  if (person.maritalStatus == null) person.maritalStatus = person.spouseIds.length ? 'married' : 'single';
  if (person.spouseIds.length && person.spouseBond == null) person.spouseBond = npcRandInt(S, 58, 85);
  if (!person.spouseIds.length) person.spouseBond = null;
  if (person.leftHome == null) person.leftHome = !['sibling', 'child', 'nephew', 'niece', 'grandchild'].includes(person.role);
}

function npcSpouseOf(S, person) {
  if (!person || !Array.isArray(person.spouseIds) || !person.spouseIds.length) return null;
  const s = S.people[person.spouseIds[0]];
  return s && s.alive ? s : null;
}

function npcChildrenOf(S, person) {
  return Object.values(S.people).filter(p => p && p.alive && Array.isArray(p.parentIds) && p.parentIds.includes(person.id));
}

/* A real adult job (same entry-pay rule as the existing age-22 first job),
   so a new spouse or a rehired NPC arrives with income and savings, not
   empty-handed. */
function npcGiveJob(S, person) {
  const pCountry = getCountry(person.residenceCountry || S.country);
  const entryPay = eraSalary(pCountry.annualSalaryTiers2026.entry / 12, person.residenceCountry, S.year);
  const mult = 0.75 + (person.traits.ambition / 140);
  person.career.title = person.vitals.smarts >= 78 ? 'Graduate Specialist' : 'Operations Coordinator';
  person.career.monthlyIncomeLocal = Math.round(entryPay * mult);
  person.career.savingsLocal = Math.max(Number(person.career.savingsLocal) || 0, Math.round(person.career.monthlyIncomeLocal * 2));
}

function npcSpouseLabelFor(S, person, spouseGender) {
  if (person.role === 'sibling') return spouseGender === 'f' ? 'Sister-in-law' : 'Brother-in-law';
  if (person.role === 'child') return spouseGender === 'f' ? 'Daughter-in-law' : 'Son-in-law';
  if (person.role === 'nephew' || person.role === 'niece' || person.role === 'grandchild') return 'In-law';
  return spouseGender === 'f' ? "Friend's Wife" : "Friend's Husband";
}

function npcWeddingGiftCost(S) {
  const cObj = getCountry(S.country);
  return Math.max(1, Math.round(eraLocalCost(cObj.monthlyBasket2026.rentStandard * 0.25, S.country, S.year)));
}

function npcMarry(S, person, polygamy = false) {
  const partnerGender = person.gender === 'f' ? 'm' : 'f';
  const partnerAge = clamp(person.age + npcRandInt(S, -5, 5), 20, 60);
  // Most partners come from the NPC's own town; a few come from abroad,
  // and then the NPC moves to join them (see below).
  let partnerCountry = person.residenceCountry || S.country;
  if (!polygamy && npcChance(S, 0.18)) {
    const abroad = COUNTRY_IDS.filter(id => id !== partnerCountry && !(id === 'uae' && S.year < 1971));
    partnerCountry = npcPick(S, abroad) || partnerCountry;
  }
  const pCountry = getCountry(partnerCountry);
  const partner = npcCreatePerson(S, {
    gender: partnerGender,
    age: partnerAge,
    role: 'in-law',
    relationLabel: npcSpouseLabelFor(S, person, partnerGender),
    nationality: partnerCountry,
    residenceCountry: partnerCountry,
    city: npcPick(S, pCountry.cities) || pCountry.cities[0],
    religion: person.religion,
    familyName: person.familyName,
    traits: { warmth: npcRandInt(S, 45, 90), traditionalism: npcRandInt(S, 30, 90) }
  });
  npcGiveJob(S, partner);
  partner.maritalStatus = 'married';
  partner.spouseId = person.id;
  partner.spouseIds = [person.id];
  partner.spouseBond = npcRandInt(S, 68, 92);
  partner.marriageYear = S.year;
  partner.leftHome = true;
  S.people[partner.id] = partner;

  const firstWifeId = person.spouseIds[0] || null;
  person.spouseIds.push(partner.id);
  if (!person.spouseId) person.spouseId = partner.id;
  person.maritalStatus = 'married';
  person.marriageYear = S.year;
  if (person.spouseBond == null) person.spouseBond = npcRandInt(S, 68, 92);

  const movedAbroad = partnerCountry !== (person.residenceCountry || S.country);
  if (movedAbroad) {
    person.residenceCountry = partnerCountry;
    person.city = partner.city;
  }
  const kin = npcKinWord(person);
  const place = `${partner.city}, ${pCountry.name}`;
  const giftCost = npcWeddingGiftCost(S);
  recordJournal(
    S,
    polygamy
      ? `Your ${kin} ${person.firstName} took a second wife, ${partner.fullName}, in ${place}.`
      : `Your ${kin} ${person.firstName} married ${partner.fullName} in ${place}.${movedAbroad ? ` ${person.firstName} is moving to ${pCountry.name} to build their life together.` : ''}`,
    'relationship'
  );
  queueScene(S, {
    key: `npc_wedding_${person.id}_${S.year}`,
    category: 'family',
    title: `${person.firstName} Is Getting Married`,
    text: polygamy
      ? `Your ${kin} ${person.firstName} has taken a second wife, ${partner.fullName}. The wedding is in ${place}, and the family is talking about little else.`
      : `Your ${kin} ${person.firstName} is marrying ${partner.fullName} in ${place}. There is a wedding to go to, and a gift is expected if you show up.`,
    choices: [
      {
        label: `Go to the wedding & bring a gift (${formatMoney(giftCost, S.country)})`,
        available: () => S.money.cash >= giftCost,
        effect: (st) => {
          walletMove(st, -giftCost, `Wedding gift for ${person.firstName}`, 'family');
          rememberDeed(st, person, 'wedding_attended', 'You came to their wedding and gave a proper gift.', { affection: 10, respect: 6, trust: 5 });
          recordJournal(st, `You went to ${person.firstName}'s wedding in ${place} and gave ${formatMoney(giftCost, st.country)} as a gift. ${person.firstName} kept thanking you all evening.`, 'relationship');
        }
      },
      {
        label: 'Send your congratulations from afar',
        effect: (st) => {
          rememberDeed(st, person, 'wedding_missed', 'You missed their wedding and only sent congratulations.', { affection: -4, respect: -2 });
          recordJournal(st, `You could not make it to ${person.firstName}'s wedding in ${place}. You sent congratulations, and ${person.firstName} understood — mostly.`, 'relationship');
        }
      }
    ]
  });
  if (polygamy && firstWifeId) {
    const firstWife = S.people[firstWifeId];
    if (firstWife && firstWife.alive) {
      if (firstWife.spouseBond != null) firstWife.spouseBond = clamp(firstWife.spouseBond - 35);
      rememberDeed(S, firstWife, 'polygamy', `Her husband ${person.firstName} took a second wife.`, { affection: -20, trust: -15, resentment: 30 });
      recordJournal(S, `${firstWife.firstName} learned that ${person.firstName} had taken a second wife. The house went quiet for weeks, and she has not forgiven it.`, 'relationship');
    }
  }
}

function npcMaybeMarry(S, person) {
  if (person.age < 20 || person.age > 55) return;
  const spouse = npcSpouseOf(S, person);
  if (spouse) {
    // Already married: the only further marriage is polygamy, and only
    // where the marriage engine's own profile allows it (Muslim man,
    // at most 4 wives) — same-sex unions stay out, as decided.
    const profile = getMarriageProfile(person.residenceCountry || S.country, S.year);
    if (person.gender === 'm' && person.religion === 'muslim' && profile.polygamyAllowedForMuslimMen
      && person.spouseIds.length < 4 && person.age >= 25 && npcChance(S, 0.004)) {
      npcMarry(S, person, true);
    }
    return;
  }
  let base = person.age <= 35 ? 0.04 : person.age <= 45 ? 0.022 : 0.01;
  base *= 0.8 + person.traits.warmth / 200;
  if (person.traits.traditionalism >= 70) base *= 1.3;
  if (npcChance(S, base)) npcMarry(S, person, false);
}

/* Births roll from the mother's side only, so a couple rolls once a year. */
function npcMaybeBirth(S, person) {
  if (person.gender !== 'f') return;
  if (person.age < 20 || person.age > 42) return;
  const spouse = npcSpouseOf(S, person);
  if (!spouse || spouse.age < 20 || spouse.age > 60) return;
  if (npcChildrenOf(S, person).length >= 4) return;
  if (person.lastNpcBirthYear != null && S.year - person.lastNpcBirthYear < 2) return;
  let p = 0.14;
  p *= 0.8 + person.traits.traditionalism / 250;
  if (person.age > 35) p *= 0.6;
  if (npcChance(S, p)) npcHaveChild(S, person, spouse);
}

function npcHaveChild(S, mother, father) {
  const gender = npcRand(S) < 0.5 ? 'm' : 'f';
  // Who the baby is to the player: a sibling's child is a niece/nephew,
  // a child's child is a grandchild, an in-law's child follows their
  // spouse (your sibling's wife's baby is still your niece).
  const anchor = mother.role === 'sibling' || mother.role === 'child' ? mother
    : (father && (father.role === 'sibling' || father.role === 'child') ? father : null);
  let role = 'friend';
  let label = `${mother.firstName}'s ${gender === 'f' ? 'Daughter' : 'Son'}`;
  if (anchor) {
    if (anchor.role === 'sibling') { role = gender === 'f' ? 'niece' : 'nephew'; label = gender === 'f' ? 'Niece' : 'Nephew'; }
    else { role = 'grandchild'; label = gender === 'f' ? 'Granddaughter' : 'Grandson'; }
  }
  const baby = npcCreatePerson(S, {
    gender,
    age: 0,
    role,
    relationLabel: label,
    nationality: mother.residenceCountry || S.country,
    residenceCountry: mother.residenceCountry || S.country,
    city: mother.city || S.city,
    familyName: mother.familyName
  });
  baby.parentIds = [mother.id, father.id];
  baby.leftHome = false;
  S.people[baby.id] = baby;
  mother.lastNpcBirthYear = S.year;
  const close = !!anchor;
  const youAre = anchor
    ? (anchor.role === 'sibling' ? (gender === 'f' ? 'an aunt' : 'an uncle') : 'a grandparent')
    : null;
  recordJournal(
    S,
    close
      ? `Your ${npcKinWord(mother)} ${mother.firstName} gave birth to ${gender === 'f' ? 'a baby girl' : 'a baby boy'}, ${baby.firstName}. You are ${youAre} now.`
      : `${mother.firstName} (${mother.relationLabel}) had a baby, ${baby.firstName}.`,
    'milestone'
  );
  if (close) {
    const cObj = getCountry(S.country);
    const giftCost = Math.max(1, Math.round(eraLocalCost(cObj.monthlyBasket2026.rentStandard * 0.08, S.country, S.year)));
    queueScene(S, {
      key: `npc_birth_${mother.id}_${S.year}`,
      category: 'family',
      title: `A New Baby in the Family`,
      text: `Your ${npcKinWord(mother)} ${mother.firstName} has had a baby — ${baby.firstName}. The family is passing the little one around, and everyone is asking when you will come and see them.`,
      choices: [
        {
          label: `Visit & bring a gift for the baby (${formatMoney(giftCost, S.country)})`,
          available: () => S.money.cash >= giftCost,
          effect: (st) => {
            walletMove(st, -giftCost, `Baby gift for ${baby.firstName}`, 'family');
            rememberDeed(st, mother, 'baby_gift', `You came to see the new baby and brought a gift.`, { affection: 8, respect: 4 });
            recordJournal(st, `You visited ${mother.firstName} and the new baby ${baby.firstName}, with a gift worth ${formatMoney(giftCost, st.country)}. ${mother.firstName} was glowing.`, 'relationship');
          }
        },
        {
          label: 'Send congratulations and visit later',
          effect: (st) => {
            recordJournal(st, `You sent congratulations on the birth of ${baby.firstName} and promised to visit soon.`, 'relationship');
          }
        }
      ]
    });
  }
}

function npcDivorce(S, person) {
  const spouse = npcSpouseOf(S, person);
  if (!spouse) return;
  const profile = getMarriageProfile(person.residenceCountry || S.country, S.year);
  const sharia = profile.inheritanceModel === 'sharia_faraid';
  let splitLine;
  if (sharia) {
    splitLine = 'Under Sharia family law, each kept the savings in their own name.';
  } else {
    const total = Math.max(0, Number(person.career.savingsLocal) || 0) + Math.max(0, Number(spouse.career.savingsLocal) || 0);
    const half = Math.round(total / 2);
    person.career.savingsLocal = half;
    spouse.career.savingsLocal = total - half;
    splitLine = `Under ${getCountry(person.residenceCountry || S.country).name} civil law, their savings were split evenly.`;
  }
  const kids = npcChildrenOf(S, person).filter(k => k.age < 18);
  const kidsLine = kids.length
    ? ` Their ${kids.length === 1 ? 'child' : 'children'} ${kids.slice(0, 2).map(k => k.firstName).join(' and ')} will split their time between both parents now.`
    : '';
  const years = person.marriageYear != null ? S.year - person.marriageYear : 0;
  const yearsLine = years > 0 ? ` after ${years} year${years === 1 ? '' : 's'} of marriage` : '';
  // Unlink both sides (a husband with a second wife stays married to her).
  person.spouseIds = person.spouseIds.filter(id => id !== spouse.id);
  spouse.spouseIds = (spouse.spouseIds || []).filter(id => id !== person.id);
  person.spouseId = person.spouseIds[0] || null;
  spouse.spouseId = spouse.spouseIds[0] || null;
  person.maritalStatus = person.spouseIds.length ? 'married' : 'divorced';
  spouse.maritalStatus = spouse.spouseIds.length ? 'married' : 'divorced';
  person.spouseBond = person.spouseIds.length ? person.spouseBond : null;
  spouse.spouseBond = spouse.spouseIds.length ? spouse.spouseBond : null;
  if (spouse.role === 'in-law') spouse.relationLabel = `Ex-${spouse.relationLabel}`;
  if (person.role === 'in-law') person.relationLabel = `Ex-${person.relationLabel}`;
  const kin = npcKinWord(person);
  const close = person.role === 'sibling' || person.role === 'child';
  if (close) S.player.vitals.happiness = clamp(S.player.vitals.happiness - 6);
  rememberDeed(S, person, 'divorced', `Their marriage to ${spouse.firstName} ended.`, { affection: -4, trust: -3 });
  rememberDeed(S, spouse, 'divorced', `Their marriage to ${person.firstName} ended.`, { affection: -4, trust: -3 });
  recordJournal(S, `Your ${kin} ${person.firstName} and ${spouse.firstName} divorced${yearsLine}. ${splitLine}${kidsLine}`, 'relationship');
  if (close) {
    queueScene(S, {
      key: `npc_divorce_${person.id}_${S.year}`,
      category: 'family',
      title: `${person.firstName}'s Marriage Ended`,
      text: `Your ${kin} ${person.firstName} and ${spouse.firstName} have divorced${yearsLine}. ${splitLine}${kidsLine} ${person.firstName} is trying to hold it together, and could use their family right now.`,
      choices: [
        {
          label: 'Be there for them',
          effect: (st) => {
            rememberDeed(st, person, 'supported_crisis', 'You stood by them through the divorce.', { affection: 10, trust: 8 });
            recordJournal(st, `You sat with ${person.firstName} through the worst of the divorce. It meant more than you said out loud.`, 'relationship');
          }
        },
        {
          label: 'Stay out of it',
          effect: (st) => {
            rememberDeed(st, person, 'neglected', 'You stayed out of their divorce.', { affection: -5, respect: -3 });
            recordJournal(st, `You stayed out of ${person.firstName}'s divorce. They noticed the silence.`, 'relationship');
          }
        }
      ]
    });
  }
}

/* One couple, one drift a year: only the lexicographically smaller id of
   the pair drives the bond, so the bond does not random-walk twice. */
function npcBondDriftAndDivorce(S, person) {
  const spouse = npcSpouseOf(S, person);
  if (!spouse) return;
  if (person.id > spouse.id) return;
  if (person.spouseBond == null) person.spouseBond = npcRandInt(S, 58, 85);
  person.spouseBond = clamp(person.spouseBond + npcRandInt(S, -6, 5)
    + (person.traits.warmth >= 70 ? 2 : 0)
    + (person.traits.warmth < 40 ? -2 : 0)
    + (person.traits.reliability < 40 ? -3 : 0)
    + (person.traits.reliability < 55 ? -1 : 0)
    + (person.traits.traditionalism >= 75 ? 1 : 0));
  spouse.spouseBond = person.spouseBond;
  const bond = person.spouseBond;
  const p = bond < 18 ? 0.45 : bond < 30 ? 0.20 : bond < 45 ? 0.12 : 0;
  if (p > 0 && npcChance(S, p)) npcDivorce(S, person);
}

function npcMove(S, person) {
  const fromCountry = person.residenceCountry || S.country;
  const fromCity = person.city || getCountry(fromCountry).cities[0];
  const kin = npcKinWord(person);
  if (npcChance(S, 0.21)) {
    // A poor NPC does not emigrate without a visa path: real savings, a
    // spouse already abroad, or a sponsoring employer (high ambition and
    // a real job). Otherwise they stay put.
    const spouse = npcSpouseOf(S, person);
    const spouseAbroad = spouse && spouse.residenceCountry && spouse.residenceCountry !== fromCountry;
    const income = Number(person.career.monthlyIncomeLocal) || 0;
    const monthsCover = income > 0 ? (Number(person.career.savingsLocal) || 0) / income : 0;
    const sponsored = income > 0 && person.traits.ambition > 75;
    if (!spouseAbroad && monthsCover < 6 && !sponsored) return;
    const dests = COUNTRY_IDS.filter(id => id !== fromCountry && !(id === 'uae' && S.year < 1971));
    const dest = npcPick(S, dests);
    if (!dest) return;
    const dCountry = getCountry(dest);
    const reason = spouseAbroad ? 'to join their spouse' : npcPick(S, ['a job offer', 'lower living costs', 'a fresh start', "their company's transfer"]);
    person.residenceCountry = dest;
    person.city = npcPick(S, dCountry.cities) || dCountry.cities[0];
    recordJournal(S, `Your ${kin} ${person.firstName} moved from ${fromCity} to ${person.city}, ${dCountry.name} — ${reason}, after their work visa came through.`, 'relationship');
  } else {
    const cities = getCountry(fromCountry).cities.filter(c => c !== fromCity);
    if (!cities.length) return;
    const toCity = npcPick(S, cities);
    const reason = npcPick(S, ['a bigger place', 'to be closer to family', 'a shorter commute', 'a fresh start']);
    person.city = toCity;
    recordJournal(S, `Your ${kin} ${person.firstName} moved across ${getCountry(fromCountry).name}, from ${fromCity} to ${toCity} — ${reason}.`, 'relationship');
  }
}

function npcMaybeMove(S, person) {
  if (person.age < 18 || person.age > 65) return;
  if (!npcChance(S, 0.008+personMind(S,person).adventure/10000)) return;
  npcMove(S, person);
}

function npcLeaveHome(S, person) {
  const married = person.maritalStatus === 'married';
  const spouse = married ? npcSpouseOf(S, person) : null;
  const reason = married ? 'marriage' : (person.age >= 22 && npcChance(S, 0.45) ? 'work' : 'university');
  const cObj = getCountry(person.residenceCountry || S.country);
  const cities = cObj.cities.filter(c => c !== person.city);
  person.city = spouse ? (spouse.city || person.city) : (cities.length ? npcPick(S, cities) : person.city);
  person.leftHome = true;
  if (reason === 'work' && person.age >= 22 && !(Number(person.career.monthlyIncomeLocal) > 0)) npcGiveJob(S, person);
  const kin = npcKinWord(person);
  const dest = `${person.city}, ${cObj.name}`;
  if (person.role === 'child') {
    const cObj2 = getCountry(S.country);
    const helpCost = Math.max(1, Math.round(eraLocalCost(cObj2.monthlyBasket2026.rentStandard * 0.15, S.country, S.year)));
    recordJournal(S, `Your ${kin} ${person.firstName} is leaving home and moving to ${dest} for ${reason}.`, 'milestone');
    queueScene(S, {
      key: `npc_leavehome_${person.id}_${S.year}`,
      category: 'family',
      title: `Your ${kin} ${person.firstName} Is Leaving Home`,
      text: `Your ${kin} ${person.firstName} is moving to ${dest} for ${reason}. The bags are packed, the room is already quieter, and this is the goodbye that matters.`,
      choices: [
        {
          label: `Help them settle in (${formatMoney(helpCost, S.country)})`,
          available: () => S.money.cash >= helpCost,
          effect: (st) => {
            walletMove(st, -helpCost, `Helping ${person.firstName} settle into their new place`, 'family');
            rememberDeed(st, person, 'supported_move', 'You helped them settle into their first place of their own.', { affection: 10, trust: 8 });
            recordJournal(st, `You helped ${person.firstName} settle into their new place in ${dest} (${formatMoney(helpCost, st.country)}). It still feels strange coming home to their empty room.`, 'relationship');
          }
        },
        {
          label: 'Wish them well and let them go',
          effect: (st) => {
            rememberDeed(st, person, 'left_home', 'They left home for a new life of their own.', { affection: 4 });
            recordJournal(st, `You hugged ${person.firstName} goodbye as they left for ${dest}. They promised to call every week.`, 'relationship');
          }
        }
      ]
    });
  } else {
    recordJournal(S, `Your ${kin} ${person.firstName} left ${person.role === 'sibling' ? 'the family home' : "their parents' home"} and moved to ${dest} for ${reason}.`, 'relationship');
  }
}

function npcMaybeLeaveHome(S, person) {
  if (person.leftHome) return;
  if (person.age < 18 || person.age > 24) return;
  if (!['sibling', 'child', 'nephew', 'niece', 'grandchild'].includes(person.role)) return;
  if (!npcChance(S, 0.28)) return;
  npcLeaveHome(S, person);
}

function npcJobChange(S, person) {
  if(person.career?.businessEmployeeId&&(S.career.businesses||[]).some(b=>b.id===person.career.businessEmployeeId&&((b.staff||[]).some(e=>e.personId===person.id)||b.manager?.personId===person.id)))return;
  const income = Number(person.career.monthlyIncomeLocal) || 0;
  const title = person.career.title || '';
  if (person.age < 22 || person.age >= 63 || title === 'Retired') return;
  if (income <= 0) {
    // Hired after a spell without work. Students are excluded: they get
    // their first job from the existing age-22 rule, not from this.
    if ((title === 'Seeking Work' || title === 'Unemployed') && npcChance(S, 0.20)) {
      npcGiveJob(S, person);
      recordJournal(S, `Your ${npcKinWord(person)} ${person.firstName} found a new job as a ${person.career.title.toLowerCase()} in ${person.city} (${formatMoney(person.career.monthlyIncomeLocal, person.residenceCountry)}/mo).`, 'career');
    }
    return;
  }
  if (npcChance(S, person.traits.reliability < 40 ? 0.03 : 0.015)) {
    person.career.monthlyIncomeLocal = 0;
    person.career.title = 'Seeking Work';
    recordJournal(S, `Your ${npcKinWord(person)} ${person.firstName} lost their job as a ${title.toLowerCase()} in ${person.city}. They are looking for work again.`, 'career');
    return;
  }
  if (npcChance(S, person.traits.ambition > 68 ? 0.07 : 0.04)) {
    // A second promotion moves Senior -> Lead -> Principal, so the title
    // keeps showing the rise instead of stalling at Senior forever.
    // The old rank is stripped first: a third promotion must never
    // produce a doubled rank like "Senior Principal".
    const baseTitle = title.replace(/^(Senior |Lead |Principal )/, '');
    if (title.startsWith('Senior ')) person.career.title = `Lead ${baseTitle}`;
    else if (title.startsWith('Lead ')) person.career.title = `Principal ${baseTitle}`;
    else if (title.startsWith('Principal ')) person.career.title = title; // already at the top; the pay still rises
    else person.career.title = `Senior ${title}`;
    person.career.monthlyIncomeLocal = Math.round(income * 1.18);
    recordJournal(S, `Your ${npcKinWord(person)} ${person.firstName} was promoted to ${person.career.title.toLowerCase()} in ${person.city} — now earning ${formatMoney(person.career.monthlyIncomeLocal, person.residenceCountry)}/mo.`, 'career');
    return;
  }
  if (person.age >= 25 && person.age <= 55 && npcChance(S, 0.01)) {
    const next = npcPick(S, NPC_CAREER_CHANGE_TITLES.filter(t => t !== title && !title.includes(t)));
    if (next) {
      const pCountry = getCountry(person.residenceCountry || S.country);
      const entryPay = eraSalary(pCountry.annualSalaryTiers2026.entry / 12, person.residenceCountry, S.year);
      person.career.title = next;
      person.career.monthlyIncomeLocal = Math.round(entryPay * (0.75 + (person.traits.ambition / 140)));
      recordJournal(S, `Your ${npcKinWord(person)} ${person.firstName} changed careers and is now working as a ${next.toLowerCase()} in ${person.city}.`, 'career');
    }
  }
}

/* Annual NPC Autonomy: every NPC ages once per year, progresses in career/life, and checks promises! */
export function tickNpcAutonomyYearly(S) {
  const cObj = getCountry(S.country);

  for (const person of Object.values(S.people)) {
    if (!person || !person.alive || person.id === 'player') continue;
    // Ages are set in exactly one place — ageAllPeople() in gameLoop.js
    // (birth-month ageing). This tick only progresses NPC lives.

    personMind(S,person);
    /* Natural NPC age-appropriate schooling & career progression */
    const pCountry = getCountry(person.residenceCountry || S.country);
    const managedEmployment=person.career?.businessEmployeeId&&(S.career.businesses||[]).some(b=>b.id===person.career.businessEmployeeId&&((b.staff||[]).some(e=>e.personId===person.id)||b.manager?.personId===person.id));
    if(person.career?.npcCompanyPayroll){}
    else if(managedEmployment){person.career.savingsLocal=(person.career.savingsLocal||0)+Math.round(person.career.monthlyIncomeLocal*12*.12);}
    else if (person.age < 5 && !person.career.monthlyIncomeLocal) {
      person.career.title = 'Infant / Preschool';
    } else if (person.age >= 5 && person.age < 12 && !person.career.monthlyIncomeLocal) {
      person.career.title = 'Primary School Pupil';
    } else if (person.age >= 12 && person.age < 18 && !person.career.monthlyIncomeLocal) {
      person.career.title = 'Secondary Student';
    } else if (person.age >= 18 && person.age < 22 && !person.career.monthlyIncomeLocal) {
      person.career.title = 'University Student';
    } else if (person.age === 22 && (!person.career.monthlyIncomeLocal || ['Unemployed', 'Seeking Work', 'University Student'].includes(person.career.title))) {
      const entryPay = eraSalary(pCountry.annualSalaryTiers2026.entry / 12, person.residenceCountry, S.year);
      const mult = 0.75 + (person.traits.ambition / 140);
      person.career.title = person.vitals.smarts >= 78 ? 'Graduate Specialist' : 'Operations Coordinator';
      person.career.monthlyIncomeLocal = Math.round(entryPay * mult);
      person.career.savingsLocal = Math.round(person.career.monthlyIncomeLocal * 2);
      if (person.role === 'child') {
        recordJournal(S, `Your ${person.gender === 'f' ? 'daughter' : 'son'} ${person.firstName} graduated and started working as a ${person.career.title.toLowerCase()} (${formatMoney(person.career.monthlyIncomeLocal, person.residenceCountry)}/mo).`, 'relationship');
      }
    } else if (person.age > 22 && person.age < 63 && person.career.monthlyIncomeLocal > 0) {
      const raiseMult = 1 + (person.traits.ambition > 68 ? 0.04 : 0.015);
      person.career.monthlyIncomeLocal = Math.round(person.career.monthlyIncomeLocal * raiseMult);
      const saveRate = person.traits.materialism > 70 ? 0.06 : 0.16;
      person.career.savingsLocal += Math.round(person.career.monthlyIncomeLocal * 12 * saveRate);
    } else if (person.age === 64 && person.career.monthlyIncomeLocal > 0 && person.career.title !== 'Retired') {
      person.career.title = 'Retired';
      person.career.monthlyIncomeLocal = Math.round(person.career.monthlyIncomeLocal * 0.52);
    }

    /* v2.10 — NPCs live their own lives. Parents and the player's own
       spouse/partner are excluded from the family events (their lives are
       the player's story, owned by the marriage engine); parents still
       change jobs. A boss's life is none of the player's business. */
    npcEnsureMarital(S, person);
    const isParent = person.role === 'father' || person.role === 'mother';
    const isPlayersPartner = person.role === 'spouse' || person.role === 'partner' || person.role === 'fiance';
    if (!isPlayersPartner && person.role !== 'boss') {
      if (isParent) {
        // Parents arrive with no spouse link; tie them to each other once
        // so neither is ever treated as single and remarried by mistake.
        const otherParentId = person.role === 'father' ? S.relations.motherId : S.relations.fatherId;
        const other = otherParentId ? S.people[otherParentId] : null;
        if (other && other.alive && !person.spouseIds.length) {
          person.spouseIds = [other.id];
          person.spouseId = other.id;
          person.maritalStatus = 'married';
          person.spouseBond = 72;
        }
        npcJobChange(S, person);
      } else if (NPC_AUTONOMY_ROLES.has(person.role)) {
        npcBondDriftAndDivorce(S, person);
        npcMaybeMarry(S, person);
        npcMaybeBirth(S, person);
        npcMaybeMove(S, person);
        npcMaybeLeaveHome(S, person);
        npcJobChange(S, person);
      }
    }

    /* Gentle distance drift ONLY when no contact for >2 years while living apart — NO automatic happy-marriage decay! */
    const turnsSinceContact = S.turn - (person.rel.lastContactTurn || 0);
    const yearsSilent = S.pacing === 'monthly' ? turnsSinceContact / 12 : turnsSinceContact;
    if (yearsSilent >= 2.5 && person.residenceCountry !== S.country && person.role !== 'spouse') {
      person.rel.affection = clamp(person.rel.affection - 2);
    }

    /* Check overdue promises (Invariant: concrete follow-through!) */
    for (const pr of person.rel.promises) {
      if (pr.status === 'open' && S.year > pr.dueYear) {
        pr.status = 'broken';
        rememberDeed(S, person, 'broke_promise', `Promise expired unfulfilled: ${pr.description}.`, {
          trust: -18,
          respect: -12,
          resentment: 22,
          affection: -8,
          weight: 2
        });
        recordJournal(
          S,
          `The deadline passed on your promise to ${person.fullName} (${pr.description}). They didn't shout, which somehow felt worse.`,
          'relationship'
        );
      }
    }

    /* NPC Mortality for elderly relatives (realistic actuarial curve, never sudden young wipeouts unless severe illness) */
    if (person.age >= 58) {
      person.vitals.health = clamp(person.vitals.health - randInt(S, 1, person.age >= 76 ? 5 : 3));
      const baseMort = person.age < 68 ? 0.012 : person.age < 78 ? 0.042 : person.age < 86 ? 0.11 : 0.24;
      const lowHpBoost = person.vitals.health < 28 ? 0.14 : 0;
      if (chance(S, baseMort + lowHpBoost)) {
        handleNpcDeath(S, person);
      }
    }
  }

  /* v2.15 W3 — friendship decay: a friend uncontacted for 6 months starts
     drifting (warned on the card), at 12 months a notice fires with a
     real choice. Friends only; family ties are not friendships. */
  tickFriendshipDrift(S);
}

/* v2.9 — the ONE writer for a marriage ending with no live couple record
   (old saves / marriages created before couples existed). It rebuilds the
   couple record from the legacy contract (or an empty one if even the
   contract is missing — the rebuilt record is stamped at the current
   year; the legacy contract keeps the real marriage year), then closes it
   through closeCouple() so the stage history, the legacy status and the
   contract all stay in sync. Nothing in the game writes
   S.marriage.status / S.marriage.contracts directly any more — every
   write goes through syncCoupleToLegacy / closeCouple. Lives in this file
   (not marriageFamilyEngine.js) because that file already imports from
   here — the other direction would be an import cycle. */
export function closeMarriageWithoutCouple(S, spouse, endedReason) {
  if (!S || !spouse) return null;
  if (!Array.isArray(S.marriage.couples)) S.marriage.couples = [];
  if (!Array.isArray(S.marriage.contracts)) S.marriage.contracts = [];
  let couple = S.marriage.couples.find(c => c && c.partners && c.partners.includes(spouse.id)) || null;
  if (!couple) {
    const contract = S.marriage.contracts.find(c => c.spouseId === spouse.id && c.active)
      || S.marriage.contracts.find(c => c.spouseId === spouse.id) || {};
    couple = newCoupleRecord(S, 'player', spouse.id, {
      stage: 'married',
      country: contract.country || S.country,
      contractId: contract.id || null,
      mahrPrompt: contract.mahrPrompt || 0,
      mahrPromptPaid: contract.mahrPromptPaid || 0,
      mahrDeferred: contract.mahrDeferred || 0,
      mahrDeferredPaid: contract.mahrDeferredPaid || 0,
      shabkaGrams: contract.shabkaGrams || 0,
      qaimaSigned: !!contract.qaimaSigned,
      qaimaValueLocal: contract.qaimaValueLocal || 0,
      prenupSigned: !!contract.prenupSigned
    });
    S.marriage.couples.push(couple);
  }
  closeCouple(S, couple, endedReason);
  return couple;
}

export function handleNpcDeath(S, person) {
  if (!person || !person.alive) return;
  inheritNpcCompanies(S,person);
  person.alive = false;
  person.deathYear = S.year;
  person.deathCause = person.age >= 75 ? 'natural causes' : 'cardiac complications';

  const abroad = person.residenceCountry !== S.country;
  S.player.vitals.happiness = clamp(S.player.vitals.happiness - (person.role === 'father' || person.role === 'mother' || person.role === 'spouse' || person.role === 'child' ? 24 : 12));
  S.player.vitals.stress = clamp(S.player.vitals.stress + 16);

  if (person.role === 'spouse') {
    // ONE widowhood writer (D5): close the couple record; the legacy lists
    // (incl. the widowed-spouse list, never the ex list) follow from it.
    // A widowed survivor's deferred mahr remainder is a debt on the estate,
    // settled from the estate — it is NOT re-charged to the survivor.
    const couple = getCoupleForSpouse(S, person.id);
    if (couple) {
      closeCouple(S, couple, 'widowed');
    } else {
      /* v2.9 — no live couple record: rebuild it from the legacy contract
         and close it properly (stage history + legacy status + contract). */
      closeMarriageWithoutCouple(S, person, 'widowed');
    }
  }

  /* Parent bereavement + Estate Inheritance Settlement! */
  if (person.role === 'father' || person.role === 'mother') {
    const otherParentId = person.role === 'father' ? S.relations.motherId : S.relations.fatherId;
    const otherParent = otherParentId ? S.people[otherParentId] : null;
    const estateInParentLocal = Math.max(0, Number(person.career.savingsLocal) || 0);
    const estateInPlayerLocal = Math.round(convertCurrency(estateInParentLocal, person.residenceCountry, S.country, S.year));

    /* Calculate authentic legal inheritance (Sharia Al-Faraid 2:1 in egy/sau/uae vs Western Probate + UK 40% IHT) */
    const livingSibs = S.relations.siblingIds.map(id => S.people[id]).filter(x => x && x.alive);
    const profCountry = person.nationality || S.homeCountry;
    let playerSharePct = 0.5;
    let lawLabel = 'Civil Probate Equal Division';
    let netEstatePlayerLocal = estateInPlayerLocal;

    if (['egy', 'sau', 'uae'].includes(profCountry) || S.player.religion === 'muslim') {
      const spouseTake = (otherParent && otherParent.alive) ? (person.role === 'father' ? 0.125 : 0.25) : 0;
      const pool = 1 - spouseTake;
      const playerUnits = S.player.gender === 'm' ? 2 : 1;
      const totalUnits = playerUnits + livingSibs.reduce((sum, sb) => sum + (sb.gender === 'm' ? 2 : 1), 0);
      playerSharePct = pool * (playerUnits / Math.max(1, totalUnits));
      lawLabel = profCountry === 'sau' ? 'Sharia Sakk Hasr Erth (Al-Fara\'id 2:1)' : 'Sharia I\'lam Waratha (Al-Fara\'id 2:1)';
    } else {
      if (profCountry === 'gbr' && !person.companyEstateCashAfterCharges && !(otherParent && otherParent.alive)) {
        const nilBand = Math.round(convertCurrency(eraLocalCost(325000, 'gbr', S.year), 'gbr', S.country, S.year));
        if (netEstatePlayerLocal > nilBand) {
          netEstatePlayerLocal -= Math.round((netEstatePlayerLocal - nilBand) * 0.40);
          lawLabel = 'UK Probate (after 40% HM Treasury IHT above £325k)';
        }
      }
      const spouseTake = (otherParent && otherParent.alive) ? 0.5 : 0;
      playerSharePct = (1 - spouseTake) / (1 + livingSibs.length);
    }

    const inheritedAmount = Math.round(netEstatePlayerLocal * playerSharePct);
    const flightCost = abroad ? Math.round(convertCurrency(650, 'usa', S.country, S.year)) : 0;
    const funeralShare = Math.round(eraLocalCost(getCountry(S.country).monthlyBasket2026.rentStandard * 1.2, S.country, S.year));

    queueScene(S, {
      key: `bereavement_${person.id}`,
      category: 'family',
      speakerId: livingSibs[0]?.id || otherParent?.id || null,
      title: `The Loss of Your ${person.relationLabel}, ${person.firstName}`,
      text: abroad
        ? `Your phone rings at dawn with news from ${getCountry(person.residenceCountry).name}: your ${person.relationLabel.toLowerCase()} ${person.fullName} has passed away at age ${person.age}.${inheritedAmount > 0 ? ` Under ${lawLabel}, your statutory share is ${formatMoney(inheritedAmount, S.country)}.` : ''}`
        : `Your ${person.relationLabel.toLowerCase()} ${person.fullName} passed away peacefully at age ${person.age}. Family and neighbors gather to offer condolences.${inheritedAmount > 0 ? ` Under ${lawLabel}, your statutory share is ${formatMoney(inheritedAmount, S.country)}.` : ''}`,
      choices: [
        {
          label: abroad
            ? `Fly home immediately & cover funeral arrangements (${formatMoney(flightCost + funeralShare, S.country)})`
            : `Lead the funeral arrangements & honor their memory (${formatMoney(funeralShare, S.country)})`,
          available: () => S.money.cash >= (abroad ? flightCost : Math.round(funeralShare * 0.4)),
          effect: (st) => {
            const cost = Math.min(st.money.cash, (abroad ? flightCost : 0) + funeralShare);
            if (cost > 0) walletMove(st, -cost, `Funeral & travel for ${person.fullName}`, 'family');
            if (inheritedAmount > 0) {
              walletMove(st, inheritedAmount, `Estate inheritance share from ${person.fullName}`, 'inheritance');
            }
            for (const sb of livingSibs) {
              rememberDeed(st, sb, 'supported_crisis', `Stood by the family at ${person.firstName}'s funeral.`, { affection: 12, respect: 14, trust: 10 });
            }
            if (otherParent && otherParent.alive) {
              rememberDeed(st, otherParent, 'supported_crisis', `Carried the family through ${person.firstName}'s funeral.`, { affection: 15, trust: 12 });
            }
            recordJournal(
              st,
              `You stood with the family to lay ${person.fullName} (age ${person.age}) to rest.${inheritedAmount > 0 ? ` Estate settlement transferred your statutory share of ${formatMoney(inheritedAmount, st.country)}.` : ''}`,
              'milestone'
            );
          }
        },
        {
          label: abroad ? 'Mourn from abroad & wire funeral support' : 'Attend quietly with the family',
          effect: (st) => {
            const wire = Math.min(st.money.cash, Math.round(funeralShare * 0.4));
            if (wire > 0) walletMove(st, -wire, `Funeral contribution for ${person.fullName}`, 'family');
            if (inheritedAmount > 0) {
              walletMove(st, inheritedAmount, `Estate inheritance share from ${person.fullName}`, 'inheritance');
            }
            if (abroad) {
              for (const sb of livingSibs) {
                rememberDeed(st, sb, 'neglected', `Could not make it back in person for ${person.firstName}'s funeral.`, { respect: -8, resentment: 10 });
              }
            }
            recordJournal(
              st,
              `${person.fullName} was laid to rest at age ${person.age}.${abroad ? ' Missing the funeral in person weighed heavily on you.' : ''}${inheritedAmount > 0 ? ` Your estate share was ${formatMoney(inheritedAmount, st.country)}.` : ''}`,
              'milestone'
            );
          }
        }
      ]
    }, true);
  } else {
    recordJournal(S, `${person.fullName} (${person.relationLabel}) passed away at age ${person.age}.`, 'milestone');
  }
}

/* Helper wired cleanly onto S helper or imported directly */
S_attachSpouseDeathHelper();
function S_attachSpouseDeathHelper() {}

/* Pick a genuine, logical Domino Reaction Scene when player state warrants one (Adults 18+ ONLY for money asks!) */
export function maybePickDominoSoulScene(S) {
  if (!S || S.player.age < 19 || S.activeScene) return null;

  const netWorth = computeNetWorthLocal(S); // D12: one net-worth definition, shared with every other gate.
  const cObj = getCountry(S.country);
  const annualMidPay = eraSalary(cObj.annualSalaryTiers2026.mid, S.country, S.year);

  /* 1. Materialistic or Struggling Adult Sibling/Friend asks for help when Player is clearly prosperous */
  if (netWorth > annualMidPay * 0.8) {
    const candidates = [
      ...S.relations.siblingIds.map(id => S.people[id]),
      ...S.relations.friendIds.map(id => S.people[id])
    ].filter(p =>
      p && p.alive && p.age >= 21 &&
      p.rel.resentment < 60 &&
      !p.rel.promises.some(pr => pr.status === 'open') &&
      (!S.cooldowns[`ask_loan_${p.id}`] || S.turn >= S.cooldowns[`ask_loan_${p.id}`]) &&
      (p.traits.materialism >= 58 || p.career.savingsLocal < annualMidPay * 0.15)
    );

    if (candidates.length && chance(S, 0.22)) {
      const asker = pick(S, candidates);
      const askAmt = Math.round(Math.min(netWorth * 0.18, annualMidPay * 0.28));
      if (askAmt > 0) {
        S.cooldowns[`ask_loan_${asker.id}`] = S.turn + (S.pacing === 'monthly' ? 48 : 4);
        const abroadContext = asker.residenceCountry !== S.country
          ? `calling from ${getCountry(asker.residenceCountry).name}`
          : `over tea`;
        const purpose = asker.role === 'sibling'
          ? (asker.age < 29 ? 'covering marriage apartment deposits' : 'bridging a supplier gap in a small venture')
          : 'covering an urgent lease and clinic deposit';

        return {
          key: `ask_loan_${asker.id}_${S.year}`,
          category: 'relationship',
          speakerId: asker.id,
          title: `${asker.firstName} Asks for Financial Backing`,
          text: `${asker.fullName} (${asker.relationLabel}, ${asker.traitTags.join(' · ')}) brings it up ${abroadContext}: "Things have gone well for you lately, thank God. I’m short about ${formatMoney(askAmt, S.country)} for ${purpose}. Can you back me?"`,
          choices: [
            {
              label: `Give ${formatMoney(askAmt, S.country)} as family/friend support (no repayment expected)`,
              available: () => S.money.cash >= askAmt,
              effect: (st) => {
                walletMove(st, -askAmt, `Supported ${asker.fullName} (${purpose})`, 'family');
                asker.career.savingsLocal += Math.round(convertCurrency(askAmt, st.country, asker.residenceCountry, st.year));
                rememberDeed(st, asker, 'helped_money', `Gave ${formatMoney(askAmt, st.country)} generously without strings.`, {
                  affection: 18, respect: 16, trust: 15, resentment: -20, weight: 3
                });
                recordJournal(st, `You backed ${asker.fullName} with ${formatMoney(askAmt, st.country)} — no IOU attached. They were visibly moved.`, 'relationship');
              }
            },
            {
              label: `Give half (${formatMoney(Math.round(askAmt * 0.5), S.country)}) — what you can safely spare`,
              available: () => S.money.cash >= Math.round(askAmt * 0.5),
              effect: (st) => {
                const half = Math.round(askAmt * 0.5);
                walletMove(st, -half, `Partial support to ${asker.fullName}`, 'family');
                asker.career.savingsLocal += Math.round(convertCurrency(half, st.country, asker.residenceCountry, st.year));
                rememberDeed(st, asker, 'helped_money', `Helped with ${formatMoney(half, st.country)}.`, {
                  affection: 8, respect: 7, trust: 6, resentment: -8
                });
                recordJournal(st, `You met ${asker.firstName} halfway with ${formatMoney(half, st.country)}. Practical and fair.`, 'relationship');
              }
            },
            {
              label: `Promise to send ${formatMoney(askAmt, S.country)} within a year`,
              effect: (st) => {
                createPromise(st, asker, 'money_help', `Help ${asker.firstName} with ${purpose}`, askAmt, 12);
                recordJournal(st, `You promised ${asker.firstName} ${formatMoney(askAmt, st.country)} within a year. They’re counting on your word.`, 'relationship');
              }
            },
            {
              label: 'Politely decline — keep money and relationships separate',
              effect: (st) => {
                const hurt = asker.traits.materialism >= 68 || asker.traits.pride >= 70 ? 18 : 7;
                rememberDeed(st, asker, 'refused_help', `Declined request for ${formatMoney(askAmt, st.country)}.`, {
                  affection: -Math.round(hurt * 0.6),
                  resentment: hurt
                });
                const reactionLine = asker.traits.warmth >= 68
                  ? `${asker.firstName} nodded quietly: "I understand — everyone has their own commitments."`
                  : `${asker.firstName}'s tone cooled at once: "Right. Good to know who stands where."`;
                recordJournal(st, `You declined ${asker.firstName}'s request for ${formatMoney(askAmt, st.country)}. ${reactionLine}`, 'relationship');
              }
            }
          ]
        };
      }
    }
  }

  /* 2. Aging Parent Health / Homesickness Scene when Player lives abroad */
  const parentsAbroad = [S.relations.fatherId, S.relations.motherId]
    .map(id => id && S.people[id])
    .filter(p => p && p.alive && p.age >= 58 && p.residenceCountry !== S.country);

  if (parentsAbroad.length && chance(S, 0.20)) {
    const parent = pick(S, parentsAbroad);
    const key = `parent_abroad_care_${parent.id}_${Math.floor(S.year / 3)}`;
    if (!S.cooldowns[key] || S.turn >= S.cooldowns[key]) {
      S.cooldowns[key] = S.turn + (S.pacing === 'monthly' ? 36 : 3);
      const clinicUsd = 950;
      const clinicLocal = Math.round(convertCurrency(clinicUsd, 'usa', S.country, S.year));
      const tripLocal = Math.round(convertCurrency(1450, 'usa', S.country, S.year));

      return {
        key,
        category: 'family',
        speakerId: parent.id,
        title: `What ${parent.firstName} Didn’t Mention on the Call`,
        text: `On your video call to ${getCountry(parent.residenceCountry).name}, your ${parent.relationLabel.toLowerCase()} ${parent.firstName} (age ${parent.age}) insists everything is fine — until you notice medicine boxes on the side table. Private specialist care back home runs ~${formatMoney(clinicLocal, S.country)}.`,
        choices: [
          {
            label: `Fly back for a week & fund full specialist care (${formatMoney(tripLocal, S.country)})`,
            available: () => S.money.cash >= tripLocal && S.legal.military.travelPermitted,
            effect: (st) => {
              walletMove(st, -tripLocal, `Home visit & specialist care for ${parent.fullName}`, 'family');
              parent.vitals.health = clamp(parent.vitals.health + 14);
              parent.rel.lastContactTurn = st.turn;
              rememberDeed(st, parent, 'supported_crisis', `Flew home and arranged private doctors.`, {
                affection: 18, respect: 15, trust: 14, resentment: -15, weight: 3
              });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
              recordJournal(st, `You flew back to ${getCountry(parent.residenceCountry).name} and took ${parent.firstName} to a top specialist yourself. Their health stabilized noticeably.`, 'relationship');
            }
          },
          {
            label: `Wire ${formatMoney(clinicLocal, S.country)} immediately for private doctors`,
            available: () => S.money.cash >= clinicLocal,
            effect: (st) => {
              walletMove(st, -clinicLocal, `Wired medical funds for ${parent.fullName}`, 'family');
              parent.vitals.health = clamp(parent.vitals.health + 10);
              parent.rel.lastContactTurn = st.turn;
              rememberDeed(st, parent, 'helped_money', `Wired funds for private medical care.`, {
                affection: 11, respect: 10, trust: 10
              });
              recordJournal(st, `You wired ${formatMoney(clinicLocal, st.country)} to cover ${parent.firstName}'s private medical care in ${getCountry(parent.residenceCountry).name}.`, 'relationship');
            }
          },
          {
            label: 'Check in by phone — money and leave are tight right now',
            effect: (st) => {
              parent.vitals.health = clamp(parent.vitals.health - 4);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 8);
              recordJournal(st, `You stayed on the phone longer with ${parent.firstName}, wishing distance and work weren't always in the way.`, 'relationship');
            }
          }
        ]
      };
    }
  }

  /* 3. Grown Child Reaches Out (either thriving & grateful, or asking advice) */
  const grownKids = S.relations.childIds
    .map(id => S.people[id])
    .filter(c => c && c.alive && c.age >= 20);
  if (grownKids.length && chance(S, 0.18)) {
    const kid = pick(S, grownKids);
    const key = `grown_child_${kid.id}_${Math.floor(S.year / 3)}`;
    if (!S.cooldowns[key] || S.turn >= S.cooldowns[key]) {
      S.cooldowns[key] = S.turn + (S.pacing === 'monthly' ? 36 : 3);
      if (kid.rel.affection >= 65 && S.player.age >= 55) {
        const giftLocal = Math.round(eraLocalCost(cObj.monthlyBasket2026.foodAdult * 0.9, S.country, S.year));
        return {
          key,
          category: 'family',
          speakerId: kid.id,
          title: `${kid.firstName} Drops By Unannounced`,
          text: `Your ${kid.gender === 'f' ? 'daughter' : 'son'} ${kid.firstName} (age ${kid.age}, ${kid.career.title}) stops by carrying groceries and insisting on settling one of your household bills this month.`,
          choices: [
            {
              label: 'Accept warmly and stay up talking for hours',
              effect: (st) => {
                walletMove(st, giftLocal, `Household gift from ${kid.firstName}`, 'family');
                kid.rel.affection = clamp(kid.rel.affection + 8);
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 9);
                st.player.vitals.stress = clamp(st.player.vitals.stress - 8);
                recordJournal(st, `${kid.firstName} spent the evening with you and quietly covered ${formatMoney(giftLocal, st.country)} of household bills.`, 'relationship');
              }
            },
            {
              label: 'Refuse the money out of pride, but keep them for dinner',
              effect: (st) => {
                kid.rel.affection = clamp(kid.rel.affection + 6);
                kid.rel.respect = clamp(kid.rel.respect + 6);
                st.player.vitals.happiness = clamp(st.player.vitals.happiness + 7);
                recordJournal(st, `You waved away ${kid.firstName}'s money ("Put it in your savings!") and shared a long family dinner instead.`, 'relationship');
              }
            }
          ]
        };
      }
    }
  }

  return null;
}

/* Generate contextual, age-, role-, personality- and memory-aware dialogue for any NPC! */
export function generateContextualLine(S, person) {
  if (!person || !person.alive) return '';

  /* 1. Strict Age Gating: Babies & Children NEVER speak like corporate adults! */
  if (person.age < 4) {
    return person.rel.affection >= 75
      ? `*Reaches both arms up toward you and giggles happily.*`
      : `*Playing quietly on the rug with wooden blocks.*`;
  }
  if (person.age < 12) {
    return person.vitals.smarts >= 78
      ? `"Look what I built at school today — the teacher put a gold star on it!"`
      : `"Can we go out for ice cream and play in the park this weekend?"`;
  }
  if (person.age < 18) {
    return person.role === 'child'
      ? `"Exams are intense right now, ${S.player.gender === 'f' ? 'Mom' : 'Dad'} — I'm doing my best to make you proud."`
      : `"Everyone at school is stressed about exam scores and what comes next."`;
  }

  const openProm = person.rel.promises.find(pr => pr.status === 'open');
  if (openProm) {
    return `"Don’t forget what we talked about — ${openProm.description} by ${openProm.dueYear}."`;
  }

  const lastMem = person.rel.memories[0];
  if (lastMem && (S.year - lastMem.year) <= 2) {
    if (lastMem.kind === 'broke_promise') {
      return person.traits.warmth >= 68
        ? `"I’m still hurt that my trust meant so little when I counted on you."`
        : `"Words are cheap. You already showed me what a promise is worth."`;
    }
    if (lastMem.kind === 'helped_money' || lastMem.kind === 'kept_promise') {
      return `"I haven’t forgotten how you stood by me (${lastMem.summary.toLowerCase()})."`;
    }
    if (lastMem.kind === 'refused_help' && person.rel.resentment >= 25) {
      return `"I managed on my own last time, and I’ll manage again."`;
    }
  }

  if (person.residenceCountry !== S.country) {
    if (person.role === 'mother' || person.role === 'father') {
      return `"The house in ${person.city} feels quieter with you in ${getCountry(S.country).name}. Take care of your health."`;
    }
    return `"Life in ${getCountry(S.country).name} suits you — tell me when you’re visiting ${person.city} next."`;
  }

  if (person.rel.resentment >= 55) {
    return `"Let’s keep things polite and brief."`;
  }
  if (person.traits.warmth >= 70) {
    return `"Sit down — tell me honestly how work and life have been treating you."`;
  }
  if (person.traits.pride >= 72) {
    return `"Hold your head high and make moves worth respecting."`;
  }
  if (person.traits.materialism >= 70) {
    return `"Results and stability are what count in this economy."`;
  }
  if (person.traits.traditionalism >= 72) {
    return `"A person who honors family duty never loses their footing."`;
  }
  return `"Good to catch up. Plenty going on lately."`;
}

/* Direct Player-Initiated Interactions from the People Screen */
export function interactWithPerson(S, personId, action, opts = {}) {
  const p = S.people[personId];
  if (!p || !p.alive) return { ok: false, msg: 'Person unavailable.' };
  if(!canContactPerson(S,p))return{ok:false,msg:p.firstName+' is not accepting contact.'};

  /* v2.15 W3 — every relationship action costs social energy. Checked up
     front (a refusal in plain words, before anything happens); spent at
     the point in each branch where the interaction actually happens, so a
     gift you cannot afford or a referral you cannot get never costs you
     an evening. A scene that already charged the energy (ask-for-help)
     passes energyCharged and is never charged twice. */
  const energyCost = energyCostFor(`interact:${action}`, S, p);
  let energySpent = !!opts.energyCharged;
  const spendEnergy = () => { if (!energySpent) { spendSocialEnergy(S, energyCost); energySpent = true; } };
  if (!opts.energyCharged) {
    const e = checkSocialEnergy(S, energyCost);
    if (!e.ok) return e;
  }

  const cObj = getCountry(S.country);
  const sameCountry = p.residenceCountry === S.country;
  noteSocialContact(S, p); /* v2.15 W3 — this is a real contact: it stops any drift. */

  if (action === 'talk_visit') {
    spendEnergy(); /* v2.15 W3 */
    if (sameCountry) {
      rememberDeed(S, p, 'visited', `Spent quality time together in ${S.city}.`, {
        affection: 7, trust: 4, resentment: -5
      });
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 4);
      S.player.vitals.stress = clamp(S.player.vitals.stress - 4);
      const quote = generateContextualLine(S, p);
      recordJournal(S, `You spent the afternoon with ${p.fullName} (${p.relationLabel}). ${quote}`, 'relationship');
      return { ok: true, msg: quote };
    } else {
      rememberDeed(S, p, 'visited', `Had a long international call.`, { affection: 5, trust: 2, resentment: -2 });
      S.player.vitals.happiness = clamp(S.player.vitals.happiness + 2);
      const quote = generateContextualLine(S, p);
      recordJournal(S, `You called ${p.fullName} in ${getCountry(p.residenceCountry).name}. ${quote}`, 'relationship');
      return { ok: true, msg: quote };
    }
  }

  if (action === 'gift') {
    if (S.player.age < 16) return { ok: false, msg: 'Wait until you earn pocket money.' };
    const giftCost = eraLocalCost(cObj.monthlyBasket2026.foodAdult * 0.45, S.country, S.year);
    if (S.money.cash < giftCost) return { ok: false, msg: `Need ${formatMoney(giftCost, S.country)} for a thoughtful gift.` };
    spendEnergy(); /* v2.15 W3 */
    walletMove(S, -giftCost, `Thoughtful gift for ${p.fullName}`, 'family');
    const affBoost = p.traits.materialism >= 65 ? 13 : 9;
    rememberDeed(S, p, 'gift', `Brought a thoughtful gift (${formatMoney(giftCost, S.country)}).`, {
      affection: affBoost, respect: 5, resentment: -10
    });
    recordJournal(S, `You surprised ${p.fullName} with a gift (${formatMoney(giftCost, S.country)}). Their face lit up.`, 'relationship');
    return { ok: true, msg: `Gifted ${p.firstName}!` };
  }

  if (action === 'financial_support') {
    if (S.player.age < 18) return { ok: false, msg: 'Adults only.' };
    const supportAmt = eraLocalCost(cObj.monthlyBasket2026.rentModest, S.country, S.year);
    if (S.money.cash < supportAmt) return { ok: false, msg: `Need ${formatMoney(supportAmt, S.country)} in cash.` };
    spendEnergy(); /* v2.15 W3 */
    walletMove(S, -supportAmt, `Financial support sent to ${p.fullName}`, 'family');
    p.career.savingsLocal += Math.round(convertCurrency(supportAmt, S.country, p.residenceCountry, S.year));
    rememberDeed(S, p, 'helped_money', `Supported them with ${formatMoney(supportAmt, S.country)}.`, {
      affection: 14, respect: 14, trust: 12, resentment: -18, weight: 2
    });
    S.player.vitals.happiness = clamp(S.player.vitals.happiness + 5);
    recordJournal(S, `You gave ${formatMoney(supportAmt, S.country)} to support ${p.fullName}.`, 'relationship');
    return { ok: true, msg: `Sent ${formatMoney(supportAmt, S.country)} to ${p.firstName}.` };
  }

  if (action === 'ask_for_help') {
    if (S.player.age < 18) return { ok: false, msg: 'Your household already covers your childhood needs.' };
    if (p.age < 22) return { ok: false, msg: `${p.firstName} is too young to support you financially.` };
    const theirSavingsInPlayerCurr = convertCurrency(p.career.savingsLocal || 0, p.residenceCountry, S.country, S.year);
    const askTarget = eraLocalCost(cObj.monthlyBasket2026.rentStandard * 1.5, S.country, S.year);

    if (theirSavingsInPlayerCurr < askTarget * 0.5) {
      return { ok: false, msg: `${p.firstName} genuinely doesn’t have spare savings right now.` };
    }
    spendEnergy(); /* v2.15 W3 — the ask itself costs the evening, granted or refused. */
    const willingness = (p.rel.affection * 0.45) + (p.rel.trust * 0.35) + (p.traits.warmth * 0.25) - (p.rel.resentment * 0.6) - (p.traits.materialism * 0.2);
    if (willingness >= 45) {
      const granted = Math.round(Math.min(askTarget, theirSavingsInPlayerCurr * 0.35));
      p.career.savingsLocal = Math.max(0, p.career.savingsLocal - Math.round(convertCurrency(granted, S.country, p.residenceCountry, S.year)));
      walletMove(S, granted, `Emergency support from ${p.fullName}`, 'family');
      p.rel.trust = clamp(p.rel.trust - 4);
      rememberDeed(S, p, 'supported_crisis', `Stepped up and gave you ${formatMoney(granted, S.country)}.`, { affection: 3 });
      recordJournal(S, `${p.fullName} stepped in and helped you with ${formatMoney(granted, S.country)} from their own savings.`, 'relationship');
      return { ok: true, msg: `${p.firstName} helped you with ${formatMoney(granted, S.country)}.` };
    } else {
      p.rel.respect = clamp(p.rel.respect - 6);
      recordJournal(S, `You asked ${p.fullName} for financial help, and they turned you down flat.`, 'relationship');
      return { ok: false, msg: `${p.firstName} refused to lend you money.` };
    }
  }

  if (action === 'reconcile') {
    if (p.rel.resentment <= 10) return { ok: false, msg: 'There is no bad blood to clear.' };
    spendEnergy(); /* v2.15 W3 */
    p.rel.resentment = clamp(p.rel.resentment - 22);
    p.rel.trust = clamp(p.rel.trust + 6);
    p.rel.affection = clamp(p.rel.affection + 6);
    S.player.vitals.pride = S.player.traits.pride;
    recordJournal(S, `You swallowed your pride and had an honest conversation with ${p.fullName}. Much of the tension eased.`, 'relationship');
    return { ok: true, msg: `Cleared the air with ${p.firstName}.` };
  }

  if (action === 'wasta_referral') {
    if (S.player.age < 18) return { ok: false, msg: 'Wait until adulthood.' };
    if (p.age < 24 || p.career.monthlyIncomeLocal <= 0) {
      return { ok: false, msg: `${p.firstName} isn’t in a senior position to refer you right now.` };
    }
    const cdKey = `wasta_ask_${p.id}_${S.year}`;
    if (S.cooldowns[cdKey]) return { ok: false, msg: `Already asked ${p.firstName} for a career referral this year.` };
    S.cooldowns[cdKey] = 999999;

    if (p.rel.respect + p.rel.trust < 108 || p.rel.resentment >= 35) {
      return { ok: false, msg: `Build stronger trust & respect with ${p.firstName} before asking them to vouch for you professionally.` };
    }
    spendEnergy(); /* v2.15 W3 */
    if (!S.skills) S.skills = { charisma: 45, financialIq: 42, fitness: 50, creativity: 44, wasta: 35 };
    S.skills.wasta = clamp(S.skills.wasta + 10);
    if (S.career.employed && S.career.job && p.residenceCountry === S.country) {
      S.career.job.monthlyGross = Math.round(S.career.job.monthlyGross * 1.09);
      S.career.job.performance = clamp(S.career.job.performance + 8);
      rememberDeed(S, p, 'supported_crisis', `Vouched for your work to senior contacts.`, { respect: 4 });
      recordJournal(S, `${p.fullName} put in a strong personal word for you with industry decision-makers, lifting your compensation by 9%.`, 'career');
      return { ok: true, msg: `${p.firstName} vouched for you (+9% pay & +Wasta)!` };
    }
    recordJournal(S, `${p.fullName} introduced you to hiring managers in ${p.city} (+10 Wasta network).`, 'career');
    return { ok: true, msg: `${p.firstName} opened doors for you (+10 Wasta)!` };
  }

  if (action === 'family_meal') {
    const mealCost = S.player.age < 18 ? 0 : eraLocalCost(cObj.monthlyBasket2026.foodAdult * 0.25, S.country, S.year);
    if (mealCost > 0 && S.money.cash < mealCost) return { ok: false, msg: `Need ${formatMoney(mealCost, S.country)} to host lunch.` };
    spendEnergy(); /* v2.15 W3 */
    if (mealCost > 0) walletMove(S, -mealCost, `Hosted Friday family lunch with ${p.firstName}`, 'family');
    rememberDeed(S, p, 'visited', `Hosted a warm Friday family table.`, { affection: 10, trust: 7, resentment: -9 });
    S.player.vitals.happiness = clamp(S.player.vitals.happiness + 6);
    S.player.vitals.stress = clamp(S.player.vitals.stress - 6);
    recordJournal(S, `Gathered around a long Friday meal with ${p.fullName} — laughter and home cooking melted the week’s stress.`, 'family');
    return { ok: true, msg: `Warm family meal with ${p.firstName}!` };
  }

  if (action === 'mentor_child') {
    if (p.role !== 'child' || p.age < 5) return { ok: false, msg: 'Available for children aged 5+.' };
    const cdKey = `mentor_${p.id}_${S.year}`;
    if (S.cooldowns[cdKey]) return { ok: false, msg: `Already mentored ${p.firstName} intensively this year.` };
    S.cooldowns[cdKey] = 999999;
    spendEnergy(); /* v2.15 W3 */
    p.vitals.smarts = clamp(p.vitals.smarts + 6);
    p.traits.ambition = clamp(p.traits.ambition + 5);
    rememberDeed(S, p, 'proud_moment', `Sat patiently mentoring their studies & character.`, { affection: 9, respect: 10, trust: 8 });
    recordJournal(S, `Spent dedicated evenings coaching ${p.firstName} through books and life lessons (+6 child smarts).`, 'family');
    return { ok: true, msg: `Mentored ${p.firstName} (+6 Smarts & +Respect)!` };
  }

  return { ok: false, msg: 'Unknown interaction.' };
}

/* ============================================================================
   v2.12 W5 — Circle verbs (item 6). The audit counted ONE verb on this
   screen (npc-interact, 61x). These five are DISTINCT data-actions, and
   every one moves a number, moves money, or opens a scene with choices.
   "Voice" here is text dialogue with personality (generateContextualLine) —
   never audio/TTS. Time cost is a once-per-turn limit per person: a call or
   a visit is an evening spent, not something you can spam for free affection.
   ========================================================================== */

/* Once-per-turn guard: returns true if this verb was already used on this
   person this turn (and marks it used otherwise). */
function oncePerTurn(S, key) {
  if (!S.cooldowns) S.cooldowns = {};
  if ((S.cooldowns[key] || 0) > S.turn) return true;
  S.cooldowns[key] = S.turn + 1;
  return false;
}

/* Travel cost of going to see someone in person. Same city is free; another
   city in the same country is a bus/train fare; abroad is a short flight
   (modelled fare — the game has no per-route airfare table to read). */
export function visitTripCostLocal(S, p) {
  const cObj = getCountry(S.country);
  if (!p || p.residenceCountry !== S.country) {
    return { cost: Math.round(convertCurrency(110, 'usa', S.country, S.year)), kind: 'abroad' };
  }
  if ((p.city || S.city) === S.city) return { cost: 0, kind: 'same-city' };
  return { cost: Math.max(5, Math.round(eraLocalCost(cObj.monthlyBasket2026.transport * 0.3, S.country, S.year))), kind: 'other-city' };
}

/* A quick phone call: small affection/trust move, the person answers in
   their own words, and the player hears it. Small time cost (once/turn). */
export function callPerson(S, personId) {
  const p = S.people[personId];
  if (!p || !p.alive) return { ok: false, msg: 'Person unavailable.' };
  if(!canContactPerson(S,p))return{ok:false,msg:p.firstName+' is not accepting contact.'};
  if (p.age < 4) return { ok: false, msg: `${p.firstName} is too young to talk on the phone.` };
  /* v2.15 W3 — a call costs 1 social energy. Checked before the
     once-per-turn mark, and spent only after it, so a refused call never
     burns the month's call. */
  const callCost = energyCostFor('call', S, p);
  const e = checkSocialEnergy(S, callCost);
  if (!e.ok) return e;
  if (oncePerTurn(S, `call_${p.id}`)) return { ok: false, msg: `You already called ${p.firstName} this month.` };
  spendSocialEnergy(S, callCost);
  noteSocialContact(S, p); /* v2.15 W3 — this is a real contact: it stops any drift. */
  rememberDeed(S, p, 'called', `A long phone call, just to catch up.`, { affection: 4, trust: 2, resentment: -2 });
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 2);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 1);
  const quote = generateContextualLine(S, p);
  recordJournal(S, `You called ${p.fullName}${p.residenceCountry !== S.country ? ` in ${getCountry(p.residenceCountry).name}` : ''}. ${quote}`, 'relationship');
  return { ok: true, msg: quote };
}

/* An in-person visit: a bigger affection move than a call. Costs the trip
   when the person is in another city or country. */
export function visitPerson(S, personId) {
  const p = S.people[personId];
  if (!p || !p.alive) return { ok: false, msg: 'Person unavailable.' };
  if(!canContactPerson(S,p))return{ok:false,msg:p.firstName+' is not accepting contact.'};
  /* v2.15 W3 — a visit costs 3 social energy. Checked before the
     once-per-turn mark and spent only once the trip is affordable, so a
     refused visit never burns energy or the month's visit. */
  const visitCost = energyCostFor('visit', S, p);
  const ve = checkSocialEnergy(S, visitCost);
  if (!ve.ok) return ve;
  if (oncePerTurn(S, `visit_${p.id}`)) return { ok: false, msg: `You already visited ${p.firstName} this month.` };
  const trip = visitTripCostLocal(S, p);
  if (trip.cost > 0 && S.money.cash < trip.cost) {
    S.cooldowns[`visit_${p.id}`] = S.turn; // don't burn the month's visit on a failed trip
    return { ok: false, msg: `Visiting ${p.firstName} in ${p.city} costs ${formatMoney(trip.cost, S.country)} for the trip — you hold ${formatMoney(S.money.cash, S.country)}.` };
  }
  spendSocialEnergy(S, visitCost);
  if (trip.cost > 0) walletMove(S, -trip.cost, `Trip to visit ${p.fullName} in ${p.city}`, 'family');
  noteSocialContact(S, p); /* v2.15 W3 — this is a real contact: it stops any drift. */
  rememberDeed(S, p, 'visited', `Spent real time together in ${p.city}.`, { affection: 9, trust: 5, resentment: -5 });
  S.player.vitals.happiness = clamp(S.player.vitals.happiness + 5);
  S.player.vitals.stress = clamp(S.player.vitals.stress - 5);
  const quote = generateContextualLine(S, p);
  recordJournal(S, `You visited ${p.fullName} in ${p.city}${trip.cost > 0 ? ` (${formatMoney(trip.cost, S.country)} for the trip)` : ''}. ${quote}`, 'relationship');
  return { ok: true, msg: quote };
}

/* Real shop items that make sensible gifts: era-correct, in the giftable
   categories of the shop catalogue, $5–$200. Every gift below is one of
   these rows — never an invented item. */
const GIFT_CATEGORIES = new Set(['jewelry', 'watch', 'fashion', 'luxury']);
export function giftableShopItems(S) {
  return SHOP_MEGA_CATALOG
    .filter(i => GIFT_CATEGORIES.has(i.category) && i.yearFrom <= S.year && i.yearTo >= S.year
      && i.priceUsd2026 >= 5 && i.priceUsd2026 <= 200)
    .map(i => ({ ...i, priceLocal: Math.max(5, Math.round(convertCurrency(i.priceUsd2026, 'usa', S.country, S.year))) }))
    .sort((a, b) => a.priceLocal - b.priceLocal);
}
export function cashGiftAmountLocal(S) {
  return eraLocalCost(getCountry(S.country).monthlyBasket2026.foodAdult * 0.45, S.country, S.year);
}
function giftAffection(itemPriceUsd, p) {
  return 8 + Math.min(8, Math.round(itemPriceUsd / 25)) + (p.traits.materialism >= 65 ? 4 : 0);
}

/* Give a gift: opens a scene — pick a real shop item (cheap / mid / dearest
   you can afford), give cash instead, or just warm words for free. */
export function openGiftScene(S, personId, rebuild = false) {
  const p = S.people[personId];
  if (!p || !p.alive) return { ok: false, msg: 'Person unavailable.' };
  if(!canContactPerson(S,p))return{ok:false,msg:p.firstName+' is not accepting contact.'};
  if (S.player.age < 16) return { ok: false, msg: 'Wait until you are 16 and earning pocket money.' };
  if (!rebuild && S.activeScene) return { ok: false, msg: 'Finish the open moment first.' };
  const affordable = giftableShopItems(S).filter(i => i.priceLocal <= S.money.cash);
  const cashAmt = cashGiftAmountLocal(S);
  const spread = affordable.length
    ? [affordable[0], affordable[Math.floor(affordable.length / 2)], affordable[affordable.length - 1]]
        .filter((it, idx, arr) => it && arr.findIndex(x => x.id === it.id) === idx)
    : [];
  /* v2.15 W3 — a gift costs 2 social energy. Checked here, spent in the
     choice effect (the giving itself), so opening the scene and changing
     your mind never costs anything. */
  const giftEnergy = checkSocialEnergy(S, energyCostFor('gift', S, p));
  if (!giftEnergy.ok) return giftEnergy;
  const monthTag = `${S.year}-${String(S.month || 1).padStart(2, '0')}`;
  const scene = {
    key: `gift_${p.id}_${S.turn}`,
    baseId: `npc_gift_${p.id}`,
    maxPerLife: 99,
    category: 'relationship',
    speakerId: p.id,
    title: `A gift for ${p.firstName} (${monthTag})`,
    text: `You want to give ${p.fullName} something. ${generateContextualLine(S, p)} What do you choose?`,
    choices: [
      ...spread.map(item => ({
        label: `Buy the ${item.brand} ${item.name} — ${formatMoney(item.priceLocal, S.country)}`,
        effect: (st) => {
          /* v2.15 W3 — the giving costs 2 social energy and is a real contact. */
          if (!spendSocialEnergy(st, energyCostFor('gift', st, p))) { recordJournal(st, `You meant to give ${p.firstName} a gift, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          walletMove(st, -item.priceLocal, `Gift for ${p.fullName}: ${item.brand} ${item.name}`, 'family');
          rememberDeed(st, p, 'gift', `Gave a ${item.brand} ${item.name} (${formatMoney(item.priceLocal, S.country)}).`, {
            affection: giftAffection(item.priceUsd2026, p), respect: 5, resentment: -10
          });
          recordJournal(st, `You surprised ${p.fullName} with a ${item.brand} ${item.name} (${formatMoney(item.priceLocal, S.country)}). Their face lit up.`, 'relationship');
        }
      })),
      ...(S.money.cash >= cashAmt ? [{
        label: `Give ${formatMoney(cashAmt, S.country)} in cash instead`,
        effect: (st) => {
          /* v2.15 W3 — the giving costs 2 social energy and is a real contact. */
          if (!spendSocialEnergy(st, energyCostFor('gift', st, p))) { recordJournal(st, `You meant to give ${p.firstName} a gift, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          walletMove(st, -cashAmt, `Cash gift for ${p.fullName}`, 'family');
          p.career.savingsLocal += Math.round(convertCurrency(cashAmt, S.country, p.residenceCountry, S.year));
          rememberDeed(st, p, 'gift', `Gave ${formatMoney(cashAmt, S.country)} in cash.`, {
            affection: p.traits.materialism >= 65 ? 13 : 9, respect: 5, resentment: -10
          });
          recordJournal(st, `You pressed ${formatMoney(cashAmt, S.country)} into ${p.firstName}'s hand as a gift.`, 'relationship');
        }
      }] : []),
      {
        label: 'Just warm words — free, and honest',
        effect: (st) => {
          /* v2.15 W3 — warm words cost no money, but the evening still costs 2 social energy, and it is a real contact. */
          if (!spendSocialEnergy(st, energyCostFor('gift', st, p))) { recordJournal(st, `You meant to tell ${p.firstName} what they mean to you, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          rememberDeed(st, p, 'gift', `Warm words, no money spent.`, { affection: 2, trust: 2 });
          recordJournal(st, `You told ${p.fullName} plainly what they mean to you. No gift — just the words.`, 'relationship');
        }
      }
    ]
  };
  if (rebuild) return scene;
  if (!queueScene(S, scene)) return { ok: false, msg: 'Finish the open moment first.' };
  return { ok: true, msg: `Choose a gift for ${p.firstName}.` };
}

/* Ask for help: money or advice, in one scene. Money reuses the existing
   ask-for-help rule (their savings, your relationship); a refusal says why,
   in the journal, in plain words. Advice is free but needs goodwill. */
export function openAskHelpScene(S, personId, rebuild = false) {
  const p = S.people[personId];
  if (!p || !p.alive) return { ok: false, msg: 'Person unavailable.' };
  if(!canContactPerson(S,p))return{ok:false,msg:p.firstName+' is not accepting contact.'};
  if (S.player.age < 18) return { ok: false, msg: 'Your household already covers your needs until adulthood.' };
  if (p.age < 22) return { ok: false, msg: `${p.firstName} is too young to help you out.` };
  if (!rebuild && S.activeScene) return { ok: false, msg: 'Finish the open moment first.' };
  /* v2.15 W3 — asking for help costs 4 social energy. Checked here,
     spent in the choice effect (the asking itself); "never mind" costs
     nothing, because you never asked. */
  const helpEnergy = checkSocialEnergy(S, energyCostFor('askHelp', S, p));
  if (!helpEnergy.ok) return helpEnergy;
  const monthTag = `${S.year}-${String(S.month || 1).padStart(2, '0')}`;
  const adviceLine = p.traits.warmth >= 70
    ? `"Take it one step at a time, and don't carry it all alone — that's what family is for."`
    : p.traits.pride >= 72
    ? `"Hold your head high, work twice as hard, and let results answer for you."`
    : p.traits.materialism >= 70
    ? `"Spend less than you earn, keep something aside, and never borrow for show."`
    : p.traits.traditionalism >= 72
    ? `"Honor your duties, keep your word, and the rest will follow."`
    : `"Sleep on it. The answer looks different in the morning."`;
  const scene = {
    key: `askhelp_${p.id}_${S.turn}`,
    baseId: `npc_ask_help_${p.id}`,
    maxPerLife: 99,
    category: 'relationship',
    speakerId: p.id,
    title: `Ask ${p.firstName} for help (${monthTag})`,
    text: `You need ${p.firstName}'s help. ${generateContextualLine(S, p)} What do you ask for?`,
    choices: [
      {
        label: 'Ask for money from their savings',
        effect: (st) => {
          /* v2.15 W3 — the asking costs 4 social energy and is a real
             contact; the inner call is already charged, so it must not
             charge again. */
          if (!spendSocialEnergy(st, energyCostFor('askHelp', st, p))) { recordJournal(st, `You meant to ask ${p.firstName} for help, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          const r = interactWithPerson(st, personId, 'ask_for_help', { energyCharged: true });
          if (!r.ok) recordJournal(st, `${p.firstName} could not help with money: ${r.msg}`, 'relationship');
        }
      },
      {
        label: 'Ask for advice, not money',
        effect: (st) => {
          /* v2.15 W3 — the asking costs 4 social energy and is a real contact. */
          if (!spendSocialEnergy(st, energyCostFor('askHelp', st, p))) { recordJournal(st, `You meant to ask ${p.firstName} for advice, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          if (p.rel.resentment >= 60) {
            recordJournal(st, `You asked ${p.firstName} for advice, but they are too angry with you right now to help (resentment is high — clear the air first).`, 'relationship');
            return;
          }
          st.player.vitals.smarts = clamp(st.player.vitals.smarts + 3);
          p.rel.trust = clamp(p.rel.trust + 2);
          recordJournal(st, `You asked ${p.firstName} for advice. They said: ${adviceLine} (+3 Smarts).`, 'relationship');
        }
      },
      {
        label: 'Never mind — handle it alone',
        effect: (st) => {
          recordJournal(st, `You almost asked ${p.firstName} for help, then decided to handle it alone.`, 'relationship');
        }
      }
    ]
  };
  if (rebuild) return scene;
  if (!queueScene(S, scene)) return { ok: false, msg: 'Finish the open moment first.' };
  return { ok: true, msg: `What do you ask ${p.firstName} for?` };
}

/* A real conversation: a scene whose choices come from who this person is —
   their job, their place in the family, your history together. Not a card
   that just opens the person card again. */
export function openConversationScene(S, personId, rebuild = false) {
  const p = S.people[personId];
  if (!p || !p.alive) return { ok: false, msg: 'Person unavailable.' };
  if(!canContactPerson(S,p))return{ok:false,msg:p.firstName+' is not accepting contact.'};
  if (p.age < 4) return { ok: false, msg: `${p.firstName} is too young for a real conversation.` };
  if (p.rel.resentment >= 80) return { ok: false, msg: `${p.firstName} will not talk to you right now — clear the air first (Apologize / Clear Air).` };
  if (!rebuild && S.activeScene) return { ok: false, msg: 'Finish the open moment first.' };
  /* v2.15 W3 — a real conversation costs 2 social energy. Checked here,
     spent in the choice effect (the talking itself). */
  const talkEnergy = checkSocialEnergy(S, energyCostFor('talk', S, p));
  if (!talkEnergy.ok) return talkEnergy;
  const monthTag = `${S.year}-${String(S.month || 1).padStart(2, '0')}`;
  const isFamily = ['father', 'mother', 'sibling', 'spouse', 'partner', 'child'].includes(p.role);
  const scene = {
    key: `conv_${p.id}_${S.turn}`,
    baseId: `npc_conversation_${p.id}`,
    maxPerLife: 99,
    category: 'relationship',
    speakerId: p.id,
    title: `A real conversation with ${p.firstName} (${monthTag})`,
    text: `You sit down properly with ${p.fullName} — no small talk. ${generateContextualLine(S, p)} What do you talk about?`,
    choices: [
      {
        label: 'Ask how work is going',
        available: () => (p.career?.monthlyIncomeLocal || 0) > 0,
        effect: (st) => {
          /* v2.15 W3 — the conversation costs 2 social energy and is a real contact. */
          if (!spendSocialEnergy(st, energyCostFor('talk', st, p))) { recordJournal(st, `You meant to sit down properly with ${p.firstName}, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          rememberDeed(st, p, 'visited', `A long talk about work and where life is heading.`, { affection: 5, trust: 3 });
          recordJournal(st, `You talked properly with ${p.fullName} about work — the pressures, the plans, what comes next. ${generateContextualLine(st, p)}`, 'relationship');
        }
      },
      {
        label: 'Talk about family',
        available: () => isFamily,
        effect: (st) => {
          /* v2.15 W3 — the conversation costs 2 social energy and is a real contact. */
          if (!spendSocialEnergy(st, energyCostFor('talk', st, p))) { recordJournal(st, `You meant to sit down properly with ${p.firstName}, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          rememberDeed(st, p, 'visited', `A long family talk.`, { affection: 5, respect: 2 });
          recordJournal(st, `You and ${p.fullName} talked family — who needs help, who is proud of whom, what home means now.`, 'relationship');
        }
      },
      {
        label: 'Apologise for an old slight',
        available: () => p.rel.resentment > 10,
        effect: (st) => {
          /* v2.15 W3 — the conversation costs 2 social energy and is a real contact. */
          if (!spendSocialEnergy(st, energyCostFor('talk', st, p))) { recordJournal(st, `You meant to apologise to ${p.firstName}, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          p.rel.resentment = clamp(p.rel.resentment - 15);
          p.rel.trust = clamp(p.rel.trust + 5);
          p.rel.affection = clamp(p.rel.affection + 4);
          recordJournal(st, `You apologised to ${p.fullName} for an old slight, properly, without excuses. Some of the tension left the room.`, 'relationship');
        }
      },
      {
        label: 'Share your own news',
        effect: (st) => {
          /* v2.15 W3 — the conversation costs 2 social energy and is a real contact. */
          if (!spendSocialEnergy(st, energyCostFor('talk', st, p))) { recordJournal(st, `You meant to tell ${p.firstName} your real news, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          rememberDeed(st, p, 'visited', `Shared real news about your life.`, { affection: 4, trust: 3 });
          st.player.vitals.happiness = clamp(st.player.vitals.happiness + 3);
          recordJournal(st, `You told ${p.fullName} your real news — not the polite version. They listened properly.`, 'relationship');
        }
      },
      {
        label: 'Ask for their honest advice',
        effect: (st) => {
          /* v2.15 W3 — the conversation costs 2 social energy and is a real contact. */
          if (!spendSocialEnergy(st, energyCostFor('talk', st, p))) { recordJournal(st, `You meant to ask ${p.firstName} for honest advice, but you had no social energy left this month. It comes back at the start of next month.`, 'relationship'); return; }
          noteSocialContact(st, p);
          st.player.vitals.smarts = clamp(st.player.vitals.smarts + 2);
          p.rel.trust = clamp(p.rel.trust + 3);
          recordJournal(st, `You asked ${p.fullName} for honest advice, and took it seriously. ${generateContextualLine(st, p)}`, 'relationship');
        }
      }
    ]
  };
  if (rebuild) return scene;
  if (!queueScene(S, scene)) return { ok: false, msg: 'Finish the open moment first.' };
  return { ok: true, msg: `A conversation with ${p.firstName} is waiting.` };
}

export function restorePeopleDecision(S, saved) {
  const builders = [
    ['npc_gift_', openGiftScene],
    ['npc_ask_help_', openAskHelpScene],
    ['npc_conversation_', openConversationScene]
  ];
  const match = builders.find(([prefix]) => String(saved?.baseId || '').startsWith(prefix));
  if (!match) return null;
  const p = S.people[saved.speakerId];
  if (!p?.alive) return null;
  const scene = match[1](S, p.id, true);
  if (!scene?.choices) return null;
  return { ...saved, ...scene, title: saved.title, text: saved.text };
}
