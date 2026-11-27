/* Month-to-month demand swings for the detailed company model.
   Before this, an enterprise or software company with the same staff, stock and
   prices booked the identical revenue every month, so there was never a bad month
   or a good one. The swing is deterministic per save, company and month (no RNG
   state is consumed, so a month recomputed twice agrees with itself), and
   it carries over a little from one month to the next so a slow stretch
   lasts a few months instead of flipping every month.
   GAME DESIGN numbers, one per sector: the typical size of a swing in demand
   (1 sigma). Steady services are small, harvests and building jobs are lumpy. */
export const DEMAND_SWING_SIGMA = {
  clinic: .04, pharmacy: .04, hospitality: .10, education: .06, food: .08, logistics: .09, retail: .09,
  manufacturing: .11, software: .12, construction: .2, farming: .22
};
const MAX_SWING = .45;
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0; return h >>> 0; }
function unit(S, b, monthIndex, k) {
  let h = (hashStr(String(b.id || b.name || 'co')) ^ Math.imul((Number(S.seed) | 0) + 31 * monthIndex + 7919 * k, 2654435761)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/* roughly normal, mean 0, sd 1, from four uniform draws */
function gauss(S, b, m) { let s = 0; for (let k = 0; k < 4; k++) s += unit(S, b, m, k); return (s - 2) / Math.sqrt(4 / 12); }
export function companyDemandSwing(S, b) {
  const sector = b?.enterprise?.sector || (b?.tech ? 'software' : null), sigma = DEMAND_SWING_SIGMA[sector];
  if (!sigma) return 1;
  const m = S.year * 12 + S.month, z = .62 * gauss(S, b, m) + .27 * gauss(S, b, m - 1) + .11 * gauss(S, b, m - 2);
  const swing = Math.max(-MAX_SWING, Math.min(MAX_SWING, z * sigma));
  return Math.round((1 + swing) * 1000) / 1000;
}
