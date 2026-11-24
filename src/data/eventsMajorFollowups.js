/* Follow-ups that exist only because a major event really happened. */
import { clamp } from '../core/rng.js';
import { recordJournal } from '../core/schema.js';
import { rememberDeed } from '../systems/soulEngine.js';
import { noteSocialContact } from '../systems/socialEnergy.js';

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
export const EVENTS_MAJOR_FOLLOWUPS = [survivingParent('mom', 'your father', 'father'), survivingParent('dad', 'your mother', 'mother')];
