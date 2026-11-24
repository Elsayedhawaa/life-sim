/* ============================================================================
   World Life 2.0 — Business Fate (v2.17 W5, §6)
   The business's fate reaches the rest of the life.

   checkBusinessFate(S) is called once per month, AFTER the monthly
   settlement (settleHouseholdMonth) has posted the month's P&L — so it
   reads the fresh numbers, never last month's. It looks at every
   business and fires consequences that land OUTSIDE the business card:

   FAILING (dead, or at risk with sustained losses):
     F1  the bank calls about the loan (or the unpaid business debt) —
         restructure vs pay now, real loan numbers, real ledger moves.
     F2  the spouse reacts to the lost income — worry, an argument, or
         support, depending on the relationship (affection).
     F3  a friend offers a job — a real job offer (real wage, real
         employer) the player can take or refuse.

   BOOMING (broken out — biz.group set — or level 6+ with sustained
   profit):
     B1  the spouse wants a bigger house — a real scene, a real choice,
         a real effect on the marriage (and a house-hunt flag the
         property side can read).
     B2  the bank offers a bigger loan — a real offer with real terms
         (APR, monthly payment), taken through takeBusinessLoan.
     B3  a rival tries to copy you — a price war or a copycat opening
         nearby, with a real effect on revenue / repeat customers.

   Every consequence is a real scene in the event engine's own shape
   (title / text / choices with effect functions), queued with
   queueScene and resolved by resolveActiveSceneChoice — the same
   machinery every random event uses. They are NOT in the random pool
   (src/data/eventsBusiness.js): a bank calling about a dead business
   must fire when the business dies, not win a 24%-a-month lottery.
   Each scene fires at most once per business per kind (biz.fate
   flags), at most one fate scene per business per month, and at most
   two fate scenes per monthly call, so a bad month never floods the
   queue.

   CONTRACT (built against, hand-tested — W2 writes these):
     - business death:  biz.dead === true, biz.deathCause (plain words)
     - breakout:       biz.group (object — head office, regional
                       manager, supply chain)
   Everything else read here already exists in the v2.16 base:
   monthsLosing, debtLocal, misses, lastPL, history, level,
   consecutiveProfitableMonths / monthsInBusiness (businessEngine.js),
   getBusinessLoan / takeBusinessLoan / payExtraOnBusinessLoan /
   businessLoanTerms (businessLoans.js).
   ========================================================================== */

import{checkJobApplication,hireIntoJob}from'./careerEducationEngine.js';
import { clamp } from '../core/rng.js';
import { recordJournal, walletMove, queueScene, ensureExtendedState } from '../core/schema.js';
import { getCountry, formatMoney } from '../data/countries.js';
import { eraSalary } from '../data/economy.js';
import { migrateBusinesses, consecutiveProfitableMonths } from './businessEngine.js';
import { businessesOf } from './businessPremises.js';
import {
  getBusinessLoan, takeBusinessLoan, payExtraOnBusinessLoan, businessLoanTerms,
} from './businessLoans.js';

/* One fate scene per business per month; two per monthly call, so a
   portfolio of failing businesses never floods the scene queue. */
export const FATE_MAX_SCENES_PER_CALL = 2;

/* A business counts as failing while it is dead, or while the losses
   have lasted long enough to be a pattern, not one bad month: two
   losing months in a row, or unpaid business debt on the books. The
   settlement already warns in plain words at miss 2 (economyEngine.js
   §3) — fate is the consequence that follows the warning. */
export function isFailingBusiness(S, biz) {
  if (!biz) return false;
  if (biz.dead === true) return true;
  if ((Number(biz.monthsLosing) || 0) >= 2) return true;
  if ((Number(biz.debtLocal) || 0) > 0) return true;
  return false;
}

/* A business counts as booming when it has broken out — W2's group
   record exists — or, independently of the group record, when it is
   past the old level-5 ceiling with a sustained profitable run. */
export function isBoomingBusiness(S, biz) {
  if (!biz) return false;
  if (biz.group && typeof biz.group === 'object') return true;
  if ((Number(biz.level) || 1) >= 6 && consecutiveProfitableMonths(biz) >= 6) return true;
  return false;
}

/* Per-business fate bookkeeping, created lazily so older saves and
   hand-built records never crash the check. */
export function ensureFateState(biz) {
  if (!biz) return null;
  if (!biz.fate || typeof biz.fate !== 'object') biz.fate = {};
  return biz.fate;
}

function fateFired(biz, kind) {
  const f = ensureFateState(biz);
  return !!(f && f[kind]);
}

function markFateFired(S, biz, kind) {
  const f = ensureFateState(biz);
  f[kind] = { year: S.year, month: S.month };
  f.lastFiredYear = S.year;
  f.lastFiredMonth = S.month;
}

function firedThisMonth(S, biz) {
  const f = ensureFateState(biz);
  return f.lastFiredYear === S.year && f.lastFiredMonth === S.month;
}

/* --- People, resolved the way the event engine does (eventEngine.js:
   resolveEventCtx) — a missing person never crashes the text. --- */
export function spouseOf(S) {
  const ids = S?.relations?.spouseIds || [];
  for (const id of ids) {
    const p = S.people && S.people[id];
    if (p && p.alive) return p;
  }
  const partner = S?.relations?.partnerId ? S.people[S.relations.partnerId] : null;
  return partner && partner.alive ? partner : null;
}

export function friendOf(S) {
  const ids = S?.relations?.friendIds || [];
  let best = null;
  for (const id of ids) {
    const p = S.people && S.people[id];
    if (!p || !p.alive) continue;
    if (!best || (Number(p.rel?.affection) || 0) > (Number(best.rel?.affection) || 0)) best = p;
  }
  return best;
}

function personName(p, fallback) {
  return (p && (p.fullName || p.name)) || fallback;
}

function shiftAffection(p, delta) {
  if (!p) return;
  if (!p.rel || typeof p.rel !== 'object') p.rel = {};
  p.rel.affection = clamp(Math.round((Number(p.rel.affection) || 50) + delta), 0, 100);
}

function shiftVitals(S, { stress = 0, happiness = 0 } = {}) {
  if (!S.player || !S.player.vitals) return;
  if (stress) S.player.vitals.stress = clamp(Math.round((Number(S.player.vitals.stress) || 0) + stress));
  if (happiness) S.player.vitals.happiness = clamp(Math.round((Number(S.player.vitals.happiness) || 0) + happiness));
}

function monthIndex(S) {
  return (Number(S.year) || 0) * 12 + (Number(S.month) || 1);
}

/* ============================================================================
   FAILING — F1: the bank calls about the loan (or the unpaid debt).
   ========================================================================== */

function rawBankCallScene(S, biz) {
  const loan = getBusinessLoan(S, biz);
  const debt = Math.round(Number(biz.debtLocal) || 0);
  const deadNote = biz.dead === true
    ? `${biz.name} has closed${biz.deathCause ? ` — ${biz.deathCause}` : ''}. `
    : '';
  if (loan) {
    const monthly = Math.round(Number(loan.monthlyPayment) || 0);
    const balance = Math.round(Number(loan.balance) || 0);
    const threeMonths = monthly * 3;
    const canPayThree = (Number(S.money?.cash) || 0) >= threeMonths;
    return {
      key: `fate_bank_${biz.id}`,
      baseId: `fate_bank_${biz.id}`,
      maxPerLife: 1,
      category: 'money',
      title: `The Bank Calls About ${biz.name}`,
      text: `${deadNote}Your bank's business team is on the phone about the ${biz.name} loan — ${formatMoney(balance, S.country)} still owed, ${formatMoney(monthly, S.country)} a month. "${biz.name} is not covering its payments. We need a plan today — restructure the loan, or pay something now."`,
      choices: [
        {
          label: `Restructure — pay ${formatMoney(Math.round(monthly * 0.75), S.country)}/mo instead, for longer`,
          effect: (st) => {
            const l = getBusinessLoan(st, biz);
            if (!l) return;
            l.monthlyPayment = Math.max(1, Math.round((Number(l.monthlyPayment) || 0) * 0.75));
            l.remainingMonths = Math.max(1, Math.round((Number(l.remainingMonths) || 0) * 1.5));
            if (st.money) st.money.creditScore = clamp(Math.round((Number(st.money.creditScore) || 600) - 5), 300, 850);
            recordJournal(st, `Restructured the ${biz.name} loan — payments down to ${formatMoney(l.monthlyPayment, st.country)}/month, but the term is longer and the bank notes it on your credit file.`, 'money');
          },
        },
        {
          label: `Pay three months now — ${formatMoney(threeMonths, S.country)}`,
          available: (st) => (Number(st.money?.cash) || 0) >= threeMonths,
          effect: (st) => {
            const r = payExtraOnBusinessLoan(st, biz, threeMonths);
            if (r.ok) {
              if (st.money) st.money.creditScore = clamp(Math.round((Number(st.money.creditScore) || 600) + 5), 300, 850);
              recordJournal(st, `Paid ${formatMoney(threeMonths, st.country)} off the ${biz.name} loan in one go — three months' payments, up front. The bank backs off, for now.`, 'money');
            }
          },
        },
        {
          label: 'Tell them you need time — you will call back',
          effect: (st) => {
            const l = getBusinessLoan(st, biz);
            if (l) l.missedMonths = (Number(l.missedMonths) || 0) + 1;
            if (st.money) st.money.creditScore = clamp(Math.round((Number(st.money.creditScore) || 600) - 3), 300, 850);
            shiftVitals(st, { stress: 4 });
            recordJournal(st, `Told the bank you need time on the ${biz.name} loan and hung up. Nothing is paid, the month still counts as missed, and the call will come again.`, 'money');
          },
        },
      ],
    };
  }
  /* No loan on the books, but unpaid business debt is — the bank
     (through the same collections path the settlement uses) wants the
     arrears, not a restructure: there is nothing to restructure. */
  const canPayDebt = (Number(S.money?.cash) || 0) >= debt && debt > 0;
  return {
    key: `fate_bank_${biz.id}`,
    baseId: `fate_bank_${biz.id}`,
    maxPerLife: 1,
    category: 'money',
    title: `The Bank Calls About ${biz.name}`,
    text: `${deadNote}Your bank is on the phone about ${biz.name}: ${formatMoney(debt, S.country)} of unpaid business bills is on the books${(Number(biz.misses) || 0) > 0 ? ` after ${biz.misses} missed month${biz.misses === 1 ? '' : 's'}` : ''}. "The arrears need clearing, or we start collections."`,
    choices: [
      {
        label: `Clear the arrears now — ${formatMoney(debt, S.country)}`,
        available: (st) => (Number(st.money?.cash) || 0) >= Math.round(Number(biz.debtLocal) || 0) && (Number(biz.debtLocal) || 0) > 0,
        effect: (st) => {
          const owed = Math.round(Number(biz.debtLocal) || 0);
          if (owed <= 0) return;
          walletMove(st, -owed, `Cleared ${biz.name} business arrears after the bank's call`, 'bank');
          biz.debtLocal = 0;
          biz.misses = 0;
          recordJournal(st, `Cleared the ${formatMoney(owed, st.country)} of arrears on ${biz.name} after the bank's call — the account is clean again.`, 'money');
        },
      },
      {
        label: 'Ask for three months to catch up',
        effect: (st) => {
          const f = ensureFateState(biz);
          f.bankCatchUpUntil = monthIndex(st) + 3;
          shiftVitals(st, { stress: 3 });
          recordJournal(st, `Asked the bank for three months to catch up on ${biz.name}'s arrears. They agreed — but nothing is paid yet, and the debt is still there.`, 'money');
        },
      },
    ],
  };
}

/* ============================================================================
   FAILING — F2: the spouse reacts to the lost income.
   ========================================================================== */

function rawSpouseReactionScene(S, biz, spouse) {
  const name = personName(spouse, 'Your spouse');
  const first = name.split(' ')[0];
  const affection = Number(spouse?.rel?.affection) || 50;
  const lost = biz.lastPL && Number(biz.lastPL.net) < 0
    ? ` It lost ${formatMoney(Math.abs(biz.lastPL.net), S.country)} last month alone.`
    : '';
  const deadNote = biz.dead === true
    ? `${biz.name} has closed${biz.deathCause ? ` — ${biz.deathCause}` : ''} — and the income it brought in is gone.`
    : `${biz.name} has lost money ${Number(biz.monthsLosing) || 0} month${(Number(biz.monthsLosing) || 0) === 1 ? '' : 's'} in a row.${lost}`;
  if (affection >= 55) {
    /* Support: a strong relationship holds — and the spouse helps cut
       costs, which is a real number on the business. */
    return {
      key: `fate_spouse_${biz.id}`,
      baseId: `fate_spouse_${biz.id}`,
      maxPerLife: 1,
      category: 'relationship',
      title: `${first} Worries About ${biz.name}`,
      text: `${deadNote} ${first} sits down with you after dinner. "I know this hurts. We will get through it — but we have to stop the bleeding. Let us go through the costs together and cut what we can."`,
      choices: [
        {
          label: 'Cut costs together — trim the business by 5%',
          effect: (st) => {
            biz.monthlyCost = Math.max(1, Math.round((Number(biz.monthlyCost) || 0) * 0.95));
            shiftAffection(spouse, 5);
            shiftVitals(st, { stress: -5 });
            recordJournal(st, `${first} sat down with the ${biz.name} books and helped cut the monthly costs by 5% — the business is leaner, and you faced it together.`, 'relationship');
          },
        },
        {
          label: "Say you'll handle it alone",
          effect: (st) => {
            shiftAffection(spouse, -4);
            shiftVitals(st, { stress: 4 });
            recordJournal(st, `Told ${first} you would handle ${biz.name} alone. They backed off — but the worry did not go away.`, 'relationship');
          },
        },
      ],
    };
  }
  /* Argument: a strained relationship rows about the money. */
  return {
    key: `fate_spouse_${biz.id}`,
    baseId: `fate_spouse_${biz.id}`,
    maxPerLife: 1,
    category: 'relationship',
    title: `A Row About ${biz.name}`,
    text: `${deadNote} ${first} does not hide it any more. "We are paying for a business that does not pay us. How much longer? I need to know there is a plan — not just hope."`,
    choices: [
      {
        label: 'Apologise and make a plan together',
        effect: (st) => {
          biz.monthlyCost = Math.max(1, Math.round((Number(biz.monthlyCost) || 0) * 0.97));
          shiftAffection(spouse, 6);
          shiftVitals(st, { stress: -3 });
          recordJournal(st, `Apologised to ${first} about ${biz.name} and made a real plan together — costs trimmed by 3%, and the row ended in a plan instead of silence.`, 'relationship');
        },
      },
      {
        label: "Row back — it's your business, not theirs",
        effect: (st) => {
          shiftAffection(spouse, -10);
          shiftVitals(st, { stress: 8, happiness: -5 });
          recordJournal(st, `Rowed with ${first} about ${biz.name} and told them it was your business, not theirs. The money is still lost — and now the evening is lost too.`, 'relationship');
        },
      },
    ],
  };
}

/* ============================================================================
   FAILING — F3: a friend offers a job.
   ========================================================================== */

export function friendJobOffer(S, friend) {
  const cObj = getCountry(S.country);
  const midAnnual = eraSalary(cObj.annualSalaryTiers2026.mid, S.country, S.year) || 0;
  const midMonthly = Math.max(1, Math.round(midAnnual / 12));
  const currentGross = (S.career?.employed && S.career?.job) ? (Number(S.career.job.monthlyGross) || 0) : 0;
  /* A friend does not offer a pay cut: the offer beats a current job
     by 15%, or pays the country's mid salary to someone out of work. */
  const monthlyGross = currentGross > 0
    ? Math.round(currentGross * 1.15)
    : midMonthly;
  /* v2.18 W2 — FIX: a person's job lives at person.career.*
     (createPerson stores title/employer/track there); the old code
     read friend.employer / friend.jobTitle / friend.track at the top
     level, which is always undefined for a real person — so every
     live F3 offer was "Shop Assistant" at "the firm where X works"
     instead of the friend's real job. The top-level read stays as a
     fallback for hand-built records. */
  const friendEmployer = (friend && (friend.career?.employer || friend.employer)) || null;
  const friendTitle = (friend && (friend.career?.title || friend.jobTitle)) || null;
  const friendTrack = (friend && (friend.career?.track || friend.track)) || 'general';
  const employer = friendEmployer;
  const title = friendTitle
    ? `Junior ${friendTitle}`
    : 'Shop Assistant';
  return {
    employer,
    employerLabel: employer || `the firm where ${personName(friend, 'your friend')} works`,
    title,
    track: friendTrack,
    monthlyGross,
  };
}

function rawFriendJobScene(S, biz, friend, savedOffer=null) {
  const offer = savedOffer||friendJobOffer(S, friend);
  const fname = personName(friend, 'A friend');
  const first = fname.split(' ')[0];
  const deadNote = biz.dead === true
    ? `${biz.name} is finished${biz.deathCause ? ` — ${biz.deathCause}` : ''} — and ${first} knows it.`
    : `${biz.name} is bleeding money, and ${first} has watched it happen.`;
  return {
    key: `fate_friendjob_${biz.id}`,
    baseId: `fate_friendjob_${biz.id}`,
    maxPerLife: 1,
    category: 'career',
    title: `${first} Offers You a Job`,
    text: `${deadNote} ${first} calls: "Come and work with me at ${offer.employerLabel} — ${offer.title}, ${formatMoney(offer.monthlyGross, S.country)} a month. Shared job qualification and work-permit checks apply. The offer stands until the end of the month."`,
    choices: [
      {
        label: `Take the job — ${offer.title}, ${formatMoney(offer.monthlyGross, S.country)}/mo`,
        available:st=>checkJobApplication(st,{...offer,employer:offer.employer||offer.employerLabel,level:0}).ok,
        effect: (st) => {
          const application={...offer,employer:offer.employer||offer.employerLabel,level:0};const gate=checkJobApplication(st,application);if(!gate.ok)return {ok:false};hireIntoJob(st,application,gate.workAuth);
          shiftVitals(st, { stress: -6 });
          recordJournal(st, `Took the ${offer.title} job ${first} offered at ${offer.employerLabel} (${formatMoney(offer.monthlyGross, st.country)}/month) while ${biz.name} ${biz.dead === true ? 'is closed' : 'struggles'} — steady pay again, from next month's settlement.`, 'career');
        },
      },
      {
        label: 'Turn it down — the business comes back',
        effect: (st) => {
          shiftAffection(friend, 2);
          shiftVitals(st, { stress: -2 });
          recordJournal(st, `Turned down ${first}'s job offer — ${biz.name} gets another chance first. ${first} respects the loyalty, even if the money is tight.`, 'career');
        },
      },
    ],
  };
}

/* ============================================================================
   BOOMING — B1: the spouse wants a bigger house.
   ========================================================================== */

function rawBiggerHouseScene(S, biz, spouse) {
  const name = personName(spouse, 'Your spouse');
  const first = name.split(' ')[0];
  const profit = biz.lastPL && Number(biz.lastPL.net) > 0
    ? ` Last month alone it made ${formatMoney(biz.lastPL.net, S.country)}.`
    : '';
  return {
    key: `fate_house_${biz.id}`,
    baseId: `fate_house_${biz.id}`,
    maxPerLife: 1,
    category: 'relationship',
    title: `${first} Wants a Bigger House`,
    text: `${biz.name} is doing real money now.${profit} ${first} has been looking at bigger places — more room, a better street. "We can finally afford it. Let us start looking — properly, this time."`,
    choices: [
      {
        label: 'Agree — start looking for a bigger place',
        effect: (st) => {
          shiftAffection(spouse, 8);
          shiftVitals(st, { happiness: 4 });
          /* A machine-readable flag, not just a journal line: the
             property side can read S.fateHouseHunt and know this
             household is hunting for a bigger home, for which
             business, and since when. */
          st.fateHouseHunt = { bizId: biz.id, bizName: biz.name, year: st.year, month: st.month };
          recordJournal(st, `Agreed with ${first} to start looking for a bigger house — ${biz.name} is earning enough to afford it now.`, 'relationship');
        },
      },
      {
        label: 'Not yet — the money stays in the business',
        effect: (st) => {
          shiftAffection(spouse, -4);
          shiftVitals(st, { stress: -2 });
          recordJournal(st, `Told ${first} the ${biz.name} money stays in the business for now — no bigger house yet. They understand, but they are disappointed.`, 'relationship');
        },
      },
    ],
  };
}

/* ============================================================================
   BOOMING — B2: the bank offers a bigger loan.
   ========================================================================== */

export function biggerLoanOffer(S, biz) {
  const terms0 = businessLoanTerms(S, 1, { typeId: biz.typeId });
  const capital = Math.round(Number(biz.capitalInvested) || 0);
  let amount = Math.round(capital * 0.5);
  if (terms0.maxAmount > 0) amount = Math.min(amount, terms0.maxAmount);
  if (amount <= 0) return null;
  const terms = businessLoanTerms(S, amount, { typeId: biz.typeId });
  if ((Number(S.money?.creditScore) || 0) < terms.reqScore) return null;
  if ((S.money?.loans || []).length >= 2) return null;
  return { amount, terms };
}

function rawBiggerLoanScene(S, biz) {
  const offer = biggerLoanOffer(S, biz);
  if (!offer) return null;
  const { amount, terms } = offer;
  return {
    key: `fate_loan_${biz.id}`,
    baseId: `fate_loan_${biz.id}`,
    maxPerLife: 1,
    category: 'money',
    title: `The Bank Offers ${biz.name} a Bigger Loan`,
    text: `${biz.name} is trading well, and the bank has noticed. They offer ${formatMoney(amount, S.country)} to grow — ${terms.source}, ${formatMoney(terms.monthlyPayment, S.country)} a month for ${terms.termYears} years. The money lands in your account the moment you sign.`,
    choices: [
      {
        label: `Take it — ${formatMoney(amount, S.country)} at ${formatMoney(terms.monthlyPayment, S.country)}/mo`,
        effect: (st) => {
          const r = takeBusinessLoan(st, biz, amount);
          if (!r.ok) {
            recordJournal(st, `The bank's bigger loan for ${biz.name} fell through at signing: ${r.msg}`, 'money');
          }
        },
      },
      {
        label: 'Turn it down — grow on your own money',
        effect: (st) => {
          recordJournal(st, `Turned down the bank's ${formatMoney(amount, st.country)} growth loan for ${biz.name} — the business grows on its own money, not borrowed money.`, 'money');
        },
      },
    ],
  };
}

/* ============================================================================
   BOOMING — B3: a rival tries to copy you.
   ========================================================================== */

function rawRivalScene(S, biz) {
  return {
    key: `fate_rival_${biz.id}`,
    baseId: `fate_rival_${biz.id}`,
    maxPerLife: 1,
    category: 'business',
    title: `A Rival Copies ${biz.name}`,
    text: `A copycat has opened two streets away from ${biz.name} — same look, same prices, undercutting you by a little on everything. Your regulars have noticed, and so have you. What do you do?`,
    choices: [
      {
        label: 'Cut prices to hold your customers (−8% revenue, +3% repeat customers)',
        effect: (st) => {
          biz.monthlyRev = Math.max(1, Math.round((Number(biz.monthlyRev) || 0) * 0.92));
          biz.repeatRate = clamp((Number(biz.repeatRate ?? 0.5)) + 0.03, 0, 1);
          recordJournal(st, `Cut prices at ${biz.name} to hold customers against the copycat — revenue down 8%, but more customers come back.`, 'business');
        },
      },
      {
        label: 'Hold your prices — your regulars will stay (−4% repeat customers)',
        effect: (st) => {
          biz.repeatRate = clamp((Number(biz.repeatRate ?? 0.5)) - 0.04, 0, 1);
          recordJournal(st, `Held prices at ${biz.name} while the copycat undercuts you — the margin stays, but some regulars drift to the cheaper shop.`, 'business');
        },
      },
    ],
  };
}

/* ============================================================================
   The monthly check.
   ========================================================================== */

export function checkBusinessFate(S) {
  const report = { fired: [], skipped: [], atRisk: [], booming: [] };
  if (!S || S.gameOver) return report;
  if ((S.player?.age ?? 0) < 18) return report;
  ensureExtendedState(S);
  migrateBusinesses(S);
  const list = businessesOf(S);
  if (!list.length) return report;

  const spouse = spouseOf(S);
  const friend = friendOf(S);

  for (const biz of list) {
    if (report.fired.length >= FATE_MAX_SCENES_PER_CALL) break;
    if (!biz) continue; /* Branches included: a branch is its own business record with its own P&L and loan, so its fate fires its own scenes, named for the branch ("Parent — City"). */
    if (firedThisMonth(S, biz)) continue;

    if (isFailingBusiness(S, biz)) {
      report.atRisk.push(biz.id);
      /* Priority: bank first (the money is urgent), then spouse,
         then the friend's job offer. One scene per business per
         month — the rest wait for next month, so the player is never
         hit with three crises at once. */
      const loan = getBusinessLoan(S, biz);
      const debt = Math.round(Number(biz.debtLocal) || 0);
      let scene = null;
      let kind = null;
      if (!fateFired(biz, 'bank') && (loan || debt > 0)) {
        scene = buildBankCallScene(S, biz);
        kind = 'bank';
      } else if (!fateFired(biz, 'spouse') && spouse) {
        scene = buildSpouseReactionScene(S, biz, spouse);
        kind = 'spouse';
      } else if (!fateFired(biz, 'friendJob') && friend) {
        scene = buildFriendJobScene(S, biz, friend);
        kind = 'friendJob';
      }
      if (scene && kind) {
        if (queueScene(S, scene, true)) {
          markFateFired(S, biz, kind);
          report.fired.push({ kind, bizId: biz.id, bizName: biz.name, sceneKey: scene.key, title: scene.title });
        } else {
          report.skipped.push({ kind, bizId: biz.id, reason: 'queue refused (already queued, or cap)' });
        }
      } else {
        report.skipped.push({ bizId: biz.id, reason: 'no failing consequence available (no loan/debt, no spouse, no friend — or all fired)' });
      }
      continue;
    }

    if (isBoomingBusiness(S, biz)) {
      report.booming.push(biz.id);
      let scene = null;
      let kind = null;
      if (!fateFired(biz, 'house') && spouse) {
        scene = buildBiggerHouseScene(S, biz, spouse);
        kind = 'house';
      } else if (!fateFired(biz, 'loan') && biggerLoanOffer(S, biz)) {
        scene = buildBiggerLoanScene(S, biz);
        kind = 'loan';
      } else if (!fateFired(biz, 'rival')) {
        scene = buildRivalScene(S, biz);
        kind = 'rival';
      }
      if (scene && kind) {
        if (queueScene(S, scene, true)) {
          markFateFired(S, biz, kind);
          report.fired.push({ kind, bizId: biz.id, bizName: biz.name, sceneKey: scene.key, title: scene.title });
        } else {
          report.skipped.push({ kind, bizId: biz.id, reason: 'queue refused (already queued, or cap)' });
        }
      } else {
        report.skipped.push({ bizId: biz.id, reason: 'no booming consequence available (all fired)' });
      }
    }
  }
  return report;
}

function fateFingerprint(S,biz){const loan=getBusinessLoan(S,biz);return JSON.stringify({country:S.country,loan:loan?{id:loan.id,balance:loan.balance,monthlyPayment:loan.monthlyPayment,remainingMonths:loan.remainingMonths}:null,debt:biz.debtLocal,rev:biz.monthlyRev,cost:biz.monthlyCost,repeat:biz.repeatRate,capital:biz.capitalInvested});}
function durableFateScene(S,biz,person,kind,snapshot){
 if(!biz)return null;const q=snapshot||{kind,bizId:biz.id,country:S.country,personId:person?.id,year:S.year,month:S.month,fingerprint:fateFingerprint(S,biz),offer:kind==='FriendJob'?friendJobOffer(S,person):null};
 const raw={BankCall:rawBankCallScene,SpouseReaction:rawSpouseReactionScene,FriendJob:rawFriendJobScene,BiggerHouse:rawBiggerHouseScene,BiggerLoan:rawBiggerLoanScene,Rival:rawRivalScene}[kind];
 const scene=kind==='FriendJob'?raw(S,biz,person,q.offer):raw(S,biz,person);if(!scene)return null;
 scene.businessFateSnapshot=q;
 const valid=st=>{const b=businessesOf(st).find(b=>b.id===q.bizId);if(!b||st.country!==q.country||fateFingerprint(st,b)!==q.fingerprint)return false;if(q.personId&&(!st.people[q.personId]?.alive))return false;if(['SpouseReaction','BiggerHouse'].includes(kind)&&spouseOf(st)?.id!==q.personId)return false;return true;};
 scene.choices=scene.choices.map(c=>({...c,available:st=>valid(st)&&(!c.available||c.available(st))&&(kind!=='FriendJob'||st.year===q.year&&st.month===q.month),effect:st=>{if(!valid(st)||c.available&&!c.available(st)||kind==='FriendJob'&&(st.year!==q.year||st.month!==q.month))return;st.career.businessFateReplies??={};const key=kind+'_'+q.bizId;if(st.career.businessFateReplies[key])return;const r=c.effect?.(st);if(r?.ok===false)return r;st.career.businessFateReplies[key]=true;return r;}}));return scene;
}
export function buildBankCallScene(S,biz,person){return durableFateScene(S,biz,person,'BankCall');}
export function buildSpouseReactionScene(S,biz,person){return durableFateScene(S,biz,person,'SpouseReaction');}
export function buildFriendJobScene(S,biz,person){return durableFateScene(S,biz,person,'FriendJob');}
export function buildBiggerHouseScene(S,biz,person){return durableFateScene(S,biz,person,'BiggerHouse');}
export function buildBiggerLoanScene(S,biz,person){return durableFateScene(S,biz,person,'BiggerLoan');}
export function buildRivalScene(S,biz,person){return durableFateScene(S,biz,person,'Rival');}
export function restoreBusinessFateScene(S,saved){const q=saved?.businessFateSnapshot;if(!q)return null;const biz=businessesOf(S).find(b=>b.id===q.bizId);if(!biz||fateFingerprint(S,biz)!==q.fingerprint||S.country!==q.country)return null;const person=q.personId?S.people[q.personId]:null;if(q.personId&&!person?.alive)return null;return durableFateScene(S,biz,person,q.kind,q);}
