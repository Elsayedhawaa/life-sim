/* Loans between the player and people in their life are read from the
   player's own recorded choice: cash that actually left the wallet in the
   resolved request. Nothing is assumed from the event having appeared. */
export function loanFromOutcome(S, eventId) {
  const o = S?.eventOutcomes?.[eventId];
  if (!o || !(Number(o.cashDelta) < 0)) return null;
  const settled = S.loanSettlements?.[eventId] || null;
  const months = (S.year - o.year) * 12 + (S.month - o.month);
  return { eventId, amount: Math.round(-o.cashDelta), months, settled, borrowerId: Object.values(o.participants || {})[0] || null };
}
export function loanOutstanding(S, eventId, minMonths = 0) {
  const l = loanFromOutcome(S, eventId);
  return !!l && !l.settled && l.months >= minMonths;
}
export function settleLoan(S, eventId, how) {
  S.loanSettlements ??= {};
  if (!S.loanSettlements[eventId]) S.loanSettlements[eventId] = { how, year: S.year, month: S.month };
}
