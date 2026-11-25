/* The family name (wealth event 8): a passive, small, tier-scaled lift where the surname is known. It applies only in the home country, only to adults, and only as a few points on gates that already exist: lenders' credit-score checks and the job interview score. It never decides alone what a weak application cannot reach. */
export const NAME_CREDIT_POINTS = { upper_middle: 5, wealthy: 15, very_wealthy: 30 };
export const NAME_INTERVIEW_POINTS = { upper_middle: 1, wealthy: 3, very_wealthy: 6 };
export function familyNameKnown(S) {
  const tier = S?.familyTier;
  return !!(NAME_CREDIT_POINTS[tier] && (S.player?.age ?? 0) >= 18 && S.country === S.homeCountry);
}
export function familyNameCreditPoints(S) { return familyNameKnown(S) ? NAME_CREDIT_POINTS[S.familyTier] : 0; }
export function familyNameInterviewPoints(S) { return familyNameKnown(S) ? NAME_INTERVIEW_POINTS[S.familyTier] : 0; }
/* The score a lender reads: your own score plus the name, capped at the scale's top. */
export function lenderCreditScore(S) { return Math.min(900, (S.money?.creditScore ?? 0) + familyNameCreditPoints(S)); }
