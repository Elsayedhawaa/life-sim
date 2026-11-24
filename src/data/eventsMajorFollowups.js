/* Follow-ups that exist only because a major event really happened. */
import { clamp } from '../core/rng.js';
import { formatMoney } from '../data/countries.js';
import { recordJournal } from '../core/schema.js';
import { rememberDeed } from '../systems/soulEngine.js';
import { noteSocialContact } from '../systems/socialEnergy.js';
import { relationshipAction } from '../systems/relationshipProgression.js';

function survivingParent(role, other, lost) {
  return {
    id: `ev_major_surviving_${role}_after_${lost}`,
    category: 'family',
    gates: { requiredPeople: [role === 'mom' ? 'mom' : 'dad'], minAge: 18, afterMajor: { kind: 'death', role: lost, minMonths: 1, maxMonths: 9 } },
    build: (S, ctx) => {
      const p = ctx[role];
      const name = p?.firstName || (role === 'mom' ? 'your mother' : 'your father');
      return {
        key: `ev_major_surviving_${role}_after_${lost}`, category: 'family',
        title: `${name} Is Alone Now`,
        text: `Since ${other} died, ${name} has been quiet on the phone. The house is different, and ${role === 'mom' ? 'she' : 'he'} has not said how ${role === 'mom' ? 'she' : 'he'} is coping.`,
        choices: [
          { label: 'Go and spend a few days with them', effect: (st) => {
              if (p) { noteSocialContact(st, p); rememberDeed(st, p, 'supported_crisis', `Stayed close after ${other} died.`, { affection: 12, trust: 9 }); }
              st.player.vitals.stress = clamp(st.player.vitals.stress - 3);
              recordJournal(st, `You spent time with ${name} after ${other} died.`, 'family');
          } },
          { label: 'Call every few days and keep it short', effect: (st) => {
              if (p) { noteSocialContact(st, p); rememberDeed(st, p, 'contact', 'Called regularly after the loss.', { affection: 4, trust: 3 }); }
              recordJournal(st, `You called ${name} regularly after ${other} died.`, 'family');
          } },
          { label: 'Leave it, you are overwhelmed yourself', effect: (st) => {
              if (p) rememberDeed(st, p, 'neglected', 'Kept distance after the loss.', { affection: -6, trust: -4, resentment: 4 });
              recordJournal(st, `You kept your distance from ${name} after ${other} died.`, 'family');
          } },
        ],
      };
    },
  };
}


const nameOf = (p, fb) => p?.firstName || fb;
const LOSS = ['job_lost_redundancy', 'job_lost_dismissed'];

const afterCrashCover = {
  id: 'ev_major_after_crash_cover', category: 'money',
  gates: { hasCar: true, autoInsured: false, afterMajor: { kind: 'car_crash', minMonths: 1, maxMonths: 6 } },
  build: (S) => {
    const c = (S.carCrashes || [])[S.carCrashes.length - 1];
    return {
      key: 'ev_major_after_crash_cover', category: 'money',
      title: 'Driving Without Cover',
      text: `Since the crash${c ? ` that cost ${formatMoney(c.repair, S.country)} to repair` : ''}, every drive reminds you that you have no auto insurance. A policy would be added to your monthly costs.`,
      choices: [
        { label: 'Take out auto insurance', effect: (st) => { st.insurance.auto = true; st.player.vitals.stress = clamp(st.player.vitals.stress - 3); recordJournal(st, 'You took out auto insurance after the crash. The premium is now part of your monthly costs.', 'money'); } },
        { label: 'Stay uninsured for now', effect: (st) => { recordJournal(st, 'You decided to keep driving without auto insurance after the crash.', 'money'); } },
      ],
    };
  },
};

const afterLossSpouse = {
  id: 'ev_major_after_job_loss_spouse', category: 'family',
  gates: { requiredPeople: ['spouse'], hasJob: false, afterMajor: { kind: LOSS, castRole: 'spouse', minMonths: 1, maxMonths: 5 } },
  build: (S, ctx) => {
    const p = ctx.spouse, n = nameOf(p, 'your spouse');
    return {
      key: 'ev_major_after_job_loss_spouse', category: 'family',
      title: `${n} Asks About the Job Search`,
      text: `You are still out of work. ${n} asks quietly how the search is going and what the two of you should do about money.`,
      choices: [
        { label: 'Be honest about where things stand', effect: (st) => { if (p) { noteSocialContact(st, p); rememberDeed(st, p, 'supported_crisis', 'Was honest about the job loss and money.', { affection: 6, trust: 8 }); } st.player.vitals.stress = clamp(st.player.vitals.stress - 3); recordJournal(st, `You told ${n} honestly where the job search and money stood.`, 'family'); } },
        { label: 'Say it is under control and change the subject', effect: (st) => { if (p) rememberDeed(st, p, 'neglected', 'Brushed off questions about money after the job loss.', { trust: -6, resentment: 5 }); st.player.vitals.stress = clamp(st.player.vitals.stress + 3); recordJournal(st, `You told ${n} the job search was under control, though it was not.`, 'family'); } },
      ],
    };
  },
};

const afterEvictionParent = {
  id: 'ev_major_after_eviction_parent', category: 'family',
  gates: { hasLivingParent: true, housingMode: 'parents', afterMajor: { kind: 'eviction', minMonths: 1, maxMonths: 8 } },
  build: (S, ctx) => {
    const p = ctx.mom || ctx.dad, n = nameOf(p, 'your parent');
    return {
      key: 'ev_major_after_eviction_parent', category: 'family',
      title: `${n} Wants to Know the Plan`,
      text: `You have been back at the family home since the eviction. ${n} is not angry, but would like to know how long this is for and what you plan to do next.`,
      choices: [
        { label: 'Explain a clear plan to get back on your feet', effect: (st) => { if (p) { noteSocialContact(st, p); rememberDeed(st, p, 'kept_promise', 'Explained a plan after the eviction.', { affection: 4, trust: 6 }); } recordJournal(st, `You told ${n} your plan for getting out of the family home again.`, 'family'); } },
        { label: 'Say you do not know yet', effect: (st) => { if (p) rememberDeed(st, p, 'neglected', 'Had no plan after the eviction.', { trust: -3, resentment: 3 }); st.player.vitals.stress = clamp(st.player.vitals.stress + 3); recordJournal(st, `You told ${n} you did not yet know your next step after the eviction.`, 'family'); } },
      ],
    };
  },
};

const afterAffair = {
  id: 'ev_major_after_affair', category: 'family',
  gates: { requiredPeople: ['spouse'], affairStatus: 'discovered', afterMajor: { kind: 'affair_discovered', castRole: 'spouse', minMonths: 0, maxMonths: 4 } },
  build: (S, ctx) => {
    const p = ctx.spouse, n = nameOf(p, 'your spouse');
    return {
      key: 'ev_major_after_affair', category: 'family',
      title: `What to Do About ${n}`,
      text: `You know about the affair, and ${n} does not yet know that you know.`,
      choices: [
        { label: 'Confront them directly', effect: (st) => relationshipAction(st, p.id, 'discuss') },
        { label: 'Propose couple counselling first', effect: (st) => relationshipAction(st, p.id, 'counsel') },
        { label: 'Say nothing yet', effect: (st) => { rememberDeed(st, p, 'neglected', 'Kept the affair to themselves.', { resentment: 6 }); st.player.vitals.stress = clamp(st.player.vitals.stress + 4); recordJournal(st, `You kept what you knew about ${n}'s affair to yourself for now.`, 'family'); } },
      ],
    };
  },
};

export const EVENTS_MAJOR_FOLLOWUPS = [survivingParent('mom', 'your father', 'father'), survivingParent('dad', 'your mother', 'mother'), afterCrashCover, afterLossSpouse, afterEvictionParent, afterAffair];
