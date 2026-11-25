/* ============================================================================
   World Life 2.0 — v2.15 W5 Memory Events (eventsMemory.js)
   Three small events that prove a memory is a real record, not flavour:
   the later event reads the memories array and its outcome changes with
   the memory present vs absent — same event, same seed, different outcome.

   - ev_memory_ask_for_help: you ask a friend for money. A friend who
     remembers a favour you did lends the full amount and quotes it
     ("You lent me money in 2019 — of course I'll help"). A friend who
     remembers being let down refuses and names it. Anyone else lends
     half, reluctantly.
   - ev_memory_favour_returns: a friend who remembers your help comes
     back offering help of their own.
   - ev_memory_broken_bond: a friend who remembers a betrayal confronts
     you. Apologise properly and the friendship can heal; let it go and
     it breaks for a stated reason, naming the memory.
   ========================================================================== */

import { clamp } from '../core/rng.js';
import { recordJournal, walletMove } from '../core/schema.js';
import { formatMoney } from '../data/countries.js';
import { eraLocalCost } from '../data/economy.js';
import {
  recordMemory, findPeopleWithMemory, findMemory,
  FAVOUR_MEMORY_KINDS, BETRAYAL_MEMORY_KINDS,
} from '../systems/npcMemory.js';

function liveFriend(S, ctx) {
  const fromCtx = ctx && ctx.friend;
  if (fromCtx && fromCtx.alive) return fromCtx;
  const ids = S.relations.friendIds || [];
  for (const id of ids) {
    const p = S.people[id];
    if (p && p.alive) return p;
  }
  return null;
}

function nm(p, fb) { return (p && p.firstName) || fb; }

export const EVENTS_MEMORY = [
  {
    id: 'ev_memory_ask_for_help',
    category: 'friends',
    gates: { minAge: 20, hasFriend: true },
    build: (S, ctx) => {
      const friend = liveFriend(S, ctx);
      if (!friend) return null;
      const amount = eraLocalCost(1500, S.country, S.year);
      const favour = findMemory(friend, FAVOUR_MEMORY_KINDS);
      const betrayal = findMemory(friend, BETRAYAL_MEMORY_KINDS);
      const name = nm(friend, 'your friend');
      const memoryLine = favour
        ? `${name} has not forgotten what you did — "${favour.summary}"`
        : betrayal
          ? `${name} has not forgotten — "${betrayal.summary}"`
          : `${name} likes you well enough, but you have no real history of standing by each other.`;
      return {
        key: 'ev_memory_ask_for_help', category: 'friends',
        title: 'Asking for Help',
        text: `Money is tight this month, and you need ${formatMoney(amount, S.country)} to get through it. ${memoryLine}`,
        choices: [
          { label: `Ask ${name} for ${formatMoney(amount, S.country)}`, effect: (st) => {
            const fr = st.people[friend.id];
            if (!fr) return;
            if (favour) {
              walletMove(st, amount, `${name} lent you money — returning an old favour`, 'family');
              recordMemory(st, fr, 'supported_crisis', `They stood by you when money was tight in ${st.year}.`, { affection: 8, trust: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 6);
              recordJournal(st, `${name} lent you ${formatMoney(amount, st.country)} without a second thought. "${favour.summary}" — they remembered, and it mattered.`, 'friends');
            } else if (betrayal) {
              recordMemory(st, fr, 'refused_help', `They said no when you asked for help in ${st.year} — they still remember being let down themselves.`, { affection: -8, trust: -8, resentment: 8 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness - 6);
              st.player.vitals.stress = clamp(st.player.vitals.stress + 5);
              recordJournal(st, `You asked ${name} for ${formatMoney(amount, st.country)} and they said no. "${betrayal.summary}" — that is the reason they gave, in those words.`, 'friends');
            } else {
              const half = Math.round(amount / 2);
              walletMove(st, half, `${name} lent you half of what you asked for`, 'family');
              recordMemory(st, fr, 'helped_money', `They lent you ${formatMoney(half, st.country)} when you asked, though you had never really helped them before.`, { affection: 4, trust: 4 });
              st.player.vitals.happiness = clamp(st.player.vitals.happiness + 2);
              recordJournal(st, `${name} lent you ${formatMoney(half, st.country)} — half of what you asked for. No history between you, no full trust.`, 'friends');
            }
          } },
          { label: 'Do not ask — handle it alone', effect: (st) => {
            st.player.vitals.stress = clamp(st.player.vitals.stress + 4);
            recordJournal(st, `Money was tight and you did not ask ${name} for help. You handled it alone.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_memory_favour_returns',
    category: 'friends',
    gates: { minAge: 20, memoryKind: FAVOUR_MEMORY_KINDS },
    build: (S, ctx) => {
      const people = findPeopleWithMemory(S, FAVOUR_MEMORY_KINDS);
      const person = (ctx && ctx.friend && people.includes(ctx.friend)) ? ctx.friend : people[0];
      if (!person) return null;
      const favour = findMemory(person, FAVOUR_MEMORY_KINDS);
      const amount = eraLocalCost(1200, S.country, S.year);
      const name = nm(person, 'your friend');
      return {
        key: 'ev_memory_favour_returns', category: 'friends',
        title: 'A Favour Comes Back',
        text: `${name} turns up at your door with an envelope. "You helped me when I needed it," they say. "${favour ? favour.summary : 'You stood by me.'} I have not forgotten. Take this — and if you ever need a hand again, you only have to ask." Inside is ${formatMoney(amount, S.country)}.`,
        choices: [
          { label: `Accept the ${formatMoney(amount, S.country)} and thank them`, effect: (st) => {
            const p = st.people[person.id];
            walletMove(st, amount, `${name} repaid an old favour in cash`, 'family');
            if (p) recordMemory(st, p, 'supported_crisis', `They repaid your old favour in ${st.year}, in cash and in person.`, { affection: 10, trust: 10, resentment: -10 });
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 8);
            recordJournal(st, `${name} came to your door and repaid an old favour with ${formatMoney(amount, st.country)}. Good turns come back.`, 'friends');
          } },
          { label: 'Refuse the money — the help was freely given', effect: (st) => {
            const p = st.people[person.id];
            if (p) recordMemory(st, p, 'supported_crisis', `You refused repayment for your old favour in ${st.year} — they respect you more for it.`, { affection: 12, trust: 8, respect: 6 });
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 5);
            recordJournal(st, `${name} tried to repay an old favour and you refused the money. The friendship is worth more than the cash.`, 'friends');
          } },
        ],
      };
    },
  },
  {
    id: 'ev_memory_broken_bond',
    category: 'friends',
    gates: { minAge: 20, memoryKind: BETRAYAL_MEMORY_KINDS },
    build: (S, ctx) => {
      const people = findPeopleWithMemory(S, BETRAYAL_MEMORY_KINDS);
      const person = (ctx && ctx.friend && people.includes(ctx.friend)) ? ctx.friend : people[0];
      if (!person) return null;
      const betrayal = findMemory(person, BETRAYAL_MEMORY_KINDS);
      const name = nm(person, 'your friend');
      return {
        key: 'ev_memory_broken_bond', category: 'friends',
        title: 'The Thing They Cannot Forget',
        text: `${name} asks to meet, and comes straight to the point. "I need to say this plainly," they say. "${betrayal ? betrayal.summary : 'You let me down when it mattered.'} I have carried that with me ever since. I need to know whether our friendship means anything to you at all."`,
        choices: [
          { label: 'Apologise properly, and mean it', effect: (st) => {
            const p = st.people[person.id];
            if (p) recordMemory(st, p, 'made_amends', `You apologised properly in ${st.year} for letting them down, and meant it.`, { affection: 10, trust: 12, resentment: -25 });
            st.player.vitals.happiness = clamp(st.player.vitals.happiness + 4);
            recordJournal(st, `You apologised properly to ${name} for what happened, and meant it. The friendship has a chance again.`, 'friends');
          } },
          { label: 'Let it go — the friendship is over', effect: (st) => {
            const p = st.people[person.id];
            if (p) {
              recordMemory(st, p, 'neglected', `You let the friendship end in ${st.year} without a word, after they told you plainly what was wrong.`, { affection: -40, trust: -40, resentment: 30 });
              p.rel.affection = clamp(p.rel.affection, 0, 20);
              p.rel.trust = clamp(p.rel.trust, 0, 20);
            }
            st.player.vitals.happiness = clamp(st.player.vitals.happiness - 8);
            recordJournal(st, `The friendship with ${name} ended. The reason, in their words: "${betrayal ? betrayal.summary : 'You let me down when it mattered.'}"`, 'friends');
          } },
        ],
      };
    },
  },
];
