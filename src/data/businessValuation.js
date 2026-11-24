/* Game resale estimate, shared by portfolio, exits and net worth.
   Retained cash is a real separate pool; cumulative P&L is not cash. */
export function businessValuation(biz) {
  if (!biz || biz.dead) return 0;
  const wages = (biz.staff || []).reduce((sum, st) => sum + (Number(st.wageLocal) || 0), 0);
  const rent = Number(biz.premises?.monthlyRentLocal) || 0;
  const lastNet = biz.tech&&!biz.lastPL?0:biz.lastPL ? Number(biz.lastPL.net) || 0 : (Number(biz.monthlyRev) || 0) - (Number(biz.monthlyCost) || 0) - wages - rent;
  const equity = Math.max(0, Math.min(1, (biz.equityOwned ?? 100) / 100));
  return Math.round((Math.max(0, Number(biz.capitalInvested) || 0) * .7 + Math.max(0, lastNet) * 12 * 2.8 + Math.max(0, Number(biz.retainedCash) || 0) + Math.max(0,Number(biz.tech?.reserve)||0)) * equity);
}
export function businessSalvage(biz) {
  const equity = Math.max(0, Math.min(1, (biz?.equityOwned ?? 100) / 100));
  return Math.round((Math.max(0, Number(biz?.capitalInvested) || 0) * .5 + Math.max(0, Number(biz?.retainedCash) || 0) + Math.max(0,Number(biz?.tech?.reserve)||0)) * equity);
}
