/* GAME DESIGN: at the credit limit (new lives, S.rules.creditLimit), optional spending in these decisions is locked and says why.
   Bills, medical care and family obligations stay open. The cost is probed once per option on a throwaway copy of the state. */
export const DISCRETIONARY_SCENES = new Set([
  'ev_life_lottery_nothing','ev_money_investment_tip','ev_money_bank_certificate','ev_life_beggar_asks','ev_life_local_match',
  'ev_life_street_festival','ev_life_new_cafe','ev_life_birthday_forgotten','ev_friend_birthday_forgot','ev_friend_birthday_party',
  'ev_friend_new_restaurant','ev_friend_football_match','ev_friend_join_gym','ev_life_subscription_renewal','ad_gold_hedge',
  'ev_friend_business_invest','ev_friend_asks_loan','ev_family_sib_money_never_back_l2','ev_family_parents_anniversary',
  'ev_career_side_business','ev_career_language_course','ev_school_music_lesson','ev_friend_apologises_row_l2','ev_friend_loan_repaid_l2','ev_family_sib_wedding_l2'
]);
export function isDiscretionaryScene(sc) {
  return !!sc && (DISCRETIONARY_SCENES.has(sc.baseId) || DISCRETIONARY_SCENES.has(sc.key) || /Asks for Financial Backing$/.test(sc.title || ''));
}
export function atCreditLimit(S) {
  if (S?.rules?.creditLimit && (S.money?.creditBlocked || S.year <= (S.money?.bankruptUntilYear ?? -1))) return Number(S.money.cash) <= 0.5; /* relief's credit block: no credit at all */
  return !!(S?.rules?.creditLimit && Number(S.money?.creditCap) > 0 && Number(S.money.cash) <= -Number(S.money.creditCap) + 0.5);
}
const probed = new WeakMap();
/* Some effects change a person object they captured earlier, so the probe could touch the live people. Put them back in place, keeping object identity. */
function restoreInPlace(live, saved) {
  if (Array.isArray(live) && Array.isArray(saved)) { live.length = saved.length; saved.forEach((v, i) => { if (v && typeof v === 'object' && live[i] && typeof live[i] === 'object') restoreInPlace(live[i], v); else live[i] = v; }); return; }
  for (const k of Object.keys(live)) if (!(k in saved)) delete live[k];
  for (const [k, v] of Object.entries(saved)) {
    if (v && typeof v === 'object' && live[k] && typeof live[k] === 'object' && Array.isArray(live[k]) === Array.isArray(v)) restoreInPlace(live[k], v);
    else live[k] = v;
  }
}
function probeCost(S, ch) {
  if (probed.has(ch)) return probed.get(ch);
  let cost = 0;
  const peopleSnap = S.people ? JSON.stringify(S.people) : null;
  try {
    const copy = {};
    for (const k of Object.keys(S)) if (k !== 'activeScene' && k !== 'sceneQueue') copy[k] = S[k];
    const cl = JSON.parse(JSON.stringify(copy));
    cl.sceneQueue = []; cl.activeScene = null; if (cl.people && cl.player) cl.people.player = cl.player;
    const before = Number(cl.money.cash);
    ch.effect(cl);
    cost = Math.max(0, before - Number(cl.money.cash));
  } catch (e) { cost = 0; }
  if (peopleSnap) restoreInPlace(S.people, JSON.parse(peopleSnap));
  probed.set(ch, cost);
  return cost;
}
/* Returns a plain-words lock reason, or null when the option is open. */
export function discretionaryLock(S, sc, ch) {
  if (!atCreditLimit(S) || !isDiscretionaryScene(sc) || typeof ch?.effect !== 'function') return null;
  if (!(probeCost(S, ch) > 0.5)) return null;
  /* A card must never have every option locked: that left the player on a card they could not close. If no option is free, the cheapest stays open so the card can be answered. */
  const live = (sc.choices || []).filter(c => typeof c?.effect === 'function');
  if (live.length && live.every(c => probeCost(S, c) > 0.5)) {
    const cheapest = live.reduce((a, b) => (probeCost(S, b) < probeCost(S, a) ? b : a));
    if (cheapest === ch) return null;
  }
  return 'You are at your credit limit. Optional spending like this is closed until you are back under it.';
}
