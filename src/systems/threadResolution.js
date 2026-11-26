/* ============================================================================
   World Life 2.0 — v2.15 W5 Story-Thread Resolution (threadResolution.js)
   Every event chain (a root event plus its afterEvent follow-ups) has an
   explicit resolved state, kept on the save in S.threadResolutions:

     S.threadResolutions[chainId] = {
       chainId, personId, resolvedYear, resolvedMonth,
       how: 'choice' | 'timeout',   // a choice that closed it, or time
       outcome: 'plain-words ending',
       lastEventId
     }

   A resolved thread never re-queues: the chain picker in eventEngine.js
   refuses every member of a resolved chain. A chain ends in exactly one
   of two ways:
     1. CHOICE — a terminal event (one with no follow-up of its own) is
        played and the player picks a choice; the choice label is the
        ending, written into the record and the journal.
     2. TIME-OUT — the follow-up was due but its gates never passed for
        36 months (the person died, the age window passed, the
        relationship ended): the thread closes with a stated outcome —
        time moved on — instead of hanging open forever with no ending.
   A chain that genuinely cannot resolve (a recurring life situation, not
   a story) is listed in RECURRING_CHAINS instead of being left open.
   Audit (2026-11-20, 62 follow-up events, 36 chains): every chain has
   at least one terminal event, so RECURRING_CHAINS is empty — there is
   no recurring chain in the pool to exempt.
   ========================================================================== */

import { recordJournal } from '../core/schema.js';

export const THREAD_TIMEOUT_MONTHS = 36;

/* Chains that are recurring life situations, not stories. Empty by audit:
   all 17 chains end in a terminal event with a closing choice. */
export const RECURRING_CHAINS = [];

/* Plain-words labels for each chain root, used in time-out endings. */
export const CHAIN_LABELS = {
  ev_family_dad_loan_request: "your father's loan",
  ev_family_mom_birthday_forgot: "your mother's forgotten birthday",
  ev_family_dad_health_scare: "your father's health scare",
  ev_family_sib_engaged: "your sibling's engagement",
  ev_family_mom_falls_ill: "your mother's illness",
  ev_family_sib_borrows_money: 'the money your sibling borrowed',
  ev_marriage_baby_question: 'the question of a baby',
  ev_marriage_money_row: 'the money row with your spouse',
  ev_child_bullied: 'your child being bullied',
  ev_child_teen_party: "your teenager's party",
  ev_friend_asks_loan: 'the loan your friend asked for',
  ev_friend_politics_row: 'the row about politics with your friend',
  ev_friend_borrow_car: 'your friend borrowing your car',
  ev_friend_borrows_disappears: 'your friend who borrowed money and disappeared',
  ev_family_sib_moves_abroad: 'your sibling moving abroad',
  ev_family_sib_baby_born: "your sibling's new baby",
  ev_child_adult_moves_out: 'your grown child moving out',
  ev_money_sibling_loan: 'the loan your sibling asked for',
  ev_money_parent_medicine: "the money for your parent's medicine",
  ev_money_friend_loan: 'the money your friend borrowed',
  ev_money_collector_call: "the debt collector's call",
  ev_money_funeral_collection: 'the collection for the funeral',
  ev_money_baby_costs: 'the cost of the new baby',
  ev_money_child_phone: "your child's phone",
  ev_money_spouse_sofa: 'the sofa your spouse wanted',
  ev_money_payday_loan_shop: 'the payday loan',
  ev_health_gym_injury: 'your gym injury',
  ev_health_checkup: 'your health check-up',
  ev_career_boss_praise: "your boss's praise",
  ev_career_credit_stolen: 'the credit stolen from you at work',
  ev_career_fired: 'losing your job',
  ev_career_promotion_celebration: 'your promotion',
  ev_school_bully: 'the bully at school',
  ev_school_tutor_offer: "the tutor's offer",
  ev_uni_scholarship_win: 'your scholarship',
  ev_gulf_sponsor_trouble: 'the trouble with your Gulf sponsor',
};

/* Build the chain graph from the event pool: each event belongs to the
   chain of its oldest ancestor (the root, which has no afterEvent). */
export function buildChainIndex(events) {
  const byId = new Map(events.map((ev) => [ev.id, ev]));
  const children = new Map(); // parent id -> [child ids]
  for (const ev of events) {
    if (ev.gates && ev.gates.afterEvent) {
      if (!children.has(ev.gates.afterEvent)) children.set(ev.gates.afterEvent, []);
      children.get(ev.gates.afterEvent).push(ev.id);
    }
  }
  const chainOf = new Map(); // event id -> root id
  const chains = new Map(); // root id -> { root, members, terminals }
  function rootOf(id) {
    let cur = id;
    const seen = new Set();
    while (byId.get(cur)?.gates?.afterEvent && !seen.has(cur)) {
      seen.add(cur);
      cur = byId.get(cur).gates.afterEvent;
    }
    return cur;
  }
  for (const ev of events) {
    const root = rootOf(ev.id);
    if (!children.has(root) && root === ev.id) continue; // one-off, no chain
    chainOf.set(ev.id, root);
    if (!chains.has(root)) chains.set(root, { root, members: [], terminals: [] });
    chains.get(root).members.push(ev.id);
  }
  for (const chain of chains.values()) {
    chain.terminals = chain.members.filter((id) => !(children.get(id) || []).length);
  }
  return { byId, children, chainOf, chains };
}

export function ensureThreadState(S) {
  if (!S.threadResolutions) S.threadResolutions = {};
  return S.threadResolutions;
}

export function isChainResolved(S, chainId) {
  return !!(S && S.threadResolutions && S.threadResolutions[chainId]);
}

export function getThreadResolution(S, chainId) {
  return (S && S.threadResolutions && S.threadResolutions[chainId]) || null;
}

/* Close a thread. The first close wins — a resolved thread is never
   re-resolved or re-opened. */
export function resolveThread(S, chainId, { how = 'choice', outcome = '', lastEventId = null, personId = null } = {}) {
  if (!S || !chainId) return null;
  const store = ensureThreadState(S);
  if (store[chainId]) return store[chainId];
  const label = CHAIN_LABELS[chainId] || chainId.replace(/^ev_/, '').replace(/_/g, ' ');
  const record = {
    chainId,
    personId: personId || null,
    resolvedYear: S.year,
    resolvedMonth: S.month,
    how,
    outcome: outcome || `The thread about ${label} closed.`,
    lastEventId,
  };
  store[chainId] = record;
  /* "You chose: <button label>" only repeats the choice the journal already holds on the next line, so it is not written out a second time. The record itself is kept. */
  if (!/^You chose:/.test(record.outcome)) recordJournal(S, `A loose thread closed: ${record.outcome}`, 'life');
  return record;
}

/* Months between two (year, month) points. */
export function monthsBetween(y1, m1, y2, m2) {
  return (y2 - y1) * 12 + (m2 - m1);
}

/* Close threads whose follow-up was due but never became playable for
   THREAD_TIMEOUT_MONTHS after the last event of the chain fired. The
   caller supplies isEligible(eventId) — the engine's gate check — so
   this module never imports the engine. Returns the threads closed. */
export function closeStaleThreads(S, index, isEligible) {
  if (!S || !index) return [];
  const store = ensureThreadState(S);
  const closed = [];
  for (const chain of index.chains.values()) {
    if (store[chain.root] || RECURRING_CHAINS.includes(chain.root)) continue;
    const fired = S.eventFiredTurns || {};
    // Last event of this chain that actually fired.
    let lastFired = null;
    let lastMember = null;
    for (const id of chain.members) {
      const f = fired[id];
      if (!f) continue;
      if (typeof f.year === 'number' && typeof f.month === 'number') {
        if (!lastFired || monthsBetween(lastFired.year, lastFired.month, f.year, f.month) > 0) {
          lastFired = f;
          lastMember = id;
        }
      }
    }
    if (!lastFired) continue; // chain never started
    // Is any member playable right now? Then the thread is still alive.
    const anyEligible = chain.members.some((id) => {
      try { return !!isEligible(id); } catch (_) { return false; }
    });
    if (anyEligible) continue;
    // Was a follow-up due (its parent fired and the delay passed) but
    // never played? Only then is this a thread that stopped, not one
    // still waiting for its season.
    const anyDue = chain.members.some((id) => {
      const ev = index.byId.get(id);
      if (!ev || !ev.gates || !ev.gates.afterEvent) return false;
      if (fired[id]) return false;
      const parent = fired[ev.gates.afterEvent];
      if (!parent || typeof parent.year !== 'number') return false;
      return monthsBetween(parent.year, parent.month, S.year, S.month) >= (ev.gates.afterEventMinTurns || 0);
    });
    if (!anyDue) continue;
    if (monthsBetween(lastFired.year, lastFired.month, S.year, S.month) < THREAD_TIMEOUT_MONTHS) continue;
    const label = CHAIN_LABELS[chain.root] || chain.root.replace(/^ev_/, '').replace(/_/g, ' ');
    closed.push(resolveThread(S, chain.root, {
      how: 'timeout',
      outcome: `Time moved on — ${label} was never settled, and the moment passed.`,
      lastEventId: lastMember,
      personId: null,
    }));
  }
  return closed;
}

/* Static audit for the verify script: every chain, and whether it has a
   resolution path (a terminal event whose choice closes it, or an
   explicit recurring marking). */
export function auditChains(events) {
  const index = buildChainIndex(events);
  const rows = [];
  for (const chain of index.chains.values()) {
    rows.push({
      root: chain.root,
      members: chain.members.length,
      terminals: chain.terminals,
      recurring: RECURRING_CHAINS.includes(chain.root),
      hasResolution: chain.terminals.length > 0 || RECURRING_CHAINS.includes(chain.root),
    });
  }
  return { totalChains: rows.length, chains: rows, index };
}
