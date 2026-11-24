/* Follow-ups that exist only because a major event really happened, and that
   involve the people it actually touched. Each is gated on a recorded major
   event plus the current saved state; none invents a person, job or sum. */
import { clamp } from '../core/rng.js';
import { recordJournal, walletMove } from '../core/schema.js';
import { formatMoney } from './countries.js';
import { visitHospitalCheckup } from '../systems/healthDirectorEngine.js';
import { rememberDeed } from '../systems/soulEngine.js';
import { noteSocialContact } from '../systems/socialEnergy.js';

const nameOf = (p, fb) => p?.firstName || fb;
const stress = (st, d) => { st.player.vitals.stress = clamp(st.player.vitals.stress + d); };

const promotionSpouse = {
  id: 'ev_conseq_promotion_spouse', category: 'family',
  gates: { requiredPeople: ['spouse'], hasJob: true, recentPromotionMonths: 3, afterMajor: { kind: 'promotion', minMonths: 0, maxMonths: 3 } },
  build: (S, ctx) => {
    const p = ctx.spouse, n = nameOf(p, 'your spouse'), q = S.career.lastPromotion || {};
    return {
      key: 'ev_conseq_promotion_spouse', category: 'family',
      title: `${n} Heard About the Promotion`,
      text: `Your spouse, ${n}, knows you were promoted${q.newTitle ? ` to ${q.newTitle}` : ''}${q.employer ? ` at ${q.employer}` : ''}.`,
      choices: [
        { label: 'Take an evening to celebrate together', effect: (st) => { noteSocialContact(st, p); rememberDeed(st, p, 'proud_moment', 'Celebrated the promotion together.', { affection: 6, trust: 3 }); stress(st, -2); recordJournal(st, `You spent an evening with ${n} marking your promotion.`, 'family'); } },
        { label: 'Say you will celebrate once things calm down', effect: (st) => { rememberDeed(st, p, 'neglected', 'Put off celebrating the promotion.', { affection: -2, resentment: 2 }); recordJournal(st, `You put off celebrating the promotion with ${n}.`, 'family'); } },
      ],
    };
  },
};

const promotionWorkload = {
  id: 'ev_conseq_promotion_workload', category: 'career',
  gates: { hasJob: true, recentPromotionMonths: 4, afterMajor: { kind: 'promotion', minMonths: 1, maxMonths: 4 } },
  build: (S) => {
    const j = S.career.job || {};
    return {
      key: 'ev_conseq_promotion_workload', category: 'career',
      title: `Settling Into ${j.title || 'the New Role'}`,
      text: `You have held the promotion${j.employer ? ` at ${j.employer}` : ''} for a few weeks. How much effort you put into it now is up to you.`,
      choices: [
        { label: 'Take on the extra responsibility fully', effect: (st) => { if (st.career.job) st.career.job.performance = clamp((st.career.job.performance || 0) + 3); stress(st, 4); recordJournal(st, 'You took on the extra responsibility of the new role.', 'career'); } },
        { label: 'Keep to what the role strictly requires', effect: (st) => { recordJournal(st, 'You kept to the strict requirements of the new role.', 'career'); } },
      ],
    };
  },
};

function childAfter(kind, id, title, text, minMonths, maxMonths) {
  return {
    id, category: 'family',
    gates: { requiredPeople: ['child'], people: { child: { minAge: 4, maxAge: 17, sameCountry: true } }, afterMajor: { kind, castRole: 'spouse', minMonths, maxMonths } },
    build: (S, ctx) => {
      const c = ctx.child, n = nameOf(c, 'your child'), x = nameOf(ctx.spouse, 'their other parent');
      return {
        key: id, category: 'family', title: title(n, x), text: text(n, x),
        choices: [
          { label: 'Sit down and answer honestly, without blaming anyone', effect: (st) => { if (c) { noteSocialContact(st, c); rememberDeed(st, c, 'supported_crisis', 'Explained the family change honestly.', { affection: 8, trust: 8 }); } recordJournal(st, `You talked honestly with ${n} about the change at home.`, 'family'); } },
          { label: 'Tell them it is an adult matter', effect: (st) => { if (c) rememberDeed(st, c, 'neglected', 'Was told the family change was not for them.', { trust: -5, resentment: 4 }); recordJournal(st, `You told ${n} it was an adult matter.`, 'family'); } },
        ],
      };
    },
  };
}
const childAfterDivorce = childAfter('divorce_final', 'ev_conseq_child_after_divorce',
  (n) => `${n} Asks What Changes`, (n, x) => `Now that the divorce from your ex-spouse, ${x}, is final, your child, ${n}, asks what the divorce means for them.`, 1, 6);
const childAfterSeparation = childAfter('separation', 'ev_conseq_child_after_separation',
  (n) => `${n} Notices`, (n, x) => `Your spouse, ${x}, no longer lives with you. Your child, ${n}, knows and asks whether this is for good.`, 0, 3);

function siblingAfterParentDeath(lost, word) {
  return {
    id: `ev_conseq_sibling_after_${lost}_death`, category: 'family',
    gates: { requiredPeople: ['sib'], people: { sib: { minAge: 16 } }, afterMajor: { kind: 'death', role: lost, minMonths: 0, maxMonths: 4 } },
    build: (S, ctx) => {
      const p = ctx.sib, n = nameOf(p, 'your sibling');
      return {
        key: `ev_conseq_sibling_after_${lost}_death`, category: 'family',
        title: `${n} Wants to Talk`,
        text: `Your sibling, ${n}, calls after the death of ${word} and asks whether you can talk about it.`,
        choices: [
          { label: 'Talk for as long as they need', effect: (st) => { noteSocialContact(st, p); rememberDeed(st, p, 'supported_crisis', `Talked after ${word} died.`, { affection: 8, trust: 7 }); stress(st, -2); recordJournal(st, `You talked with ${n} about ${word}.`, 'family'); } },
          { label: 'Say you cannot talk about it yet', effect: (st) => { rememberDeed(st, p, 'neglected', `Could not talk after ${word} died.`, { trust: -3, resentment: 2 }); recordJournal(st, `You told ${n} you could not talk about ${word} yet.`, 'family'); } },
        ],
      };
    },
  };
}

function parentAfterSiblingDeath(role) {
  return {
    id: `ev_conseq_${role}_after_sibling_death`, category: 'family',
    gates: { requiredPeople: [role], afterMajor: { kind: 'death', role: 'sibling', minMonths: 1, maxMonths: 8 } },
    build: (S, ctx) => {
      const p = ctx[role], n = nameOf(p, role === 'mom' ? 'your mother' : 'your father');
      return {
        key: `ev_conseq_${role}_after_sibling_death`, category: 'family',
        title: `${n} Has Lost a Child`,
        text: `${role === 'mom' ? 'Your mother' : 'Your father'}, ${n}, has lost a child. You can visit, or keep your distance.`,
        choices: [
          { label: 'Visit and just be there', effect: (st) => { noteSocialContact(st, p); rememberDeed(st, p, 'supported_crisis', 'Stayed close after losing a child.', { affection: 10, trust: 8 }); recordJournal(st, `You spent time with ${n} while they grieved.`, 'family'); } },
          { label: 'Keep your distance, it is too painful', effect: (st) => { rememberDeed(st, p, 'neglected', 'Kept distance after losing a child.', { trust: -4, resentment: 3 }); recordJournal(st, `You kept your distance from ${n} after the loss.`, 'family'); } },
        ],
      };
    },
  };
}

const friendAfterJobLoss = {
  id: 'ev_conseq_friend_after_job_loss', category: 'social',
  gates: { requiredPeople: ['friend'], hasJob: false, afterMajor: { kind: ['job_lost_redundancy', 'job_lost_dismissed'], minMonths: 1, maxMonths: 4 } },
  build: (S, ctx) => {
    const p = ctx.friend, n = nameOf(p, 'a friend');
    return {
      key: 'ev_conseq_friend_after_job_loss', category: 'social',
      title: `${n} Checks In`,
      text: `Your friend, ${n}, heard you are out of work and offers to meet and help you go over your CV and applications.`,
      choices: [
        { label: 'Meet up and accept the help', effect: (st) => { noteSocialContact(st, p); rememberDeed(st, p, 'supported_crisis', 'Accepted help after the job loss.', { affection: 5, trust: 5 }); stress(st, -2); recordJournal(st, `You met ${n} and went through your applications together.`, 'social'); } },
        { label: 'Thank them but say you are handling it', effect: (st) => { recordJournal(st, `You thanked ${n} and said you were handling the search yourself.`, 'social'); } },
      ],
    };
  },
};

const rentalLiability = (S) => (S.money?.loans || []).find((l) => String(l.id || '').startsWith('rentarrears_') && l.balance > 0);

const evictionAbroad = {
  id: 'ev_conseq_eviction_abroad', category: 'money',
  gates: { abroad: true, housingMode: 'rent', afterMajor: { kind: 'eviction', minMonths: 1, maxMonths: 8 } },
  build: (S) => {
    const e = S.housing?.lastEviction || {}, rent = Number(S.housing?.monthlyRent) || 0, loan = rentalLiability(S);
    const shared = S.housing?.currentHomeName === 'Shared Bedspace / Room';
    const part = loan ? Math.min(Math.floor(loan.balance), Math.floor(Math.max(0, Number(S.money?.cash) || 0) / 2)) : 0;
    const choices = [];
    if (loan && part > 0) {
      choices.push({ label: `Put ${formatMoney(part, S.country)} toward what you still owe the landlord`, effect: (st) => {
        const l = rentalLiability(st); if (!l) return;
        const pay = Math.min(Math.floor(l.balance), part);
        if (pay <= 0 || !walletMove(st, -pay, 'Payment toward rental liability', 'money')) return;
        l.balance = Math.max(0, l.balance - pay); if (l.balance <= 0) st.money.loans = st.money.loans.filter((x) => x !== l);
        stress(st, -2); recordJournal(st, `You paid ${formatMoney(pay, st.country)} toward the rental liability left after the eviction.`, 'money');
      } });
    }
    choices.push({ label: shared ? 'Stay in the shared room for now' : 'Carry on for now', effect: (st) => { recordJournal(st, 'You carried on after the eviction.', 'money'); } });
    return {
      key: 'ev_conseq_eviction_abroad', category: 'money',
      title: 'After the Eviction',
      text: `Since the eviction${e.from ? ` from ${e.from}` : ''}, ${shared ? `you have been renting a shared room${rent > 0 ? ` at ${formatMoney(rent, S.country)} a month` : ''}` : 'you have found another place to rent'}.${loan ? ` You still owe ${formatMoney(Math.floor(loan.balance), S.country)} on the rental liability.` : ''}`,
      choices,
    };
  },
};

const crashInjury = {
  id: 'ev_conseq_crash_injury', category: 'health',
  gates: { afterMajor: { kind: 'car_crash', facts: { injury: true }, minMonths: 1, maxMonths: 4 } },
  build: (S) => {
    const c = [...(S.carCrashes || [])].reverse().find((x) => x.injury) || {};
    const checked = (Number(S.medical?.lastCheckupPeriod) || 0) > (c.year * 12 + c.month);
    return {
      key: 'ev_conseq_crash_injury', category: 'health',
      title: 'After the Crash Injury',
      text: `You were hurt in the ${c.severity || ''} crash${c.carName ? ` in your ${c.carName}` : ''}. ${checked ? 'You have had a medical checkup since.' : 'You have not had a medical checkup since.'}`.replace('  ', ' '),
      choices: [
        { label: checked ? 'Book a follow-up at a public clinic' : 'Have it checked at a public clinic', effect: (st) => {
            const r = visitHospitalCheckup(st, 'public');
            if (!r.ok) recordJournal(st, `You wanted the crash injury checked, but could not: ${r.msg}`, 'health');
        } },
        { label: 'Rest and wait for it to settle', effect: (st) => { recordJournal(st, 'You chose to rest rather than have the crash injury checked.', 'health'); } },
      ],
    };
  },
};

export const EVENTS_CONSEQUENCES = [crashInjury, evictionAbroad, promotionSpouse, promotionWorkload, childAfterDivorce, childAfterSeparation,
  siblingAfterParentDeath('mother', 'your mother'), siblingAfterParentDeath('father', 'your father'),
  parentAfterSiblingDeath('mom'), parentAfterSiblingDeath('dad'), friendAfterJobLoss];
